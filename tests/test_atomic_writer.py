# -*- coding: utf-8 -*-
"""Tests for two-phase atomic ledger writer (stdlib only) + genesis root."""

from __future__ import annotations

import json
from pathlib import Path

from romeo_hydra.genesis import GENESIS_HASH
from romeo_hydra.core.storage.atomic_writer import (
    STATUS_PENDING,
    AtomicLedgerWriter,
)


def test_append_and_chain_ok(tmp_path: Path) -> None:
    ledger = tmp_path / "delta.jsonl"
    w = AtomicLedgerWriter(ledger)
    assert GENESIS_HASH in ledger.read_text(encoding="utf-8")
    assert w.sanitize_startup() == 0
    assert w.append_entry({"op": 1, "v": "a"}) is True
    assert w.append_entry({"op": 2, "v": "b"}) is True
    assert w.chain_ok() is True
    committed = w.list_committed()
    assert len(committed) == 2
    assert committed[0]["op"] == 1
    assert committed[1]["op"] == 2


def test_sanitize_drops_pending(tmp_path: Path) -> None:
    ledger = tmp_path / "delta.jsonl"
    w = AtomicLedgerWriter(ledger)
    assert w.append_entry({"op": 1}) is True

    payload = json.dumps({"op": 99}, sort_keys=True, separators=(",", ":"))
    import hashlib

    h = hashlib.sha256(payload.encode()).hexdigest()
    with open(ledger, "a", encoding="utf-8") as f:
        f.write(f"{STATUS_PENDING}\nHASH: {h}\nPAYLOAD: {payload}\n\n---\n")

    assert STATUS_PENDING in ledger.read_text(encoding="utf-8")
    n = w.sanitize_startup()
    assert n == 1
    assert w.chain_ok() is True
    assert all(c["op"] != 99 for c in w.list_committed())


def test_empty_ledger_sealed_with_genesis(tmp_path: Path) -> None:
    ledger = tmp_path / "empty.jsonl"
    w = AtomicLedgerWriter(ledger)
    assert w.sanitize_startup() == 0
    assert w.list_committed() == []
    assert w.chain_ok() is True
    assert GENESIS_HASH in ledger.read_text(encoding="utf-8")
