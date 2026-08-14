# -*- coding: utf-8 -*-
"""Scoring audit pilot: ledger without PII, offline, reproducible."""

from __future__ import annotations

import json
from pathlib import Path

from pilot.run_scoring_audit import main


def test_scoring_audit_no_pii(tmp_path, monkeypatch):
    import pilot.run_scoring_audit as mod

    monkeypatch.setattr(mod, "OUTPUT_DIR", tmp_path)

    rc = main(["--entity", "TEST", "--n", "10", "--seed", "7"])
    assert rc == 0

    ledger = tmp_path / "scoring_ledger.jsonl"
    summary = tmp_path / "scoring_summary.json"
    assert ledger.exists()
    assert summary.exists()

    lines = ledger.read_text(encoding="utf-8").strip().splitlines()
    assert len(lines) == 10

    for line in lines:
        rec = json.loads(line)
        assert rec.get("pii_stored") is False
        assert rec.get("offline") is True
        assert "folio" in rec
        assert "input_hash" in rec
        blob = line.lower()
        assert "curp" not in blob
        assert "password" not in blob
        assert "nombre" not in blob

    data = json.loads(summary.read_text(encoding="utf-8"))
    assert data["n_decisions"] == 10
    assert data["pii_stored"] is False
    assert "disclaimer" in data
