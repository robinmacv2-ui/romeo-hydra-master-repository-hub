# -*- coding: utf-8 -*-
"""
Paillier — cifrado parcialmente homomorfico (aditivo), ejecutable en pure Python.

Propiedad real verificable:
  Dec(Enc(a) * Enc(b) mod n^2) = a + b mod n

Esto NO es TFHE (no evalua circuitos booleanos arbitrarios).
Es HE parcial autentico, util para sumas sobre cifrados (conteos, agregados).
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any

from romeo_hydra.crypto.sha256_integrity import sha256_hex


def _is_prime(n: int) -> bool:
    if n < 2:
        return False
    if n % 2 == 0:
        return n == 2
    i = 3
    while i * i <= n:
        if n % i == 0:
            return False
        i += 2
    return True


def _prime_from_seed(offset: int) -> int:
    # Primes ~ 10^5 range: enough for demos/tests; increase for stronger demos.
    base = 100003 + (offset % 50000)
    n = base | 1
    while not _is_prime(n):
        n += 2
    return n


def _lcm(a: int, b: int) -> int:
    return abs(a * b) // math_gcd(a, b)


def math_gcd(a: int, b: int) -> int:
    while b:
        a, b = b, a % b
    return a


def _inv(a: int, m: int) -> int:
    return pow(a, -1, m)


def _L(u: int, n: int) -> int:
    return (u - 1) // n


@dataclass
class PaillierKeyPair:
    public: dict[str, str]   # n, g
    private: dict[str, str]  # lambda, mu, n
    bits_note: str


class PaillierHE:
    """Motor Paillier pure-Python (HE aditivo)."""

    def __init__(self, prime_offset: int | None = None) -> None:
        self.prime_offset = prime_offset if prime_offset is not None else int.from_bytes(os.urandom(2), "big")

    def generate_keypair(self) -> PaillierKeyPair:
        p = _prime_from_seed(self.prime_offset)
        q = _prime_from_seed(self.prime_offset + 9973)
        if p == q:
            q = _prime_from_seed(self.prime_offset + 19997)
        n = p * q
        n2 = n * n
        lam = _lcm(p - 1, q - 1)
        g = n + 1  # common simple choice
        mu = _inv(_L(pow(g, lam, n2), n), n)
        return PaillierKeyPair(
            public={"n": str(n), "g": str(g)},
            private={"lambda": str(lam), "mu": str(mu), "n": str(n)},
            bits_note="demo-scale primes (~17 bit factors); raise size for stronger demos",
        )

    def encrypt(self, public: dict[str, str], m: int) -> dict[str, Any]:
        n = int(public["n"])
        g = int(public["g"])
        n2 = n * n
        if m < 0 or m >= n:
            raise ValueError("plaintext fuera de rango [0, n)")
        # r in 1..n-1 coprime to n
        while True:
            r = int.from_bytes(os.urandom(8), "big") % n
            if r > 1 and math_gcd(r, n) == 1:
                break
        c = (pow(g, m, n2) * pow(r, n, n2)) % n2
        return {
            "scheme": "Paillier-additive",
            "ciphertext": str(c),
            "n": str(n),
            "plaintext_sha256": sha256_hex(str(m)),
            "homomorphic": "add",
        }

    def decrypt(self, private: dict[str, str], package: dict[str, Any]) -> int:
        n = int(private["n"])
        lam = int(private["lambda"])
        mu = int(private["mu"])
        n2 = n * n
        c = int(package["ciphertext"])
        u = pow(c, lam, n2)
        m = (_L(u, n) * mu) % n
        return m

    def add_ciphertexts(self, c1: dict[str, Any], c2: dict[str, Any]) -> dict[str, Any]:
        """Enc(m1) * Enc(m2) = Enc(m1+m2) mod n^2"""
        if c1["n"] != c2["n"]:
            raise ValueError("n distinto entre ciphertexts")
        n = int(c1["n"])
        n2 = n * n
        c = (int(c1["ciphertext"]) * int(c2["ciphertext"])) % n2
        return {
            "scheme": "Paillier-additive",
            "ciphertext": str(c),
            "n": str(n),
            "op": "homomorphic_add",
            "homomorphic": "add",
        }
