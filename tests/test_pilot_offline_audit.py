# -*- coding: utf-8 -*-
"""Pilot path: offline audit node must run and produce ledger without secrets."""

from __future__ import annotations

import json
import re
from pathlib import Path

import pytest

from pilot.run_offline_audit import main, OUTPUT_DIR


SENSITIVE = [
    re.compile(r"password\s*[:=]", re.I),
    re.compile(r"secret[_-]?key\s*[:=]", re.I),
    re.compile(r"-----BEGIN .*PRIVATE KEY-----"),
]


def test_offline_audit_produces_ledger(tmp_path, monkeypatch):
    # Redirect output to temp dir
    import pilot.run_offline_audit as mod

    monkeypatch.setattr(mod, "OUTPUT_DIR", tmp_path)

    rc = main(["--days", "7", "--entity", "TEST-SOFIPO", "--cycles", "3", "--seed", "1"])
    assert rc == 0

    ledger = tmp_path / "audit_ledger.jsonl"
    summary = tmp_path / "pilot_summary.json"
    bundle = tmp_path / "evidence_bundle.md"

    assert ledger.exists()
    assert summary.exists()
    assert bundle.exists()

    lines = ledger.read_text(encoding="utf-8").strip().splitlines()
    assert len(lines) == 3

    for line in lines:
        rec = json.loads(line)
        assert "folio" in rec
        assert "record_hash" in rec
        assert rec.get("offline") is True
        blob = json.dumps(rec)
        for pat in SENSITIVE:
            assert not pat.search(blob)

    data = json.loads(summary.read_text(encoding="utf-8"))
    assert data["cycles_executed"] == 3
    assert "disclaimer" in data
