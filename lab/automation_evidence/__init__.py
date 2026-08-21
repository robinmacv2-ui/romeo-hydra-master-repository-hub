# -*- coding: utf-8 -*-
"""Deprecated import path - use romeo_hydra.evidence instead.

REMOVE_AFTER: 2027-02-17
  Delete this package once callers use romeo_hydra.evidence.
  Shim exists only for a short transition after promotion (Aug 2026).
"""

from __future__ import annotations

from romeo_hydra.evidence import (
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
