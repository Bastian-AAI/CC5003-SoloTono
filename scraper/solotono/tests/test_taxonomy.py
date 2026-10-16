"""Unit tests for SoloTono's SoloTodo-style taxonomy models, fixtures, and classifier."""

import unittest
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from solotono.db.models import Base, Section, CategoryGroup, Category, Subcategory, Store, Entity
from solotono.db.fixtures import seed_taxonomy
from solotono.matching.taxonomy import classify_product
from solotono.pipeline.sync import IngestionPipeline
from solotono.scrapers.base import ScrapedProduct


class TestTaxonomy(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.session = self.Session()

    def tearDown(self):
        self.session.close()

    def test_seed_taxonomy_creates_full_menu(self):
        stats = seed_taxonomy(self.session)
        self.assertEqual(stats["sections"], 3)
        self.assertEqual(stats["groups"], 12)
        self.assertGreaterEqual(stats["categories"], 38)
        self.assertGreaterEqual(stats["subcategories"], 15)

        # Verify sections
        instrumentos = self.session.query(Section).filter(Section.slug == "instrumentos").first()
        self.assertIsNotNone(instrumentos)
        self.assertEqual(instrumentos.name, "Categorías en Instrumentos")
        self.assertEqual(len(instrumentos.groups), 4)

        equipos = self.session.query(Section).filter(Section.slug == "equipos-de-sonido").first()
        self.assertIsNotNone(equipos)
        self.assertEqual(len(equipos.groups), 4)

        repuestos = self.session.query(Section).filter(Section.slug == "piezas-y-repuestos").first()
        self.assertIsNotNone(repuestos)
        self.assertEqual(len(repuestos.groups), 4)

    def test_category_and_subcategory_views(self):
        seed_taxonomy(self.session)

        # Check Guitarras Electricas
        cat = self.session.query(Category).filter(Category.slug == "guitarras-electricas").first()
        self.assertIsNotNone(cat)
        self.assertIsNotNone(cat.browse_result_template)
        subcat_names = [s.name for s in cat.subcategories]
        self.assertIn("7 o más cuerdas", subcat_names)
        self.assertIn("Stratocaster", subcat_names)
        self.assertIn("Les Paul / Singlecut", subcat_names)

        # Check subcategory params
        sub_7 = self.session.query(Subcategory).filter(Subcategory.slug == "guitarras-electricas-7-cuerdas").first()
        self.assertIn("strings_min=7", sub_7.params)

    def test_taxonomic_classifier_rules(self):
        seed_taxonomy(self.session)

        # 1. Stratocaster
        res = classify_product("Fender Player II Stratocaster Rosewood Polar White", session=self.session)
        self.assertEqual(res.category_slug, "guitarras-electricas")
        self.assertGreaterEqual(res.confidence, 0.90)
        self.assertIn("Stratocaster", res.suggested_subcategories)

        # 2. 7-string guitar
        res = classify_product("Ibanez RG7421 Standard 7 Cuerdas Walnut Flat", session=self.session)
        self.assertEqual(res.category_slug, "guitarras-electricas")
        self.assertIn("7 o más cuerdas", res.suggested_subcategories)

        # 3. Tube amp
        res = classify_product("Fender Blues Junior IV 15W 1x12 Tube Amp Valvular", session=self.session)
        self.assertEqual(res.category_slug, "amplificadores-de-guitarra")
        self.assertIn("Valvulares (Tubes)", res.suggested_subcategories)

        # 4. Distortion pedal
        res = classify_product("Boss DS-1 Distortion Pedal Naranja", session=self.session)
        self.assertEqual(res.category_slug, "pedales-de-efectos")

        # 5. Audio interface
        res = classify_product("Focusrite Scarlett 2i2 4th Gen USB Audio Interface", session=self.session)
        self.assertEqual(res.category_slug, "interfaces-de-audio")

        # 6. Studio mic
        res = classify_product("Shure SM7B Microfono Dinamico Vocal para Estudio", session=self.session)
        self.assertEqual(res.category_slug, "microfonos-de-estudio")

        # 7. Strings
        res = classify_product("Ernie Ball Regular Slinky 2221 Cuerdas para Guitarra", session=self.session)
        self.assertEqual(res.category_slug, "cuerdas-guitarra-y-bajo")

        # 8. Accessories mentioning target instrument must NOT be classified as instruments
        res_strings = classify_product("Cuerdas Guitarra Eléctrica Ernie Ball 10-46", session=self.session)
        self.assertEqual(res_strings.category_slug, "cuerdas-guitarra-y-bajo")

        res_case = classify_product("Estuche Rígido para Bajo Eléctrico Fender", session=self.session)
        self.assertEqual(res_case.category_slug, "fundas-y-estuches")

        res_stand = classify_product("Atril para Guitarra Eléctrica Hércules", session=self.session)
        self.assertEqual(res_stand.category_slug, "soportes-stands")

        res_capo = classify_product("Cejillo Trigger Capo para Guitarra Acústica", session=self.session)
        self.assertEqual(res_capo.category_slug, "cejillos-capos")

        res_sticks = classify_product("Baquetas Vic Firth 5A American Classic para Batería", session=self.session)
        self.assertEqual(res_sticks.category_slug, "parches-y-baquetas")

        # 9. Non-musical products must be marked as excluded
        res_merch = classify_product("Abrebotellas Fender Custom Shop", session=self.session)
        self.assertTrue(res_merch.is_excluded)

        res_demo = classify_product("Producto Demo Test Tienda", session=self.session)
        self.assertTrue(res_demo.is_excluded)

        # 10. Instrument bundle must preserve instrument category
        res_bundle = classify_product("Guitarra Clásica Yamaha C40 con funda y afinador", session=self.session)
        self.assertEqual(res_bundle.category_slug, "guitarras-clasicas")

        # 11. Newly expanded categories
        res_portable_keys = classify_product("Casio CT-S300 Teclado Portátil 61 Teclas", session=self.session)
        self.assertEqual(res_portable_keys.category_slug, "teclados-portatiles")

        res_melodica = classify_product("Melódica Suzuki 37 Teclas con Funda", session=self.session)
        self.assertEqual(res_melodica.category_slug, "acordeones-y-melodicas")

        res_wireless = classify_product("Sistema Inalámbrico Shure BLX24/PG58", session=self.session)
        self.assertEqual(res_wireless.category_slug, "sistemas-inalambricos")

        res_dj = classify_product("Pioneer DJ DDJ-FLX4 Controlador DJ 2 Canales", session=self.session)
        self.assertEqual(res_dj.category_slug, "equipos-dj-y-tornamesas")

        res_lighting = classify_product("Foco Par LED Chauvet SlimPAR 56 DMX", session=self.session)
        self.assertEqual(res_lighting.category_slug, "iluminacion-y-escenario")

    def test_pipeline_assigns_category_id(self):
        seed_taxonomy(self.session)

        store = Store(
            name="Audiomusica",
            slug="audiomusica",
            website_url="https://www.audiomusica.com",
            scraper_class="AudiomusicaScraper",
            engine_type="VTEX",
        )
        self.session.add(store)
        self.session.commit()

        scraped = [
            ScrapedProduct(
                name="Fender Player Stratocaster Electric Guitar",
                store_slug="audiomusica",
                url="https://www.audiomusica.com/p/123",
                key="AM-123",
                normal_price=Decimal("849900"),
                offer_price=Decimal("799900"),
                category="Guitarras y Bajos/Guitarras Eléctricas",
            )
        ]

        pipeline = IngestionPipeline(self.session, auto_match=False)
        stats = pipeline.process_scraped_products(scraped)
        self.assertEqual(stats["entities_created"], 1)

        entity = self.session.query(Entity).filter(Entity.key == "AM-123").first()
        self.assertIsNotNone(entity.category_id)
        self.assertEqual(entity.category_obj.slug, "guitarras-electricas")


if __name__ == "__main__":
    unittest.main()
