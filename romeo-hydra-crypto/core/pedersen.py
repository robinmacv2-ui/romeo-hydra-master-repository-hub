from __future__ import annotations

import hashlib
import secrets


# ============================================================
# RFC 3526 — MODP GROUP 14
# ============================================================

P_HEX = (
    "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1"
    "29024E088A67CC74020BBEA63B139B22514A08798E3404DD"
    "EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245"
    "E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED"
    "EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D"
    "C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F"
    "83655D23DCA3AD961C62F356208552BB9ED529077096966D"
    "670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B"
    "E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9"
    "DE2BCBF6955817183995497CEA956AE515D2261898FA0510"
    "15728E5A8AACAA68FFFFFFFFFFFFFFFF"
)

P = int(P_HEX, 16)

# Safe-prime subgroup order.
Q = (P - 1) // 2

# RFC 3526 generator.
G = 2

COMMITMENT_BYTES = (P.bit_length() + 7) // 8
COMMITMENT_HEX_LENGTH = COMMITMENT_BYTES * 2


# ============================================================
# DOMAIN-SEPARATED SECOND GENERATOR
# ============================================================

def _hash_to_group(
    domain_string: str,
    p: int,
) -> int:
    """
    Deterministically derives a non-zero quadratic residue.

    The squaring operation maps the SHA-256-derived integer
    into the subgroup of quadratic residues modulo p.

    This is a prototype hash-to-group construction with
    explicit domain separation.
    """

    if not isinstance(domain_string, str):
        raise TypeError("domain_string debe ser str")

    if p <= 3 or p % 2 == 0:
        raise ValueError("p debe ser un primo impar válido")

    digest = hashlib.sha256(
        domain_string.encode("utf-8")
    ).digest()

    x = int.from_bytes(
        digest,
        byteorder="big",
    )

    # Avoid identity element.
    x %= p

    if x == 0:
        x = 1

    h = pow(x, 2, p)

    if h == 1:
        # Deterministic retry with domain-separated input.
        digest2 = hashlib.sha256(
            (
                domain_string
                + "/RETRY"
            ).encode("utf-8")
        ).digest()

        x = int.from_bytes(
            digest2,
            byteorder="big",
        ) % p

        if x == 0:
            x = 2

        h = pow(x, 2, p)

    if h == 1:
        raise RuntimeError(
            "No se pudo derivar un generador H no trivial"
        )

    return h


H = _hash_to_group(
    "ROMEO-HYDRA/PEDERSEN/H_GENERATOR_V1",
    P,
)


# ============================================================
# CANONICAL ENCODING
# ============================================================

def commitment_to_hex(
    commitment: int,
) -> str:
    """
    Canonical fixed-width encoding.

    RFC 3526 Group 14:
        2048 bits
        256 bytes
        512 hexadecimal characters
    """

    if isinstance(commitment, bool):
        raise TypeError("commitment debe ser int")

    if not isinstance(commitment, int):
        raise TypeError("commitment debe ser int")

    if not 1 <= commitment < P:
        raise ValueError(
            "commitment fuera del rango válido de Z_p*"
        )

    return f"{commitment:0{COMMITMENT_HEX_LENGTH}x}"


def commitment_from_hex(
    value: str,
) -> int:
    """
    Strict inverse of commitment_to_hex().
    """

    if not isinstance(value, str):
        raise TypeError(
            "commitment hexadecimal debe ser str"
        )

    if len(value) != COMMITMENT_HEX_LENGTH:
        raise ValueError(
            "Longitud de commitment hexadecimal inválida"
        )

    try:
        result = int(value, 16)
    except ValueError as exc:
        raise ValueError(
            "Commitment no es hexadecimal válido"
        ) from exc

    if not 1 <= result < P:
        raise ValueError(
            "Commitment fuera del rango de Z_p*"
        )

    return result


# ============================================================
# PEDERSEN COMMITMENT
# ============================================================

def commit(
    m: int,
    r: int | None = None,
) -> tuple[int, int]:
    """
    Pedersen commitment:

        C = G^m * H^r mod P

    where:

        m ∈ Z_q
        r ∈ Z_q
        C ∈ Z_p*
    """

    if isinstance(m, bool) or not isinstance(m, int):
        raise TypeError("m debe ser int")

    if not 0 <= m < Q:
        raise ValueError(
            "El mensaje m debe pertenecer a Z_q"
        )

    if r is None:
        r = secrets.randbelow(Q)
    else:
        if isinstance(r, bool) or not isinstance(r, int):
            raise TypeError("r debe ser int")

        if not 0 <= r < Q:
            raise ValueError(
                "El factor r debe pertenecer a Z_q"
            )

    c = (
        pow(G, m, P)
        * pow(H, r, P)
    ) % P

    if not 1 <= c < P:
        raise RuntimeError(
            "Commitment fuera de Z_p*"
        )

    return c, r


def verify(
    c: int,
    m: int,
    r: int,
) -> bool:
    """
    Verifica:

        C == G^m H^r mod P
    """

    try:
        if isinstance(c, bool) or not isinstance(c, int):
            return False

        if isinstance(m, bool) or not isinstance(m, int):
            return False

        if isinstance(r, bool) or not isinstance(r, int):
            return False

        if not 1 <= c < P:
            return False

        if not 0 <= m < Q:
            return False

        if not 0 <= r < Q:
            return False

        expected = (
            pow(G, m, P)
            * pow(H, r, P)
        ) % P

        return c == expected

    except (
        TypeError,
        ValueError,
        OverflowError,
    ):
        return False


def combine(
    c1: int,
    c2: int,
) -> int:
    """
    Homomorfismo multiplicativo:

        C1 * C2 mod P

    corresponde a:

        C(m1+m2, r1+r2)
    """

    if not isinstance(c1, int):
        raise TypeError("c1 debe ser int")

    if not isinstance(c2, int):
        raise TypeError("c2 debe ser int")

    if not 1 <= c1 < P:
        raise ValueError("c1 fuera de Z_p*")

    if not 1 <= c2 < P:
        raise ValueError("c2 fuera de Z_p*")

    return (c1 * c2) % P


def verify_sum(
    c_list: list[int],
    total_m: int,
    total_r: int,
) -> bool:
    """
    Verifica la suma homomórfica en Z_q.
    """

    if not c_list:
        raise ValueError(
            "La lista de compromisos no puede estar vacía"
        )

    if not isinstance(total_m, int):
        raise TypeError("total_m debe ser int")

    if not isinstance(total_r, int):
        raise TypeError("total_r debe ser int")

    product = 1

    for c in c_list:
        if not isinstance(c, int):
            return False

        if not 1 <= c < P:
            return False

        product = (
            product * c
        ) % P

    return verify(
        product,
        total_m % Q,
        total_r % Q,
    )


# ============================================================
# IMPORT-TIME INVARIANTS
# ============================================================

if P.bit_length() != 2048:
    raise RuntimeError(
        "RFC 3526 Group 14 debe tener 2048 bits"
    )

if Q.bit_length() != 2047:
    raise RuntimeError(
        "Q debe tener 2047 bits"
    )

if G <= 1 or G >= P:
    raise RuntimeError(
        "Generador G inválido"
    )

if not 1 < H < P:
    raise RuntimeError(
        "Generador H inválido"
    )
