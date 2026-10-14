"""Audiomusica scraper using VTEX Catalog API."""

from __future__ import annotations

from decimal import Decimal
from typing import Any, Dict, List, Optional
from urllib.parse import urlsplit

from scrapers.common.models import ScrapedOffer
from scrapers.common.normalize import (
    clean_price,
    infer_category,
    infer_section,
    normalize_store_name,
    strip_html,
    to_slug,
)
from scrapers.common.session import get_session


class AudiomusicaScraper:
    store_slug = "audiomusica"
    website_url = "https://www.audiomusica.com"
    catalog_url = f"{website_url}/api/catalog_system/pub/products/search"

    @classmethod
    def _fetch_page(cls, offset: int, batch_size: int, query: Optional[str] = None) -> Optional[List[Dict[str, Any]]]:
        session = get_session()
        params: Dict[str, Any] = {"_from": offset, "_to": offset + batch_size - 1}
        if query:
            params["ft"] = query

        response = session.get(cls.catalog_url, params=params, timeout=20)
        if response.status_code == 400 and "_from can't be greater" in response.text:
            return None
        if response.status_code not in (200, 206):
            response.raise_for_status()
        data = response.json()
        if not isinstance(data, list):
            return []
        return data

    @classmethod
    def _normalize(cls, item: Dict[str, Any]) -> Optional[ScrapedOffer]:
        skus = item.get("items") or []
        if not skus:
            return None

        sku_data = skus[0]
        sellers = sku_data.get("sellers") or []
        if not sellers:
            return None

        comm = sellers[0].get("commertialOffer") or {}
        price = comm.get("Price", 0)
        list_price = comm.get("ListPrice", price)
        if list_price is None or list_price <= 0:
            list_price = price

        # Audiomusica exposes:
        #   Price/ListPrice in the catalog offer.
        #   In product pages, spotPrice is the transfer/cash price and
        #   ListPrice/PriceWithoutDiscount is the normal/card price.
        # The catalog API usually gives Price=offer and ListPrice=normal.
        offer_price = clean_price(price)
        normal_price = clean_price(list_price if list_price > price else price)

        if offer_price == 0 and normal_price == 0:
            return None

        if normal_price < offer_price:
            normal_price = offer_price

        stock = int(comm.get("AvailableQuantity") or 0)
        is_available = bool(comm.get("IsAvailable", stock > 0)) and stock > 0

        category_path = ""
        categories = item.get("categories") or []
        if categories and isinstance(categories, list):
            category_path = categories[0] or ""

        title = item.get("productName") or ""
        brand = item.get("brand")
        solotono_category = infer_category(category_path, title)
        section = infer_section(solotono_category)

        sub_category = None
        if category_path:
            segments = [segment.strip() for segment in category_path.strip("/").split("/") if segment.strip()]
            if len(segments) > 1:
                sub_category = segments[1]
            elif segments:
                sub_category = segments[0]
        image_urls = [
            image.get("imageUrl")
            for image in sku_data.get("images", [])
            if isinstance(image, dict) and image.get("imageUrl")
        ]

        reference_ids = sku_data.get("referenceId") or []
        part_number = None
        if isinstance(reference_ids, list) and reference_ids:
            first = reference_ids[0]
            if isinstance(first, dict):
                part_number = first.get("Value")

        slug = (item.get("linkText") or "").strip("-")
        if not slug:
            link = item.get("link") or ""
            slug = urlsplit(link).path.rstrip("/").split("/")[-1].replace(".html", "")

        store_product_id = str(sku_data.get("itemId") or "") or None
        ean = sku_data.get("ean") or None

        return ScrapedOffer(
            product_slug=slug,
            product_name=title.strip(),
            store_name=normalize_store_name(cls.store_slug),
            product_url=item.get("link") or f"{cls.website_url}/{slug}/p",
            price_cash=offer_price,
            price_normal=normal_price,
            in_stock=is_available,
            brand=brand,
            category=solotono_category,
            section=section,
            sub_category=sub_category,
            image_url=image_urls[0] if image_urls else None,
            picture_urls=image_urls,
            description=item.get("description"),
            store_product_id=store_product_id,
            sku=store_product_id,
            part_number=part_number,
            ean=ean,
            stock=stock,
        )

    @classmethod
    def to_payload(cls, offer: ScrapedOffer) -> dict:
        return {
            "product": {
                "slug": offer.product_slug,
                "name": offer.product_name,
                "brand": offer.brand,
                "category": offer.category,
                "section": offer.section,
                "subCategory": offer.sub_category,
                "imageUrl": offer.image_url,
                "description": strip_html(offer.description),
            },
            "offer": {
                "storeName": offer.store_name,
                "storeProductId": offer.store_product_id,
                "sku": offer.sku,
                "productUrl": offer.product_url,
                "priceCash": offer.price_cash,
                "priceNormal": offer.price_normal,
                "inStock": offer.in_stock,
            },
        }

    @classmethod
    def scrape_all(cls, limit: Optional[int] = None, query: Optional[str] = None) -> List[ScrapedOffer]:
        offers: List[ScrapedOffer] = []
        offset = 0
        batch_size = 50

        while True:
            effective_batch = batch_size
            if limit is not None:
                remaining = limit - len(offers)
                if remaining <= 0:
                    break
                effective_batch = min(batch_size, remaining)

            try:
                items = cls._fetch_page(offset, effective_batch, query=query)
            except Exception as exc:
                raise RuntimeError(f"Failed to fetch Audiomusica catalog at offset {offset}: {exc}") from exc

            if items is None:
                print(f"Audiomusica VTEX pagination limit reached at offset {offset}; stopping collection.")
                break

            if not items:
                break
            for item in items:
                offer = cls._normalize(item)
                if offer is not None:
                    offers.append(offer)
                    if limit is not None and len(offers) >= limit:
                        return offers

            offset += len(items)
            if len(items) < effective_batch:
                break
            if limit is not None and offset >= limit:
                break

        return offers
