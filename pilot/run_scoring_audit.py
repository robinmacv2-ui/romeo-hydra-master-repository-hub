#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Piloto scoring sintetico - SOLO stdlib.
No importa romeo_hydra (evita fallos por cryptography en Termux).
No es folio CNBV. No es TFHE.

  cd /data/data/com.termux/files/home/romeo-hydra-master-repository-hub
  python -m pilot.run_scoring_audit --entity SOFIPO-DEMO --n 20 --seed 54

Audit hardening (reproducibility + integrity):
- seed and arch recorded in JSON for cross-run / cross-arch verification
- scores rounded to 4 decimals before hashing
- companion .sha256 file for tamper detection
"""

from __future__ import annotations

import argparse
import hashlib
import json
import platform
from datetime import datetime, timezone
from pathlib import Path


def sha256_hex(data: str | bytes) -> str:
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def chain_hash(prev: str, payload: str) -> str:
    return sha256_hex(f"{prev}|{payload}")


def synthetic_scores(n: int, seed: int = 42) -> list[dict]:
    # Synthetic data only - not for PII - use secrets module for production.
    # Deterministic LCG (not CSPRNG) is intentional: reproducible demo data.
    x = seed
    rows = []
    for i in range(n):
        x = (1103515245 * x + 12345) & 0x7FFFFFFF
        # Round to 4 decimals for cross-arch float stability (even if currently int)
        score = round(300 + (x % 550), 4)
        rows.append({
            "seq": i,
            "subject_id_hash": sha256_hex(f"subj-{seed}-{i}")[:16],
            "score": score,
            "band": "A" if score >= 700 else "B" if score >= 500 else "C",
        })
    return rows


def run(entity: str, n: int, seed: int, out_dir: Path) -> dict:
    rows = synthetic_scores(n, seed=seed)
    prev = "0" * 64
    ledger = []
    for r in rows:
        # Ensure deterministic serialization (sorted keys, no spaces)
        payload = json.dumps(r, sort_keys=True, separators=(",", ":"))
        h = chain_hash(prev, payload)
        ledger.append({"event_sha256": h, "prev": prev, "record": r})
        prev = h

    tip = prev
    report = {
        "pilot": "scoring_audit",
        "version": "0.1.3",
        "entity": entity,
        "n": n,
        "seed": seed,
        "arch": platform.machine(),
        "platform": platform.platform(),
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "ledger_tip_sha256": tip,
        "folio_interno": f"RH-{entity}-{tip[:12].upper()}",
        "folio_note": "Folio INTERNO de evidencia. NO es folio CNBV.",
        "encryption": {
            "tfhe_full": False,
            "what_is_used": "SHA-256 chain on synthetic scores (no PII)",
        },
        "scope": {
            "is_production_sofipo_scoring": False,
            "is_cnbv_certified": False,
            "is_homomorphic_scoring": False,
        },
        "author": "Luis Angel Vazquez Martinez",
        "ledger_events": len(ledger),
        "reproducibility": {
            "deterministic_seed": True,
            "cross_arch_rounded_scores": True,
            "companion_sha256": True,
        },
    }

    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"scoring_{entity}_{n}.json"
    content = json.dumps({"report": report, "ledger": ledger}, indent=2)
    path.write_text(content, encoding="utf-8")

    # Companion integrity file: if JSON is edited, .sha256 will not match
    digest = sha256_hex(content)
    sha_path = path.with_name(path.name + ".sha256")
    sha_path.write_text(f"{digest}  {path.name}\n", encoding="utf-8")

    report["output"] = str(path)
    report["sha256_file"] = str(sha_path)
    report["content_sha256"] = digest
    return report


def main() -> None:
    p = argparse.ArgumentParser(
        description="Piloto scoring sintético offline (stdlib-only, reproducible)"
    )
    p.add_argument("--entity", default="SOFIPO-DEMO")
    p.add_argument("--n", type=int, default=20)
    p.add_argument("--seed", type=int, default=42, help="Seed for deterministic synthetic scores")
    p.add_argument("--out", default="pilot/output")
    args = p.parse_args()
    print(json.dumps(run(args.entity, args.n, args.seed, Path(args.out)), indent=2))


if __name__ == "__main__":
    main()
