# -*- coding: utf-8 -*-
"""SHA-256 real (stdlib). Integridad y encadenamiento de ledger."""

from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Iterable


def sha256_hex(data: str | bytes) -> str:
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: str | Path, chunk_size: int = 65536) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def chain_hash(prev_hash: str, payload: str | bytes) -> str:
    """Hash encadenado tipo blockchain simple (append-only ledger)."""
    if isinstance(payload, str):
        payload = payload.encode("utf-8")
    return sha256_hex(prev_hash.encode("utf-8") + b"|" + payload)
