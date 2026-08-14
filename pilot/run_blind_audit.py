#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Piloto: scoring ciego con PHE Paillier (NO FHE).

Rama: feat/fhe-next-level
Deps: pip install -r requirements-fhe.txt

Modelo:
  - SOFIPO genera llaves (simuladas en este proceso).
  - Romeo solo usa public_key para operar sobre cifrados.
  - Ledger: is_cnbv_certified=false, paillier_mode=simulated_pilot

Uso:
  python -m pilot.run_blind_audit --entity SOFIPO-DEMO --n 20

Autor: Luis Angel Vazquez Martinez
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


def synthetic_subjects(n: int, seed: int = 7) -> list[dict]:
    """Features sinteticas (no PII). Di en unidades arbitrarias."""
    x = seed
    rows = []
    for i in range(n):
        x = (1103515245 * x + 12345) & 0x7FFFFFFF
        income = 50 + (x % 200)          # proxy ingresos
        tenure = 1 + (x % 24)            # meses
        util = (x % 100) / 100.0         # utilizacion 0-1
        rows.append({
            "seq": i,
            "subject_id_hash": sha256_hex(f"blind-{seed}-{i}")[:16],
            "features": [float(income), float(tenure), float(util)],
        })
    return rows


def run(entity: str, n: int, out_dir: Path) -> dict:
    from pilot.blind.homomorphic_engine import HomomorphicEngine

    engine = HomomorphicEngine()
    # --- Lado SOFIPO (en produccion: solo ellos) ---
    public_key, private_key, pub_view = engine.sofipo_generate_keypair(n_length=1024)

    weights = [0.5, 0.3, 0.2]  # Wi publicos / acordados
    subjects = synthetic_subjects(n)

    prev = "0" * 64
    ledger = []
    scores_clear_for_sofipo_only = []

    for row in subjects:
        # SOFIPO cifra Di
        enc_feats = engine.encrypt_features(public_key, row["features"])
        # Romeo aplica pesos sin ver plaintext
        enc_score = engine.blind_weighted_sum(enc_feats, weights)
        # SOFIPO descifra (Romeo en produccion NO hace este paso)
        score = engine.sofipo_decrypt_score(private_key, enc_score)
        scores_clear_for_sofipo_only.append(score)

        event = {
            "seq": row["seq"],
            "subject_id_hash": row["subject_id_hash"],
            "encrypted_score_committed": sha256_hex(str(enc_score.ciphertext())),
            "weights": weights,
            "public_key_n_sha256": sha256_hex(str(pub_view.n))[:16],
        }
        payload = json.dumps(event, sort_keys=True, separators=(",", ":"))
        h = chain_hash(prev, payload)
        ledger.append({"event_sha256": h, "prev": prev, "event": event})
        prev = h

    tip = prev
    report = {
        "pilot": "blind_scoring_phe_paillier",
        "version": "0.1.2-blind",
        "entity": entity,
        "n": n,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "ledger_tip_sha256": tip,
        "folio_interno": f"RH-BLIND-{entity}-{tip[:12].upper()}",
        "folio_note": "Folio INTERNO de evidencia. NO es folio CNBV.",
        "scheme": "PHE-Paillier-additive",
        "scheme_note": (
            "Partially Homomorphic Encryption (Paillier). "
            "NOT Fully Homomorphic Encryption (FHE/TFHE/HElib)."
        ),
        "paillier_mode": "simulated_pilot",
        "key_ownership": {
            "private_key_holder": "SOFIPO (simulated in-process for demo only)",
            "romeo_receives": "public_key.n only in production model",
            "romeo_held_private_in_this_run": True,
            "production_rule": "SOFIPO generates keypair; Romeo never stores private key",
        },
        "public_key_view": pub_view.to_dict(),
        "weights": weights,
        "score_formula": "sum(w_i * d_i) over encrypted d_i",
        "scope": {
            "is_cnbv_certified": False,
            "is_production_sofipo_scoring": False,
            "is_fhe": False,
            "is_phe_paillier": True,
            "is_homomorphic_scoring": True,
            "homomorphic_type": "additive_weighted_sum",
        },
        "demo_scores_preview": scores_clear_for_sofipo_only[:5],
        "author": "Luis Angel Vazquez Martinez",
        "ledger_events": len(ledger),
    }

    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"blind_{entity}_{n}.json"
    path.write_text(
        json.dumps({"report": report, "ledger": ledger}, indent=2),
        encoding="utf-8",
    )
    report["output"] = str(path)
    return report


def main() -> None:
    p = argparse.ArgumentParser(description="Blind scoring PHE Paillier pilot")
    p.add_argument("--entity", default="SOFIPO-DEMO")
    p.add_argument("--n", type=int, default=20)
    p.add_argument("--out", default="pilot/output")
    args = p.parse_args()
    print(json.dumps(run(args.entity, args.n, Path(args.out)), indent=2))


if __name__ == "__main__":
    main()
