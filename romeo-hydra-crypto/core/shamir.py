from __future__ import annotations

import secrets
from typing import List, Tuple


# Primo de Mersenne de 521 bits.
# Adecuado para el núcleo experimental offline.
PRIME = 2**521 - 1

Share = Tuple[int, int]


def _validate(
    secret: int,
    n: int,
    threshold: int,
    prime: int,
) -> None:

    if not 0 <= secret < prime:
        raise ValueError("secret fuera del campo")

    if not 1 < threshold <= n:
        raise ValueError("threshold debe cumplir 1 < t <= n")

    if n >= prime:
        raise ValueError("n debe ser menor que prime")


def split(
    secret: int,
    n: int = 3,
    threshold: int = 2,
    prime: int = PRIME,
) -> List[Share]:

    _validate(
        secret,
        n,
        threshold,
        prime,
    )

    coefficients = [
        secret
    ] + [
        secrets.randbelow(prime)
        for _ in range(threshold - 1)
    ]

    def evaluate(x: int) -> int:
        result = 0

        for coefficient in reversed(coefficients):
            result = (
                result * x + coefficient
            ) % prime

        return result

    return [
        (x, evaluate(x))
        for x in range(1, n + 1)
    ]


def reconstruct(
    shares: List[Share],
    prime: int = PRIME,
) -> int:

    if not shares:
        raise ValueError("se requieren shares")

    xs = [x for x, _ in shares]

    if len(set(xs)) != len(xs):
        raise ValueError("shares duplicados")

    secret = 0

    for i, (xi, yi) in enumerate(shares):

        numerator = 1
        denominator = 1

        for j, xj in enumerate(xs):

            if i == j:
                continue

            numerator = (
                numerator * (-xj)
            ) % prime

            denominator = (
                denominator * (xi - xj)
            ) % prime

        lagrange = (
            numerator
            * pow(denominator, -1, prime)
        ) % prime

        secret = (
            secret + yi * lagrange
        ) % prime

    return secret
