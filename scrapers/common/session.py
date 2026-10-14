"""Resilient HTTP session helpers."""

from __future__ import annotations

import os
from typing import Optional

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

HTTP_TIMEOUT = int(os.getenv("SOLOTONO_HTTP_TIMEOUT", "15"))
HTTP_RETRIES = int(os.getenv("SOLOTONO_HTTP_RETRIES", "3"))


def get_session() -> requests.Session:
    session = requests.Session()
    retry = Retry(
        total=HTTP_RETRIES,
        backoff_factor=0.5,
        status_forcelist=[429, 500, 502, 503, 504],
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    session.headers.update(
        {
            "User-Agent": os.getenv(
                "SOLOTONO_USER_AGENT",
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "es-CL,es;q=0.9,en;q=0.8",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        }
    )
    return session


def fetch_url(url: str, timeout: Optional[int] = None) -> Optional[str]:
    session = get_session()
    try:
        response = session.get(url, timeout=timeout or HTTP_TIMEOUT)
        if response.status_code == 200:
            return response.text
    except Exception:
        return None
    return None
