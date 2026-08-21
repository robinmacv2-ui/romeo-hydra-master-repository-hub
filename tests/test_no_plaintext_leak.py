# -*- coding: utf-8 -*-
"""
TRL-6 Gate: No plaintext leak
=============================
Pruebas exigidas por entorno regulado (banca / CNBV-like).
Garantizan que el núcleo no expone secretos ni claves en rastros.
"""

from __future__ import annotations

import json
import re

import numpy as np
import pytest

from romeo_hydra import (
    KernelConfig,
    KernelSigmaController,
    EnvironmentSpectrum,
    RomeoAbstractionLayer,
    get_info,
)


SENSITIVE_PATTERNS = [
    re.compile(r"password\s*[:=]", re.I),
    re.compile(r"secret[_-]?key\s*[:=]", re.I),
    re.compile(r"api[_-]?key\s*[:=]", re.I),
    re.compile(r"Bearer\s+[A-Za-z0-9\-._~+/]+=*"),
    re.compile(r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----"),
]


def _assert_no_sensitive(text: str) -> None:
    for pat in SENSITIVE_PATTERNS:
        assert not pat.search(text), f"Posible fuga de secreto detectada: {pat.pattern}"


def test_core_state_hash_is_opaque_and_stable_for_same_object():
    """El hash de un CoreState concreto es estable y no es el vector en claro."""
    cfg = KernelConfig(state_dimension=32)
    kernel = KernelSigmaController(cfg)
    rng = np.random.default_rng(7)
    current = np.zeros(32)
    candidate = rng.normal(0, 0.2, 32)

    core, _ = kernel.collapse_to_core(current, candidate)
    h1 = core.compute_sha256()
    h2 = core.compute_sha256()  # mismo objeto -> mismo hash

    assert h1 == h2
    assert len(h1) == 64
    assert all(c in "0123456789abcdef" for c in h1)
    assert h1 != candidate.tobytes().hex()


def test_mimetic_phenotype_never_contains_raw_secrets():
    """Ningún fenotipo del adaptador mimético contiene secretos en claro."""
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
        assert "password" not in serialized.lower()
        assert "private_key" not in serialized.lower()


def test_abstraction_layer_output_is_stub_not_secret():
    """El esqueleto C++ generado es conceptual y no incluye claves reales."""
    romeo = RomeoAbstractionLayer()
    cpp = romeo.unfold_to_cpp("circuito de prueba de no-fuga")
    _assert_no_sensitive(cpp)
    # No debe contener material criptográfico real
    assert "PRIVATE KEY" not in cpp
    assert "BEGIN RSA" not in cpp
    assert "sk_" not in cpp  # patrones típicos de API keys
    assert "RomeoCircuit" in cpp or "evaluate_homomorphic" in cpp

    verified = romeo.verify_homomorphic_circuit("test")
    assert verified.get("privacy") == "data_never_revealed"
    assert verified.get("verified") is True


def test_package_metadata_exposes_no_credentials():
    """get_info() solo devuelve metadatos públicos."""
    info = get_info()
    blob = json.dumps(info)
    _assert_no_sensitive(blob)
    assert "doi_concept" in info
    assert "version" in info
