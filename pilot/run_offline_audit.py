#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Piloto auditoria offline N dias — ledger de evidencia interna.
Sin cryptography. Sin TFHE. Sin folio CNBV.
Stdlib-only: prueba de ejecución offline (sin llamadas de red).

  python -m pilot.run_offline_audit --days 30 --entity SOFIPO-DEMO
"""

from __future__ import annotations

import argparse
import hashlib
import json
import platform
from datetime import datetime, timezone, timedelta
from pathlib import Path


def sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def run(days: int, entity: str, out_dir: Path) -> dict:
    prev = "0" * 64
    events = []
    base = datetime.now(timezone.utc)
    for d in range(days):
        day = (base - timedelta(days=days - 1 - d)).date().isoformat()
        payload = json.dumps({"day": day, "entity": entity, "check": "heartbeat"}, sort_keys=True)
        h = sha256_hex(f"{prev}|{payload}")
        events.append({"day": day, "event_sha256": h, "prev": prev})
        prev = h

    report = {
        "pilot": "offline_audit",
        "version": "0.1.3",
        "entity": entity,
        "days": days,
        "arch": platform.machine(),
        "platform": platform.platform(),
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "ledger_tip_sha256": prev,
        "folio_interno": f"RH-OFF-{entity}-{prev[:10].upper()}",
        "folio_note": "Folio INTERNO — no es folio CNBV",
        "tfhe": False,
        "offline_proof": {
            "stdlib_only": True,
            "no_network_imports": True,
            "note": "Script uses only Python stdlib. Run with network disabled to prove offline execution.",
        },
        "author": "Luis Angel Vazquez Martinez",
    }
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"offline_{entity}_{days}d.json"
    content = json.dumps({"report": report, "events": events}, indent=2)
    path.write_text(content, encoding="utf-8")

    # Companion integrity file
    digest = sha256_hex(content)
    sha_path = path.with_name(path.name + ".sha256")
    sha_path.write_text(f"{digest}  {path.name}\n", encoding="utf-8")

    report["output"] = str(path)
    report["sha256_file"] = str(sha_path)
    report["content_sha256"] = digest
    return report


def main() -> None:
    p = argparse.ArgumentParser(
        description="Piloto auditoría offline N días (stdlib-only, offline-proof)"
    )
    p.add_argument("--days", type=int, default=30)
    p.add_argument("--entity", default="SOFIPO-DEMO")
    p.add_argument("--out", default="pilot/output")
    args = p.parse_args()
    print(json.dumps(run(args.days, args.entity, Path(args.out)), indent=2))


if __name__ == "__main__":
    main()
