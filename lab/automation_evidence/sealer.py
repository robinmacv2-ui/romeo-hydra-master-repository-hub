# -*- coding: utf-8 -*-
"""Compatibility shim - implementation: romeo_hydra.evidence.automation.

REMOVE_AFTER: 2027-02-17 - delete with lab/automation_evidence/.
Prefer: from romeo_hydra.evidence import AutomationEvidenceSealer
"""

from __future__ import annotations

from romeo_hydra.evidence.automation import (  # noqa: F401
    EVIDENCE_DISCLAIMER,
    EVIDENCE_KIND,
    RECORDER,
    SCHEMA_VERSION,
    AutomationEvidenceSealer,
    SealResult,
    build_evidence_payload,
    payload_sha256,
    validate_external_event,
)

__all__ = [
    "EVIDENCE_DISCLAIMER",
    "EVIDENCE_KIND",
    "RECORDER",
    "SCHEMA_VERSION",
    "AutomationEvidenceSealer",
    "SealResult",
    "build_evidence_payload",
    "payload_sha256",
    "validate_external_event",
]
