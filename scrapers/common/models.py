"""Shared data models for SoloTono scrapers."""

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class ScrapedOffer:
    product_slug: str
    product_name: str
    store_name: str
    product_url: str
    price_cash: int
    price_normal: int
    in_stock: bool

    brand: Optional[str] = None
    category: Optional[str] = None
    section: Optional[str] = None
    sub_category: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    store_product_id: Optional[str] = None
    sku: Optional[str] = None
    part_number: Optional[str] = None
    ean: Optional[str] = None
    stock: Optional[int] = None
    picture_urls: List[str] = field(default_factory=list)


@dataclass
class SyncSummary:
    processed: int = 0
    created_products: int = 0
    created_offers: int = 0
    updated_offers: int = 0
    price_history_entries: int = 0
    errors: list = field(default_factory=list)
