# -*- coding: utf-8 -*-
"""Deprecated import path — use romeo_hydra.evidence instead."""

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
