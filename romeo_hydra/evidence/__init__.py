# -*- coding: utf-8 -*-
"""
Evidence helpers - record external facts into the atomic ledger.

Product surface: automation event sealing (n8n / SOAR / similar).
Does not detect threats, block IPs, or take security decisions.
"""

from __future__ import annotations

from romeo_hydra.evidence.automation import (
    EVIDENCE_DISCLAIMER,
    SCHEMA_VERSION,
    AutomationEvidenceSealer,
    SealResult,
    build_evidence_payload,
    validate_external_event,
)

__all__ = [
    "EVIDENCE_DISCLAIMER",
    "SCHEMA_VERSION",
    "AutomationEvidenceSealer",
    "SealResult",
    "build_evidence_payload",
    "validate_external_event",
]
