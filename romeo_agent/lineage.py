"""Immutable lineage constants (EMMOROR Regime Delta / WORM traceability).

Source of truth: Manifiesto IH + DOIs Zenodo + Dictamen de Autoría.
Never invent; only declare what is already published.
"""
from __future__ import annotations

LINEAGE: dict[str, str] = {
    "architect": "Luis Angel Vazquez Martinez",
    "agent": "romeo_agent",
    "policy": "fail-closed ? offline ? sin red ? sin shell libre",
    "formalization": "FORMALIZACION_DFA (agosto 2026)",
    "doi_concept": "10.5281/zenodo.21744014",
    "doi_version": "10.5281/zenodo.21922106",
    "doi_core_software": "10.5281/zenodo.21406719",
    "doi_hardware": "10.5281/zenodo.21697259",
    "doi_ontology": "10.5281/zenodo.2170967",
    "regime": "EMMOROR Alpha/Beta/Gamma/Delta",
}


def get_lineage() -> dict[str, str]:
    """Return a shallow copy of the frozen lineage map."""
    return dict(LINEAGE)
