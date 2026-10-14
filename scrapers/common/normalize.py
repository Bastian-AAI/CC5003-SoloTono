"""Normalization helpers for prices and SoloTono taxonomy."""

from __future__ import annotations

import re
from typing import Optional


def clean_price(value) -> int:
    """Parse Chilean CLP prices such as '$1.299.990', '494990', or '494990.00'."""
    if value is None or value == "":
        return 0
    if isinstance(value, bool):
        raise TypeError("price cannot be a bool")
    if isinstance(value, (int, float)):
        return int(value)

    text = str(value).strip()
    if re.search(r"\.\d{1,2}$", text):
        text = re.sub(r"\.\d{1,2}$", "", text)

    digits = re.sub(r"[^\d]", "", text)
    return int(digits) if digits else 0


def normalize_store_name(store_slug: str) -> str:
    mapping = {
        "audiomusica": "Audiomusica",
        "casamarilla": "Casa Amarilla",
        "promusic": "Promusic",
        "rdmusico": "RD Musico",
        "fatstore": "Fat Store",
        "fender": "Fender Chile",
        "musicchile": "Music Chile",
        "instrumentoschile": "Instrumentos Chile",
        "epicmusic": "Epic Music",
        "factorysound": "Factory Sound",
        "overdrive": "Overdrive",
    }
    return mapping.get(store_slug.lower(), store_slug.replace("_", " ").title())


def _contains(haystack: str, *needles: str) -> bool:
    haystack = haystack.lower()
    return any(needle in haystack for needle in needles)


def infer_category(path: Optional[str], title: Optional[str] = None) -> str:
    """Map a store category/title to a SoloTono category."""
    joined = " ".join(part for part in (path or "", title or "") if part).lower()

    if _contains(joined, "audio pro", "grabación", "grabacion", "audio"):
        if _contains(joined, "subwoofer", "sub bajo", "altavoz", "caja acústica", "caja acustica", "parlante"):
            return "En Vivo y PA"
        if _contains(joined, "microfono", "micrófono", "interface", "interfase", "monitor", "audifono", "audífono", "consola"):
            return "Grabación y Estudio"
        return "Grabación y Estudio"

    if _contains(joined, "microfono", "micrófono", "interface", "interfase", "monitor", "audifono", "audífono", "consola"):
        return "Grabación y Estudio"

    if _contains(joined, "guitarra", "bajo", "ukelele", "violin", "viola", "mandolina"):
        return "Cuerda"
    if _contains(joined, "flauta", "saxofon", "saxófono", "trompeta", "clarinete", "armonica", "armónica"):
        return "Aire"
    if _contains(joined, "bateria", "batería", "percusion", "percusión", "platillo", "redoblante"):
        return "Percusión"
    if _contains(joined, "teclado", "piano", "sintetizador", "midi"):
        return "Teclas"
    if _contains(joined, "amplificador", "amp "):
        return "Amplificación"
    if _contains(joined, "pedal", "efecto"):
        return "Efectos"
    if _contains(joined, "cuerda", "afinador", "clavijero", "puente", "cejuela"):
        return "Cuerdas y Afinación"
    if _contains(joined, "pastilla", "capsula", "cápsula", "potenciometro", "potenciómetro", "jack", "placa"):
        return "Electrónica y Pastillas"
    if _contains(joined, "correa", "strap", "funda", "estuche", "soporte", "stand", "pick", "uñeta", "pua", "púa"):
        return "Accesorios"
    if _contains(joined, "limpieza", "aceite", "herramienta", "mantencion", "mantención"):
        return "Mantenimiento"
    return "Otros"


def infer_section(category: Optional[str]) -> str:
    if category in {"Cuerda", "Aire", "Percusión", "Teclas"}:
        return "Instrumentos"
    if category in {"Cuerdas y Afinación", "Electrónica y Pastillas", "Accesorios", "Mantenimiento"}:
        return "Piezas y Repuestos"
    if category in {"Amplificación", "Efectos", "Grabación y Estudio", "En Vivo y PA"}:
        return "Equipos de sonido"
    return "Instrumentos"


def to_slug(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    text = value.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text or None


def strip_html(value: Optional[str], max_length: int = 4000) -> Optional[str]:
    if not value:
        return None
    text = re.sub(r"<[^>]*>", " ", value)
    text = " ".join(text.split())
    if not text:
        return None
    return text[:max_length]
