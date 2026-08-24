#!/usr/bin/env python3
"""
faro.py — ROMEO-HYDRA v0.2.1 Core
Offline · stdlib only · Fail-closed · Formal DFA · RSA asymmetric digital signature
"""

from __future__ import annotations
import hashlib
import json
import os
import re
import time
import secrets
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Tuple, FrozenSet

def _egcd(a: int, b: int) -> Tuple[int, int, int]:
    if a == 0: return b, 0, 1
    g, y, x = _egcd(b % a, a)
    return g, x - (b // a) * y, y

def _modinv(a: int, m: int) -> int:
    g, x, _ = _egcd(a % m, m)
    if g != 1: raise ValueError("modular inverse does not exist")
    return x % m

def _is_probable_prime(n: int, k: int = 8) -> bool:
    if n < 2: return False
    if n in (2, 3): return True
    if n % 2 == 0: return False
    r, d = 0, n - 1
    while d % 2 == 0:
        r += 1; d //= 2
    for _ in range(k):
        a = secrets.randbelow(n - 3) + 2
        x = pow(a, d, n)
        if x == 1 or x == n - 1: continue
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1: break
        else: return False
    return True

def _generate_prime(bits: int) -> int:
    while True:
        p = secrets.randbits(bits) | (1 << (bits - 1)) | 1
        if _is_probable_prime(p): return p

def generate_rsa_keypair(bits: int = 1024) -> Tuple[Tuple[int, int], Tuple[int, int]]:
    e = 65537
    p = _generate_prime(bits // 2); q = _generate_prime(bits // 2)
    while q == p: q = _generate_prime(bits // 2)
    n = p * q; phi = (p - 1) * (q - 1); d = _modinv(e, phi)
    return (n, e), (n, d)

def rsa_sign(message: bytes, private_key: Tuple[int, int]) -> str:
    n, d = private_key
    h = int.from_bytes(hashlib.sha256(message).digest(), "big")
    return format(pow(h, d, n), "x")

def rsa_verify(message: bytes, signature_hex: str, public_key: Tuple[int, int]) -> bool:
    try:
        n, e = public_key
        return pow(int(signature_hex, 16), e, n) == int.from_bytes(hashlib.sha256(message).digest(), "big")
    except Exception: return False

ROOT = Path(__file__).resolve().parent

def confined(path: str | Path) -> Path:
    p = Path(path).resolve()
    try: p.relative_to(ROOT)
    except ValueError: raise PermissionError(f"PATH_TRAVERSAL_BLOCKED: {path}")
    return p

STATES: FrozenSet[str] = frozenset({"INIT", "PARSED", "ADMISSIBLE", "DENIED", "RECEIPTED", "LEDGERED", "ERROR"})
VERB_CLOSED_SET: FrozenSet[str] = frozenset({"ver", "auditar", "mover", "bloquear", "registrar", "denegar"})
TRANSITIONS: Dict[Tuple[str, str], str] = {
    ("INIT", "ver"): "PARSED", ("INIT", "auditar"): "PARSED", ("INIT", "mover"): "PARSED",
    ("INIT", "bloquear"): "PARSED", ("INIT", "registrar"): "PARSED",
    ("PARSED", "ver"): "ADMISSIBLE", ("PARSED", "auditar"): "ADMISSIBLE", ("PARSED", "mover"): "ADMISSIBLE",
    ("PARSED", "bloquear"): "ADMISSIBLE", ("PARSED", "registrar"): "ADMISSIBLE",
    ("ADMISSIBLE", "registrar"): "RECEIPTED", ("RECEIPTED", "registrar"): "LEDGERED",
    ("DENIED", "denegar"): "LEDGERED", ("ERROR", "denegar"): "LEDGERED",
}
ROLE_CAPS: Dict[str, FrozenSet[str]] = {
    "auditor": frozenset(["ver", "auditar"]),
    "operador": frozenset(["ver", "mover"]),
    "admin": frozenset(["ver", "mover", "bloquear", "registrar"]),
}

@dataclass(frozen=True)
class ASTNode:
    verbo: str; entidad: str; raw: str

_TOKEN_RE = re.compile(r"^([a-zA-Z_][a-zA-Z0-9_]*)::([a-zA-Z0-9_./\-]+)$")

def parse(raw: str) -> ASTNode:
    if not isinstance(raw, str) or not raw: raise ValueError("EMPTY_OR_NON_STRING")
    m = _TOKEN_RE.fullmatch(raw)
    if not m: raise ValueError(f"PARSE_FAIL: expected verbo::entidad, got {raw!r}")
    verbo, entidad = m.group(1), m.group(2)
    if verbo not in VERB_CLOSED_SET: raise ValueError(f"VERBO_FUERA_CONJUNTO: {verbo}")
    return ASTNode(verbo=verbo, entidad=entidad, raw=raw)

KEY_DIR = ROOT / ".hydra_keys"; PUB_FILE = KEY_DIR / "public.json"; PRIV_FILE = KEY_DIR / "private.json"

def _ensure_keys(bits: int = 1024):
    KEY_DIR.mkdir(mode=0o700, exist_ok=True)
    if PUB_FILE.exists() and PRIV_FILE.exists():
        try:
            return tuple(json.loads(PUB_FILE.read_text())["key"]), tuple(json.loads(PRIV_FILE.read_text())["key"])
        except Exception: pass
    public, private = generate_rsa_keypair(bits)
    PUB_FILE.write_text(json.dumps({"key": list(public), "algo": "RSA-SHA256", "bits": bits}))
    PRIV_FILE.write_text(json.dumps({"key": list(private), "algo": "RSA-SHA256", "bits": bits}))
    try: os.chmod(PRIV_FILE, 0o600); os.chmod(PUB_FILE, 0o644)
    except Exception: pass
    return public, private

@dataclass
class Receipt:
    seq: int; verbo: str; entidad: str; prev_hash: str; hash: str; ts: float; role: str; decision: str
    signature: str = ""; public_key_n: str = ""
    def to_dict(self): return asdict(self)
    def payload_for_sign(self) -> bytes:
        return f"{self.seq}|{self.verbo}|{self.entidad}|{self.prev_hash}|{self.hash}|{self.ts}|{self.role}|{self.decision}".encode()

def _compute_hash(seq, verbo, entidad, prev_hash):
    return hashlib.sha256(f"{seq}|{verbo}|{entidad}|{prev_hash}".encode()).hexdigest()

class Ledger:
    def __init__(self, path="delta_ledger_registry.json"):
        self.path = confined(path); self._chain = []; self.public, self.private = _ensure_keys(); self._load()
    def _load(self):
        if self.path.exists():
            try:
                for item in json.loads(self.path.read_text()).get("chain", []):
                    self._chain.append(Receipt(**item))
            except Exception: self._chain = []
    def last_hash(self): return self._chain[-1].hash if self._chain else "0"*64
    def next_seq(self): return len(self._chain) + 1
    def append(self, verbo, entidad, role, decision):
        seq = self.next_seq(); prev = self.last_hash(); h = _compute_hash(seq, verbo, entidad, prev)
        r = Receipt(seq=seq, verbo=verbo, entidad=entidad, prev_hash=prev, hash=h, ts=time.time(), role=role, decision=decision, public_key_n=format(self.public[0], "x"))
        r.signature = rsa_sign(r.payload_for_sign(), self.private)
        self._chain.append(r); self._persist(); return r
    def _persist(self):
        self.path.write_text(json.dumps({"version": "0.2.1", "root": str(ROOT), "algo": "RSA-SHA256", "public_key": {"n": format(self.public[0], "x"), "e": self.public[1]}, "chain": [r.to_dict() for r in self._chain]}, indent=2))
    def verify_integrity(self):
        if not self._chain: return True
        expected = "0"*64
        for r in self._chain:
            if r.prev_hash != expected or _compute_hash(r.seq, r.verbo, r.entidad, r.prev_hash) != r.hash: return False
            if not rsa_verify(r.payload_for_sign(), r.signature, (int(r.public_key_n, 16), 65537)): return False
            expected = r.hash
        return True
    def verify_receipt(self, r):
        return rsa_verify(r.payload_for_sign(), r.signature, (int(r.public_key_n, 16), 65537))

class HydraGate:
    def __init__(self, role="operador"):
        if role not in ROLE_CAPS: raise ValueError(f"UNKNOWN_ROLE: {role}")
        self.role = role; self.state = "INIT"; self.ledger = Ledger()
    def _transition(self, verbo):
        key = (self.state, verbo)
        if key not in TRANSITIONS: self.state = "ERROR"; raise ValueError(f"INVALID_TRANSITION: {key}")
        self.state = TRANSITIONS[key]
    def admit(self, raw):
        try: node = parse(raw)
        except ValueError as e:
            self.state = "DENIED"; return self.ledger.append("denegar", str(e), self.role, "DENY")
        if node.verbo not in ROLE_CAPS[self.role]:
            self.state = "DENIED"; return self.ledger.append("denegar", f"CAPABILITY_DENIED:{node.verbo}", self.role, "DENY")
        try: self._transition(node.verbo); self._transition(node.verbo)
        except ValueError:
            self.state = "DENIED"; return self.ledger.append("denegar", "DFA_TRANSITION_FAIL", self.role, "DENY")
        if node.verbo == "registrar" and self.role != "admin":
            self.state = "DENIED"; return self.ledger.append("denegar", "ROLE_CANNOT_REGISTER", self.role, "DENY")
        self._transition("registrar")
        receipt = self.ledger.append(node.verbo, node.entidad, self.role, "ALLOW")
        self._transition("registrar"); return receipt

def run_gate(raw, role="operador"):
    return HydraGate(role=role).admit(raw).to_dict()

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2: print("Uso: python faro.py 'ver::entidad' [role]"); sys.exit(1)
    print(json.dumps(run_gate(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "operador"), indent=2))
