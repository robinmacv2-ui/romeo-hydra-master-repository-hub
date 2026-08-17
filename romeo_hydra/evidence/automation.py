# -*- coding: utf-8 -*-
"""
Seal external automation events into ROMEO-HYDRA's atomic ledger.

Product module:
  - Accept a JSON event produced by a third system (n8n, Cortex XSOAR, etc.)
  - Persist it via AtomicLedgerWriter (PENDING → COMMITTED)
  - Attach an explicit disclaimer: ROMEO-HYDRA did NOT decide or validate the action

Out of scope:
  - Threat detection, IP blocking, firewall orchestration
  - Approving or rejecting the external decision
  - New mandatory dependencies

Depends on romeo_hydra only through:
  from romeo_hydra.core.storage.atomic_writer import AtomicLedgerWriter

Author: Luis Angel Vazquez Martinez (product: romeo_hydra.evidence)
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Mapping

from romeo_hydra.core.storage.atomic_writer import AtomicLedgerWriter

EVIDENCE_DISCLAIMER = (
    "Evidencia de un evento externo, no una decisión tomada por ROMEO-HYDRA."
)

EVIDENCE_KIND = "external_automation_event"
SCHEMA_VERSION = "1"
RECORDER = "romeo_hydra.evidence.automation"

# Contract history (bump SCHEMA_VERSION when payload shape changes incompatibly).
# "1" — initial product schema:
#       required: source_system, event_type, summary
#       always set by sealer: kind, schema_version, recorder, recorded_at,
#                             decision_by_romeo_hydra=False, evidence_note
#       optional pass-through: occurred_at, actor, external_id, details
SCHEMA_VERSION_NOTES = {
    "1": (
        "Initial product schema. External action record only; "
        "ROMEO-HYDRA never claims decision authority."
    ),
}


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def validate_external_event(raw: Mapping[str, Any]) -> Dict[str, Any]:
    """
    Validate minimal schema for an external automation event.

    Required:
      - source_system: str (e.g. "n8n", "cortex_xsoar")
      - event_type: str
      - summary: str

    Optional: occurred_at, actor, details, external_id
    """
    if not isinstance(raw, Mapping):
        raise ValueError("event must be a mapping/dict")

    source = raw.get("source_system")
    if not isinstance(source, str) or not source.strip():
        raise ValueError(
            "source_system is required (e.g. 'n8n', 'cortex_xsoar') — "
            "identifies the external system that took the action"
        )

    event_type = raw.get("event_type")
    if not isinstance(event_type, str) or not event_type.strip():
        raise ValueError("event_type is required (non-empty string)")

    summary = raw.get("summary")
    if not isinstance(summary, str) or not summary.strip():
        raise ValueError("summary is required (non-empty string)")

    details = raw.get("details", {})
    if details is None:
        details = {}
    if not isinstance(details, dict):
        raise ValueError("details must be a dict when provided")

    out: Dict[str, Any] = {
        "source_system": source.strip(),
        "event_type": event_type.strip(),
        "summary": summary.strip(),
        "details": details,
    }

    for key in ("occurred_at", "actor", "external_id"):
        val = raw.get(key)
        if val is not None:
            if not isinstance(val, str):
                raise ValueError(f"{key} must be a string when provided")
            out[key] = val.strip()

    return out


def build_evidence_payload(raw: Mapping[str, Any]) -> Dict[str, Any]:
    """Validated event + non-decision markers for the ledger hash."""
    event = validate_external_event(raw)
    return {
        "kind": EVIDENCE_KIND,
        "schema_version": SCHEMA_VERSION,
        "recorder": RECORDER,
        "recorded_at": _utc_now_iso(),
        "decision_by_romeo_hydra": False,
        "evidence_note": EVIDENCE_DISCLAIMER,
        **event,
    }


def payload_sha256(payload: Dict[str, Any]) -> str:
    raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


@dataclass
class SealResult:
    ok: bool
    chain_ok: bool
    payload: Dict[str, Any]
    payload_hash: str
    ledger_path: str
    evidence_note: str = EVIDENCE_DISCLAIMER

    def to_dict(self) -> Dict[str, Any]:
        return {
            "ok": self.ok,
            "chain_ok": self.chain_ok,
            "payload_hash": self.payload_hash,
            "ledger_path": self.ledger_path,
            "evidence_note": self.evidence_note,
            "decision_by_romeo_hydra": False,
            "payload": self.payload,
        }


class AutomationEvidenceSealer:
    """Thin consumer of AtomicLedgerWriter — records only, never acts."""

    def __init__(self, ledger_path: str | Path):
        self.ledger_path = Path(ledger_path)
        self._writer = AtomicLedgerWriter(self.ledger_path)

    def seal(self, event: Mapping[str, Any]) -> SealResult:
        payload = build_evidence_payload(event)
        ok = self._writer.append_entry(payload)
        return SealResult(
            ok=ok,
            chain_ok=self._writer.chain_ok(),
            payload=payload,
            payload_hash=payload_sha256(payload),
            ledger_path=str(self.ledger_path),
        )

    def list_evidence(self) -> list:
        return [
            e
            for e in self._writer.list_committed()
            if e.get("kind") == EVIDENCE_KIND and e.get("recorder") == RECORDER
        ]

    def chain_ok(self) -> bool:
        return self._writer.chain_ok()

    def sanitize_startup(self) -> int:
        return self._writer.sanitize_startup()
