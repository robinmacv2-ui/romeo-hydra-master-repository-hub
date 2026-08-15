# -*- coding: utf-8 -*-
"""Pilot path: offline audit node must run and produce ledger without secrets."""

from __future__ import annotations

import json
import re
from pathlib import Path

from pilot.run_offline_audit import run

SENSITIVE = [
    re.compile(r"password\s*[:=]", re.I),
    re.compile(r"secret[_-]?key\s*[:=]", re.I),
    re.compile(r"-----BEGIN .*PRIVATE KEY-----"),
]


def test_offline_audit_produces_ledger(tmp_path: Path) -> None:
    report = run(days=7, entity="TEST-SOFIPO", out_dir=tmp_path)

    assert report["days"] == 7
    assert report["entity"] == "TEST-SOFIPO"
    assert "folio_note" in report
    note = report["folio_note"].lower()
    assert "no es folio cnbv" in note or "no es folio CNBV".lower() in note
    assert report.get("tfhe") is False
    assert report["offline_proof"]["stdlib_only"] is True

    out = Path(report["output"])
    assert out.exists()
    data = json.loads(out.read_text(encoding="utf-8"))
    assert len(data["events"]) == 7

    blob = json.dumps(data)
    for pat in SENSITIVE:
        assert not pat.search(blob)

    assert Path(report["sha256_file"]).exists()
