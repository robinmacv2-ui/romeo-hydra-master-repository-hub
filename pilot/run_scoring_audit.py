#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Piloto scoring sintetico — SOLO stdlib.
No importa romeo_hydra (evita fallos por cryptography en Termux).
No es folio CNBV. No es TFHE.

  cd /data/data/com.termux/files/home/romeo-hydra-master-repository-hub
  python -m pilot.run_scoring_audit --entity SOFIPO-DEMO --n 20
"""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path


def sha256_hex(data: str | bytes) -> str:
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def chain_hash(prev: str, payload: str) -> str:
    return sha256_hex(f"{prev}|{payload}")


def synthetic_scores(n: int, seed: int = 42) -> list[dict]:
    x = seed
    rows = []
    for i in range(n):
        x = (1103515245 * x + 12345) & 0x7FFFFFFF
        score = 300 + (x % 550)
        rows.append({
            "seq": i,
            "subject_id_hash": sha256_hex(f"subj-{seed}-{i}")[:16],
            "score": score,
            "band": "A" if score >= 700 else "B" if score >= 500 else "C",
        })
    return rows


def run(entity: str, n: int, out_dir: Path) -> dict:
    rows = synthetic_scores(n)
    prev = "0" * 64
    ledger = []
    for r in rows:
        payload = json.dumps(r, sort_keys=True, separators=(",", ":"))
        h = chain_hash(prev, payload)
        ledger.append({"event_sha256": h, "prev": prev, "record": r})
        prev = h

    tip = prev
    report = {
        "pilot": "scoring_audit",
        "version": "0.1.2",
        "entity": entity,
        "n": n,
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
    }

    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"scoring_{entity}_{n}.json"
    path.write_text(json.dumps({"report": report, "ledger": ledger}, indent=2), encoding="utf-8")
    report["output"] = str(path)
    return report


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--entity", default="SOFIPO-DEMO")
    p.add_argument("--n", type=int, default=20)
    p.add_argument("--out", default="pilot/output")
    args = p.parse_args()
    print(json.dumps(run(args.entity, args.n, Path(args.out)), indent=2))


if __name__ == "__main__":
    main()
