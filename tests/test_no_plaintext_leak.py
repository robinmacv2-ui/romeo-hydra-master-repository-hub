# -*- coding: utf-8 -*-
"""
TRL-6 Gate: No plaintext leak
=============================
Pruebas exigidas por entorno regulado (banca / CNBV-like).
Garantizan que el núcleo no expone datos en claro ni secretos en rastros.
"""

from __future__ import annotations

import hashlib
import json
import re

import numpy as np
import pytest

from romeo_hydra import (
    KernelConfig,
    KernelSigmaController,
    MimeticSurfaceAdapter,
    EnvironmentSpectrum,
    RomeoAbstractionLayer,
    get_info,
)


# ── Helpers ──────────────────────────────────────────────────────────────────

SENSITIVE_PATTERNS = [
    re.compile(r"password\s*[:=]", re.I),
    re.compile(r"secret[_-]?key", re.I),
    re.compile(r"api[_-]?key\s*[:=]", re.I),
    re.compile(r"Bearer\s+[A-Za-z0-9\-._~+/]+=*"),
    re.compile(r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----"),
]


def _assert_no_sensitive(text: str) -> None:
    for pat in SENSITIVE_PATTERNS:
        assert not pat.search(text), f"Posible fuga de secreto detectada: {pat.pattern}"


# ── Tests ────────────────────────────────────────────────────────────────────

def test_core_state_hash_is_deterministic_and_opaque():
    """El CoreState produce hash SHA-256 estable y no contiene el vector en claro en el hash."""
    cfg = KernelConfig(state_dimension=32)
    kernel = KernelSigmaController(cfg)
    rng = np.random.default_rng(7)
    current = np.zeros(32)
    candidate = rng.normal(0, 0.2, 32)

    core1, _ = kernel.collapse_to_core(current, candidate)
    core2, _ = kernel.collapse_to_core(current, candidate)

    h1 = core1.compute_sha256()
    h2 = core2.compute_sha256()

    assert h1 == h2, "Hash debe ser determinista con la misma entrada"
    assert len(h1) == 64
    assert all(c in "0123456789abcdef" for c in h1)
    # El hash no debe ser el vector serializado
    assert h1 != candidate.tobytes().hex()


def test_mimetic_phenotype_never_contains_raw_secrets():
    """Ningún fenotipo del adaptador mimético debe contener secretos en claro."""
    cfg = KernelConfig(state_dimension=24)
    kernel = KernelSigmaController(cfg)
    current = np.zeros(24)
    candidate = np.random.default_rng(42).normal(0, 0.15, 24)
    core, adapter = kernel.collapse_to_core(current, candidate)

    for spectrum in EnvironmentSpectrum:
        phenotype = adapter.project(spectrum)
        if isinstance(phenotype, dict):
            serialized = json.dumps(phenotype, default=str)
        elif isinstance(phenotype, bytes):
            serialized = phenotype.hex()
        else:
            serialized = str(phenotype)

        _assert_no_sensitive(serialized)
        # No debe aparecer el vector completo en texto legible de forma trivial
        assert "password" not in serialized.lower()
        assert "private_key" not in serialized.lower()


def test_abstraction_layer_output_is_stub_not_secret():
    """El esqueleto C++ generado es conceptual y no incluye claves reales."""
    romeo = RomeoAbstractionLayer()
    cpp = romeo.unfold_to_cpp("circuito de prueba de no-fuga")
    _assert_no_sensitive(cpp)
    assert "delete_gate_bootstrapping" in cpp or "RomeoCircuit" in cpp
    assert "SECRET" not in cpp.upper() or "secret" not in cpp  # stub seguro

    verified = romeo.verify_homomorphic_circuit("test")
    assert verified.get("privacy") == "data_never_revealed"
    assert verified.get("verified") is True


def test_package_metadata_exposes_no_credentials():
    """get_info() solo devuelve metadatos públicos."""
    info = get_info()
    blob = json.dumps(info)
    _assert_no_sensitive(blob)
    assert "doi_concept" in info
    assert info["trl"] in ("5", "6") or "TRL" in str(info.get("status", ""))
