# -*- coding: utf-8 -*-
"""Pruebas de cripto real: SHA-256, RSA, Paillier aditivo."""

from __future__ import annotations

from romeo_hydra.crypto import (
    sha256_hex,
    chain_hash,
    RSAProtocol,
    PaillierHE,
    HERuntime,
    he_status,
)


def test_sha256_stable():
    assert sha256_hex("romeo") == sha256_hex("romeo")
    assert sha256_hex("romeo") != sha256_hex("hydrar")


def test_chain_hash_links():
    h1 = chain_hash("0" * 64, "a")
    h2 = chain_hash(h1, "b")
    assert h1 != h2
    assert len(h2) == 64


def test_rsa_roundtrip():
    proto = RSAProtocol()
    keys = proto.generate_keypair()
    msg = b"pilot-hash-16b" if keys.backend == "pure-demo" else b"romeo-hydra-integrity-test"
    package = proto.encrypt(keys.public_pem, msg, backend=keys.backend)
    out = proto.decrypt(keys.private_pem, package)
    assert out == msg
    assert package["plaintext_sha256"] == sha256_hex(msg)


def test_paillier_homomorphic_add():
    he = PaillierHE(prime_offset=7)
    keys = he.generate_keypair()
    c1 = he.encrypt(keys.public, 10)
    c2 = he.encrypt(keys.public, 32)
    c_sum = he.add_ciphertexts(c1, c2)
    assert he.decrypt(keys.private, c_sum) == 42


def test_he_runtime_demo():
    result = HERuntime().demo_stack("eval")
    assert result["rsa_roundtrip_ok"] is True
    assert result["paillier_homomorphic_ok"] is True
    assert len(result["sha256"]) == 64


def test_he_status_honest():
    st = he_status()
    assert st["sha256"]["available"] is True
    assert st["paillier_additive_he"]["is_tfhe"] is False
    assert "no se finge" in st["honest_summary"] or "not" in st["honest_summary"].lower() or "no" in st["honest_summary"].lower()
