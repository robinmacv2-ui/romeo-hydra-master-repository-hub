# -*- coding: utf-8 -*-
"""
LAB: automation event sealing (evidence only).

Records external automation/SOAR/n8n decisions into the existing
AtomicLedgerWriter. Does not detect threats, block IPs, or execute actions.

Not part of the product surface until promoted with review.
"""

from __future__ import annotations

from lab.automation_evidence.sealer import (
    EVIDENCE_DISCLAIMER,
    AutomationEvidenceSealer,
    SealResult,
    build_evidence_payload,
    validate_external_event,
)

__all__ = [
    "EVIDENCE_DISCLAIMER",
    "AutomationEvidenceSealer",
    "SealResult",
    "build_evidence_payload",
    "validate_external_event",
]
