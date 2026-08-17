# -*- coding: utf-8 -*-
"""LAB tests: external automation events sealed via AtomicLedgerWriter."""

from __future__ import annotations

from pathlib import Path

import pytest

from lab.automation_evidence import (
    EVIDENCE_DISCLAIMER,
    AutomationEvidenceSealer,
    build_evidence_payload,
    validate_external_event,
)
from lab.automation_evidence.sealer import EVIDENCE_KIND, RECORDER


def _sample_event(**overrides):
    base = {
        "source_system": "n8n",
        "event_type": "ip_blocked",
        "summary": "Blocked 203.0.113.10 after playbook X",
        "occurred_at": "2026-08-17T02:00:00+00:00",
        "details": {"ip": "203.0.113.10", "reason": "brute_force"},
    }
    base.update(overrides)
    return base


def test_seal_event_commits_with_disclaimer_and_source(tmp_path: Path) -> None:
    ledger = tmp_path / "automation.jsonl"
    sealer = AutomationEvidenceSealer(ledger)

    result = sealer.seal(_sample_event())

    assert result.ok is True
    assert result.chain_ok is True
    assert result.evidence_note == EVIDENCE_DISCLAIMER
    assert result.payload["decision_by_romeo_hydra"] is False
    assert result.payload["source_system"] == "n8n"
    assert result.payload["kind"] == EVIDENCE_KIND
    assert result.payload["recorder"] == RECORDER

    evidence = sealer.list_evidence()
    assert len(evidence) == 1
    assert evidence[0]["summary"].startswith("Blocked 203.0.113.10")
    assert evidence[0]["evidence_note"] == EVIDENCE_DISCLAIMER
    disk = ledger.read_text(encoding="utf-8")
    assert "evidence_note" in disk
    assert "decision_by_romeo_hydra" in disk
    assert "lab.automation_evidence" in disk


def test_missing_source_system_rejected() -> None:
    with pytest.raises(ValueError, match="source_system"):
        validate_external_event(
            {
                "event_type": "ip_blocked",
                "summary": "missing source",
            }
        )


def test_tamper_after_seal_breaks_chain(tmp_path: Path) -> None:
    ledger = tmp_path / "automation.jsonl"
    sealer = AutomationEvidenceSealer(ledger)
    result = sealer.seal(_sample_event(source_system="cortex_xsoar"))
    assert result.chain_ok is True

    text = ledger.read_text(encoding="utf-8")
    lines = text.splitlines()
    mutated = []
    flipped = False
    for line in lines:
        if not flipped and line.startswith("HASH: "):
            h = line[len("HASH: "):].strip()
            if len(h) == 64 and "503b0b26" not in h:
                flipped_char = "0" if h[-1] != "0" else "1"
                line = f"HASH: {h[:-1]}{flipped_char}"
                flipped = True
        mutated.append(line)
    assert flipped, "expected to find a non-genesis HASH line to tamper"
    ledger.write_text("\n".join(mutated) + "\n", encoding="utf-8")

    assert sealer.chain_ok() is False


def test_build_payload_never_claims_romeo_decision() -> None:
    payload = build_evidence_payload(_sample_event())
    assert payload["decision_by_romeo_hydra"] is False
    assert payload["evidence_note"] == EVIDENCE_DISCLAIMER
    assert payload["kind"] == EVIDENCE_KIND
