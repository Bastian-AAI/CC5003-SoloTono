"""CLI entrypoint for the Audiomusica scraper."""

from __future__ import annotations

import argparse
import json
import os
from typing import List

from scrapers.audiomusica.scraper import AudiomusicaScraper
from scrapers.common.client import SoloTonoClient
from scrapers.common.models import SyncSummary


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scrape Audiomusica and sync into SoloTono")
    parser.add_argument("--limit", type=int, default=None, help="Maximum number of products to scrape")
    parser.add_argument("--query", type=str, default=None, help="Optional VTEX search query")
    parser.add_argument("--dry-run", action="store_true", help="Print payloads without sending them")
    parser.add_argument("--batch-size", type=int, default=10, help="Items per API request")
    parser.add_argument("--api-base-url", default=os.getenv("SOLOTONO_API_BASE_URL", "http://localhost:3001"))
    parser.add_argument("--api-key", default=os.getenv("SOLOTONO_SCRAPER_API_KEY", ""))
    return parser.parse_args()


def print_summary(summary_json: dict) -> None:
    summary = SyncSummary(
        processed=summary_json.get("processed", 0),
        created_products=summary_json.get("createdProducts", 0),
        created_offers=summary_json.get("createdOffers", 0),
        updated_offers=summary_json.get("updatedOffers", 0),
        price_history_entries=summary_json.get("priceHistoryEntries", 0),
        errors=summary_json.get("errors", []),
    )
    print(
        "processed={processed} created_products={created_products} "
        "created_offers={created_offers} updated_offers={updated_offers} "
        "history={price_history_entries} errors={error_count}".format(
            processed=summary.processed,
            created_products=summary.created_products,
            created_offers=summary.created_offers,
            updated_offers=summary.updated_offers,
            price_history_entries=summary.price_history_entries,
            error_count=len(summary.errors),
        )
    )
    for error in summary.errors[:10]:
        print(f"  error[{error.get('index')}]: {error.get('message')}")


def main() -> int:
    args = parse_args()

    offers = AudiomusicaScraper.scrape_all(limit=args.limit, query=args.query)
    payloads = [AudiomusicaScraper.to_payload(offer) for offer in offers]

    print(f"Scraped {len(payloads)} Audiomusica products")
    if args.dry_run:
        print(json.dumps(payloads[:3], ensure_ascii=False, indent=2))
        return 0

    if not args.api_key:
        print("SOLOTONO_SCRAPER_API_KEY is required unless --dry-run is used")
        return 2

    client = SoloTonoClient(args.api_base_url, args.api_key)
    summaries = client.sync_batches(payloads, batch_size=args.batch_size)
    for summary in summaries:
        print_summary(summary)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
