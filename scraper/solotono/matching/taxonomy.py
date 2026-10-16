"""Clasificador taxonomico de SoloTono.

Asigna cada producto de tienda a una de las categorias canonicas definidas en
``solotono.db.fixtures.TAXONOMY_FIXTURES``. El orden de evaluacion es:

1. Exclusion de productos no musicales (merchandising, demos, giftcards).
2. Extraccion del titulo nucleo (se descartan inclusiones de pack: "con funda", "+ atril").
3. Reglas de accesorios, piezas y equipos de sonido sobre el titulo nucleo
   (con limites de palabra, para evitar que "Cuerdas Guitarra Electrica" caiga en guitarras).
4. Mapeo exacto de la categoria original de la tienda.
5. Reglas de instrumentos sobre el titulo nucleo.
6. Reglas combinadas sobre titulo + categoria de tienda + marca.
"""

from dataclasses import dataclass, field
import re
from typing import Dict, List, Optional, Set, Tuple
import unicodedata

from sqlalchemy.orm import Session

from solotono.db.models import Category

EXCLUDED_SLUG = "__excluded__"


@dataclass
class TaxonomyResult:
    category_slug: Optional[str]
    confidence: float
    matched_rule: str
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    detected_params: Dict[str, str] = field(default_factory=dict)
    suggested_subcategories: List[str] = field(default_factory=list)

    @property
    def is_excluded(self) -> bool:
        return self.matched_rule == "excluded"

def normalize_text(text: str) -> str:
    if not text:
        return ""
    nfkd = unicodedata.normalize("NFKD", text)
    cleaned = "".join([c for c in nfkd if not unicodedata.combining(c)])
    return cleaned.lower().strip()


EXCLUDED_TITLE_PATTERNS = [
    r"\bproducto\s+(?:demo|test|prueba)\b",
    r"\bservicio\s+test\b",
    r"\btest\s+product\b",
    r"\bgift\s*card\b",
    r"\btarjeta\s+de\s+regalo\b",
    r"\babrebotellas\b",
    r"\bposavasos\b",
    r"\balfombras?\s+limpiapies\b",
    r"^(?:epic\s+music\s+)?alfombras?$",
    r"^(?:epic\s+music\s+)?accesorios\s+para\s+instrumentos\s+musicales$",
    r"\bfat\s+store\s+pack\s+\d+\b",
    r"\bcq\s+restante\b",
    r"\bpack\s+de\s+imanes\b",
    r"\bpoleras?\b",
    r"\bgorros?\b",
    r"\bjockeys?\b",
    r"\bllaveros?\b",
    r"\btazon(?:es)?\b",
    r"\bcalcetines\b",
    r"\bbandanas?\b",
    r"\bparches?\s+bordados?\b",
    r"\bmochila\s+escolar\b",
    r"\bguantes\s+comfort\s+fit\b",
    r"\bpocket\s+de\s+herramientas\b",
    r"\bmochila\s+tecnico\b",
]
EXCLUDED_REGEX = re.compile("|".join(EXCLUDED_TITLE_PATTERNS))


def is_excluded_product(title: str, raw_category: Optional[str] = None) -> bool:
    norm_t = normalize_text(title)
    norm_c = normalize_text(raw_category or "")
    if EXCLUDED_REGEX.search(norm_t):
        return True
    if norm_c in ("taza", "polera", "gorro", "merchandising", "ropa", "guantes de trabajo", "pocket de trabajo"):
        return True
    return False


def extract_core_title(norm_title: str) -> str:
    """Strips bundle inclusions (e.g. 'con funda y soporte', '(Funda-Afinador-Correa)') from the end of a title
    when the product itself starts as an instrument or audio unit."""
    # Remove parenthetical bundle lists (but preserve '(cuerdas nylon)' or '(cuerdas metal)')
    core = re.sub(
        r"\([^)]*\b(?:funda|estuche|case|atril|soporte|correa|afinador|transformador|incluye|amplificador\s+y\s+accesorios)\b[^)]*\)",
        " ",
        norm_title,
    )
    # Check if the prefix before 'con / c/ / incluye / +' is already an accessory
    m = re.search(
        r"(?:\b(?:con|c/|incluye|inc\.?)|\+)\s+(?:funda|estuche|case|hard\s*case|soporte|atril|stand|correa|cable|accesorios|banqueta|sillin|arco|baquetas|unetas|transformador|fuente|parches?\s+de|bordona)\b",
        core,
    )
    if m:
        prefix = core[: m.start()].strip()
        if not re.search(
            r"\b(?:atril|soporte|funda|estuche|case|bolso|correa|cable|adaptador|fuente|pedalboard|rack|parche|bordona|baqueta)\b",
            prefix,
        ):
            core = prefix
    return re.sub(r"\s+", " ", core).strip()


# Map from normalized store raw_category to canonical category slug
# Only for UNAMBIGUOUS store categories (leaf categories).
EXACT_RAW_CATEGORY_MAP: Dict[str, str] = {
    # --- Cuerdas Guitarra y Bajo ---
    "guitarras/cuerdas/guitarra electrica": "cuerdas-guitarra-y-bajo",
    "guitarras/cuerdas/guitarra acustica": "cuerdas-guitarra-y-bajo",
    "guitarras/cuerdas/guitarra clasica": "cuerdas-guitarra-y-bajo",
    "guitarras/cuerdas": "cuerdas-guitarra-y-bajo",
    "bajos/cuerdas": "cuerdas-guitarra-y-bajo",
    "cuerdas": "cuerdas-guitarra-y-bajo",
    "cuerdas de bajo": "cuerdas-guitarra-y-bajo",
    "set cuerdas guitarra acustica": "cuerdas-guitarra-y-bajo",
    "set cuerdas guitarra clasica": "cuerdas-guitarra-y-bajo",
    "encordado de violin": "cuerdas-guitarra-y-bajo",
    "vientos y otras cuerdas/cuerdas frotadas/cuerdas": "cuerdas-guitarra-y-bajo",
    # --- Clavijeros y Afinadores ---
    "guitarras/accesorios/afinadores": "clavijeros-y-afinadores",
    "afinador de pinza": "clavijeros-y-afinadores",
    "afinadores": "clavijeros-y-afinadores",
    "clavijeros": "clavijeros-y-afinadores",
    # --- Cejillos / Capos ---
    "guitarras/accesorios/cejillos": "cejillos-capos",
    "guitarras/accesorios/slides": "cejillos-capos",
    "cejillo": "cejillos-capos",
    # --- Picks / Uñetas ---
    "guitarras/accesorios/unetas": "picks-unetas",
    "bajos/accesorios/unetas para bajo": "picks-unetas",
    "baterias y percusion/accesorios/plumillas": "picks-unetas",
    "uneta": "picks-unetas",
    "plumillas": "picks-unetas",
    # --- Correas / Straps ---
    "guitarras/accesorios/correas para guitarra y bajo": "correas-straps",
    "correa": "correas-straps",
    "correa de instrumento": "correas-straps",
    "correa guitarra-bajo": "correas-straps",
    # --- Fundas y Estuches ---
    "guitarras/fundas y cases/guitarra electrica": "fundas-y-estuches",
    "guitarras/fundas y cases/guitarra acustica": "fundas-y-estuches",
    "guitarras/fundas y cases": "fundas-y-estuches",
    "bajos/fundas y cases": "fundas-y-estuches",
    "pianos y teclados/fundas y cases para pianos": "fundas-y-estuches",
    "baterias y percusion/accesorios/fundas": "fundas-y-estuches",
    "dj/accesorios/cases": "fundas-y-estuches",
    "funda": "fundas-y-estuches",
    "funda de bateria": "fundas-y-estuches",
    "funda de transporte": "fundas-y-estuches",
    "funda instrumento": "fundas-y-estuches",
    "funda teclado": "fundas-y-estuches",
    "funda de platillos": "fundas-y-estuches",
    "funda parlante": "fundas-y-estuches",
    "funda bongo": "fundas-y-estuches",
    "funda conga": "fundas-y-estuches",
    "funda timbales": "fundas-y-estuches",
    "funda sc-modx7": "fundas-y-estuches",
    "funda sc-modx6": "fundas-y-estuches",
    "set fundas bateria": "fundas-y-estuches",
    "case": "fundas-y-estuches",
    "case guitarra": "fundas-y-estuches",
    "case bajo": "fundas-y-estuches",
    "case consola": "fundas-y-estuches",
    "case rack plastico largo": "fundas-y-estuches",
    "case rack plastico corto": "fundas-y-estuches",
    "hardcase": "fundas-y-estuches",
    "hardcase para pedalboard": "fundas-y-estuches",
    "maleta protectora": "fundas-y-estuches",
    "bolso para atriles": "fundas-y-estuches",
    "bolso herramientas": "fundas-y-estuches",
    "estuche de accesorios": "fundas-y-estuches",
    "cubierta para guitarra": "fundas-y-estuches",
    # --- Soportes / Stands ---
    "guitarras/accesorios/atriles y soportes": "soportes-stands",
    "pianos y teclados/atriles y soportes": "soportes-stands",
    "pianos y teclados/sillines para piano": "soportes-stands",
    "microfonos/accesorios/atriles y stands": "soportes-stands",
    "baterias y percusion/hardware y partes percusion/atriles": "soportes-stands",
    "atril": "soportes-stands",
    "atril(no drums)": "soportes-stands",
    "atril platillo": "soportes-stands",
    "atril caja bateria": "soportes-stands",
    "atril hi-hat": "soportes-stands",
    "atril de microfono con boom": "soportes-stands",
    "atril de microfono": "soportes-stands",
    "atril microfono": "soportes-stands",
    "atril de microfono sobremesa": "soportes-stands",
    "atril de instrumento": "soportes-stands",
    "atril de parlante": "soportes-stands",
    "atril caja acustica": "soportes-stands",
    "pack atriles caja acustica": "soportes-stands",
    "atril de teclado": "soportes-stands",
    "atril de teclado doble": "soportes-stands",
    "atril de teclado de columna": "soportes-stands",
    "extension de atril de teclado": "soportes-stands",
    "atril de guitarra doble": "soportes-stands",
    "atril de teclado en x": "soportes-stands",
    "atril de partitura": "soportes-stands",
    "atril partitura": "soportes-stands",
    "atril partituras": "soportes-stands",
    "atril bateria": "soportes-stands",
    "pack atriles bateria": "soportes-stands",
    "atril conga": "soportes-stands",
    "atril bongo": "soportes-stands",
    "atril dj": "soportes-stands",
    "mesa dj": "soportes-stands",
    "atril de muro": "soportes-stands",
    "adaptador de atril": "soportes-stands",
    "bandeja para atril": "soportes-stands",
    "soporte de aislamiento": "soportes-stands",
    "accesorio soporte de monitor": "soportes-stands",
    "soporte de audifonos": "soportes-stands",
    "soporte de dispositivo": "soportes-stands",
    "soporte violin": "soportes-stands",
    "soporte de bateria": "soportes-stands",
    "soporte piano": "soportes-stands",
    "soporte de tom": "soportes-stands",
    "soporte de baquetas": "soportes-stands",
    "soporte de parlante a muro": "soportes-stands",
    "soporte tablet": "soportes-stands",
    "soporte de instalacion": "soportes-stands",
    "adaptador de montaje": "soportes-stands",
    "adaptador de montaje para parlante": "soportes-stands",
    "polo de montaje": "soportes-stands",
    "clamp de bateria": "soportes-stands",
    "clamp de percusion": "soportes-stands",
    "clamp de superficie": "soportes-stands",
    "clamp": "soportes-stands",
    "holder": "soportes-stands",
    "brazo microfono": "soportes-stands",
    "cuello de ganso": "soportes-stands",
    "clip de microfono": "soportes-stands",
    "barra estereo para microfono": "soportes-stands",
    "adaptador de microfono": "soportes-stands",
    "sillin redondo": "soportes-stands",
    "sillin": "soportes-stands",
    "sillin de teclado": "soportes-stands",
    "banqueta piano": "soportes-stands",
    "silla de piano": "soportes-stands",
    "mueble para teclado": "soportes-stands",
    "rack estudio": "soportes-stands",
    "rack de piso": "soportes-stands",
    "audiorack": "soportes-stands",
    "gaveta de rack": "soportes-stands",
    "bandeja rack": "soportes-stands",
    "kit de montaje en rack": "soportes-stands",
    # --- Kits de Limpieza / Mantenimiento / Herramientas ---
    "guitarras/accesorios/aseo y mantencion": "kits-de-limpieza",
    "bajos/accesorios/aseo y mantencion de bajo": "kits-de-limpieza",
    "lutheria": "herramientas-de-calibracion",
    "llave de afinacion": "herramientas-de-calibracion",
    "pack llave de afinacion": "herramientas-de-calibracion",
    # --- Pastillas / Cápsulas, Potenciómetros, Jacks ---
    "guitarras/accesorios/capsulas para guitarra y bajo": "pastillas-capsulas",
    "capsula de guitarra": "pastillas-capsulas",
    "control selector": "potenciometros-y-switches",
    "control de volumen": "potenciometros-y-switches",
    "placa": "jacks-y-placas",
    "sujeta correa": "jacks-y-placas",
    "set de tornillos": "jacks-y-placas",
    "tensor": "puentes-y-cejuelas",
    "tornillo tensor": "puentes-y-cejuelas",
    # --- Fuentes de Poder y Pedalboards ---
    "fuente de poder": "fuentes-y-pedalboards",
    "fuente de poder (phantom)": "fuentes-y-pedalboards",
    "fuente de poder ups": "fuentes-y-pedalboards",
    "acondicionador de energia": "fuentes-y-pedalboards",
    "cargador de bateria": "fuentes-y-pedalboards",
    "pilas": "fuentes-y-pedalboards",
    "portapilas": "fuentes-y-pedalboards",
    "pedalboard": "fuentes-y-pedalboards",
    "switchera electrica rack": "fuentes-y-pedalboards",
    # --- Parches y Baquetas (y Hardware/Repuestos Batería) ---
    "baterias y percusion/accesorios/parches": "parches-y-baquetas",
    "baterias y percusion/accesorios/baquetas": "parches-y-baquetas",
    "baterias y percusion/accesorios/otros accesorios": "parches-y-baquetas",
    "baterias y percusion/hardware y partes percusion/pedales": "parches-y-baquetas",
    "baterias y percusion/hardware y partes percusion/otros en hardware": "parches-y-baquetas",
    "parche bateria": "parches-y-baquetas",
    "parche bombo": "parches-y-baquetas",
    "parche tom": "parches-y-baquetas",
    "parches caja": "parches-y-baquetas",
    "parche bongo": "parches-y-baquetas",
    "parche djembe": "parches-y-baquetas",
    "parche": "parches-y-baquetas",
    "pack muteador parche": "parches-y-baquetas",
    "baquetas": "parches-y-baquetas",
    "baquetas de timbaleta": "parches-y-baquetas",
    "brushes": "parches-y-baquetas",
    "maceta bombo": "parches-y-baquetas",
    "baquetero": "parches-y-baquetas",
    "pedal bombo doble": "parches-y-baquetas",
    "pedal bombo simple": "parches-y-baquetas",
    "pedal bateria": "parches-y-baquetas",
    "pedal de bateria": "parches-y-baquetas",
    "resorte pedal": "parches-y-baquetas",
    "kit pedal repuesto": "parches-y-baquetas",
    "extension de platillo": "parches-y-baquetas",
    "extension hi-hat": "parches-y-baquetas",
    "clutch": "parches-y-baquetas",
    "fieltros de platillo": "parches-y-baquetas",
    "set fieltros": "parches-y-baquetas",
    "bujes de platillo": "parches-y-baquetas",
    "bordona": "parches-y-baquetas",
    "repuesto de bateria": "parches-y-baquetas",
    "tuerca mariposa": "parches-y-baquetas",
    "tornillo mariposa": "parches-y-baquetas",
    "mariposa": "parches-y-baquetas",
    "kit pernos de afinacion": "parches-y-baquetas",
    "pad de practica": "parches-y-baquetas",
    "kit de pads": "parches-y-baquetas",
    "jaula de bateria": "parches-y-baquetas",
    "pata de timbal": "parches-y-baquetas",
    "ruedas de hardware": "parches-y-baquetas",
    # --- Boquillas, Cañas y Viento / Frotadas Accesorios ---
    "vientos y otras cuerdas/vientos de madera/accesorios": "boquillas-y-canas",
    "vientos y otras cuerdas/cuerdas frotadas/accesorios": "boquillas-y-canas",
    "boquilla saxo alto": "boquillas-y-canas",
    "boquilla": "boquillas-y-canas",
    "sordina": "boquillas-y-canas",
    "sordinas": "boquillas-y-canas",
    # --- Equipos DJ y Tornamesas ---
    "dj/controladores dj": "equipos-dj-y-tornamesas",
    "dj/tornamesas": "equipos-dj-y-tornamesas",
    "dj/mixer": "equipos-dj-y-tornamesas",
    "dj/accesorios/otros": "equipos-dj-y-tornamesas",
    "dj/accesorios/capsulas de tornamesas": "equipos-dj-y-tornamesas",
    "audio hogar/tornamesas y tocadiscos": "equipos-dj-y-tornamesas",
    "controlador dj": "equipos-dj-y-tornamesas",
    "controlador dj 4 canales": "equipos-dj-y-tornamesas",
    "tornamesa": "equipos-dj-y-tornamesas",
    "tornamesa direct drive": "equipos-dj-y-tornamesas",
    "tornamesa belt drive": "equipos-dj-y-tornamesas",
    "reproductor dj": "equipos-dj-y-tornamesas",
    "mezclador dj 7 canales": "equipos-dj-y-tornamesas",
    "mezclador dj 5 canales": "equipos-dj-y-tornamesas",
    "mezclador dj 3 canales": "equipos-dj-y-tornamesas",
    "estudio &amp; dj": "equipos-dj-y-tornamesas",
    # --- Iluminación y Escenario ---
    "iluminacion": "iluminacion-y-escenario",
    "audio pro y grabacion/iluminacion y efectos": "iluminacion-y-escenario",
    "par led": "iluminacion-y-escenario",
    "foco par led": "iluminacion-y-escenario",
    "barra led": "iluminacion-y-escenario",
    "efecto led": "iluminacion-y-escenario",
    "paleta led": "iluminacion-y-escenario",
    "fresnel led": "iluminacion-y-escenario",
    "pantalla led": "iluminacion-y-escenario",
    "aro de luz led": "iluminacion-y-escenario",
    "cabeza movil wash": "iluminacion-y-escenario",
    "cabeza movil beam": "iluminacion-y-escenario",
    "cabeza movil spot": "iluminacion-y-escenario",
    "cabeza movil hibrida": "iluminacion-y-escenario",
    "maquina de humo": "iluminacion-y-escenario",
    "liquido de humo": "iluminacion-y-escenario",
    "liquido de hazer": "iluminacion-y-escenario",
    "consola de iluminacion": "iluminacion-y-escenario",
    "controlador dmx": "iluminacion-y-escenario",
    "splitter dmx": "iluminacion-y-escenario",
    "interfaz de iluminacion": "iluminacion-y-escenario",
    "procesador de iluminacion": "iluminacion-y-escenario",
    "procesador de video": "iluminacion-y-escenario",
    "conversor artnet": "iluminacion-y-escenario",
    "lampara de descarga": "iluminacion-y-escenario",
    "lampara de consola": "iluminacion-y-escenario",
    "lampara par 64": "iluminacion-y-escenario",
    "lampara par 56": "iluminacion-y-escenario",
    "lampara par 36": "iluminacion-y-escenario",
    "lampara led para rack": "iluminacion-y-escenario",
    "lampara halogena": "iluminacion-y-escenario",
    "laser azul": "iluminacion-y-escenario",
    "blinder": "iluminacion-y-escenario",
    "elipsoidal": "iluminacion-y-escenario",
    "porta gelatina": "iluminacion-y-escenario",
    "lente intercambiable": "iluminacion-y-escenario",
    "bola espejo": "iluminacion-y-escenario",
    "motor bola disco": "iluminacion-y-escenario",
    "atril de iluminacion": "iluminacion-y-escenario",
    "atril iluminacion": "iluminacion-y-escenario",
    "atril de iluminacion doble": "iluminacion-y-escenario",
    "atril de iluminacion simple": "iluminacion-y-escenario",
    "atril de panel led": "iluminacion-y-escenario",
    "clamp truss": "iluminacion-y-escenario",
    "base truss": "iluminacion-y-escenario",
    "adaptador truss": "iluminacion-y-escenario",
    "union truss": "iluminacion-y-escenario",
    "truss": "iluminacion-y-escenario",
    "truss cuadrado 29x29": "iluminacion-y-escenario",
    "truss plano 29x29": "iluminacion-y-escenario",
    "truss cuadrado 40x40": "iluminacion-y-escenario",
    "truss cuadrado 50x50": "iluminacion-y-escenario",
    "truss cuadrado 10x10": "iluminacion-y-escenario",
    "truss cuadrado 52x52": "iluminacion-y-escenario",
    "barra truss": "iluminacion-y-escenario",
    "corner cuadrado 29x29": "iluminacion-y-escenario",
    "corner cuadrado 40x40": "iluminacion-y-escenario",
    "corner cuadrado 10x10": "iluminacion-y-escenario",
    "pivote cubo truss 29x29": "iluminacion-y-escenario",
    "soporte diagonal truss": "iluminacion-y-escenario",
    "carro sistema truss": "iluminacion-y-escenario",
    "carro truss": "iluminacion-y-escenario",
    "torre elevadora": "iluminacion-y-escenario",
    "tecle manual": "iluminacion-y-escenario",
    "control elevador tecle": "iluminacion-y-escenario",
    "escalera tarima": "iluminacion-y-escenario",
    "union de tarima": "iluminacion-y-escenario",
    "tarima 6 patas": "iluminacion-y-escenario",
    "rueda union tarimas": "iluminacion-y-escenario",
    "rueda tarima": "iluminacion-y-escenario",
    "baranda pasamanos": "iluminacion-y-escenario",
    "carro dolly": "iluminacion-y-escenario",
    "carro trolley": "iluminacion-y-escenario",
    "cinta gaffer": "iluminacion-y-escenario",
    "cubre cables": "iluminacion-y-escenario",
    "amarra cables": "iluminacion-y-escenario",
    "eslinga": "iluminacion-y-escenario",
    "piola de seguridad": "iluminacion-y-escenario",
    "copla": "iluminacion-y-escenario",
    "pasador": "iluminacion-y-escenario",
    "clip pasador": "iluminacion-y-escenario",
    "terminal pasador": "iluminacion-y-escenario",
    "contrapeso": "iluminacion-y-escenario",
    "perfil": "iluminacion-y-escenario",
    "bisel magnetico": "iluminacion-y-escenario",
    "etiqueta": "iluminacion-y-escenario",
    # --- Sistemas Inalámbricos ---
    "sistema inalambrico de mano": "sistemas-inalambricos",
    "sistema inalambrico de cintillo": "sistemas-inalambricos",
    "sistema inalambrico de cintillo uhf": "sistemas-inalambricos",
    "sistema inalambrico de solapa": "sistemas-inalambricos",
    "sistema inalambrico de instrumento": "sistemas-inalambricos",
    "sistema inalambrico combo": "sistemas-inalambricos",
    "sistema de monitoreo inalambrico": "sistemas-inalambricos",
    "sistema de monitoreo": "sistemas-inalambricos",
    "microfonos/inalambricos/de mano": "sistemas-inalambricos",
    "microfonos/inalambricos/lavalier": "sistemas-inalambricos",
    "microfonos/inalambricos/cintillo": "sistemas-inalambricos",
    "microfonos/inalambricos": "sistemas-inalambricos",
    "microfono inalambrico": "sistemas-inalambricos",
    "transmisor de mano": "sistemas-inalambricos",
    "transmisor bodypack": "sistemas-inalambricos",
    "transmisor iem": "sistemas-inalambricos",
    "transmisor de linea": "sistemas-inalambricos",
    "transmisor inalambrico instrumento": "sistemas-inalambricos",
    "receptor bodypack": "sistemas-inalambricos",
    "receptor de linea": "sistemas-inalambricos",
    "receptor para in ear": "sistemas-inalambricos",
    "receptor": "sistemas-inalambricos",
    "convertidor receptor": "sistemas-inalambricos",
    "antena": "sistemas-inalambricos",
    "amplificador de antena": "sistemas-inalambricos",
    "combinador de antena": "sistemas-inalambricos",
    "distribuidor de antenas": "sistemas-inalambricos",
    "conector inalambrico": "sistemas-inalambricos",
    "kit calibracion inalambrico": "sistemas-inalambricos",
    # --- Cables y Conectores ---
    "audio pro y grabacion/cables y conectores/cables de instrumentos": "cables-y-conectores",
    "audio pro y grabacion/cables y conectores/cables de microfonos": "cables-y-conectores",
    "audio pro y grabacion/cables y conectores/cables de parlantes": "cables-y-conectores",
    "audio pro y grabacion/cables y conectores/cables midi": "cables-y-conectores",
    "audio pro y grabacion/cables y conectores/cables digitales": "cables-y-conectores",
    "audio pro y grabacion/cables y conectores/multipares": "cables-y-conectores",
    "audio pro y grabacion/cables y conectores/patcheras": "cables-y-conectores",
    "audio pro y grabacion/cables y conectores/conectores": "cables-y-conectores",
    "audio pro y grabacion/cables y conectores": "cables-y-conectores",
    "pianos y teclados/cables y conectores de pianos y teclados": "cables-y-conectores",
    "cable": "cables-y-conectores",
    "cable multipar": "cables-y-conectores",
    "cable xlr": "cables-y-conectores",
    "cable xlr a plug": "cables-y-conectores",
    "cable xlr a d-sub25": "cables-y-conectores",
    "cable xlr a rca": "cables-y-conectores",
    "cable plug-plug": "cables-y-conectores",
    "cable plug - speakon": "cables-y-conectores",
    "cable plug-plug \"y\"": "cables-y-conectores",
    "cable extension plug": "cables-y-conectores",
    "cable mini plug": "cables-y-conectores",
    "cable dmx": "cables-y-conectores",
    "cable dmx - powercon": "cables-y-conectores",
    "cable de red": "cables-y-conectores",
    "cable red utp": "cables-y-conectores",
    "cable rj45": "cables-y-conectores",
    "cable powercon": "cables-y-conectores",
    "cable speakon": "cables-y-conectores",
    "cable microfono": "cables-y-conectores",
    "cable de microfono": "cables-y-conectores",
    "cable parlante": "cables-y-conectores",
    "cable de audifonos": "cables-y-conectores",
    "cable de instrumento": "cables-y-conectores",
    "cable de energia": "cables-y-conectores",
    "cable iec": "cables-y-conectores",
    "cable usb": "cables-y-conectores",
    "cable ts": "cables-y-conectores",
    "cable digital": "cables-y-conectores",
    "cable desbalanceado": "cables-y-conectores",
    " cable thunderbolt-3": "cables-y-conectores",
    "cable thunderbolt-3": "cables-y-conectores",
    "cables thunderbolt": "cables-y-conectores",
    "conector xlr": "cables-y-conectores",
    "conector xlr chasis": "cables-y-conectores",
    "conector plug": "cables-y-conectores",
    "conector speakon": "cables-y-conectores",
    "conector speakon de chasis": "cables-y-conectores",
    "conector powercon de chasis": "cables-y-conectores",
    "conector jack": "cables-y-conectores",
    "conector mini plug": "cables-y-conectores",
    "conector de red": "cables-y-conectores",
    "conector alimentacion": "cables-y-conectores",
    "adaptadores": "cables-y-conectores",
    "adaptador dmx": "cables-y-conectores",
    "adaptador plug trs a xlr": "cables-y-conectores",
    "adaptador de audifonos": "cables-y-conectores",
    "patchera": "cables-y-conectores",
    "patchbay": "cables-y-conectores",
    "patch panel modular": "cables-y-conectores",
    "transceptor sfp": "cables-y-conectores",
    # --- Preamps, Cajas Directas y Procesadores ---
    "caja directa pasiva": "preamps",
    "caja directa activa": "preamps",
    "caja directa": "preamps",
    "preamplificador de microfono": "preamps",
    "preamplificador de phono": "preamps",
    "preamplificador de senal": "preamps",
    "microfonos/accesorios/preamplificador": "preamps",
    "procesador de audio": "preamps",
    "procesador de audio digital": "preamps",
    "procesador de audio integral": "preamps",
    "procesador de efectos": "preamps",
    "potenciador de sonido": "preamps",
    "ecualizador": "preamps",
    "compresor / limitador": "preamps",
    "crossover": "preamps",
    "expansor - gate": "preamps",
    "splitter de microfono": "preamps",
    "caja de distribucion analogica": "preamps",
    "caja de distribucion digital": "preamps",
    "atenuador y emulador de gabinete": "preamps",
    # --- Interfaces de Audio y Conversores ---
    "interfaz de audio": "interfaces-de-audio",
    "interfaz de audio usb-c": "interfaces-de-audio",
    "interfaz de audio en red": "interfaces-de-audio",
    "audio pro y grabacion/home studio/interfaces de audio": "interfaces-de-audio",
    "audio pro y grabacion/interfaces de audio": "interfaces-de-audio",
    "audio pro y grabacion/midi y controladores/interfaces midi": "interfaces-de-audio",
    "pack interfaz": "interfaces-de-audio",
    "pack home studio": "interfaces-de-audio",
    "modulo de audio digital": "interfaces-de-audio",
    "conversor analogico a madi": "interfaces-de-audio",
    "conversor 8 salidas": "interfaces-de-audio",
    "conversor 8 entradas": "interfaces-de-audio",
    "conversor soundgrid/madi": "interfaces-de-audio",
    "conversor dante/madi": "interfaces-de-audio",
    "conversor ravenna/madi": "interfaces-de-audio",
    "conversor madi a ravenna": "interfaces-de-audio",
    "conversor madi a dante": "interfaces-de-audio",
    "procesador y conversor de audio digital": "interfaces-de-audio",
    "interfaz multifuncional milan": "interfaces-de-audio",
    "interfaz multifuncional dante": "interfaces-de-audio",
    "interfaz avb a dante": "interfaces-de-audio",
    "interfaz de control remoto": "interfaces-de-audio",
    "matriz de audio digital": "interfaces-de-audio",
    "servidor dsp soundgrid": "interfaces-de-audio",
    "tarjeta soundgrid x32/m32": "interfaces-de-audio",
    "tarjeta de expansion dante": "interfaces-de-audio",
    "tarjeta thunderbolt 3": "interfaces-de-audio",
    "modulo de expansion": "interfaces-de-audio",
    "superficie de control": "interfaces-de-audio",
    "panel de control": "interfaces-de-audio",
    "control de monitoreo": "interfaces-de-audio",
    "control de grabadora": "interfaces-de-audio",
    "grabador multipista": "interfaces-de-audio",
    "grabador portatil": "interfaces-de-audio",
    "grabadora": "interfaces-de-audio",
    "grabadora de video": "interfaces-de-audio",
    "conmutador de red": "interfaces-de-audio",
    "software": "interfaces-de-audio",
    "licencia de software": "interfaces-de-audio",
    # --- Micrófonos de Estudio y En Vivo ---
    "microfono condensador": "microfonos-de-estudio",
    "microfono condensador de estudio": "microfonos-de-estudio",
    "microfono condensador tipo lapiz": "microfonos-de-estudio",
    "microfono condensador instrumento": "microfonos-de-estudio",
    "microfono condensador multipatron": "microfonos-de-estudio",
    "microfono condensador usb": "microfonos-de-estudio",
    "microfono condensador con sist. de modelado": "microfonos-de-estudio",
    "microfono condensador a tubo": "microfonos-de-estudio",
    "microfono condensador vocal": "microfonos-de-estudio",
    "microfono condensador shotgun": "microfonos-de-estudio",
    "microfono dinamico": "microfonos-de-estudio",
    "microfono dinamico vocal": "microfonos-de-estudio",
    "microfono dinamico de bateria": "microfonos-de-estudio",
    "microfono dinamico con sist. de modelado": "microfonos-de-estudio",
    "microfono dinamico broadcast": "microfonos-de-estudio",
    "microfono dinamico instrumento": "microfonos-de-estudio",
    "microfono lavalier": "microfonos-de-estudio",
    "microfono headset": "microfonos-de-estudio",
    "microfono cintillo": "microfonos-de-estudio",
    "microfono para bateria": "microfonos-de-estudio",
    "microfono cuello ganso": "microfonos-de-estudio",
    "microfono de medicion": "microfonos-de-estudio",
    "microfono usb": "microfonos-de-estudio",
    "microfono": "microfonos-de-estudio",
    "set de microfonos": "microfonos-de-estudio",
    "pack microfono": "microfonos-de-estudio",
    "pack de podcast": "microfonos-de-estudio",
    "microfonos/dinamicos": "microfonos-de-estudio",
    "microfonos/condensador": "microfonos-de-estudio",
    "microfonos/vocales": "microfonos-de-estudio",
    "microfonos/usb podcasting": "microfonos-de-estudio",
    "microfonos/camara": "microfonos-de-estudio",
    "microfonos/de contacto": "microfonos-de-estudio",
    "microfonos/ambientales y conferencia": "microfonos-de-estudio",
    "audio pro y grabacion/home studio/microfonos de estudio": "microfonos-de-estudio",
    "capsula de microfono dinamico": "microfonos-de-estudio",
    "hipercardioide": "microfonos-de-estudio",
    "suspension elastica": "microfonos-de-estudio",
    "filtro antipop": "microfonos-de-estudio",
    "antipop": "microfonos-de-estudio",
    "pantalla acustica": "microfonos-de-estudio",
    # --- Monitores de Audio ---
    "monitor de estudio": "monitores-de-audio",
    "monitor de estudio 4\"": "monitores-de-audio",
    "monitor de estudio 4.5\"": "monitores-de-audio",
    "monitor de estudio 5\"": "monitores-de-audio",
    "monitor de estudio 5.25\"": "monitores-de-audio",
    "monitor de estudio 6.5\"": "monitores-de-audio",
    "monitor de estudio 7\"": "monitores-de-audio",
    "monitor de estudio 8\"": "monitores-de-audio",
    "monitor de estudio 8.25\"": "monitores-de-audio",
    "monitor de estudio coaxial": "monitores-de-audio",
    "subwoofer de estudio": "monitores-de-audio",
    "audio pro y grabacion/home studio/monitores de estudio": "monitores-de-audio",
    "audio pro y grabacion/monitores de estudio": "monitores-de-audio",
    "difusor": "monitores-de-audio",
    "absortor": "monitores-de-audio",
    "trampa de graves": "monitores-de-audio",
    # --- Audífonos de Monitoreo ---
    "audifonos cerrados": "audifonos-de-monitoreo",
    "audifonos abiertos": "audifonos-de-monitoreo",
    "audifonos in-ear": "audifonos-de-monitoreo",
    "in ears": "audifonos-de-monitoreo",
    "in ear": "audifonos-de-monitoreo",
    "audifono": "audifonos-de-monitoreo",
    "audifonos": "audifonos-de-monitoreo",
    "audifonos/monitoreo": "audifonos-de-monitoreo",
    "audifonos/dj": "audifonos-de-monitoreo",
    "audifonos/accesorios": "audifonos-de-monitoreo",
    "dj/audifonos": "audifonos-de-monitoreo",
    "dj/accesorios/audifonos": "audifonos-de-monitoreo",
    "audio pro y grabacion/home studio/audifonos": "audifonos-de-monitoreo",
    "almohadillas audifonos": "audifonos-de-monitoreo",
    "intercomunicador": "audifonos-de-monitoreo",
    # --- Parlantes Activos / PA ---
    "caja acustica activa": "parlantes-activos-pa",
    "caja acustica activa 15\"": "parlantes-activos-pa",
    "caja acustica activa 12\"": "parlantes-activos-pa",
    "caja acustica activa 10\"": "parlantes-activos-pa",
    "caja acustica activa 6.5\"": "parlantes-activos-pa",
    "caja acustica activa 6\"": "parlantes-activos-pa",
    "caja acustica activa 5\"": "parlantes-activos-pa",
    "caja activa": "parlantes-activos-pa",
    "caja acustica pasiva": "parlantes-activos-pa",
    "audio pro y grabacion/cajas acusticas/cajas": "parlantes-activos-pa",
    "audio pro y grabacion/cajas acusticas/sistemas fijos": "parlantes-activos-pa",
    "audio pro y grabacion/cajas acusticas/subwoofer": "parlantes-activos-pa",
    "audio pro y grabacion/cajas acusticas/monitores de piso": "parlantes-activos-pa",
    "audio pro y grabacion/amplificadores de potencia": "parlantes-activos-pa",
    "audio hogar/parlantes y audio hogar": "parlantes-activos-pa",
    "audio hogar/parlantes portatiles": "parlantes-activos-pa",
    "audio hogar": "parlantes-activos-pa",
    "audio hogar/accesorios": "parlantes-activos-pa",
    "altavoces hifi": "parlantes-activos-pa",
    "sub bajo activo": "parlantes-activos-pa",
    "sub bajo pasivo": "parlantes-activos-pa",
    "subwoofer activo 1x18\"": "parlantes-activos-pa",
    "subwoofer activo 1x15\"": "parlantes-activos-pa",
    "subwoofer activo 1x12\"": "parlantes-activos-pa",
    "subwoofer activo 3x18\"": "parlantes-activos-pa",
    "subwoofer pasivo 1x18\"": "parlantes-activos-pa",
    "subwoofer pasivo 2x21\"": "parlantes-activos-pa",
    "subwoofer pasivo 1x8\"": "parlantes-activos-pa",
    "subwoofer pasivo 1x12\"": "parlantes-activos-pa",
    "base para super bass": "parlantes-activos-pa",
    "parlante de linea 70/100 v": "parlantes-activos-pa",
    "parlante line array": "parlantes-activos-pa",
    "sistema line array": "parlantes-activos-pa",
    "accesorio line array": "parlantes-activos-pa",
    "fly bar": "parlantes-activos-pa",
    "anclaje para flybar": "parlantes-activos-pa",
    "bumper line array": "parlantes-activos-pa",
    "bumpert": "parlantes-activos-pa",
    "modulo array activo 2x10\"": "parlantes-activos-pa",
    "modulo array activo 2x8\"": "parlantes-activos-pa",
    "modulo array activo 1x8\"": "parlantes-activos-pa",
    "modulo array activo 1x12\"": "parlantes-activos-pa",
    "modulo array activo 2x12\"": "parlantes-activos-pa",
    "modulo array activo 1x10\"": "parlantes-activos-pa",
    "modulo array activo 2x6.5\"": "parlantes-activos-pa",
    "sistema de columna activo": "parlantes-activos-pa",
    "sistema de columna pasivo": "parlantes-activos-pa",
    "sistema de audio portable": "parlantes-activos-pa",
    "sistema amplificacion": "parlantes-activos-pa",
    "pack audio": "parlantes-activos-pa",
    "parlante de baja impedancia": "parlantes-activos-pa",
    "parlante instalacion": "parlantes-activos-pa",
    "parlante recargable": "parlantes-activos-pa",
    "parlante": "parlantes-activos-pa",
    "monitor de piso": "parlantes-activos-pa",
    "monitor de piso activo 12\"": "parlantes-activos-pa",
    "monitor de piso activo 15\"": "parlantes-activos-pa",
    "monitor de piso activo 10\"": "parlantes-activos-pa",
    "monitor de piso pasivo 12\"": "parlantes-activos-pa",
    "amplificador de potencia": "parlantes-activos-pa",
    "amplificador de potencia 2 canales": "parlantes-activos-pa",
    "amplificador de potencia 4 canales": "parlantes-activos-pa",
    "amplificador de potencia 8 canales": "parlantes-activos-pa",
    "amplificador de potencia 1 canal": "parlantes-activos-pa",
    "amplificador mezclador de linea": "parlantes-activos-pa",
    "amplificador de streaming": "parlantes-activos-pa",
    "power": "parlantes-activos-pa",
    # --- Consolas y Mezcladoras ---
    "mixer analogo": "consolas-y-mezcladoras",
    "mixer digital": "consolas-y-mezcladoras",
    "mixer potenciado": "consolas-y-mezcladoras",
    "mixer": "consolas-y-mezcladoras",
    "mezcladores analogos": "consolas-y-mezcladoras",
    "mezclador de linea": "consolas-y-mezcladoras",
    "consola analogica": "consolas-y-mezcladoras",
    "consola analoga": "consolas-y-mezcladoras",
    "consola digital de escritorio": "consolas-y-mezcladoras",
    "consola digital de rack": "consolas-y-mezcladoras",
    "consola autoamplificada": "consolas-y-mezcladoras",
    "consola": "consolas-y-mezcladoras",
    "audio pro y grabacion/mixer & mesas de sonido/mixer sin power": "consolas-y-mezcladoras",
    "audio pro y grabacion/mixer & mesas de sonido/mixer con power": "consolas-y-mezcladoras",
    "audio pro y grabacion/mixer & mesas de sonido": "consolas-y-mezcladoras",
    "stagebox digital": "consolas-y-mezcladoras",
    "stagebox": "consolas-y-mezcladoras",
    # --- Amplificación de Instrumentos ---
    "guitarras/amplificadores/combos": "amplificadores-de-guitarra",
    "guitarras/amplificadores": "amplificadores-de-guitarra",
    "amplificador de guitarra": "amplificadores-de-guitarra",
    "amplificador de guiarra": "amplificadores-de-guitarra",
    "monitor de guitarra": "amplificadores-de-guitarra",
    "bajos/amplificadores/combos": "amplificadores-de-bajo",
    "amplificador de bajo": "amplificadores-de-bajo",
    "guitarras/amplificadores/cabezales": "cabezales-y-cajas",
    "bajos/amplificadores/cabezales": "cabezales-y-cajas",
    "cabezal de bajo": "cabezales-y-cajas",
    "gabinete de guitarra": "cabezales-y-cajas",
    "gabinete": "cabezales-y-cajas",
    "cabezal": "cabezales-y-cajas",
    "pianos y teclados/amplificadores": "cabezales-y-cajas",
    "amplificador de teclado": "cabezales-y-cajas",
    "amplificador de monitoreo": "cabezales-y-cajas",
    "amplificador de audifonos 4 canales": "cabezales-y-cajas",
    "amplificador de audifonos 6 canales": "cabezales-y-cajas",
    "amplificador de audifonos 8 canales": "cabezales-y-cajas",
    "amplificador de audifono": "cabezales-y-cajas",
    "amplificador de audifonos": "cabezales-y-cajas",
    "audifonos/amplificadores de audifonos": "cabezales-y-cajas",
    "audio pro y grabacion/procesadores de senal/amplificadores audifonos": "cabezales-y-cajas",
    # --- Pedales y Multiefectos ---
    "guitarras/pedales y efectos": "pedales-de-efectos",
    "bajos/pedales y efectos": "pedales-de-efectos",
    "pedales y efectos": "pedales-de-efectos",
    "pedal": "pedales-de-efectos",
    "pedal de efecto": "pedales-de-efectos",
    "pedal de modulacion": "pedales-de-efectos",
    "pedal de reverb": "pedales-de-efectos",
    "pedal de distorsion": "pedales-de-efectos",
    "pedal de delay": "pedales-de-efectos",
    "pedal de overdrive": "pedales-de-efectos",
    "pedal booster": "pedales-de-efectos",
    "pedal noise gate": "pedales-de-efectos",
    "pedal wah": "pedales-de-efectos",
    "pedal looper": "pedales-de-efectos",
    "pedal selector": "pedales-de-efectos",
    "pedal de efectos vocales": "pedales-de-efectos",
    "pedal sustain": "pedales-de-efectos",
    "sustain": "pedales-de-efectos",
    "footswitch": "pedales-de-efectos",
    "pedalera multiefecto": "pedaleras-multiefectos",
    "audio pro y grabacion/procesadores de senal/multiefectos": "pedaleras-multiefectos",
    # --- Instrumentos: Cuerda ---
    "guitarra electrica": "guitarras-electricas",
    "guitarra electrica 6 cuerdas": "guitarras-electricas",
    "guitarra electrica 7 cuerdas": "guitarras-electricas",
    "guitarra electrica 8 cuerdas": "guitarras-electricas",
    "guitarras/electricas/estandar": "guitarras-electricas",
    "guitarras/electricas/premium/signature": "guitarras-electricas",
    "guitarras/electricas/packs": "guitarras-electricas",
    "pack guitarra electrica": "guitarras-electricas",
    "guitarras electricas": "guitarras-electricas",
    "guitarra acustica": "guitarras-acusticas",
    "guitarra electroacustica": "guitarras-acusticas",
    "guitarra electrocustica": "guitarras-acusticas",
    "guitarras/electroacusticas/cuerdas metalica": "guitarras-acusticas",
    "guitarras/electroacusticas": "guitarras-acusticas",
    "guitarras/acusticas/packs de guitarra": "guitarras-acusticas",
    "guitarras/acusticas": "guitarras-acusticas",
    "guitarra clasica": "guitarras-clasicas",
    "guitarra clasica electroacustica": "guitarras-clasicas",
    "guitarras/electroacusticas/cuerdas nylon": "guitarras-clasicas",
    "guitarras/acusticas/cuerdas nylon": "guitarras-clasicas",
    "bajo electrico": "bajos-electricos",
    "bajo electrico 4 cuerdas": "bajos-electricos",
    "bajo electrico 5 cuerdas": "bajos-electricos",
    "bajos/electricos": "bajos-electricos",
    "bajos/electroacusticos": "bajos-electricos",
    "bajo": "bajos-electricos",
    "violin": "violines",
    "cello": "violines",
    "vientos y otras cuerdas/cuerdas frotadas/violines": "violines",
    "vientos y otras cuerdas/cuerdas frotadas/contrabajo": "violines",
    "ukelele": "ukeleles",
    "pack ukelele": "ukeleles",
    "mandolina": "ukeleles",
    "mandolina electroacustica": "ukeleles",
    "cuatro venezolano": "ukeleles",
    "lapsteel": "ukeleles",
    # --- Instrumentos: Aire ---
    "vientos y otras cuerdas/armonicas": "armonicas",
    "saxo alto": "saxofones",
    "saxo tenor": "saxofones",
    "saxo soprano": "saxofones",
    "saxo baritono": "saxofones",
    "trompeta": "trompetas",
    "corno frances": "trompetas",
    "vientos y otras cuerdas/vientos bronce/trompetas": "trompetas",
    "vientos y otras cuerdas/vientos bronce/trombones": "trompetas",
    "vientos y otras cuerdas/vientos bronce": "trompetas",
    "clarinete": "clarinetes",
    "gaita": "clarinetes",
    "vientos y otras cuerdas/vientos de madera/clarinetes": "clarinetes",
    "flauta piccolo": "flautas-traversas",
    "flauta dulce": "flautas-traversas",
    "vientos y otras cuerdas/vientos de madera/flautas": "flautas-traversas",
    # --- Instrumentos: Percusión ---
    "bateria acustica": "baterias-acusticas",
    "baterias y percusion/acusticas/set de baterias": "baterias-acusticas",
    "pack bateria": "baterias-acusticas",
    "shellpack 3 piezas": "baterias-acusticas",
    "shellpack 4 piezas": "baterias-acusticas",
    "shellpack 5 piezas": "baterias-acusticas",
    "shellpack 6 piezas": "baterias-acusticas",
    "tom de piso": "baterias-acusticas",
    "toms": "baterias-acusticas",
    "set toms": "baterias-acusticas",
    "bombo de bateria": "baterias-acusticas",
    "bateria": "baterias-acusticas",
    "bateria electrica": "baterias-electronicas",
    "bateria electronica": "baterias-electronicas",
    "baterias y percusion/electronicas/kit bateria electronica": "baterias-electronicas",
    "baterias y percusion/electronicas": "baterias-electronicas",
    "kit platillos electronicos": "baterias-electronicas",
    "caja bateria": "cajas-y-redoblantes",
    "baterias y percusion/acusticas/cajas": "cajas-y-redoblantes",
    "platillos de bateria": "platillos",
    "platillos": "platillos",
    "platillo banda": "platillos",
    "ride": "platillos",
    "kit platillos": "platillos",
    "baterias y percusion/platillos/platillos de efectos": "platillos",
    "baterias y percusion/platillos/platillos hihats": "platillos",
    "baterias y percusion/platillos/platillos ride": "platillos",
    "baterias y percusion/platillos/platillos crash": "platillos",
    "baterias y percusion/platillos/platillos splash": "platillos",
    "baterias y percusion/platillos/platillos china": "platillos",
    "baterias y percusion/platillos/packs de platillos": "platillos",
    "conga": "percusion-latina",
    "bongos": "percusion-latina",
    "bongo": "percusion-latina",
    "djembe": "percusion-latina",
    "cencerro": "percusion-latina",
    "jam block": "percusion-latina",
    "jam bell": "percusion-latina",
    "caja china": "percusion-latina",
    "shaker": "percusion-latina",
    "capacho": "parches-y-baquetas",
    "cabasa": "percusion-latina",
    "maracas": "percusion-latina",
    "par profesional maracas": "percusion-latina",
    "guiro": "percusion-latina",
    "peine guiro": "percusion-latina",
    "cajon peruano": "percusion-latina",
    "cajon cubano": "percusion-latina",
    "tambor de percusion": "percusion-latina",
    "tambor gong": "percusion-latina",
    "metalofono": "percusion-latina",
    "percusion": "percusion-latina",
    "baterias y percusion/percusion/congas tumbas y quintos": "percusion-latina",
    "baterias y percusion/percusion/efectos de percusion": "percusion-latina",
    "baterias y percusion/percusion/cencerros": "percusion-latina",
    "baterias y percusion/percusion/panderos": "percusion-latina",
    "baterias y percusion/percusion/timbaletas": "percusion-latina",
    "baterias y percusion/percusion/cajones": "percusion-latina",
    "baterias y percusion/percusion/bongos": "percusion-latina",
    "baterias y percusion/percusion": "percusion-latina",
    "baterias y percusion/bandas y conciertos": "percusion-latina",
    "baterias y percusion/educacional": "percusion-latina",
    # --- Instrumentos: Teclas ---
    "piano digital": "pianos-digitales",
    "piano digital portatil": "pianos-digitales",
    "piano digital de mueble": "pianos-digitales",
    "pianos y teclados/pianos/pianos digitales": "pianos-digitales",
    "pianos y teclados/pianos/piano de cola": "pianos-digitales",
    "piano electrico": "pianos-digitales",
    "piano eleectrico": "pianos-digitales",
    "piano": "pianos-digitales",
    "110 bkc2 88 teclas contrapesadas - piano digital": "pianos-digitales",
    "1100 rdc2 88 teclas contrapesadas, color rojo - piano digital": "pianos-digitales",
    "teclado portatil": "teclados-portatiles",
    "teclado digital": "teclados-portatiles",
    "teclado arreglador": "teclados-portatiles",
    "teclado arranger": "teclados-portatiles",
    "teclado electrico": "teclados-portatiles",
    "teclado": "teclados-portatiles",
    "organo": "teclados-portatiles",
    "organo doble": "teclados-portatiles",
    "pianos y teclados/teclados personales": "teclados-portatiles",
    "40h2 49 teclas (incluye transformador) - teclado digital": "teclados-portatiles",
    "sintetizador": "sintetizadores",
    "sintetizador de escritorio": "sintetizadores",
    "pianos y teclados/sintetizadores y controladores/sintetizadores": "sintetizadores",
    "caja de ritmos analogica": "sintetizadores",
    "dj/drum machine": "sintetizadores",
    "controlador midi": "teclados-controladores-midi",
    "controlador midi - usb": "teclados-controladores-midi",
    "controlador de pads": "teclados-controladores-midi",
    "audio pro y grabacion/midi y controladores/teclados controladores": "teclados-controladores-midi",
    "audio pro y grabacion/home studio/controladores midi estudio": "teclados-controladores-midi",
    "pianos y teclados/acordeones/cromaticos": "acordeones-y-melodicas",
    "pianos y teclados/acordeones": "acordeones-y-melodicas",
    "acordeon": "acordeones-y-melodicas",
    "vientos y otras cuerdas/melodicas": "acordeones-y-melodicas",
    "melodica": "acordeones-y-melodicas",
    # --- Additional Exact Raw Category Mappings ---
    "set cuerdas guitarra electrica": "cuerdas-guitarra-y-bajo",
    "set cuerdas bajo electrico": "cuerdas-guitarra-y-bajo",
    "cuerda": "cuerdas-guitarra-y-bajo",
    "atril tom": "soportes-stands",
    "atril monitor estudio": "soportes-stands",
    "brazo bateria": "soportes-stands",
    "pinza de aro para microfono": "soportes-stands",
    "pedal teclado": "pedales-de-efectos",
    "pedal emulador de amplificador": "pedales-de-efectos",
    "pedales de efectos": "pedales-de-efectos",
    "probador de cables": "cables-y-conectores",
    "cable sub-d 25 pines": "cables-y-conectores",
    "cable bnc": "cables-y-conectores",
    "cable insert": "cables-y-conectores",
    "cables y conectores": "cables-y-conectores",
    "audio pro y grabacion/cables y conectores/audio rca cables": "cables-y-conectores",
    "audifonos/inalambricos y bluetooth": "audifonos-de-monitoreo",
    "audifonos semi-abiertos": "audifonos-de-monitoreo",
    "audifonos circumaurales audio": "audifonos-de-monitoreo",
    "multipar digital": "consolas-y-mezcladoras",
    "bola disco": "iluminacion-y-escenario",
    "pasa cables": "iluminacion-y-escenario",
    "polvo maquina de fuego": "iluminacion-y-escenario",
    "cinta de tela": "iluminacion-y-escenario",
    "barndoor": "iluminacion-y-escenario",
    "filtro de iluminacion": "iluminacion-y-escenario",
    "kit testeo de vacio": "iluminacion-y-escenario",
    "gelatina": "iluminacion-y-escenario",
    "kit optico": "iluminacion-y-escenario",
    "case paneles pantalla led": "fundas-y-estuches",
    "fundas cases platillos": "fundas-y-estuches",
    "hardware dsp": "interfaces-de-audio",
    "interfaz de red": "interfaces-de-audio",
    "interfaz": "interfaces-de-audio",
    "audio pro y grabacion/grabadoras": "interfaces-de-audio",
    "rata tom": "baterias-acusticas",
    "timbaleta": "percusion-latina",
    "percusion latina": "percusion-latina",
    "cajon": "percusion-latina",
    "baterias y percusion/electronicas/pad de percusion": "baterias-electronicas",
    "dj/accesorios/agujas": "equipos-dj-y-tornamesas",
    "dj/reproductores multimedia": "equipos-dj-y-tornamesas",
    "pantalla antiviento": "microfonos-de-estudio",
    "microfono camara": "microfonos-de-estudio",
    "lavalier solapa": "microfonos-de-estudio",
    "microfonos/para instrumentos": "microfonos-de-estudio",
    "estacion base inalambrica": "sistemas-inalambricos",
    "bodypack inalambrico bidireccional": "sistemas-inalambricos",
    "atenuador y simulador de gabinete": "preamps",
    "bajo electro acustico": "bajos-electricos",
    "guitarras/amplificadores/gabinetes": "cabezales-y-cajas",
}

INSTRUMENT_SLUGS: Set[str] = {
    "guitarras-electricas",
    "guitarras-acusticas",
    "guitarras-clasicas",
    "bajos-electricos",
    "violines",
    "ukeleles",
    "flautas-traversas",
    "saxofones",
    "trompetas",
    "clarinetes",
    "armonicas",
    "baterias-acusticas",
    "baterias-electronicas",
    "cajas-y-redoblantes",
    "platillos",
    "percusion-latina",
    "pianos-digitales",
    "teclados-portatiles",
    "sintetizadores",
    "teclados-controladores-midi",
    "acordeones-y-melodicas",
}

# High-priority Non-Instrument Rules evaluated on core_title (word-boundary regexes)
# Order matters: most specific accessory/part/audio patterns first!
NON_INSTRUMENT_TITLE_RULES: List[Tuple[str, str]] = [
    # 1. Iluminación y Escenario
    ("iluminacion-y-escenario", r"\b(?:foco\s+led|par\s+led|barra\s+led|cabeza\s+movil|cabezal\s+movil|strobe|estroboscopico|blinder|elipsoidal|fresnel|laser|maquina\s+de\s+humo|liquido\s+de\s+(?:humo|hazer)|polvo\s+maquina\s+de\s+fuego|hazer|controlador\s+dmx|splitter\s+dmx|consola\s+de\s+iluminacion|truss|clamp\s+truss|base\s+truss|torre\s+elevadora|tarima|bola\s+(?:espejo|disco)|cinta\s+(?:gaffer|de\s+tela)|cubre\s+cables?|pasa\s*-?\s*cables?|pasacables?|amarra\s+cables?|barndoor|filtro\s+magnetico|marco\s+de\s+gelatina|kit\s+optico|kit\s+de\s+testeo\s+de\s+vacio|carro\s+(?:dolly|trolley|truss|sistema\s+truss))\b"),
    # 2. Equipos DJ y Tornamesas
    ("equipos-dj-y-tornamesas", r"\b(?:controlador(?:es)?\s+dj|reproductor(?:es)?\s+(?:para\s+)?dj|multiefectos?\s+(?:profesional\s+)?para\s+dj|multiplayer\s+alphatheta|cdj-\d+|ddj-|xdj-|tornamesas?|tocadiscos|capsulas?\s+(?:para\s+)?tornamesas?|portacapsulas?|agujas?\s+(?:para\s+tornamesas?|de\s+repuesto|reemplazo)|slipmat|mezclador(?:es)?\s+dj|mixer\s+dj)\b"),
    # 3. Picks / Uñetas
    ("picks-unetas", r"\b(?:unetas?|plumillas?|guitar\s+picks?|pack\s+de\s+\d*\s*unetas?|tortex|thumb\s+picks?|jazz\s+iii\s+xl|ultratone\s+picks?)\b"),
    # 4. Cejillos / Capos y Slides
    ("cejillos-capos", r"\b(?:cejillos?|capodastros?|dual\s+capo|flex\s+capo|axis\s+capo|trigger\s+capo|capo\s+(?:para|de|guitarra|acustica|electrica|clasica|ukelele)|slides?\s+(?:para\s+guitarra|de\s+vidrio|de\s+metal|cromado|ceramico|de\s+bronce)|comfort\s+slide|\be-?bow\s+plus\b)\b"),
    # 5. Cuerdas Guitarra y Bajo (y otros instrumentos de cuerda)
    ("cuerdas-guitarra-y-bajo", r"\b(?:juegos?\s+de\s+cuerdas|sets?\s+(?:de\s+)?(?:\d+\s+)?cuerdas|pack\s+de\s+\d+\s+cuerdas|encordados?|cuerdas?\s+(?:[a-g]\s+|nylon\s+guitarra|de\s+nylon\s+admira)|cuerdas?\s+(?:[a-g]\s+)?(?:para\s+|de\s+)?(?:guitarra|bajo|violin|viola|cello|violoncello|contrabajo|ukelele|charango|mandolina|banjo|cuatro)|(?<!\d\s)cuerdas?\s+(?:ernie\s+ball|d'addario|daddario|elixir|la\s+bella|rotosound|dunlop|savarez|hannabach|aquila|thomastik|pirastro|alice|orphee|aurora)|regular\s+slinky|super\s+slinky|power\s+slinky|hybrid\s+slinky|beefy\s+slinky|skinny\s+top|earthwood|phosphor\s+bronze|80/20\s+bronze|pro-arte|ej45|ej46|ej27|ej16|xtc45|nyxl|nanoweb|polyweb|optiweb|set\s+contrabajo)\b"),
    # 6. Clavijeros y Afinadores
    ("clavijeros-y-afinadores", r"\b(?:afinador(?:es)?|clip\s+tuner|clip-on\s+protune|polytune\s+clip|unitune\s+clip|pitchstrap|pitchblack\s+x\s+pro|clavijeros?|clavijas?\s+(?:de|para)|locking\s+tuners?|bobinador(?:es)?\s+de\s+clavijas?)\b"),
    # 7. Kits de Limpieza, Aceites y Herramientas de Calibración
    ("aceites-para-diapason", r"\b(?:lemon\s+oil|aceite\s+(?:de\s+limon|para\s+diapason|hidratador|limpiador)|liquido\s+para\s+diapason|fingerboard\s+remedy|limpiador\s+hidratador\s+para\s+diapasones?|f-one\s+oil)\b"),
    ("kits-de-limpieza", r"\b(?:kit\s+de\s+limpieza|set\s+de\s+limpieza|pack\s+limpiador|liquido\s+(?:para\s+limpieza|limpiador)|limpiador\s+(?:de\s+cuerdas|de\s+guitarra|de\s+platillos|de\s+vinilos|para\s+guitarra|multiusos\s+para\s+piano)|pano\s+de\s+(?:pulido|limpieza|microfibra)|suede\s+polishing\s+cloth|polish\s+with\s+cloth|guitar\s+polish|cera\s+de\s+guitarra|humidificador\s+(?:e\s+higrometro\s+|de\s+)?(?:para\s+)?guitarra|alfombra\s+para\s+limpieza)\b"),
    ("herramientas-de-calibracion", r"\b(?:lima\s+diamantada|set\s+de\s+limas|nut\s+file|nutdrivers?|nut\s+height\s+gauge|medidor\s+de\s+accion|llave\s+de\s+afinacion|llave\s+bateria\s+bolsillo|cortacuerdas?|enrollador|power\s+peg|protector\s+diapason|herramientas?\s+de\s+(?:calibracion|lutheria)|ejercitador\s+de\s+dedos|varigrip)\b"),
    # 8. Puentes y Cejuelas / Pastillas / Potenciómetros / Jacks y Placas
    ("puentes-y-cejuelas", r"\b(?:puente\s+(?:floyd\s+rose|tremolo|tune-o-matic|para\s+guitarra|para\s+bajo|gotoh|fender|wilkinson)|cejuelas?\s+(?:de\s+hueso|de\s+grafito|tusq|para\s+guitarra|para\s+bajo)|saddles?\s+(?:para|de)|tensor\s+(?:para\s+(?:guitarra|bajo|mastil)|de\s+mastil)|barra\s+de\s+tremolo)\b"),
    ("pastillas-capsulas", r"\b(?:pastillas?\s+(?:para\s+guitarra|para\s+bajo|humbucker|single\s+coil|seymour\s+duncan|dimarzio|emg|fender|gibson|fishman)|capsulas?\s+(?:para\s+guitarra|para\s+bajo|de\s+guitarra|de\s+bajo|humbucker|single\s+coil|seymour|dimarzio|emg)|set\s+de\s+(?:pastillas|capsulas))\b"),
    ("potenciometros-y-switches", r"\b(?:potenciometros?|switch\s+(?:de\s+)?[35]\s+posiciones|selector\s+de\s+(?:pastillas|capsulas)|control\s+selector|cubiertas?\s+de\s+perillas?|set\s+de\s+perillas?|perillas?\s+(?:para|de)|knobs?\s+(?:para|de))\b"),
    ("jacks-y-placas", r"\b(?:jack\s+(?:hembra|input|de\s+salida|stereo|mono|para\s+guitarra)|jackplate|placa\s+jack|pickguards?|golpeador(?:es)?|straplocks?|straps?\s*blocks?|dual\s+lock\s+para\s+correas|sujeta\s+correas?|set\s+de\s+tornillos|tapa\s+anti\s*feedback|sound\s*hole\s+cover|cubierta\s+para\s+guitarra)\b"),
    # 9. Fuentes de Poder y Pedalboards
    ("fuentes-y-pedalboards", r"\b(?:fuentes?\s+de\s+poder|adaptador(?:es)?\s+de\s+corriente|transformador(?:es)?\s+(?:para|de|\d+v)|pedalboards?|base\s+para\s+pedales|rockboards?(?!\s+mod\b)|placas?\s+de\s+montaje\s+rockboard|acondicionador(?:es)?\s+de\s+energia|cargador(?:es)?\s+de\s+bateria|portapilas|bateria\s+recargable\s+para)\b"),
    # 10. Correas / Straps
    ("correas-straps", r"\b(?:correas?\s+(?:para|de|guitarra|bajo|ukelele|saxo|acordeon|ernie\s+ball|fender|ibanez|levy|perri|d'addario|daddario|raven|dimarzio|planet\s+waves)|^(?:[a-z0-9\s'&-]+\s+)?correa\s+|guitar\s+straps?|bass\s+straps?|tahali(?:es)?|damper\s+(?:poliester|cuero))\b"),
    # 11. Fundas y Estuches
    ("fundas-y-estuches", r"\b(?:fundas?\s+(?:para|de|con\s+ruedas|semirrigida|mochila|drumker|novation|guitarra|bajo|teclado|bateria|ukelele|platillos|conga|bongo|timbal|parlante|cubrepolvo|acolchada|impermeable|transporte)|cubierta\s+antipolvo|estuches?\s+(?:rigidos?|para|de|bajo|guitarra|sintetizador|skb)|hard\s*cases?|soft\s*cases?|gig\s*bags?|flight\s*cases?|cases?\s+(?:para|de|rigido|rockbag|rack|guitarra|bajo|teclado|consola|platillos|novation|korg|roland|yamaha|fender|gibson|epiphone|ibanez|transporte|indoor|outdoor)|rockbag\s+funda|rockcase|mochilas?\s+(?:para\s+)?platillos|bolsos?\s+(?:para|de|platillos|baquetas|bateria|bongo|conga|teclado|guitarra|bajo|pedal|microfono|cables)|maletas?\s+protectoras?|set\s+fundas?)\b"),
    # 12. Soportes / Stands (incluye sillines/banquetas, atriles, clamps, racks)
    ("soportes-stands", r"\b(?:atril(?:es)?\s+(?:para|de|con|p/|tipo|recto|convertible|tropicana|platillo|caja|hi-hat|tom|microfono|teclado|guitarra|bajo|partitura|parlante|bateria|conga|bongo|dj|muro|doble)|set\s+de\s+atriles|pack\s+atriles|soportes?\s+(?:para|de|en\s+l|pared|muro|aislamiento|montaje|profesional|line\s+array|fbt|sonos|anton\s+breton|admira|tama|meinl|guitarra|bajo|violin|teclado|microfono|monitor|parlante|bateria|tom|conga|cencerro|hi-hat|audifonos|tablet|dispositivo)|wall\s+bracket|l-bracket|guitar\s+stand|music\s+stand|mic\s+stand|sillin(?:es)?|taburetes?|bar\s+stool|apoyo\s+para\s+pie|banquetas?\s+(?:para|de|piano|teclado)|sillas?\s+de\s+piano|bancos?\s+para\s+piano|clamps?\s+(?:de\s+bateria|de\s+percusion|de\s+superficie)|holders?\s+(?:para|de)|brazos?\s+(?:para\s+|de\s+)?(?:microfono|platillo|bateria|extension\s+para\s+platillo)|brazo\s+ajustable\s+para\s+platillo|extension\s+bateria|cuello\s+de\s+ganso|clips?\s+(?:de\s+microfono|magnetico\s+para\s+microfono)|barra\s+estereo\s+para\s+microfono|adaptador(?:es)?\s+(?:en\s+t\s+para\s+monitores|de\s+montaje|de\s+atril|de\s+microfono|de\s+rosca|tubo\s+rack|line\s+array)|postes?\s+para\s+subwoofer|polo\s+de\s+montaje|racks?\s+(?:de\s+estudio|de\s+piso|de\s+audio|base|estudio)|audiorack|bandejas?\s+(?:para\s+atril|rack)|gavetas?\s+de\s+rack|kit\s+de\s+montaje\s+en\s+rack|placa\s+de\s+montaje|marco\s+de\s+line\s+array|herraje\s+.*?\bline\s+array|pin\s+lock|pin\s+de\s+bloqueo|kit\s+de\s+instalacion\s+para\s+parlante|muebles?\s+para\s+(?:teclado|piano))\b"),
    # 13. Parches y Baquetas (y repuestos/pedales de batería)
    ("parches-y-baquetas", r"\b(?:parches?\s+(?:para|de|bateria|bombo|tom|caja|conga|bongo|djembe|timbal|remo|evans|aquarian|baldassare)|remo\s+parche|evans\s+parche|aquarian\s+parche|baquetas?\s+(?:para|de|bateria|timbal|metalofono|hickory|maple|oak|nylon|vic\s+firth|promark|zildjian|vater|baldassare)|vic\s+firth\s+baqueta|promark\s+baqueta|zildjian\s+baqueta|mazos?\s+(?:para|de)|macetas?\s+(?:para|de|bombo)|escobillas?\s+(?:para|de)|brushes|baqueteros?|bordonas?|capacho\s+para\s+caja|fieltros?\s+(?:de|para|tama)|mariposas\s+con\s+fieltros|set\s+fieltros|bujes?\s+de\s+platillo|cymbal\s+mate|base\s+soporte\s+.*?\bpara\s+platillos|clutch\s+(?:para|de|hi-hat)|extension(?:es)?\s+(?:corta\s+)?(?:de\s+|para\s+)?(?:platillo|hi-hat)|patas?\s+para\s+tom|tensor(?:es)?\s+(?:para\s+)?(?:caja|bombo|tom|timbal)|pedal(?:es)?\s+(?:de\s+bombo|bombo|kick\s+drum|de\s+bateria|bateria|doble\s+para\s+bombo)|alfombras?\s+(?:[a-z0-9\s-]+\s+)?para\s+bateria|pads?\s+de\s+practica|set\s+de\s+practica\s+para\s+bateria|kit\s+de\s+pads|sordina/controlador\s+de\s+armonicos|big\s+fat\s+snare\s+drum|muteador\s+parche|jaula\s+de\s+bateria|repuestos?\s+de\s+bateria|tuercas?\s+mariposa|tornillos?\s+mariposa|pernos?\s+de\s+afinacion)\b"),
    # 14. Boquillas, Cañas y Viento / Frotadas Accesorios
    ("boquillas-y-canas", r"\b(?:boquillas?\s+(?:para|de|saxo|saxofon|clarinete|trompeta|trombon|viento|yamaha|vandoren|rico|otto\s+link)|tapa\s+de\s+boquilla|parches?\s+para\s+boquilla|canas?\s+(?:para|de|saxo|clarinete|vandoren|rico|d'addario)|abrazaderas?\s+(?:para|de)\s+(?:saxo|clarinete|boquilla)|sordinas?(?!\s*/\s*controlador)|mute\s+noodle|arcos?\s+(?:para|de)\s+(?:violin|viola|cello|contrabajo)|resina\s+(?:para|de)\s+(?:violin|arco)|puente\s+para\s+(?:violin|viola|cello|violoncello|contrabajo))\b"),
    # 15. Cables y Conectores
    ("cables-y-conectores", r"\b(?:cables?\s+(?:para|de|instrumento|microfono|parlante|audifonos|pedales|patch|interpedal|xlr|plug|mini\s*plug|trs|ts|rca|midi|usb|dmx|bnc|db25|dsub-?25|sub-d|digital|analogico|powercon|speakon|red|utp|rj45|iec|energia|thunderbolt|multipar|balanceado|desbalanceado|espiral|trenzado|klotz|roland|cordial|rean|kabel|pro-lok|conector)|pack\s+de\s+cables|set\s+cables|vc\s+pod\s+cable|rockcable|probador(?:es)?\s+de\s+cables|conector(?:es)?\s+(?:xlr|plug|trs|ts|speakon|powercon|jack|mini\s+plug|rj45|chasis|neutrik|alimentacion|trasero)|patchbays?|patcheras?|patch\s+panel|adaptador(?:es)?\s+(?:plug|xlr|trs|rca|dmx|audifonos)|transceptor\s+sfp)\b"),
    # 16. Sistemas Inalámbricos
    ("sistemas-inalambricos", r"\b(?:sistemas?\s+inalambricos?|sistemas?\s+de\s+monitoreo\s+inalambrico|set\s+doble\s+de\s+monitorizacion\s+.*?\binalambric[oa]|microfonos?\s+inalambricos?|transmisor(?:es)?\s+(?:de\s+mano|bodypack|iem|inalambrico|de\s+linea|ew-d)|receptor(?:es)?\s+(?:bodypack|inalambrico|para\s+in\s+ear|de\s+linea|dxlink)|modulo\s+transmisor|unidad\s+de\s+captura\s+de\s+infrarrojos|bodypack\b|estacion\s+base\s+.*?\bbidireccional|petaca\s+bidireccional|antenas?\s+(?:uhf|direccional|omnidireccional|para)|combinador\s+de\s+antena|distribuidor\s+de\s+antenas|amplificador\s+de\s+antena|adaptador(?:es)?\s+bluetooth|relay\s+g10)\b"),
    # 17. Audífonos de Monitoreo
    ("audifonos-de-monitoreo", r"\b(?:audifonos?\s+(?:de\s+monitoreo|monitoreo|cerrados?|abiertos?|semi\s*abiertos?|circumaurales?|in-ear|in\s+ear|inalambricos?|profesionales?|para\s+dj|de\s+dj|bluetooth|estudio|behringer|audio-technica|sennheiser|shure|samson|akg|beyerdynamic|sony|mackie|roland|yamaha|korg|fostex|neumann|pioneer|sonos|bose|zildjian)|auriculares?\s+(?:de\s+estudio|de\s+monitoreo|in-ear|profesionales?)|studio\s+headphones?|ath-m\d+x|dt\s*\d+\s*pro|hd\s*280\s*pro|hd\s*25\b|srh\d+|almohadillas?\s+(?:para\s+)?audifonos?)\b"),
    # 18. Monitores de Audio (Estudio)
    ("monitores-de-audio", r"\b(?:monitor(?:es)?\s+(?:de\s+estudio|estudio|activos?\s+de\s+estudio|cercano|coaxial)|studio\s+monitors?|subwoofer\s+de\s+estudio|yamaha\s+hs[578]|krk\s+rokit|adam\s+audio\s+t|kali\s+lp|neumann\s+kh|genelec|presonus\s+eris|jbl\s+30[568]p|edifier|panel(?:es)?\s+absorcion|espuma\s+acustica|reflector\s+acustico|trampa\s+de\s+graves|difusor\s+acustico)\b"),
    # 19. Micrófonos de Estudio y En Vivo
    ("microfonos-de-estudio", r"\b(?:microfonos?\s+(?:dinamicos?|condensador(?:es)?|vocal(?:es)?|cardioide|super\s*cardioide|hipercardioide|direccional|usb|lavalier|solapa|headset|cintillo|cuello\s+de\s+ganso|shotgun|para\s+bateria|para\s+instrumento|para\s+armonica|de\s+instrumento|de\s+estudio|de\s+medicion|de\s+contacto|camara|ambientales?|broadcast|a\s+tubo|shure|sennheiser|audio-technica|rode|neumann|akg|behringer|samson|wharfedale|electro-voice|audix|aston|warm\s+audio|lewitt|telefunken)|podmic|videomic|video\s+mic|kit\s+de\s+\d+\s+microfonos|pack\s+microfono|set\s+de\s+microfonos|pack\s+de\s+podcast|capsula\s+de\s+microfono|filtro\s+antipop|antipop|pantalla\s+anti-?viento|malla\s+miniatura|suspension\s+elastica|shockmount|pantalla\s+acustica\s+para\s+microfono|shure\s+sm58|shure\s+sm57|shure\s+sm7b|at2020|nt1-a)\b"),
    # 20. Interfaces de Audio, Conversores y Grabadoras
    ("interfaces-de-audio", r"\b(?:n?terfaz\s+de\s+audio|interfaces?\s+de\s+audio|interfaz\s+de\s+red|control\s+(?:rdnet|remoto\s+para\s+rdnet)|audio\s+interface|pack\s+homestudio|pack\s+home\s+studio|pack\s+interfaz|focusrite\s+scarlett|universal\s+audio\s+volt|apollo\s+(?:twin|solo|x)|dsp\s+satellite|satellite\s+uad-2|behringer\s+u-phoria|motu\s+m[246]|audient\s+(?:id|evo)|presonus\s+audiobox|steinberg\s+ur|solid\s+state\s+logic\s+ssl\s*2|conversor(?:es)?\s+(?:analogico|digital|madi|dante|ravenna|soundgrid|\d+\s+entradas|\d+\s+salidas)|modulo\s+de\s+audio\s+digital|superficie\s+de\s+control|control\s+de\s+monitoreo|grabador(?:a|es)?\s+(?:multipista|portatil|de\s+mesa|digital|de\s+mano|zoom\s+h\d|tascam)|grababora\s+portatil|kit\s+accesorios\s+grabadora|camara\s+de\s+video\s+.*?\baudio|software\s+intercom|comm?nutador\s+avb|servidor\s+dsp|tarjeta\s+(?:soundgrid|dante|thunderbolt))\b"),
    # 21. Consolas y Mezcladoras
    ("consolas-y-mezcladoras", r"\b(?:consolas?\s+(?:de\s+sonido|analogicas?|analogas?|digital(?:es)?|rackeables?|autoamplificadas?|mezcladoras?)|mezclador(?:es|as)?\s+(?:analogos?|digital(?:es)?|de\s+linea|potenciados?)|mixers?\s+(?:analogos?|digital(?:es)?|con\s+power|sin\s+power|potenciados?|con\s+efectos|behringer|allen\s*&\s*heath|yamaha|soundcraft|mackie|midas|presonus|zoom|tascam)|behringer\s+xenyx|behringer\s+x32|allen\s*&\s*heath\s+(?:zed|cq|sq|qu)|yamaha\s+mg\d+|stage\s*box(?:es)?|multipar\s+(?:digital|con\s+caja\s+remota))\b"),
    # 22. Parlantes Activos / PA y Sistemas de Sonido
    ("parlantes-activos-pa", r"\b(?:parlantes?\s+(?:activos?|pasivos?|portatiles?|recargables?|de\s+linea|line\s+array|de\s+baja\s+impedancia|de\s+instalacion|instalacion|bluetooth|fbt|wharfedale|qsc|jbl|electro-voice|mackie|behringer|rcf|db\s+technologies|yamaha|bose|arx)|cajas?\s+(?:activas?|acusticas?|pasivas?)|pack\s+de\s+cajas\s+activas|subwoofers?\s+(?:activos?|pasivos?|fbt|wharfedale|qsc|jbl|rcf|mackie|behringer)|sub\s+bajos?\s+(?:activos?|pasivos?)|monitores?\s+de\s+piso|sistemas?\s+(?:de\s+columna|line\s+array|pa\b|de\s+audio\s+portable|de\s+amplificacion)|modulo\s+array|fly\s*bar|bumper\s+line\s+array|amplificador(?:es)?\s+de\s+potencia|amplificador\s+mezclador\s+de\s+linea|altavoces?\s+hifi|repuesto\s+para\s+altavoces)\b"),
    # 23. Preamps, Cajas Directas y Procesadores de Señal
    ("preamps", r"\b(?:preamps?|preamplificador(?:es)?|caja\s+directa|cajas?\s+directas?|direct\s+box|di\s+box|aislador\s+de\s+nivel|procesador(?:es)?\s+de\s+(?:audio|efectos|senal)|compresor\s*/\s*limitador|ecualizador(?:es)?\s+grafico|crossover\s+activo|expansor\s*-\s*gate|splitter\s+de\s+microfono|caja\s+de\s+distribucion|atenuador\s+(?:y\s+emulador|de\s+amplificador)|amplificador\s+de\s+tubo.*atenuador|sound\s+devices\s+\d+)\b"),
    # 24. Pedaleras Multiefectos
    ("pedaleras-multiefectos", r"\b(?:pedaleras?\s+multiefectos?|multiefectos?\s+(?:para|de|guitarra|bajo|voz|vocal)|pedal\s+multiefectos?|procesador(?:es)?\s+de\s+(?:audio\s+vocal|voz)|line\s+6\s+(?:helix|hx\s+stomp|hx\s+one|pod\s+go)|quad\s+cortex|kemper\s+profiler|boss\s+(?:gt-\d+|gx-\d+|me-\d+|ve-\d+)|zoom\s+(?:g\d|b\d|ms-\d+|v3)|valeton\s+gp|mooer\s+ge\d+|heydude|hotone\s+ampero)\b"),
    # 25. Pedales de Efectos (incluye sustain / footswitch)
    ("pedales-de-efectos", r"\b(?:pedal(?:es)?\s+(?:de\s+efecto|efecto|de\s+modelado|sintetizador|boss|uafx|t-rex|nux|para\s+guitarra|para\s+bajo|de\s+piano|teclado|de\s+sustain|overdrive|distorsion|distortion|fuzz|delay|reverb|chorus|phaser|flanger|tremolo|wah|cry\s+baby|compresor|compressor|booster|looper|octavador|octave|noise\s+gate|eq|ecualizador|volumen|expresion|sustain|selector|footswitch)|tube\s+screamer|boss\s+(?:ds-1|sd-1|bd-2|dd-\d|rv-\d|ch-1|tu-3|rc-\d+|cs-3|mt-2|ns-2|ge-7|ac-3|gm-800)|ibanez\s+ts[89]|dunlop\s+cry\s*baby|electro-harmonix|mxr\s+m\d+|strymon|walrus\s+audio|earthquaker|tc\s+electronic\s+(?:hall\s+of\s+fame|flashback|spark|mojomojo|dark\s+matter|ditto)|footswitch)\b"),
    # 26. Amplificadores de Guitarra, Bajo, Cabezales y Cajas
    ("amplificadores-de-bajo", r"\b(?:amplificador(?:es)?\s+(?:para\s+|de\s+)?bajo|combos?\s+(?:para\s+|de\s+)?bajo|combo\s+bajo|bass\s+amp|fender\s+rumble|ampeg\s+(?:rocket\s+bass|rb-?\d+|svt|ba-\d+|venture)|hartke\s+(?:hd\s*\d+|kb\d+|tx\d+)|markbass|gallien-krueger|darkglass\s+microtubes|ashdown|aguilar\s+tone\s+hammer)\b"),
    ("cabezales-y-cajas", r"\b(?:cabezal(?:es)?\s+(?:amplificador(?:es)?)?\s*(?:para|de)?\s*(?:guitarra|bajo|valvular|marshall|laney|boss|orange|peavey|fender|vox|ampeg|hartke|engl|mesa\s+boogie|evh|blackstar|hughes|victory)|gabinetes?\s+(?:amplificador(?:es)?|amplificados?)?\s*(?:para|de)?\s*(?:guitarra|bajo|blackstar|1x12|2x12|4x12|4x10|1x15|2x10|laney|marshall|orange|fender|vox|ampeg|hartke|mesa)|gabientes?\s+(?:de|para)\s+(?:bajo|guitarra)|pantalla\s+(?:1x12|2x12|4x12)|monitor\s+para\s+percusion|drumhub|amplificador(?:es)?\s+(?:[a-z0-9-]+\s+)?(?:de\s+|para\s+)?(?:audifonos?|auriculares?|teclados?|baterias?(?:\s+electronicas?)?|monitoreo))\b"),
    ("amplificadores-de-guitarra", r"\b(?:amplificador(?:es)?\s+(?:combo\s+|portatil\s+|valvular(?:es)?\s+|digital(?:es)?\s+|reverb\s+|cort\s+|marshall\s+)*(?:para\s+|de\s+)?(?:guitarras?|g/electrica|combo)(?:\s+electricas?|\s+acusticas?|\s+electroacusticas?)?|combos?\s+(?:para\s+|de\s+)?(?:guitarras?|amplificador)|amplificador\s+combo|guitar\s+amp|boss\s+katana|boss\s+acoustic\s+singer|line\s+6\s+(?:spider|catalyst)|fender\s+(?:champion|mustang\s+(?:lt|gt|gtx)|blues\s+junior|hot\s+rod|\d*\s*twin\s+reverb|deluxe\s+reverb|acoustasonic\s+\d+|frontman)|vox\s+(?:ac15|ac30|vt\d+x|pathfinder|cambridge)|marshall\s+(?:mg\d+|dsl\d+|code\d+|origin|jvm?\d+|sc20|st20)|blackstar\s+(?:id:core|debut|ht|fly\s*3|st\.\s*james)|laney\s+(?:lx\d+|lg\d+|cub|lionheart|ironheart)|orange\s+(?:crush|tiny\s+terror)|roland\s+(?:jc-\d+|cube|mobile\s+ac)|positive\s+grid\s+spark|peavey\s+(?:bandit|vypyr|rage|classic\s+\d+)|supro\s+ambassador)\b"),
]
COMPILED_NON_INSTRUMENT_RULES = [(slug, re.compile(pat)) for slug, pat in NON_INSTRUMENT_TITLE_RULES]

# Instrument Rules evaluated on core_title + raw_category
INSTRUMENT_TITLE_RULES: List[Tuple[str, str]] = [
    # --- Teclas ---
    ("acordeones-y-melodicas", r"\b(?:acordeon(?:es)?|melodicas?|clavietta)\b"),
    ("teclados-controladores-midi", r"\b(?:controlador(?:es)?\s+midi|teclados?\s+controlador(?:es)?|midi\s+controller|launchkey|flkey|keylab|minilab|microlab|mpk\s+mini|keystation|oxygen\s+pro|komplete\s+kontrol|microkey|xone:k\d|launchpad|apc\s+mini|maschines?\s+mikro)\b"),
    ("sintetizadores", r"\b(?:sintetizador(?:es)?|synthesizers?|modulo\s+sintetizador|cajas?\s+de\s+ritmos?|drum\s+machines?|groovebox|samplers?\s+(?:roland|korg|akai|elektron)|yamaha\s+(?:montage|modx\d*)|korg\s+(?:minilogue|monologue|microkorg|volca|monotron|wavestate|opsix|modwave|multi/poly|nautilus|kronos)|roland\s+(?:juno|jupiter|system-\d|sh-\d+|gaia|fantom|aira\s+compact\s+[tsj]-\d|tr-\d+s?)|behringer\s+(?:model\s+d|poly\s+d|pro-\d+|td-3|rd-\d+|crave|edge|spice|deepmind|ub-xa|kobol|grind|ms-1|odyssey|2600|solina|toro|wasp|cat|k-2|neutron|proton)|moog|arturia\s+(?:microfreak|minifreak|polybrute|matrixbrute)|asm\s+hydrasynth|sequential|teenage\s+engineering|elektron\s+(?:digitakt|digitone|syntakt))\b"),
    ("pianos-digitales", r"\b(?:pianos?\s+(?:digital(?:es)?|electricos?|eleectricos?|medeli|de\s+cola|vertical(?:es)?|acusticos?|de\s+escenario|stage)|digital\s+pianos?|clavinova|privia|celviano|yamaha\s+(?:p-\d+|clp-\d+|ydp-\d+|dgx-\d+|ck\d+)|roland\s+(?:fp-\d+|rp\d+|hp\d+|rd-\d+)|kawai\s+(?:es\d+|cn\d+|ca\d+|kdp\d+|cx\d+)|casio\s+(?:cdp-s\d+|px-s\d+|ap-\d+)|korg\s+(?:b2|l1\s+liano|lp-\d+|c1\s+air|g1\s+air|sv-2|d1)|kurzweil\s+(?:ka\d+|m\d+|mp\d+|kag\d+)|88\s+teclas\s+contrapesadas)\b"),
    ("teclados-portatiles", r"\b(?:teclados?\s+(?:portatil(?:es)?|personal(?:es)?|musical(?:es)?|pequenos?|arreglador(?:es)?|arranger|workstation|61\s+teclas|76\s+teclas|interactivo|educacional|yamaha|casio|korg|roland|medeli)|arreglador\s+profesional|organos?\s+(?:liturgicos?|doble|hammond|yamaha|roland|nord)|casio\s+(?:ct-s\d+|ct-x\d+|lk-s\d+|sa-\d+)|yamaha\s+(?:psr-\w+|np-\d+|ez-\d+|reface|genios|tyros)|korg\s+(?:pa\d+x?|ek-50|i3)|roland\s+(?:e-x\d+|go:keys|go:piano)|medeli\s+(?:mc\d*|m\d+|a\d+|ak\w+|sp\w+|mk-\d+|ik\d+|teclado)|walters\s+teclado|alesis\s+.*?harmony\s*32)\b"),
    # --- Percusión ---
    ("baterias-electronicas", r"\b(?:baterias?\s+(?:electronicas?|electricas?)|electronic\s+drum|v-drums|kit\s+bateria\s+electronica|platillos?\s+(?:para\s+percusion\s+)?ele[c]?tronicos?|octapad|multipads?\s+de\s+percusion|spd-sx|spd::one|alesis\s+(?:nitro|surge|command|crimson|strike|debut|turbo)|roland\s+(?:td-?\d+|cy-\d+)|yamaha\s+dtx\d*|avatar\s+(?:sd\d+|a-?\d+|pd\d+)|powerdrums\s+ctd|nux\s+dm-\d+|medeli\s+dd\d+|disparador(?:es)?\s+para\s+bateria|drum\s+(?:kick\s+)?trigger|kit\s+platillos\s+electronicos)\b"),
    ("cajas-y-redoblantes", r"\b(?:cajas?\s+redoblantes?|redoblantes?|snare\s+drums?|cajas?\s+(?:de\s+bateria|bateria|de\s+banda|de\s+madera|de\s+metal|acero|bronce|maple|birch)|(?:tama|dw|pearl|ludwig|mapex|gretsch|sonor|yamaha|pdp|sjc|dixon|pork\s+pie|slingerland|rogers)\s+(?:[a-z0-9\s'\".,()-]+)?caja\b|caja\s+(?:tama|dw|pearl|ludwig|mapex|gretsch|sonor|yamaha|pdp|sjc|dixon)|piccolo\s+13\s*x\s*3.*caja)\b"),
    ("baterias-acusticas", r"\b(?:baterias?\s+acusticas?|bateria\s+(?:tour\s+custom|stage\s+custom|imperialstar|stagestar|superstar|starclassic|export|roadshow|decade|forum|vision|armory|mars|venus|comet|tornado|rebel|breakbeats|catalina|renown|energy|elementary|junior|infantil|5\s+piezas|4\s+piezas)|shell\s*packs?|tom\s+de\s+piso|rata\s+tom|floor\s+tom|set\s+toms?|dw\s+drums\s+.*?\btimbal\b|bombo\s+(?:de\s+bateria|acustico|\d+\s*[x×]\s*\d+))\b"),
    ("platillos", r"\b(?:platillos?|cymbals?|hi-?hats?|crash(?:es)?|rides?|splash(?:es)?|china\s+\d+|pack\s+\d*\s*platillos|set\s+de\s+platillos|sabian\s+(?:b8x|aa|aax|hh|hhx|stratus|paragon|xsr)|zildjian\s+(?:a\s+custom|k\s+custom|zbt|planet\s+z|i\s+family|s\s+family|avedis)|paiste\s+(?:pst\d*|2002|giant\s+beat|signature|900|101|201|rude)|meinl\s+(?:hcs|byzance|classics\s+custom|pure\s+alloy)|guzel\s+(?:platillo|efecto))\b"),
    ("percusion-latina", r"\b(?:congas?|tumbadoras?|quintos?|bongos?|bongo|timbal(?:es|etas?)?|cajon(?:es)?\s+(?:peruano|flamenco|cubano|acustico|aspire|meinl|lp|toca|gon\s+bops|schlagwerk|baldassare)|cajon\b|meinl\s+cajon|guiros?|maracas?|cencerros?|cowbells?|jam\s+blocks?|jam\s+bells?|cajas?\s+chinas?|cabasas?|shakers?|panderos?|panderetas?|tamborines?|djembes?|darbukas?|bata\b|kalimbas?|metalofonos?|xilofonos?|glockenspiel|triangulos?\s+(?:musical|\d+\s*mm)|claves?\s+de\s+percusion|castanuelas?|bongoes|rototoms?|tambor\s+(?:de\s+percusion|gong)|pandero)\b"),
    # --- Aire ---
    ("armonicas", r"\b(?:armonicas?|harmonicas?|blues\s+harp|marine\s+band|golden\s+melody|chrometta|special\s+20|kazoos?|silbato\s+kazoo)\b"),
    ("saxofones", r"\b(?:saxofon(?:es)?|saxos?\s+(?:alto|tenor|soprano|baritono|digital)|aerophone|yamaha\s+yas-\d+|yamaha\s+yts-\d+|yamaha\s+yds-\d+)\b"),
    ("trompetas", r"\b(?:trompetas?|trombon(?:es)?|tubas?|cornetin(?:es)?|fliscornos?|eufonios?|bombardinos?|cornos?\s+frances|yamaha\s+ytr-?\d+)\b"),
    ("clarinetes", r"\b(?:clarinetes?|oboes?|fagot(?:es)?|gaitas?|yamaha\s+ycl-?\d+)\b"),
    ("flautas-traversas", r"\b(?:flautas?\s+(?:traversas?|traverseras?|dulces?|piccolo|soprano|contralto|tenor)|ocarinas?|yamaha\s+yfl-?\d+|yamaha\s+ypc-?\d+)\b"),
    # --- Cuerda ---
    ("violines", r"\b(?:violin(?:es)?(?!\s+burst|\s+sunburst|\s+finish)|violas?|violoncellos?|cellos?|chelos?|contrabajos?\s*(?:acusticos?|electricos?|\d/\d)?|cremona\s+sv[a]?-?\d+|cervini\s+hv[a]?-?\d+)\b"),
    ("ukeleles", r"\b(?:ukeleles?|ukuleles?|guitaleles?|charangos?|banjos?|mandolinas?|cuatros?\s+venezolanos?|arpas?|lap\s*steels?|cavaquinhos?|laud(?:es)?)\b"),
    ("bajos-electricos", r"\b(?:bajos?\s+(?:electricos?|acusticos?|electroacusticos?|e/a\b|4\s+cuerdas|5\s+cuerdas|6\s+cuerdas|fretless|activo|pasivo)|pack\s+(?:de\s+)?bajo\s+electrico|electric\s+bass|jazz\s+bass|precision\s+bass|stingray\s+bass|sire\s+marcus\s+miller|ibanez\s+(?:gsr\d+|sr\d+|btb\d+|tmb\d+|ehb\d+)|rickenbacker\s+4003)\b"),
    ("guitarras-clasicas", r"\b(?:guitarras?\s+(?:electroacusticas?\s+)?(?:clasicas?|espanolas?|criollas?|flamencas?|de\s+concierto|de\s+estudio|acusticas?\s+.*?\bnylon\b|electroacusticas?\s+.*?\bnylon\b)|pack\s+(?:de\s+)?guitarra\s+(?:clasica|acustica\s+.*?\bnylon\b)|cuerdas\s+(?:de\s+)?nylon|alhambra\s+guitarra|guitarra\s+alhambra|admira\s+(?:guitarra|pack\s+de\s+guitarra)|guitarra\s+.*?\badmira\b|yamaha\s+(?:c40|c70|c80|cx40|cg\d+|ncx|ntx)|c80\s+yamaha|ibanez\s+ga\d+\w*|takamine\s+gc\d+|cordoba\s+(?:c\d+|gk|fusion|stage)|vizcaya\s+(?:pack\s+)?guitarra\s+clasica|arcg44)\b"),
    ("guitarras-acusticas", r"\b(?:guitarras?\s+(?:acusticas?|electroacusticas?|electro-acusticas?|electrocusticas?|folk)|pack\s+(?:de\s+)?guitarra\s+acustica|acoustic\s+guitar|dreadnought|grand\s+auditorium|parlor\s+guitar|taylor\s+(?:baby|big\s+baby|gs\s+mini|\d+ce)|martin\s+(?:d-\d+|000-\d+|lx1|gpc)|takamine\s+(?:gd\d+|gn\d+|gf\d+|gy\d+|ef\d+|p\d+|ec\d+)|yamaha\s+(?:f310|f370|fg\d+|fs\d+|fx\d+|apx\d+|cpx\d+|ll\d+|ls\d+|transacoustic)|epiphone\s+(?:hummingbird|j-200|j-45|dr-100|starling|songmaker)|fender\s+(?:cd-60|cc-60|fa-\d+|redondo|malibu|newporter|paramount|acoustasonic\s+(?:player|standard|american))|ibanez\s+(?:v\d+njp|v\d+ce|pf\d+|pc\d+|aw\d+|aewc\d+|tcy\d+|tcm\d+|talman\s+acustica))\b"),
    ("guitarras-electricas", r"\b(?:guitarras?\s+electricas?|guitarra\s+electrico|pack\s+(?:de\s+)?guitarra\s+electrica|electric\s+guitar|stratocaster|telecaster|les\s+paul|sg\s+(?:standard|special|custom|tribute|modern)|flying\s+v|explorer\b|jazzmaster|jaguar\b|mustang\s+(?:guitar|90|p90|player|vintera|squier|fender)|superstrat|hollowbody|semi-hollow|es-335|es-339|ibanez\s+(?:rg\w+|grg\w+|grx\w+|jem\w*|pia\w*|az\w+|s\d+|sa\d+|arz\w+|artcore|as\d+|ag\d+|af\d+|iceman|ps\d+)|prs\s+(?:se\s+|custom|standard|silver\s+sky|mccarty|ce\s+24)|jackson\s+(?:js\d+|dinky|soloist|kelly|rhoads|warrior)|schecter\s+(?:omen|demon|hellraiser|reaper|c-1|c-6|c-7|nick\s+johnston|sun\s+valley)|esp\s+ltd\s+(?:ec-\d+|mh-\d+|m-\d+|ex-\d+|viper|arrow|sn-\d+|te-\d+)|gretsch\s+(?:g\d+|electromatic|streamliner)|epiphone\s+(?:les\s+paul|sg\b|casino|sheraton|riviera|dot|wildkat|crestwood|wilshire|coronet|firebird|prophecy)|fender\s+(?:player|vintera|american\s+(?:ultra|professional|vintage|performer)|custom\s+shop)|squier\s+(?:affinity|classic\s+vibe|sonic|bullet|contemporary|paranormal))\b"),
]
COMPILED_INSTRUMENT_RULES = [(slug, re.compile(pat)) for slug, pat in INSTRUMENT_TITLE_RULES]

def classify_slug(title: str, raw_category: Optional[str] = None, brand: Optional[str] = None) -> Tuple[Optional[str], str]:
    """Returns (canonical_slug, matched_rule). Slug is EXCLUDED_SLUG for non-musical items, None if unknown."""
    if is_excluded_product(title, raw_category):
        return EXCLUDED_SLUG, "excluded"

    norm_title = normalize_text(title)
    norm_raw = normalize_text(raw_category or "")
    norm_brand = normalize_text(brand or "")
    core_title = extract_core_title(norm_title)

    # Check if the product starts as a genuine Instrument Pack (e.g. 'pack guitarra electrica', 'pack de ukelele')
    is_instrument_pack = bool(
        re.search(
            r"^(?:[a-z0-9\s'&-]{0,25}?\b)?(?:pack|set)\s+(?:de\s+)?(?:guitarra|bajo|ukelele|ukulele|bateria|violin|teclado|piano)\b",
            core_title,
        )
    )

    # 1. Check Non-Instrument Title Rules on core_title FIRST (unless it's an instrument pack)
    if not is_instrument_pack:
        for slug, regex in COMPILED_NON_INSTRUMENT_RULES:
            if regex.search(core_title):
                return slug, f"title_non_inst:{slug}"

    # 2. Check Exact Raw Category Map
    if norm_raw in EXACT_RAW_CATEGORY_MAP:
        mapped_slug = EXACT_RAW_CATEGORY_MAP[norm_raw]
        # If raw_category is an ambiguous 'cuerdas' / 'cuerdas guitarra y bajo' and core_title is an instrument:
        if norm_raw in ("cuerdas", "cuerda", "cuerdas guitarra y bajo"):
            for inst_slug, regex in COMPILED_INSTRUMENT_RULES:
                if regex.search(core_title):
                    return inst_slug, f"inst_override_cuerdas:{inst_slug}"
        # If mapped_slug is an Instrument category, let specific Instrument Title Rules refine the instrument sub-type
        if mapped_slug in INSTRUMENT_SLUGS:
            if mapped_slug == "guitarras-clasicas" and not re.search(r"\b(?:electrica|cuerdas\s+metal)\b", core_title):
                return "guitarras-clasicas", f"exact_raw_cat:{norm_raw}"
            for inst_slug, regex in COMPILED_INSTRUMENT_RULES:
                if regex.search(core_title):
                    return inst_slug, f"inst_title_refined:{inst_slug}"
        return mapped_slug, f"exact_raw_cat:{norm_raw}"

    # 3. Check Instrument Title Rules on core_title
    for slug, regex in COMPILED_INSTRUMENT_RULES:
        if regex.search(core_title):
            return slug, f"title_inst:{slug}"

    # 4. Check Non-Instrument + Instrument Rules on full (core_title + norm_raw + norm_brand)
    combined = f"{core_title} {norm_raw} {norm_brand}"
    for slug, regex in COMPILED_NON_INSTRUMENT_RULES:
        if regex.search(combined):
            return slug, f"combined_non_inst:{slug}"
    for slug, regex in COMPILED_INSTRUMENT_RULES:
        if regex.search(combined):
            return slug, f"combined_inst:{slug}"

    return None, "unclassified"

def _confidence_for(rule: str) -> float:
    if rule.startswith("exact_raw_cat") or rule.startswith("inst_title_refined") or rule.startswith("inst_override"):
        return 0.98
    if rule.startswith("title_"):
        return 0.95
    if rule.startswith("combined_"):
        return 0.80
    return 0.0


def _detect_params(norm: str, slug: Optional[str]) -> Tuple[Dict[str, str], List[str]]:
    params: Dict[str, str] = {}
    subcats: List[str] = []
    if slug in ("guitarras-electricas", "bajos-electricos", "guitarras-acusticas", "guitarras-clasicas"):
        if re.search(r"\b(?:7|8)\s*(?:cuerdas|-string)\b", norm):
            params["strings_min"] = "7"
            subcats.append("7 o más cuerdas")
        if re.search(r"\b(?:zurdo|zurda|left[\s-]?hand(?:ed)?|lefty)\b", norm):
            params["is_left_handed"] = "1"
            subcats.append("Para Zurdos")
        if re.search(r"\bstrat(?:ocaster)?\b", norm):
            params["body_shape"] = "stratocaster"
            subcats.append("Stratocaster")
        elif re.search(r"\btele(?:caster)?\b", norm):
            params["body_shape"] = "telecaster"
            subcats.append("Telecaster")
        elif re.search(r"\b(?:les\s+paul|singlecut)\b", norm):
            params["body_shape"] = "les_paul"
            subcats.append("Les Paul / Singlecut")
    if slug in ("amplificadores-de-guitarra", "amplificadores-de-bajo", "cabezales-y-cajas"):
        if re.search(r"\b(?:valvular(?:es)?|tubos|tube\s+amp|valvulas?)\b", norm):
            params["tech"] = "tubes"
            subcats.append("Valvulares (Tubes)")
        elif re.search(r"\b(?:digital(?:es)?|modelado|modeling)\b", norm):
            params["tech"] = "digital"
            subcats.append("Digitales / Modelado")
    return params, subcats


_CATEGORY_CACHE: Dict[str, Tuple[int, str]] = {}


def _resolve_category(session: Session, slug: str) -> Optional[Tuple[int, str]]:
    cached = _CATEGORY_CACHE.get(slug)
    if cached:
        return cached
    cat = session.query(Category).filter(Category.slug == slug).first()
    if not cat:
        return None
    _CATEGORY_CACHE[slug] = (cat.id, cat.name)
    return _CATEGORY_CACHE[slug]


def classify_product(
    title: str,
    raw_category: Optional[str] = None,
    brand: Optional[str] = None,
    session: Optional[Session] = None,
) -> TaxonomyResult:
    """Clasifica un producto en una categoria canonica y detecta facetas."""
    slug, rule = classify_slug(title, raw_category, brand)
    if slug == EXCLUDED_SLUG:
        return TaxonomyResult(category_slug=None, confidence=1.0, matched_rule="excluded")

    params, subcats = _detect_params(normalize_text(title), slug)
    cat_id: Optional[int] = None
    cat_name: Optional[str] = None
    if session is not None and slug:
        resolved = _resolve_category(session, slug)
        if resolved:
            cat_id, cat_name = resolved

    return TaxonomyResult(
        category_slug=slug,
        confidence=_confidence_for(rule),
        matched_rule=rule,
        category_id=cat_id,
        category_name=cat_name,
        detected_params=params,
        suggested_subcategories=subcats,
    )
