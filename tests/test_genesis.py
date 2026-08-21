# -*- coding: utf-8 -*-
"""Genesis Satoshi-model: frozen hash, boot check, immutability."""

from __future__ import annotations

import pytest

from romeo_hydra.genesis import (
    GENESIS_HASH,
    GENESIS_PAYLOAD,
    GenesisMismatchError,
    assert_genesis_or_die,
    compute_genesis_hash,
    genesis_block,
    verify_genesis,
)


def test_genesis_hash_is_frozen():
    assert len(GENESIS_HASH) == 64
    assert compute_genesis_hash() == GENESIS_HASH
    assert verify_genesis() is True


def test_assert_genesis_or_die_ok():
    assert assert_genesis_or_die() == GENESIS_HASH


def test_tamper_payload_breaks_chain():
    bad = dict(GENESIS_PAYLOAD)
    bad["message"] = "tampered"
    assert compute_genesis_hash(bad) != GENESIS_HASH


def test_genesis_block_structure():
    b = genesis_block()
    assert b["hash"] == GENESIS_HASH
    assert b["status"] == "GENESIS"
    assert b["payload"]["timestamp_utc"] == "2026-07-17T00:00:00Z"
    assert b["payload"]["doi_concept"] == "10.5281/zenodo.21744014"


def test_mismatch_raises(monkeypatch):
    import romeo_hydra.genesis as g

    monkeypatch.setattr(g, "GENESIS_HASH", "0" * 64)
    with pytest.raises(GenesisMismatchError):
        g.assert_genesis_or_die()
