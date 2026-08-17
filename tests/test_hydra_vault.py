# -*- coding: utf-8 -*-
"""
Tests for HydraVault — written so the behaviour is easy to understand.

These checks prove:
- Numbers go in and come out correctly.
- You can add locked numbers and get the right total without unlocking them.
- Big numbers still work.
- If someone changes a locked code, the system notices.
- The secret key never leaks into the locked codes.
- Extra protection 1: fingerprint catches any change.
- Extra protection 2: many locked numbers can be summed while only the final total is opened.
"""

from __future__ import annotations

import json
import pytest

from romeo_hydra.crypto.hydra_vault import HydraVault


@pytest.fixture
def vault():
    # Small primes for fast tests (same idea as the demo you already ran)
    return HydraVault(prime_offset=17)


def test_lock_and_unlock_one_number(vault):
    """Put 1500 in the safe, take it out → still 1500."""
    locked = vault.lock_number(1500)
    assert vault.unlock_total(locked) == 1500


def test_add_three_locked_numbers(vault):
    """Exactly the demo you saw: 1500 + 2750 + 800 = 5050 while locked."""
    a = vault.lock_number(1500)
    b = vault.lock_number(2750)
    c = vault.lock_number(800)

    # Add them while they stay locked
    total_locked = vault.add_locked(a, b)
    total_locked = vault.add_locked(total_locked, c)

    assert vault.unlock_total(total_locked) == 5050


def test_sum_many_at_once(vault):
    """Extra smart idea 2: sum a whole list of locked numbers in one go."""
    numbers = [1500, 2750, 800]
    locked_list = [vault.lock_number(n) for n in numbers]
    total_locked = vault.sum_many_locked(locked_list)
    assert vault.unlock_total(total_locked) == 5050


def test_big_number_still_works(vault):
    """Large number (within demo key modulus) survives lock/unlock."""
    # Demo keys (prime_offset=17) give n ~ 1e10; stay strictly below n.
    n = int(vault.keys.public["n"])
    big = min(10**9, n - 1)
    assert big > 10**6  # still "big" relative to the other tests
    locked = vault.lock_number(big)
    assert vault.unlock_total(locked) == big


def test_tamper_is_detected(vault):
    """If anyone changes even one digit of a locked code, the system refuses."""
    locked = vault.lock_number(1234)
    package = json.loads(locked)

    # Change one character of the locked number
    ct = package["ciphertext"]
    package["ciphertext"] = ct[:-1] + ("0" if ct[-1] != "0" else "1")
    # Keep the old (now wrong) fingerprint so the check fails
    tampered = json.dumps(package)

    with pytest.raises(ValueError, match="Tamper detected"):
        vault.unlock_total(tampered)


def test_secret_key_never_appears(vault):
    """The key that unlocks must never be written inside a locked code."""
    locked = vault.lock_number(999)
    assert vault.private_key_never_in_locked(locked) is True
    assert "lambda" not in locked
    assert "mu" not in locked


def test_fingerprint_present(vault):
    """Extra smart idea 1: every locked code carries a fingerprint."""
    locked = vault.lock_number(42)
    package = json.loads(locked)
    assert "integrity" in package
    assert len(package["integrity"]) == 64  # sha256 hex
