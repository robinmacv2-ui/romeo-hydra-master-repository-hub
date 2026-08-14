#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ROMEO-HYDRA — Offline Scoring Audit (Pilot)
===========================================
Simula auditoria de scoring crediticio offline para SOFIPO.

Que hace:
- Toma registros sinteticos de decision de credito (score, decision, motivo)
- NO guarda PII en claro en el ledger
- Genera hash del input + decision + timestamp
- Corre el Kernel Sigma como control de estabilidad del lote
- Produce ledger + resumen para revision interna

Que NO hace:
- No es un bureau ni un modelo de credit scoring
- No es dictamen ni folio oficial CNBV
- No evita por si solo multas de 100,000 UDIs

Uso:
  python -m pilot.run_scoring_audit --entity "SOFIPO-DEMO" --n 50
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

try:
    from romeo_hydra import get_info, KernelConfig, KernelSigmaController
except ImportError:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from romeo_hydra import get_info, KernelConfig, KernelSigmaController

OUTPUT_DIR = Path(__file__).resolve().parent / "output"


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _sha256(data: str | bytes) -> str:
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def _folio(entity: str, seq: int) -> str:
    day = datetime.now(timezone.utc).strftime("%Y%m%d")
    short = _sha256(f"RH-SCORING-{entity}-{day}-{seq}")[:8].upper()
    return f"RH-SCR-{day}-{seq:06d}-{short}"


def make_synthetic_batch(n: int, seed: int) -> list[dict]:
    """Decisiones sinteticas. Sin nombres ni CURP reales."""
    rng = np.random.default_rng(seed)
    batch = []
    for i in range(n):
        score = float(np.clip(rng.normal(650, 80), 300, 900))
        decision = "approve" if score >= 620 else "reject"
        reason = "score_threshold" if decision == "approve" else "below_cutoff"
        # Solo campos de decision — no PII
        record = {
            "case_id": f"SYN-{i:05d}",
            "score": round(score, 2),
            "decision": decision,
            "reason_code": reason,
            "model_version": "demo-v0",
        }
        # Hash del contenido de decision (para integridad del rastro)
        record["input_hash"] = _sha256(json.dumps(record, sort_keys=True))
        batch.append(record)
    return batch


def audit_batch(
    kernel: KernelSigmaController,
    entity: str,
    batch: list[dict],
    seed: int,
) -> list[dict]:
    """Un registro de ledger por decision + un check de estabilidad del lote."""
    records = []
    scores = np.array([r["score"] for r in batch], dtype=float)
    # Normaliza scores a vector para el kernel (estabilidad del lote)
    dim = kernel.config.state_dimension
    vec = np.zeros(dim)
    take = min(dim, len(scores))
    vec[:take] = (scores[:take] - 600.0) / 150.0

    result = kernel.evaluate_and_collapse(np.zeros(dim), vec)

    for i, case in enumerate(batch, start=1):
        payload = {
            "ts": _utc_now(),
            "entity": entity,
            "seq": i,
            "folio": _folio(entity, i),
            "audit_type": "scoring_decision",
            "case_id": case["case_id"],
            "decision": case["decision"],
            "reason_code": case["reason_code"],
            "score_bucket": _score_bucket(case["score"]),
            "input_hash": case["input_hash"],
            # score numerico exacto NO se escribe en claro si se prefiere solo bucket;
            # para demo de piloto se incluye redondeado y marcado como synthetic
            "score_synthetic": case["score"],
            "kernel_batch": {
                "final_entropy": float(getattr(result, "final_entropy", 0.0)),
                "hessian_ok": bool(getattr(result, "hessian_ok", False)),
            },
            "offline": True,
            "pii_stored": False,
            "nonce": uuid.uuid4().hex[:16],
        }
        payload["record_hash"] = _sha256(json.dumps(payload, sort_keys=True))
        records.append(payload)
    return records


def _score_bucket(score: float) -> str:
    if score >= 750:
        return "A"
    if score >= 680:
        return "B"
    if score >= 620:
        return "C"
    if score >= 550:
        return "D"
    return "E"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="ROMEO-HYDRA Offline Scoring Audit (Pilot)")
    parser.add_argument("--entity", default="SOFIPO-DEMO")
    parser.add_argument("--n", type=int, default=50, help="Numero de decisiones sinteticas")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args(argv)

    info = get_info()
    cfg = KernelConfig(state_dimension=64)
    kernel = KernelSigmaController(cfg)

    batch = make_synthetic_batch(args.n, args.seed)
    records = audit_batch(kernel, args.entity, batch, args.seed)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ledger = OUTPUT_DIR / "scoring_ledger.jsonl"
    summary_path = OUTPUT_DIR / "scoring_summary.json"

    with ledger.open("w", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    approved = sum(1 for r in records if r["decision"] == "approve")
    summary = {
        "pilot": "ROMEO-HYDRA Offline Scoring Audit",
        "entity": args.entity,
        "n_decisions": len(records),
        "approved": approved,
        "rejected": len(records) - approved,
        "pii_stored": False,
        "offline": True,
        "package": info,
        "first_folio": records[0]["folio"] if records else None,
        "last_folio": records[-1]["folio"] if records else None,
        "generated_at": _utc_now(),
        "disclaimer": (
            "Synthetic scoring audit for pilot only. "
            "Not a CNBV dictamen, not a credit bureau, not certification. "
            "Does not by itself avoid regulatory fines."
        ),
    }
    summary_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")

    print("=" * 60)
    print("  ROMEO-HYDRA Offline Scoring Audit — PILOT")
    print("=" * 60)
    print(f"  entity    : {args.entity}")
    print(f"  decisions : {len(records)}")
    print(f"  approved  : {approved}")
    print(f"  rejected  : {len(records) - approved}")
    print(f"  pii       : not stored")
    print(f"  offline   : True")
    print(f"  ledger    : {ledger}")
    print(f"  summary   : {summary_path}")
    print()
    print("  Aviso: evidencia sintetica. No es dictamen CNBV.")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
