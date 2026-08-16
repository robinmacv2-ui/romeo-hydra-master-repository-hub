# -*- coding: utf-8 -*-
"""
HydraVault — simple, safe container for numbers that stay locked.

You can put numbers in (they become locked codes).
You can add the locked codes together and still get the correct total
without ever unlocking the individual numbers.
The secret key that unlocks is never written into the locked codes.

Two extra smart protections:
1. Fingerprint (integrity hash) — any change to a locked code is detected.
2. Batch sum — many locked numbers can be added while only the final total is opened.
"""

from __future__ import annotations

import json
from typing import Any

from romeo_hydra.crypto.paillier_he import PaillierHE, PaillierKeyPair
from romeo_hydra.crypto.sha256_integrity import sha256_hex


class HydraVault:
    """Safe for numbers. Lock them, add them while locked, open only the total."""

    def __init__(self, prime_offset: int | None = None) -> None:
        self.phe = PaillierHE(prime_offset=prime_offset) if prime_offset is not None else PaillierHE()
        self.keys: PaillierKeyPair = self.phe.generate_keypair()

    # ------------------------------------------------------------------
    # Core actions a non-programmer can understand
    # ------------------------------------------------------------------

    def lock_number(self, value: int) -> str:
        """Put a number inside the safe. Returns a locked code (text)."""
        package = self.phe.encrypt(self.keys.public, value)
        # Extra smart idea 1: attach a fingerprint so any later change is noticed
        package["integrity"] = sha256_hex(package["ciphertext"] + package["n"])
        return json.dumps(package, separators=(",", ":"))

    def unlock_total(self, locked_code: str) -> int:
        """Open a locked code and get the number back."""
        package = self._load_and_check(locked_code)
        return self.phe.decrypt(self.keys.private, package)

    def add_locked(self, locked_a: str, locked_b: str) -> str:
        """Add two locked codes. Result stays locked. Total is correct."""
        a = self._load_and_check(locked_a)
        b = self._load_and_check(locked_b)
        summed = self.phe.add_ciphertexts(a, b)
        # Re-attach fingerprint on the new combined code
        summed["integrity"] = sha256_hex(summed["ciphertext"] + summed["n"])
        return json.dumps(summed, separators=(",", ":"))

    def sum_many_locked(self, locked_codes: list[str]) -> str:
        """
        Extra smart idea 2: add many locked numbers at once.
        Only the final total needs to be opened later.
        Individual numbers stay locked forever.
        """
        if not locked_codes:
            raise ValueError("Need at least one locked code")
        total = locked_codes[0]
        for next_code in locked_codes[1:]:
            total = self.add_locked(total, next_code)
        return total

    # ------------------------------------------------------------------
    # Internal helpers (still simple)
    # ------------------------------------------------------------------

    def _load_and_check(self, locked_code: str) -> dict[str, Any]:
        """Load the locked code and verify its fingerprint was not changed."""
        package = json.loads(locked_code)
        expected = sha256_hex(package["ciphertext"] + package["n"])
        if package.get("integrity") != expected:
            raise ValueError("Tamper detected: locked code was changed")
        return package

    def private_key_never_in_locked(self, locked_code: str) -> bool:
        """Safety check: the secret key must never appear in a locked code."""
        return (
            "lambda" not in locked_code
            and "mu" not in locked_code
            and str(self.keys.private.get("lambda", "")) not in locked_code
        )
