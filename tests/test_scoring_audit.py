# -*- coding: utf-8 -*-
"""Scoring audit pilot: ledger without PII, offline, reproducible."""

from __future__ import annotations

import json
from pathlib import Path

from pilot.run_scoring_audit import run


def test_scoring_audit_no_pii(tmp_path: Path) -> None:
    report = run(entity="TEST", n=10, seed=7, out_dir=tmp_path)

    assert report["n"] == 10
    assert report["seed"] == 7
    assert "folio_note" in report
    assert "no es folio CNBV" in report["folio_note"].lower() or "NO es folio CNBV" in report["folio_note"]
    assert report["scope"]["is_cnbv_certified"] is False

    out = Path(report["output"])
    assert out.exists()
    data = json.loads(out.read_text(encoding="utf-8"))
    assert "report" in data
    assert "ledger" in data
    assert len(data["ledger"]) == 10

    for entry in data["ledger"]:
        rec = entry["record"]
        blob = json.dumps(rec).lower()
        assert "curp" not in blob
        assert "password" not in blob
        assert "nombre" not in blob
        assert "subject_id_hash" in rec

    sha_path = Path(report["sha256_file"])
    assert sha_path.exists()
