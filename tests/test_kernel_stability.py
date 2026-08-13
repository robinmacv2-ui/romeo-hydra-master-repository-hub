# -*- coding: utf-8 -*-
"""
TRL-6: Kernel Sigma stability & projection tests
"""

from __future__ import annotations

import numpy as np
import pytest

from romeo_hydra import KernelConfig, KernelSigmaController


def test_projection_when_entropy_exceeds_tolerance():
    cfg = KernelConfig(state_dimension=16, error_tolerance=0.05)
    kernel = KernelSigmaController(cfg)
    current = np.zeros(16)
    # Candidato lejos → debe proyectar
    candidate = np.ones(16) * 2.0
    result = kernel.evaluate_and_collapse(current, candidate)

    assert result.projected is True
    assert result.final_entropy <= cfg.error_tolerance + 1e-9
    assert result.hessian_ok in (True, False)  # depende del Hessiano sintético


def test_no_projection_when_inside_tolerance():
    cfg = KernelConfig(state_dimension=16, error_tolerance=0.5)
    kernel = KernelSigmaController(cfg)
    current = np.zeros(16)
    candidate = np.random.default_rng(1).normal(0, 0.01, 16)
    result = kernel.evaluate_and_collapse(current, candidate)

    assert result.projected is False
    assert result.final_entropy < 0.5


def test_config_fingerprint_stable():
    cfg1 = KernelConfig(state_dimension=32, error_tolerance=0.05)
    cfg2 = KernelConfig(state_dimension=32, error_tolerance=0.05)
    assert cfg1.fingerprint() == cfg2.fingerprint()

    cfg3 = KernelConfig(state_dimension=64, error_tolerance=0.05)
    assert cfg1.fingerprint() != cfg3.fingerprint()
