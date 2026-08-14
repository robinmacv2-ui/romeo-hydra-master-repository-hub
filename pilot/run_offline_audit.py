#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ROMEO-HYDRA — Offline Audit Node (Pilot)
========================================
Nodo de auditoría offline para piloto de 30 días con SOFIPO / entidad regulada.

- No requiere internet
- Genera ledger append-only con hash y folio sintético
- Usa Kernel Sigma + Abstraction Layer del paquete público
- Produce evidence_bundle listo para revisión interna

Uso:
  python -m pilot.run_offline_audit --days 30 --entity "SOFIPO-DEMO"
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path

import numpy as np

# Asegura import del paquete instalable
try:
    from romeo_hydra import (
        get_info,
        KernelConfig,
        KernelSigmaController,
        RomeoAbstractionLayer,
    )
except ImportError:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from romeo_hydra import (
        get_info,
        KernelConfig,
        KernelSigmaController,
        RomeoAbstractionLayer,
    )


OUTPUT_DIR = Path(__file__).resolve().parent / "output"


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _sha256(data: str | bytes) -> str:
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def _folio(entity: str, seq: int) -> str:
    """Folio sintético de evidencia (no es folio oficial CNBV)."""
    day = datetime.now(timezone.utc).strftime("%Y%m%d")
    raw = f"RH-{entity}-{day}-{seq:06d}"
    short = _sha256(raw)[:8].upper()
    return f"RH-{day}-{seq:06d}-{short}"


def run_audit_cycle(
    kernel: KernelSigmaController,
    abstraction: RomeoAbstractionLayer,
    entity: str,
    seq: int,
    seed: int,
) -> dict:
    """Un ciclo de auditoría offline: estabilidad + fold + hash."""
    rng = np.random.default_rng(seed)
    dim = kernel.config.state_dimension
    current = np.zeros(dim)
    candidate = rng.normal(0, 0.18, dim)

    result = kernel.evaluate_and_collapse(current, candidate)
    fold = abstraction.fold_high_level(
        f"audit_cycle entity={entity} seq={seq} offline=true"
    )

    payload = {
        "ts": _utc_now(),
        "entity": entity,
        "seq": seq,
        "folio": _folio(entity, seq),
        "kernel": {
            "final_entropy": float(getattr(result, "final_entropy", 0.0)),
            "hessian_ok": bool(getattr(result, "hessian_ok", False)),
            "projected": bool(getattr(result, "projected", False)),
        },
        "abstraction": {
            "status": fold.get("status") if isinstance(fold, dict) else str(fold),
            "privacy": fold.get("privacy", "data_never_revealed")
            if isinstance(fold, dict)
            else "data_never_revealed",
        },
        "offline": True,
        "nonce": uuid.uuid4().hex[:16],
    }
    payload["record_hash"] = _sha256(json.dumps(payload, sort_keys=True))
    return payload


def write_ledger(path: Path, records: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")


def write_summary(path: Path, info: dict, records: list[dict], entity: str, days: int) -> None:
    ok = sum(1 for r in records if r.get("kernel", {}).get("hessian_ok"))
    summary = {
        "pilot": "ROMEO-HYDRA Offline Audit Node",
        "entity": entity,
        "days_requested": days,
        "cycles_executed": len(records),
        "cycles_hessian_ok": ok,
        "success_rate": round(ok / max(len(records), 1), 4),
        "package": info,
        "first_folio": records[0]["folio"] if records else None,
        "last_folio": records[-1]["folio"] if records else None,
        "generated_at": _utc_now(),
        "disclaimer": (
            "Synthetic pilot evidence. Not a CNBV official folio or certification. "
            "For internal validation and LOI purposes only."
        ),
    }
    path.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")


def write_evidence_bundle(path: Path, summary: dict, entity: str) -> None:
    md = f"""# Evidence Bundle — ROMEO-HYDRA Offline Pilot

**Entity:** {entity}  
**Generated:** {summary.get("generated_at")}  
**Package version:** {summary.get("package", {}).get("version")}  
**TRL:** {summary.get("package", {}).get("trl")}

## Results

- Cycles executed: **{summary.get("cycles_executed")}**
- Hessian OK: **{summary.get("cycles_hessian_ok")}**
- Success rate: **{summary.get("success_rate")}**
- First folio: `{summary.get("first_folio")}`
- Last folio: `{summary.get("last_folio")}`

## How to verify

```bash
pip install -e .
python -m pilot.run_offline_audit --days 30 --entity "{entity}"
pytest tests/ -v
```

## Disclaimer

{summary.get("disclaimer")}

This bundle is technical evidence for a **pilot**, not a regulatory
certification or legal opinion.

---
Contact: emmororromeohydra@gmail.com
"""
    path.write_text(md, encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="ROMEO-HYDRA Offline Audit Node (Pilot)")
    parser.add_argument("--days", type=int, default=30, help="Pilot window in days (default 30)")
    parser.add_argument("--entity", type=str, default="SOFIPO-DEMO", help="Entity label")
    parser.add_argument("--cycles", type=int, default=None, help="Override number of audit cycles")
    parser.add_argument("--seed", type=int, default=42, help="RNG seed for reproducibility")
    args = parser.parse_args(argv)

    info = get_info()
    cfg = KernelConfig(state_dimension=64)
    kernel = KernelSigmaController(cfg)
    abstraction = RomeoAbstractionLayer()

    n_cycles = args.cycles if args.cycles is not None else max(7, min(args.days, 30))
    records: list[dict] = []

    print("═" * 60)
    print("  ROMEO-HYDRA Offline Audit Node — PILOT")
    print("═" * 60)
    print(f"  entity   : {args.entity}")
    print(f"  days     : {args.days}")
    print(f"  cycles   : {n_cycles}")
    print(f"  version  : {info.get('version')}  TRL={info.get('trl')}")
    print(f"  offline  : True")
    print()

    t0 = time.time()
    for i in range(1, n_cycles + 1):
        rec = run_audit_cycle(kernel, abstraction, args.entity, i, args.seed + i)
        records.append(rec)
        status = "OK" if rec["kernel"]["hessian_ok"] else "WARN"
        print(f"  [{i:02d}/{n_cycles}] folio={rec['folio']}  entropy={rec['kernel']['final_entropy']:.4f}  {status}")

    elapsed = time.time() - t0

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ledger_path = OUTPUT_DIR / "audit_ledger.jsonl"
    summary_path = OUTPUT_DIR / "pilot_summary.json"
    bundle_path = OUTPUT_DIR / "evidence_bundle.md"

    write_ledger(ledger_path, records)
    write_summary(summary_path, info, records, args.entity, args.days)
    summary = json.loads(summary_path.read_text(encoding="utf-8"))
    write_evidence_bundle(bundle_path, summary, args.entity)

    print()
    print(f"  elapsed  : {elapsed:.2f}s")
    print(f"  ledger   : {ledger_path}")
    print(f"  summary  : {summary_path}")
    print(f"  bundle   : {bundle_path}")
    print()
    print("  ✓ Pilot offline audit completed.")
    print("  Disclaimer: synthetic evidence — not CNBV certification.")
    print("═" * 60)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
