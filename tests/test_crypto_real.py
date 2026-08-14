# -*- coding: utf-8 -*-
"""Pruebas de cripto real: SHA-256, RSA-OAEP (cryptography), Paillier aditivo."""

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


def test_rsa_oaep_roundtrip():
    proto = RSAProtocol(key_size=2048)
    keys = proto.generate_keypair()
    assert keys.backend == "cryptography"
    msg = b"romeo-hydra-integrity-test"
    package = proto.encrypt(keys.public_pem, msg)
    assert package["alg"] == "RSA-OAEP-SHA256"
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
    assert result["rsa_backend"] == "cryptography"
    assert result["paillier_homomorphic_ok"] is True
    assert len(result["sha256"]) == 64


def test_he_status_pip_deps():
    st = he_status()
    assert st["sha256"]["available"] is True
    assert st["rsa"]["impl"] == "cryptography"
    assert st["rsa"]["production_ready"] is True
    assert st["paillier_additive_he"]["is_tfhe"] is False
