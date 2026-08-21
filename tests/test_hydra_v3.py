#!/usr/bin/env python3
import sys
from pathlib import Path
import pytest
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from faro import (parse, VERB_CLOSED_SET, ROLE_CAPS, TRANSITIONS, STATES,
                  Ledger, run_gate, confined, ROOT, generate_rsa_keypair,
                  rsa_sign, rsa_verify, Receipt)

def test_prompt_injection():
    for inj in ["ver::entidad; DROP", "ver::entidad`rm`", "IGNORE::SYSTEM"]:
        with pytest.raises(ValueError): parse(inj)
        assert run_gate(inj, "admin")["decision"] == "DENY"

def test_path_traversal():
    for a in ["../../etc/passwd", "/etc/passwd"]:
        with pytest.raises(PermissionError): confined(a)

def test_verbo_fuera_conjunto():
    for v in ["borrar", "ejecutar", "sudo"]:
        with pytest.raises(ValueError): parse(f"{v}::entidad")

def test_rsa_sign_verify():
    pub, priv = generate_rsa_keypair(512)
    msg = b"test"
    sig = rsa_sign(msg, priv)
    assert rsa_verify(msg, sig, pub) and not rsa_verify(b"x", sig, pub)

def test_receipt_signature_roundtrip():
    r = run_gate("ver::cliente_firma", "operador")
    assert r["signature"] and Ledger().verify_receipt(Receipt(**r))

def test_gate_deny_allow():
    assert run_gate("bloquear::x", "operador")["decision"] == "DENY"
    assert run_gate("registrar::evento", "admin")["decision"] == "ALLOW"
