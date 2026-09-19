export interface StoreOffer {
  id: string;
  storeName: string;
  storeLogo?: string;
  priceCash: number;      // Precio efectivo / transferencia
  priceNormal: number;    // Precio normal / tarjetas
  inStock: boolean;
  productUrl: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  section?: 'Instrumentos' | 'Piezas y Repuestos' | 'Equipos de sonido' | string;
  subCategory?: string;
  imageUrl: string;
  description: string;
  minPrice: number;
  offers: StoreOffer[];
}

export const initialProducts: Product[] = [
  {
    "id": "fender-player-ii-stratocaster",
    "name": "Guitarra Eléctrica Player II Stratocaster 3-Color Sunburst",
    "brand": "Fender",
    "category": "Cuerda",
    "section": "Instrumentos",
    "subCategory": "Guitarras Eléctricas",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/194226/1-guitarra-electrica-fender-stratocaster-player-ii--3-color-sunburst-1113554.jpg?v=638614862539700000",
    "description": "La Fender Player II Stratocaster ofrece un tono atemporal con cuerpo de aliso, mástil con perfil en 'C' moderna y pastillas Alnico 5 para un sonido clásico y brillante.",
    "minPrice": 1189990,
    "offers": [
      {
        "id": "offer-fnd-strat-1",
        "storeName": "Audiomusica",
        "priceCash": 1189990,
        "priceNormal": 1249990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com/guitarra-electrica-fender-stratocaster-player-ii--3-color-sunburst-1113554/p"
      },
      {
        "id": "offer-fnd-strat-2",
        "storeName": "Casa Amarilla",
        "priceCash": 1210000,
        "priceNormal": 1269990,
        "inStock": true,
        "productUrl": "https://www.casamarilla.cl"
      },
      {
        "id": "offer-fnd-strat-3",
        "storeName": "Overdrive",
        "priceCash": 1229990,
        "priceNormal": 1289990,
        "inStock": false,
        "productUrl": "https://www.overdrive.cl"
      }
    ]
  },
  {
    "id": "epiphone-les-paul-studio-lt",
    "name": "Guitarra Eléctrica Les Paul Studio LT Heritage Cherry Sunburst",
    "brand": "Epiphone",
    "category": "Cuerda",
    "section": "Instrumentos",
    "subCategory": "Guitarras Eléctricas",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/168871/guitarra-electrica-epiphone-les-paul-studio-lt-heritage-cherry-sunburst-1108858-1.jpg?v=637801432979900000",
    "description": "Todo el tono y sustain clásico de una Les Paul con cuerpo de caoba tallado, mástil de caoba atornillado y dos cápsulas humbucker Zebra Ceramic.",
    "minPrice": 514990,
    "offers": [
      {
        "id": "offer-epi-lp-1",
        "storeName": "Audiomusica",
        "priceCash": 514990,
        "priceNormal": 539990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com/guitarra-electrica-epiphone-les-paul-studio-lt-heritage-cherry-sunburst-1108858/p"
      },
      {
        "id": "offer-epi-lp-2",
        "storeName": "Promusic",
        "priceCash": 529900,
        "priceNormal": 559900,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      },
      {
        "id": "offer-epi-lp-3",
        "storeName": "Falabella",
        "priceCash": 549990,
        "priceNormal": 579990,
        "inStock": true,
        "productUrl": "https://www.falabella.com"
      }
    ]
  },
  {
    "id": "ibanez-sa260fm-violin",
    "name": "Guitarra Eléctrica SA Standard SA260FM Violin Sunburst",
    "brand": "Ibanez",
    "category": "Cuerda",
    "section": "Instrumentos",
    "subCategory": "Guitarras Eléctricas",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/177446/210518-1.jpg?v=637860642011030000",
    "description": "Diseñada para versatilidad con cuerpo ligero de okoume y tapa de arce flameado, configuración de pastillas SSH Resolution y trémolo T102.",
    "minPrice": 399990,
    "offers": [
      {
        "id": "offer-iba-sa-1",
        "storeName": "Audiomusica",
        "priceCash": 399990,
        "priceNormal": 429990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com/guitarra-electrica-ibanez-sa260fm-violin-sunburst-210518/p"
      },
      {
        "id": "offer-iba-sa-2",
        "storeName": "Casa Amarilla",
        "priceCash": 419990,
        "priceNormal": 449990,
        "inStock": true,
        "productUrl": "https://www.casamarilla.cl"
      }
    ]
  },
  {
    "id": "schecter-synyster-custom-s",
    "name": "Guitarra Eléctrica Synyster Custom-S Gloss Black Gold Pinstripes",
    "brand": "Schecter",
    "category": "Cuerda",
    "section": "Instrumentos",
    "subCategory": "Guitarras Eléctricas",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0865/2265/9098/files/1742_1.jpg?v=1782423733",
    "description": "Modelo signature de Synyster Gates (Avenged Sevenfold) con sistema Sustainiac en mástil, pastilla puente Schecter USA Synyster Gates y puente Floyd Rose 1500 Series.",
    "minPrice": 1769900,
    "offers": [
      {
        "id": "offer-sch-syn-1",
        "storeName": "Promusic",
        "priceCash": 1769900,
        "priceNormal": 1859900,
        "inStock": true,
        "productUrl": "https://promusic.cl/products/schecter-synyster-custom-s-gloss-black-with-gold-pinstripes-6-cuerdas"
      },
      {
        "id": "offer-sch-syn-2",
        "storeName": "Overdrive",
        "priceCash": 1799990,
        "priceNormal": 1899990,
        "inStock": false,
        "productUrl": "https://www.overdrive.cl"
      }
    ]
  },
  {
    "id": "yamaha-c40-ii",
    "name": "Guitarra Clásica C40 II Acústica 4/4",
    "brand": "Yamaha",
    "category": "Cuerda",
    "section": "Instrumentos",
    "subCategory": "Guitarras Clásicas",
    "imageUrl": "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80",
    "description": "La guitarra clásica de referencia para estudiantes y conservatorios. Tapa de picea, fondo y aros de meranti con acabado natural brillante.",
    "minPrice": 139990,
    "offers": [
      {
        "id": "offer-yam-c40-1",
        "storeName": "Casa Amarilla",
        "priceCash": 139990,
        "priceNormal": 149990,
        "inStock": true,
        "productUrl": "https://www.casamarilla.cl"
      },
      {
        "id": "offer-yam-c40-2",
        "storeName": "Audiomusica",
        "priceCash": 144990,
        "priceNormal": 154990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-yam-c40-3",
        "storeName": "Falabella",
        "priceCash": 149990,
        "priceNormal": 159990,
        "inStock": true,
        "productUrl": "https://www.falabella.com"
      }
    ]
  },
  {
    "id": "ibanez-ga3-acoustic",
    "name": "Guitarra Acústica Clásica GA3 Open Pore Ámbar",
    "brand": "Ibanez",
    "category": "Cuerda",
    "section": "Instrumentos",
    "subCategory": "Guitarras Acústicas",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/190792/1-guitarra-acustica-ibanez-ga3-oam-open-pore-ambar-213538.jpg?v=638495696671230000",
    "description": "Guitarra de cuerdas de nylon con acabado de poro abierto que potencia la resonancia acústica natural de la madera.",
    "minPrice": 195990,
    "offers": [
      {
        "id": "offer-iba-ga3-1",
        "storeName": "Audiomusica",
        "priceCash": 195990,
        "priceNormal": 209990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-iba-ga3-2",
        "storeName": "Casa Amarilla",
        "priceCash": 199990,
        "priceNormal": 214990,
        "inStock": true,
        "productUrl": "https://www.casamarilla.cl"
      }
    ]
  },
  {
    "id": "epiphone-hummingbird-studio",
    "name": "Guitarra Electroacústica Hummingbird Studio Ebony",
    "brand": "Epiphone",
    "category": "Cuerda",
    "section": "Instrumentos",
    "subCategory": "Guitarras Acústicas",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/212881/1115906-3.jpg?v=639209545009230000",
    "description": "Inspirada en el legendario modelo Gibson de los años 60, con tapa de abeto macizo, cuerpo de caoba y preamplificador Fishman Sonitone.",
    "minPrice": 629990,
    "offers": [
      {
        "id": "offer-epi-hb-1",
        "storeName": "Audiomusica",
        "priceCash": 629990,
        "priceNormal": 669990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-epi-hb-2",
        "storeName": "Overdrive",
        "priceCash": 649990,
        "priceNormal": 689990,
        "inStock": true,
        "productUrl": "https://www.overdrive.cl"
      }
    ]
  },
  {
    "id": "freeman-precision-bass-spb304",
    "name": "Bajo Eléctrico Precision Bass SPB-304 Sunburst",
    "brand": "Freeman",
    "category": "Cuerda",
    "section": "Instrumentos",
    "subCategory": "Bajos Eléctricos",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/193302/1-bajo-electrico-freeman-spb-304-sunburst-213737.jpg?v=638574436095970000",
    "description": "Bajo de 4 cuerdas de diseño tradicional con pastilla split-coil P-Bass, excelente respuesta en frecuencias bajas y tacto cómodo para iniciación y ensayos.",
    "minPrice": 199990,
    "offers": [
      {
        "id": "offer-fre-pb-1",
        "storeName": "Audiomusica",
        "priceCash": 199990,
        "priceNormal": 214990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-fre-pb-2",
        "storeName": "Casa Amarilla",
        "priceCash": 209990,
        "priceNormal": 224990,
        "inStock": true,
        "productUrl": "https://www.casamarilla.cl"
      }
    ]
  },
  {
    "id": "schecter-j4-exotic-jazz-bass",
    "name": "Bajo Eléctrico J-4 Exotic Faded Vintage Sunburst 4 Cuerdas",
    "brand": "Schecter",
    "category": "Cuerda",
    "section": "Instrumentos",
    "subCategory": "Bajos Eléctricos",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0865/2265/9098/files/2926_1.jpg?v=1782425392",
    "description": "Bajo premium con cuerpo de fresno pantanoso, mástil de arce tostado y pastillas Schecter MonsterTone-J con un rango dinámico y punch excepcional.",
    "minPrice": 1439900,
    "offers": [
      {
        "id": "offer-sch-j4-1",
        "storeName": "Promusic",
        "priceCash": 1439900,
        "priceNormal": 1519900,
        "inStock": true,
        "productUrl": "https://promusic.cl/products/schecter-j-4-exotic-faded-vintage-sunburst-bajoi-electrico-4-cuerdas"
      },
      {
        "id": "offer-sch-j4-2",
        "storeName": "Overdrive",
        "priceCash": 1489990,
        "priceNormal": 1569990,
        "inStock": false,
        "productUrl": "https://www.overdrive.cl"
      }
    ]
  },
  {
    "id": "freeman-ukelele-soprano-pack",
    "name": "Pack Ukelele Soprano Sapelly Natural con Funda y Afinador",
    "brand": "Freeman",
    "category": "Cuerda",
    "section": "Instrumentos",
    "subCategory": "Ukeleles",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/167521/pack-ukelele-soprano-freeman-color-sapelly-natural-211412-1.jpg?v=637801428183570000",
    "description": "Ukelele soprano tradicional en madera de sapelly que entrega calidez y dulzura. Incluye funda protectora y accesorios indispensables.",
    "minPrice": 49990,
    "offers": [
      {
        "id": "offer-fre-uk-1",
        "storeName": "Audiomusica",
        "priceCash": 49990,
        "priceNormal": 54990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-fre-uk-2",
        "storeName": "Falabella",
        "priceCash": 52990,
        "priceNormal": 57990,
        "inStock": true,
        "productUrl": "https://www.falabella.com"
      }
    ]
  },
  {
    "id": "freeman-classic-violin-frv50",
    "name": "Violín Classic 3/4 FRV50 con Arco y Estuche Rígido",
    "brand": "Freeman Classic",
    "category": "Cuerda",
    "section": "Instrumentos",
    "subCategory": "Violines",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/208200/208429_3k.jpg?v=639065930751000000",
    "description": "Violín de iniciación musical y práctica escolar, construido con tapa de abeto laminado, clavijas afinadoras y cordal con 4 microafinadores.",
    "minPrice": 102990,
    "offers": [
      {
        "id": "offer-fre-vn-1",
        "storeName": "Audiomusica",
        "priceCash": 102990,
        "priceNormal": 109990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-fre-vn-2",
        "storeName": "Casa Amarilla",
        "priceCash": 109990,
        "priceNormal": 119990,
        "inStock": true,
        "productUrl": "https://www.casamarilla.cl"
      }
    ]
  },
  {
    "id": "yamaha-yts-280s-tenor",
    "name": "Saxofón Tenor YTS-280S Plateado / Dorado",
    "brand": "Yamaha",
    "category": "Aire",
    "section": "Instrumentos",
    "subCategory": "Saxofones",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/198075/saxofon-tenor-yamaha-yts-280.jpg.jpg?v=638751372433600000",
    "description": "El saxofón tenor estándar de estudio más confiable del mundo, diseñado específicamente para estudiantes con entonación estable y ergonomía optimizada.",
    "minPrice": 3244990,
    "offers": [
      {
        "id": "offer-yam-sax-1",
        "storeName": "Audiomusica",
        "priceCash": 3244990,
        "priceNormal": 3399990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-yam-sax-2",
        "storeName": "Casa Amarilla",
        "priceCash": 3299990,
        "priceNormal": 3459990,
        "inStock": false,
        "productUrl": "https://www.casamarilla.cl"
      }
    ]
  },
  {
    "id": "yamaha-yfl-222",
    "name": "Flauta Traversa Estándar YFL-222 Plateada",
    "brand": "Yamaha",
    "category": "Aire",
    "section": "Instrumentos",
    "subCategory": "Flautas Traversas",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/176051/flauta-traversa-yamaha-yfl222-1103220-1.jpg?v=637844488004370000",
    "description": "Flauta traversa de estudio con llaves cerradas ergonómicas, cuerpo y llaves de alpaca plateada con entonación impecable y fácil emisión.",
    "minPrice": 1079990,
    "offers": [
      {
        "id": "offer-yam-fl-1",
        "storeName": "Audiomusica",
        "priceCash": 1079990,
        "priceNormal": 1139990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-yam-fl-2",
        "storeName": "Casa Amarilla",
        "priceCash": 1099990,
        "priceNormal": 1159990,
        "inStock": true,
        "productUrl": "https://www.casamarilla.cl"
      }
    ]
  },
  {
    "id": "baldassare-trompeta-6418n",
    "name": "Trompeta Niquelada en Si Bemol Baldassare 6418N con Estuche",
    "brand": "Baldassare",
    "category": "Aire",
    "section": "Instrumentos",
    "subCategory": "Trompetas",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/208056/205128-H1-niquelada-baldassare-6418n-05.jpg?v=639065823035900000",
    "description": "Trompeta Bb acabada en níquel brillante, con pistones de suave desplazamiento y respuesta sonora clara para bandas y ensambles.",
    "minPrice": 199990,
    "offers": [
      {
        "id": "offer-bal-tp-1",
        "storeName": "Audiomusica",
        "priceCash": 199990,
        "priceNormal": 214990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-bal-tp-2",
        "storeName": "Casa Amarilla",
        "priceCash": 209990,
        "priceNormal": 224990,
        "inStock": true,
        "productUrl": "https://www.casamarilla.cl"
      }
    ]
  },
  {
    "id": "jupiter-clarinete-jcl750nq",
    "name": "Clarinete Jupiter JCL750NQ en Si Bemol con Bolso Mochila",
    "brand": "Jupiter",
    "category": "Aire",
    "section": "Instrumentos",
    "subCategory": "Clarinetes",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/208178/clarinete-jupiter-jcl750nq-en-si-bemol-con-bolso-1108043-1.jpg?v=639065895825730000",
    "description": "Cuerpo de madera de granadilla tratada con llaves niqueladas, orificios cónicos rebajados y espiga reforzada para una afinación acústica superior.",
    "minPrice": 927990,
    "offers": [
      {
        "id": "offer-jup-cl-1",
        "storeName": "Audiomusica",
        "priceCash": 927990,
        "priceNormal": 979990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-jup-cl-2",
        "storeName": "Promusic",
        "priceCash": 949900,
        "priceNormal": 999900,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      }
    ]
  },
  {
    "id": "roland-td-07kv",
    "name": "Batería Electrónica V-Drums TD-07KV",
    "brand": "Roland",
    "category": "Percusión",
    "section": "Instrumentos",
    "subCategory": "Baterías Electrónicas",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/167284/bateria-electronica-roland-td07kv-212009-1.jpg?v=637801427304500000",
    "description": "Equipada con parches de malla de doble capa característicos de Roland, conectividad Bluetooth para tocar junto a tus temas favoritos y salida USB de audio.",
    "minPrice": 1167990,
    "offers": [
      {
        "id": "offer-rol-td-1",
        "storeName": "Audiomusica",
        "priceCash": 1167990,
        "priceNormal": 1229990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-rol-td-2",
        "storeName": "Promusic",
        "priceCash": 1189900,
        "priceNormal": 1249900,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      }
    ]
  },
  {
    "id": "tama-rhythm-mate-5pc",
    "name": "Batería Acústica Tama Rhythm Mate 5 Cuerpos Hairline Blue",
    "brand": "Tama",
    "category": "Percusión",
    "section": "Instrumentos",
    "subCategory": "Baterías Acústicas",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/197289/1-bateria-tama-rhythm-mate-de-5-piezas-color-hairline-blue-212213.jpg?v=638727238150430000",
    "description": "Cascos de álamo de 9 capas con tecnología TAMA Omnisphere de ajuste de toms, aros Accu-Tune de bombo y set completo de herrajes de doble brazo.",
    "minPrice": 607990,
    "offers": [
      {
        "id": "offer-tam-rm-1",
        "storeName": "Audiomusica",
        "priceCash": 607990,
        "priceNormal": 649990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-tam-rm-2",
        "storeName": "Casa Amarilla",
        "priceCash": 629990,
        "priceNormal": 669990,
        "inStock": true,
        "productUrl": "https://www.casamarilla.cl"
      }
    ]
  },
  {
    "id": "mapex-black-panther-pegasus",
    "name": "Caja Redoblante Mapex Black Panther Pegasus 14 x 5.5",
    "brand": "Mapex",
    "category": "Percusión",
    "section": "Instrumentos",
    "subCategory": "Cajas y Redoblantes",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/191209/1112711.jpg?v=638521886533930000",
    "description": "Caja profesional con casco híbrido de arce y nogal, bordes SONIClear que proporcionan ataque incisivo, calidez profunda y control dinámico total.",
    "minPrice": 485990,
    "offers": [
      {
        "id": "offer-map-peg-1",
        "storeName": "Audiomusica",
        "priceCash": 485990,
        "priceNormal": 519990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-map-peg-2",
        "storeName": "Casa Amarilla",
        "priceCash": 499990,
        "priceNormal": 534990,
        "inStock": false,
        "productUrl": "https://www.casamarilla.cl"
      }
    ]
  },
  {
    "id": "zildjian-zp4pk-cymbals",
    "name": "Pack de Platillos Zildjian ZP4PK Planet Z (14 Hi-Hat, 16 Crash, 20 Ride)",
    "brand": "Zildjian",
    "category": "Percusión",
    "section": "Instrumentos",
    "subCategory": "Platillos",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/170539/pack-de-platillos-zildjian-zp4pk-de-3-unidades-1108611-1.jpg?v=637801438824130000",
    "description": "Set de platillos forjados en aleación de latón de alta precisión con corte definido, sustain brillante y durabilidad para bateristas en formación.",
    "minPrice": 339990,
    "offers": [
      {
        "id": "offer-zil-zp-1",
        "storeName": "Audiomusica",
        "priceCash": 339990,
        "priceNormal": 359990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-zil-zp-2",
        "storeName": "Promusic",
        "priceCash": 349900,
        "priceNormal": 369900,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      }
    ]
  },
  {
    "id": "yamaha-p45b-digital-piano",
    "name": "Piano Digital Yamaha P-45B 88 Teclas Contrapesadas Pack con Soporte",
    "brand": "Yamaha",
    "category": "Teclas",
    "section": "Instrumentos",
    "subCategory": "Pianos Digitales",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0865/2265/9098/files/P45BL85_1.jpg?v=1786138622",
    "description": "Mecanismo de teclado Graded Hammer Standard (GHS) de tacto progresivo acústico, muestreo estéreo AWM y diseño ultraligero y transportable.",
    "minPrice": 775700,
    "offers": [
      {
        "id": "offer-yam-p45-1",
        "storeName": "Promusic",
        "priceCash": 775700,
        "priceNormal": 815900,
        "inStock": true,
        "productUrl": "https://promusic.cl/products/yamaha-p-45b-piano-digital-88-teclas-pack-soporte-l-85"
      },
      {
        "id": "offer-yam-p45-2",
        "storeName": "Audiomusica",
        "priceCash": 789990,
        "priceNormal": 829990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      }
    ]
  },
  {
    "id": "roland-fp-30x-piano",
    "name": "Piano Digital Roland FP-30X 88 Teclas PHA-4 Negro",
    "brand": "Roland",
    "category": "Teclas",
    "section": "Instrumentos",
    "subCategory": "Pianos Digitales",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/170900/piano-digital-roland-fp-30x-negro-212134-1.jpg?v=637801439763730000",
    "description": "Generador de sonido SuperNATURAL Piano de Roland, teclado PHA-4 Standard con escape y tacto marfil, y conectividad Bluetooth MIDI/Audio.",
    "minPrice": 968990,
    "offers": [
      {
        "id": "offer-rol-fp30-1",
        "storeName": "Audiomusica",
        "priceCash": 968990,
        "priceNormal": 1019990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-rol-fp30-2",
        "storeName": "Promusic",
        "priceCash": 989900,
        "priceNormal": 1039900,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      }
    ]
  },
  {
    "id": "korg-microkorg-xl",
    "name": "Sintetizador y Vocoder Korg MicroKORG XL+ 37 Mini Teclas",
    "brand": "Korg",
    "category": "Teclas",
    "section": "Instrumentos",
    "subCategory": "Sintetizadores",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/173437/sintetizador-korg-microkorg-xl-1096286-1.jpg?v=637828637196930000",
    "description": "Motor de modelado analógico MMT con vocoder de 16 bandas, micrófono de cuello de cisne y teclado Natural Touch para escenarios y producción.",
    "minPrice": 566990,
    "offers": [
      {
        "id": "offer-kor-mkxl-1",
        "storeName": "Audiomusica",
        "priceCash": 566990,
        "priceNormal": 599990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-kor-mkxl-2",
        "storeName": "Overdrive",
        "priceCash": 589990,
        "priceNormal": 619990,
        "inStock": true,
        "productUrl": "https://www.overdrive.cl"
      }
    ]
  },
  {
    "id": "korg-minilogue-xd",
    "name": "Sintetizador Analógico Polifónico Minilogue XD",
    "brand": "Korg",
    "category": "Teclas",
    "section": "Instrumentos",
    "subCategory": "Sintetizadores",
    "imageUrl": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80",
    "description": "Sintetizador analógico de 4 voces con multi-motor digital integrado, secuenciador polifónico y efectos estéreo digitales de calidad de estudio.",
    "minPrice": 629990,
    "offers": [
      {
        "id": "offer-kor-min-1",
        "storeName": "Promusic",
        "priceCash": 629990,
        "priceNormal": 669990,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      },
      {
        "id": "offer-kor-min-2",
        "storeName": "Audiomusica",
        "priceCash": 649990,
        "priceNormal": 689990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      }
    ]
  },
  {
    "id": "ernie-ball-regular-slinky",
    "name": "Cuerdas para Guitarra Eléctrica Regular Slinky 10-46",
    "brand": "Ernie Ball",
    "category": "Cuerdas y Afinación",
    "section": "Piezas y Repuestos",
    "subCategory": "Cuerdas Guitarra y Bajo",
    "imageUrl": "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=600&q=80",
    "description": "El encordado más legendario y utilizado por guitarristas en el mundo. Entorchado de acero niquelado sobre núcleo de acero de alto carbono.",
    "minPrice": 8990,
    "offers": [
      {
        "id": "offer-eb-reg-1",
        "storeName": "Overdrive",
        "priceCash": 8990,
        "priceNormal": 9990,
        "inStock": true,
        "productUrl": "https://www.overdrive.cl"
      },
      {
        "id": "offer-eb-reg-2",
        "storeName": "Audiomusica",
        "priceCash": 9490,
        "priceNormal": 10490,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-eb-reg-3",
        "storeName": "Promusic",
        "priceCash": 9900,
        "priceNormal": 10900,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      }
    ]
  },
  {
    "id": "daddario-exl170-bass-strings",
    "name": "Set de Cuerdas para Bajo Eléctrico D'Addario EXL170 45-100",
    "brand": "D'Addario",
    "category": "Cuerdas y Afinación",
    "section": "Piezas y Repuestos",
    "subCategory": "Cuerdas Guitarra y Bajo",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/200393/1007240-2.jpg.jpg?v=638827684852300000",
    "description": "Las cuerdas de bajo más populares de D'Addario, ofrecen graves redondos y potentes con agudos definidos para cualquier estilo.",
    "minPrice": 39990,
    "offers": [
      {
        "id": "offer-dad-exl-1",
        "storeName": "Audiomusica",
        "priceCash": 39990,
        "priceNormal": 42990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-dad-exl-2",
        "storeName": "Overdrive",
        "priceCash": 41990,
        "priceNormal": 44990,
        "inStock": true,
        "productUrl": "https://www.overdrive.cl"
      }
    ]
  },
  {
    "id": "daddario-ej16-acoustic-strings",
    "name": "Set Cuerdas Guitarra Acústica Phosphor Bronze EJ16 12-53",
    "brand": "D'Addario",
    "category": "Cuerdas y Afinación",
    "section": "Piezas y Repuestos",
    "subCategory": "Cuerdas Guitarra y Bajo",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0865/2265/9098/files/EJ16_1.jpg?v=1777999256",
    "description": "Bronce fosforoso de precisión que entrega el balance perfecto entre timbre cálido, articulación acústica brillante y larga durabilidad.",
    "minPrice": 9900,
    "offers": [
      {
        "id": "offer-dad-ej16-1",
        "storeName": "Promusic",
        "priceCash": 9900,
        "priceNormal": 10900,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      },
      {
        "id": "offer-dad-ej16-2",
        "storeName": "Audiomusica",
        "priceCash": 10990,
        "priceNormal": 11990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      }
    ]
  },
  {
    "id": "boss-tu-10-clip-tuner",
    "name": "Afinador Cromático de Pinza Boss TU-10 Negro",
    "brand": "Boss",
    "category": "Cuerdas y Afinación",
    "section": "Piezas y Repuestos",
    "subCategory": "Clavijeros y Afinadores",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/175180/afinador-de-pinza-boss-tu10-negro-211243-1.jpg?v=637828693330430000",
    "description": "Afinador de clip para clavijero con pantalla LCD en color 'True Color', función Accu-Pitch y capacidad de afinación plana hasta 5 semitonos.",
    "minPrice": 51990,
    "offers": [
      {
        "id": "offer-bos-tu10-1",
        "storeName": "Audiomusica",
        "priceCash": 51990,
        "priceNormal": 54990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-bos-tu10-2",
        "storeName": "Casa Amarilla",
        "priceCash": 53990,
        "priceNormal": 56990,
        "inStock": true,
        "productUrl": "https://www.casamarilla.cl"
      }
    ]
  },
  {
    "id": "tc-electronic-unitune-clip",
    "name": "Afinador Cromático Clip-On UniTune Clip TC Electronic",
    "brand": "TC Electronic",
    "category": "Cuerdas y Afinación",
    "section": "Piezas y Repuestos",
    "subCategory": "Clavijeros y Afinadores",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0865/2265/9098/files/tc-electronic-unitune-clip-front-2000x2000-web.jpg?v=1776974993",
    "description": "Afinación ultra precisa con pantalla LED de matriz brillante de 108 LED y pinza de acero inoxidable para sujeción firme sin rayar el instrumento.",
    "minPrice": 39900,
    "offers": [
      {
        "id": "offer-tc-uni-1",
        "storeName": "Promusic",
        "priceCash": 39900,
        "priceNormal": 42900,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      },
      {
        "id": "offer-tc-uni-2",
        "storeName": "Overdrive",
        "priceCash": 41990,
        "priceNormal": 44990,
        "inStock": true,
        "productUrl": "https://www.overdrive.cl"
      }
    ]
  },
  {
    "id": "seymour-duncan-jb-jazz",
    "name": "Set de Pastillas Humbucker JB & Jazz Hot Rodded",
    "brand": "Seymour Duncan",
    "category": "Electrónica y Pastillas",
    "section": "Piezas y Repuestos",
    "subCategory": "Pastillas / Cápsulas",
    "imageUrl": "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=600&q=80",
    "description": "El set humbucker definitivo: SH-4 JB en el puente para armónicos ricos y distorsión cortante, y SH-2n Jazz en el mástil para articulación nítida.",
    "minPrice": 189990,
    "offers": [
      {
        "id": "offer-sd-jb-1",
        "storeName": "Overdrive",
        "priceCash": 189990,
        "priceNormal": 199990,
        "inStock": true,
        "productUrl": "https://www.overdrive.cl"
      },
      {
        "id": "offer-sd-jb-2",
        "storeName": "Promusic",
        "priceCash": 194990,
        "priceNormal": 204990,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      }
    ]
  },
  {
    "id": "ernie-ball-strap-red",
    "name": "Correa para Guitarra Ernie Ball Polypro Ristra Red",
    "brand": "Ernie Ball",
    "category": "Accesorios",
    "section": "Piezas y Repuestos",
    "subCategory": "Correas / Straps",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/168211/correa-para-guitarra-ernie-ball-p05322-ristra-red-1110059-1.jpg?v=637801430741730000",
    "description": "Correa de polipropileno de alta resistencia de 2 pulgadas de ancho con extremos de cuero negro cosidos a máquina y hebilla de ajuste.",
    "minPrice": 31990,
    "offers": [
      {
        "id": "offer-eb-str-1",
        "storeName": "Audiomusica",
        "priceCash": 31990,
        "priceNormal": 34990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-eb-str-2",
        "storeName": "Overdrive",
        "priceCash": 32990,
        "priceNormal": 35990,
        "inStock": true,
        "productUrl": "https://www.overdrive.cl"
      }
    ]
  },
  {
    "id": "rockbag-acoustic-gigbag",
    "name": "Funda para Guitarra Acústica Rockbag RB20518B Impermeable",
    "brand": "Rockbag",
    "category": "Accesorios",
    "section": "Piezas y Repuestos",
    "subCategory": "Fundas y Estuches",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/167394/funda-de-guitarra-acustica-rockbag-rb20518b-color-negro-210118-1.jpg?v=637801427670730000",
    "description": "Funda acolchada con material RokTex resistente al agua, acolchado de 10 mm, correas tipo mochila y bolsillos frontales para partituras y cables.",
    "minPrice": 34990,
    "offers": [
      {
        "id": "offer-rb-gb-1",
        "storeName": "Audiomusica",
        "priceCash": 34990,
        "priceNormal": 37990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-rb-gb-2",
        "storeName": "Casa Amarilla",
        "priceCash": 36990,
        "priceNormal": 39990,
        "inStock": true,
        "productUrl": "https://www.casamarilla.cl"
      }
    ]
  },
  {
    "id": "hercules-gs401bb-stand",
    "name": "Mini Atril Plegable para Guitarra Acústica Hercules GS401BB",
    "brand": "Hercules",
    "category": "Accesorios",
    "section": "Piezas y Repuestos",
    "subCategory": "Soportes / Stands",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/180818/1096283-GS401BB.jpg?v=638083702564630000",
    "description": "Soporte de piso ultra compacto plegable con espuma especial formulada (SFF) en todos los puntos de contacto para no dañar el acabado de la guitarra.",
    "minPrice": 56990,
    "offers": [
      {
        "id": "offer-herc-st-1",
        "storeName": "Audiomusica",
        "priceCash": 56990,
        "priceNormal": 59990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-herc-st-2",
        "storeName": "Promusic",
        "priceCash": 58900,
        "priceNormal": 62900,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      }
    ]
  },
  {
    "id": "dunlop-gator-picks-12pack",
    "name": "Pack de 12 Uñetas Dunlop 417P Gator Grip 1.14mm",
    "brand": "Dunlop",
    "category": "Accesorios",
    "section": "Piezas y Repuestos",
    "subCategory": "Picks / Uñetas",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/173203/pack-de-12-unetas-dunlop-417p1-14-gator-1085390-1.jpg?v=637828636167000000",
    "description": "Superficie mate antideslizante con borde biselado para un ataque instantáneo y agarre seguro en sesiones de directo intensas.",
    "minPrice": 12990,
    "offers": [
      {
        "id": "offer-dun-pk-1",
        "storeName": "Audiomusica",
        "priceCash": 12990,
        "priceNormal": 14990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-dun-pk-2",
        "storeName": "Overdrive",
        "priceCash": 13990,
        "priceNormal": 15990,
        "inStock": true,
        "productUrl": "https://www.overdrive.cl"
      }
    ]
  },
  {
    "id": "dunlop-formula-654-cleaner",
    "name": "Líquido de Limpieza y Pulido para Guitarra Dunlop 654 Formula 65",
    "brand": "Dunlop",
    "category": "Mantenimiento",
    "section": "Piezas y Repuestos",
    "subCategory": "Kits de Limpieza",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/173081/liquido-para-limpieza-de-guitarra-dunlop-654-1013620-1.jpg?v=637828626244670000",
    "description": "Fórmula profesional que elimina huellas, sudor y suciedad restaurando el brillo original del instrumento con una capa protectora fina.",
    "minPrice": 13990,
    "offers": [
      {
        "id": "offer-dun-cln-1",
        "storeName": "Audiomusica",
        "priceCash": 13990,
        "priceNormal": 15990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-dun-cln-2",
        "storeName": "Overdrive",
        "priceCash": 14990,
        "priceNormal": 16990,
        "inStock": true,
        "productUrl": "https://www.overdrive.cl"
      }
    ]
  },
  {
    "id": "daddario-care-kit-pweck01",
    "name": "Kit Completo de Cuidado y Calibración para Instrumentos D'Addario PW-ECK-01",
    "brand": "D'Addario",
    "category": "Mantenimiento",
    "section": "Piezas y Repuestos",
    "subCategory": "Herramientas de Calibración",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/213531/ToolsYouNeed-1114275.jpg?v=639217259377100000",
    "description": "Contiene regla de acción de cuerdas, llaves multi-herramienta, enrollador de cuerdas, cortador, lubricante y paño de microfibra en estuche rígido.",
    "minPrice": 69990,
    "offers": [
      {
        "id": "offer-dad-kit-1",
        "storeName": "Audiomusica",
        "priceCash": 69990,
        "priceNormal": 74990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-dad-kit-2",
        "storeName": "Promusic",
        "priceCash": 72900,
        "priceNormal": 76900,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      }
    ]
  },
  {
    "id": "line6-spider-v60-mkii",
    "name": "Amplificador de Guitarra Line 6 Spider V 60 MKII 60W con Altavoz 10\"",
    "brand": "Line 6",
    "category": "Amplificación",
    "section": "Equipos de sonido",
    "subCategory": "Amplificadores de Guitarra",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/206973/1-amplificador-de-guitarra-line-6-spider-v60-mkii-10-60-w-1108596.jpg?v=639044264647230000",
    "description": "Más de 200 amplificadores, cabinas y efectos modelados, sistema de altavoces de rango completo (Full-Range) con tweeter y receptor inalámbrico integrado.",
    "minPrice": 421990,
    "offers": [
      {
        "id": "offer-l6-sp-1",
        "storeName": "Audiomusica",
        "priceCash": 421990,
        "priceNormal": 449990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-l6-sp-2",
        "storeName": "Promusic",
        "priceCash": 435900,
        "priceNormal": 459900,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      }
    ]
  },
  {
    "id": "roland-jc-40-jazz-chorus",
    "name": "Amplificador Estéreo Roland JC-40 40W Jazz Chorus 2x10\"",
    "brand": "Roland",
    "category": "Amplificación",
    "section": "Equipos de sonido",
    "subCategory": "Amplificadores de Guitarra",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/167221/amplificador-de-guitarra-roland-jc40-jazz-chorus-209330-1.jpg?v=637801427049100000",
    "description": "El mítico sonido limpio 'JC Clean' en formato combo de 40 vatios estéreo con el genuino efecto Space Chorus dimensional y entrada estéreo frontal para pedaleras.",
    "minPrice": 978990,
    "offers": [
      {
        "id": "offer-rol-jc40-1",
        "storeName": "Audiomusica",
        "priceCash": 978990,
        "priceNormal": 1029990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-rol-jc40-2",
        "storeName": "Promusic",
        "priceCash": 999900,
        "priceNormal": 1059900,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      }
    ]
  },
  {
    "id": "hartke-systems-hd25-bass-amp",
    "name": "Amplificador de Bajo Hartke Systems HD25 25 Watts HyDrive",
    "brand": "Hartke Systems",
    "category": "Amplificación",
    "section": "Equipos de sonido",
    "subCategory": "Amplificadores de Bajo",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/167294/amplificador-de-bajo-hartke-systems-hd25-25-watts-1105953-1.jpg?v=637801427357500000",
    "description": "Cono híbrido patentado HyDrive de 8 pulgadas (papel + aluminio) que combina calidez acústica con el ataque contundente y rápido del aluminio.",
    "minPrice": 197990,
    "offers": [
      {
        "id": "offer-har-hd25-1",
        "storeName": "Audiomusica",
        "priceCash": 197990,
        "priceNormal": 209990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-har-hd25-2",
        "storeName": "Overdrive",
        "priceCash": 204990,
        "priceNormal": 219990,
        "inStock": true,
        "productUrl": "https://www.overdrive.cl"
      }
    ]
  },
  {
    "id": "boss-os-2-overdrive-distortion",
    "name": "Pedal de Efecto Boss OS-2 Overdrive / Distorsión",
    "brand": "Boss",
    "category": "Efectos",
    "section": "Equipos de sonido",
    "subCategory": "Pedales de Efectos",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/168823/pedal-de-efecto-boss-os2-overdrivedistorsion-202383-1.jpg?v=637801432803100000",
    "description": "Permite elegir entre saturación overdrive cálida, distorsión agresiva o mezclar ambas gradualmente para esculpir texturas únicas.",
    "minPrice": 89990,
    "offers": [
      {
        "id": "offer-bos-os2-1",
        "storeName": "Audiomusica",
        "priceCash": 89990,
        "priceNormal": 94990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-bos-os2-2",
        "storeName": "Overdrive",
        "priceCash": 92990,
        "priceNormal": 97990,
        "inStock": true,
        "productUrl": "https://www.overdrive.cl"
      },
      {
        "id": "offer-bos-os2-3",
        "storeName": "Casa Amarilla",
        "priceCash": 94990,
        "priceNormal": 99990,
        "inStock": true,
        "productUrl": "https://www.casamarilla.cl"
      }
    ]
  },
  {
    "id": "boss-me-90-guitar-multieffects",
    "name": "Pedalera Multiefecto para Guitarra Boss ME-90",
    "brand": "Boss",
    "category": "Efectos",
    "section": "Equipos de sonido",
    "subCategory": "Pedaleras Multiefectos",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/186576/1-pedalera-multiefecto-boss-me-90-212857.jpg?v=638343776151000000",
    "description": "Procesador de guitarra todo en uno con modelado de amplificadores AIRD de alta gama, 60 efectos BOSS, pedal de expresión integrado e interfaz de audio USB.",
    "minPrice": 478990,
    "offers": [
      {
        "id": "offer-bos-me90-1",
        "storeName": "Audiomusica",
        "priceCash": 478990,
        "priceNormal": 509990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-bos-me90-2",
        "storeName": "Promusic",
        "priceCash": 489900,
        "priceNormal": 519900,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      }
    ]
  },
  {
    "id": "zoom-ms-60b-bass-multieffects",
    "name": "Pedal Multiefecto para Bajo Zoom MS-60B MultiStomp",
    "brand": "Zoom",
    "category": "Efectos",
    "section": "Equipos de sonido",
    "subCategory": "Pedaleras Multiefectos",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0865/2265/9098/files/MS60B_da476073-aa25-4a9e-99db-c119cf8447d4.jpg?v=1780416343",
    "description": "Formato de pedal compacto que alberga 58 efectos de bajo y modelos de amplificador, afinador cromático y posibilidad de encadenar hasta 4 efectos simultáneos.",
    "minPrice": 164900,
    "offers": [
      {
        "id": "offer-zm-ms60-1",
        "storeName": "Promusic",
        "priceCash": 164900,
        "priceNormal": 174900,
        "inStock": true,
        "productUrl": "https://promusic.cl/products/zoom-ms60b-pedal-de-bajo-multiefecto"
      },
      {
        "id": "offer-zm-ms60-2",
        "storeName": "Overdrive",
        "priceCash": 169990,
        "priceNormal": 179990,
        "inStock": true,
        "productUrl": "https://www.overdrive.cl"
      }
    ]
  },
  {
    "id": "universal-audio-volt-2",
    "name": "Interfaz de Audio USB-C Universal Audio Volt 2 (2 In / 2 Out)",
    "brand": "Universal Audio",
    "category": "Grabación y Estudio",
    "section": "Equipos de sonido",
    "subCategory": "Interfaces de Audio",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0865/2265/9098/files/VOLT2_1_5b82e4d9-0bc7-4e52-a793-1750c0b2d6ed.jpg?v=1759776772",
    "description": "Preamplificadores con modo Vintage Tube basado en el clásico 610 de UA, conversores líderes de 24 bits/192 kHz y salida de audífonos con volumen independiente.",
    "minPrice": 239900,
    "offers": [
      {
        "id": "offer-ua-v2-1",
        "storeName": "Promusic",
        "priceCash": 239900,
        "priceNormal": 254900,
        "inStock": true,
        "productUrl": "https://promusic.cl/products/universal-audio-volt-2-interfaz-de-audio-usb-c"
      },
      {
        "id": "offer-ua-v2-2",
        "storeName": "Audiomusica",
        "priceCash": 249990,
        "priceNormal": 264990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      }
    ]
  },
  {
    "id": "focusrite-scarlett-2i2-4th-gen",
    "name": "Interfaz de Audio Focusrite Scarlett 2i2 4th Gen USB",
    "brand": "Focusrite",
    "category": "Grabación y Estudio",
    "section": "Equipos de sonido",
    "subCategory": "Interfaces de Audio",
    "imageUrl": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80",
    "description": "Conversores de rango dinámico de 120 dB provenientes de las interfaces RedNet insignia de Focusrite, ganancia automática y modo Air renovado.",
    "minPrice": 199990,
    "offers": [
      {
        "id": "offer-foc-2i2-1",
        "storeName": "Audiomusica",
        "priceCash": 199990,
        "priceNormal": 219990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-foc-2i2-2",
        "storeName": "Promusic",
        "priceCash": 204990,
        "priceNormal": 224990,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      }
    ]
  },
  {
    "id": "shure-sm7b",
    "name": "Micrófono Dinámico Vocal Shure SM7B para Estudio y Podcasting",
    "brand": "Shure",
    "category": "Grabación y Estudio",
    "section": "Equipos de sonido",
    "subCategory": "Micrófonos de Estudio",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/179077/microfono-dinamico-shure-sm7b-1099415-1.jpg?v=637931625287900000",
    "description": "El micrófono vocal más reverenciado en la historia de la grabación profesional. Blindaje electromagnético que elimina zumbidos y respuesta en frecuencia suave.",
    "minPrice": 429990,
    "offers": [
      {
        "id": "offer-shu-sm7b-1",
        "storeName": "Promusic",
        "priceCash": 429990,
        "priceNormal": 459990,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      },
      {
        "id": "offer-shu-sm7b-2",
        "storeName": "Audiomusica",
        "priceCash": 439990,
        "priceNormal": 469990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      }
    ]
  },
  {
    "id": "shure-sm58-lc",
    "name": "Micrófono Dinámico Cardioide Shure SM58-LC Vocal",
    "brand": "Shure",
    "category": "Grabación y Estudio",
    "section": "Equipos de sonido",
    "subCategory": "Micrófonos de Estudio",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0865/2265/9098/files/SM58_1_44b8ad33-f884-4cc6-9b03-ecfc914e59fb.jpg?v=1767620327",
    "description": "El estándar definitivo para cantantes en directo y en estudio. Filtro esférico antipop integrado y sistema de montaje neumático antivibración.",
    "minPrice": 149900,
    "offers": [
      {
        "id": "offer-shu-sm58-1",
        "storeName": "Promusic",
        "priceCash": 149900,
        "priceNormal": 159900,
        "inStock": true,
        "productUrl": "https://promusic.cl/products/shure-sm58-microfono-dinamico-vocal"
      },
      {
        "id": "offer-shu-sm58-2",
        "storeName": "Audiomusica",
        "priceCash": 159990,
        "priceNormal": 169990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      }
    ]
  },
  {
    "id": "presonus-eris-st4-monitors",
    "name": "Monitores de Estudio Activos PreSonus Eris 4.5BT Par",
    "brand": "PreSonus",
    "category": "Grabación y Estudio",
    "section": "Equipos de sonido",
    "subCategory": "Monitores de Audio",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0865/2265/9098/files/ERISST4-1.png?v=1748318012",
    "description": "Monitores de referencia con transductores de baja frecuencia tejidos de material compuesto, tweeter de cúpula de seda y conectividad inalámbrica Bluetooth.",
    "minPrice": 134900,
    "offers": [
      {
        "id": "offer-pre-er4-1",
        "storeName": "Promusic",
        "priceCash": 134900,
        "priceNormal": 144900,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      },
      {
        "id": "offer-pre-er4-2",
        "storeName": "Audiomusica",
        "priceCash": 142990,
        "priceNormal": 152990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      }
    ]
  },
  {
    "id": "akg-k371-studio-headphones",
    "name": "Audífonos de Estudio Circumaurales Cerrados AKG K371",
    "brand": "AKG",
    "category": "Grabación y Estudio",
    "section": "Equipos de sonido",
    "subCategory": "Audífonos de Monitoreo",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0865/2265/9098/files/AKG_K371-Hero-shot-02_1605x1605_a97b88e3-fffd-4b54-a1bd-9372010e757e.png?v=1748317364",
    "description": "Ajustados a la prestigiosa curva de respuesta de referencia Harman con drivers de titanio de 50 mm y aislamiento acústico pasivo superior.",
    "minPrice": 139900,
    "offers": [
      {
        "id": "offer-akg-k371-1",
        "storeName": "Promusic",
        "priceCash": 139900,
        "priceNormal": 149900,
        "inStock": true,
        "productUrl": "https://promusic.cl"
      },
      {
        "id": "offer-akg-k371-2",
        "storeName": "Audiomusica",
        "priceCash": 146990,
        "priceNormal": 156990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      }
    ]
  },
  {
    "id": "yamaha-dbr15-active-speaker",
    "name": "Caja Acústica Activa 15\" Yamaha DBR15 1000W Clase D",
    "brand": "Yamaha",
    "category": "En Vivo y PA",
    "section": "Equipos de sonido",
    "subCategory": "Parlantes Activos / PA",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0865/2265/9098/files/DBR15_1.jpg?v=1757087962",
    "description": "Procesamiento DSP FIR-X dinámico, 1000 vatios pico de potencia y hasta 132 dB SPL con dispersión simétrica para escenarios y eventos en directo.",
    "minPrice": 739900,
    "offers": [
      {
        "id": "offer-yam-dbr-1",
        "storeName": "Promusic",
        "priceCash": 739900,
        "priceNormal": 779900,
        "inStock": true,
        "productUrl": "https://promusic.cl/products/yamaha-caja-activa-15-dbr15"
      },
      {
        "id": "offer-yam-dbr-2",
        "storeName": "Audiomusica",
        "priceCash": 759990,
        "priceNormal": 799990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      }
    ]
  },
  {
    "id": "yamaha-dm3-digital-mixer",
    "name": "Consola de Audio Digital Yamaha DM3 con DANTE 16 Canales",
    "brand": "Yamaha",
    "category": "En Vivo y PA",
    "section": "Equipos de sonido",
    "subCategory": "Consolas y Mezcladoras",
    "imageUrl": "https://cdn.shopify.com/s/files/1/0865/2265/9098/files/DM3DANTE-3.png?v=1753216286",
    "description": "Consola de mezclas digital ultracompacta con soporte DANTE de 16 canales, pantalla táctil de 9 pulgadas, interfaz USB de 18x18 a 96 kHz.",
    "minPrice": 2899900,
    "offers": [
      {
        "id": "offer-yam-dm3-1",
        "storeName": "Promusic",
        "priceCash": 2899900,
        "priceNormal": 2999900,
        "inStock": true,
        "productUrl": "https://promusic.cl/products/yamaha-consola-de-mezcla-digital-dm3-con-dante"
      },
      {
        "id": "offer-yam-dm3-2",
        "storeName": "Audiomusica",
        "priceCash": 2949990,
        "priceNormal": 3059990,
        "inStock": false,
        "productUrl": "https://www.audiomusica.com"
      }
    ]
  },
  {
    "id": "klotz-kikkg9-cable-instrumento",
    "name": "Cable Profesional para Instrumento Klotz KIKKG9 Jack-Jack 6m",
    "brand": "Klotz",
    "category": "En Vivo y PA",
    "section": "Equipos de sonido",
    "subCategory": "Cables y Conectores",
    "imageUrl": "https://audiomusicacl.vteximg.com.br/arquivos/ids/177820/211696.jpg?v=637873729522370000",
    "description": "Cable alemán de baja capacitancia con conectores niquelados de alta durabilidad y blindaje de cobre en espiral libre de ruidos electromagnéticos.",
    "minPrice": 44990,
    "offers": [
      {
        "id": "offer-klt-cb-1",
        "storeName": "Audiomusica",
        "priceCash": 44990,
        "priceNormal": 48990,
        "inStock": true,
        "productUrl": "https://www.audiomusica.com"
      },
      {
        "id": "offer-klt-cb-2",
        "storeName": "Overdrive",
        "priceCash": 46990,
        "priceNormal": 50990,
        "inStock": true,
        "productUrl": "https://www.overdrive.cl"
      }
    ]
  }
];
