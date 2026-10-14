"""Client for the SoloTono scraper ingestion API."""

from __future__ import annotations

from typing import Any, Dict, Iterable, List
import json

import requests


class SoloTonoClient:
    def __init__(self, base_url: str, api_key: str, timeout: int = 30):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout

    def sync(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        response = requests.post(
            f"{self.base_url}/api/internal/scraper/sync",
            headers={
                "Content-Type": "application/json",
                "X-API-Key": self.api_key,
            },
            data=json.dumps({"items": items}),
            timeout=self.timeout,
        )
        response.raise_for_status()
        return response.json()

    def sync_batches(self, items: Iterable[Dict[str, Any]], batch_size: int = 25) -> List[Dict[str, Any]]:
        batch: List[Dict[str, Any]] = []
        summaries: List[Dict[str, Any]] = []

        for item in items:
            batch.append(item)
            if len(batch) >= batch_size:
                summaries.append(self.sync(batch))
                batch = []

        if batch:
            summaries.append(self.sync(batch))

        return summaries
