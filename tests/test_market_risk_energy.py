# -*- coding: utf-8 -*-
from __future__ import annotations

from pathlib import Path

import pytest

from romeo_hydra.metrics.energy import estimate_run, compare_edge_vs_cloud_proxy
from romeo_hydra.risk.aggregate import aggregate_exposures_private


def test_energy_positive():
    r = estimate_run(2.0, device_profile="termux_phone")
    assert r.energy_kwh > 0
    assert r.co2e_kg > 0


def test_edge_vs_cloud_ratio():
    c = compare_edge_vs_cloud_proxy(1.0, cloud_hours_always_on=1.0)
    assert c["energy_ratio_cloud_over_edge"] > 1


def test_risk_aggregate_sum():
    res = aggregate_exposures_private([1, 2, 3, 4], prime_offset=3)
    assert res.n_positions == 4
    assert res.plaintext_sum_for_owner == 10


def test_market_integrity_pilot(tmp_path: Path):
    pytest.importorskip("cryptography")
    from pilot.run_market_integrity_audit import run

    report = run("TEST", 10, tmp_path)
    assert report["rsa_seal_ok"] is True
    assert report["n_orders"] == 10
    assert len(report["ledger_tip_sha256"]) == 64
    assert report["scope"]["is_real_exchange"] is False
