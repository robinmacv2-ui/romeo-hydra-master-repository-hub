#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Piloto: integridad de libro de ordenes sintetico (estilo mercado / bolsa).

No es un matching engine ni conecta a una bolsa real.
Si demuestra:
  - cadena SHA-256 de eventos (orden / cancel / fill sinteticos)
  - sello RSA del paquete de evidencia
  - agregacion de nocionales con Paillier (sin listar plaintext al agregador)
  - proxy de energia de la corrida

Uso:
  python -m pilot.run_market_integrity_audit --symbol DEMO --n 30

Autor: Luis Angel Vazquez Martinez
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from datetime import datetime, timezone

from romeo_hydra.crypto.sha256_integrity import sha256_hex, chain_hash
from romeo_hydra.crypto.rsa_protocol import RSAProtocol
from romeo_hydra.risk.aggregate import aggregate_exposures_private
from romeo_hydra.metrics.energy import estimate_run, compare_edge_vs_cloud_proxy


def _synthetic_orders(symbol: str, n: int, seed: int = 7) -> list[dict]:
    # LCG simple reproducible (sin numpy requerido en el piloto de mercado)
    x = seed
    out = []
    for i in range(n):
        x = (1103515245 * x + 12345) & 0x7FFFFFFF
        side = "BUY" if (x % 2 == 0) else "SELL"
        qty = 1 + (x % 100)
        px = 10000 + (x % 500)  # centavos sinteticos
        out.append({
            "seq": i,
            "symbol": symbol,
            "side": side,
            "qty": qty,
            "price_cents": px,
            "notional": qty * px,
        })
    return out


def run(symbol: str, n: int, out_dir: Path) -> dict:
    t0 = time.perf_counter()
    orders = _synthetic_orders(symbol, n)

    # Ledger encadenado
    prev = "0" * 64
    events = []
    for o in orders:
        payload = json.dumps(o, sort_keys=True, separators=(",", ":"))
        h = chain_hash(prev, payload)
        events.append({"event_sha256": h, "prev": prev, "order": o})
        prev = h
    tip = prev

    # Sello RSA del tip del ledger
    rsa = RSAProtocol(key_size=2048)
    keys = rsa.generate_keypair()
    seal_payload = tip.encode("utf-8")
    sealed = rsa.encrypt(keys.public_pem, seal_payload)
    # En evidencia real la private key no viaja; aqui solo verificamos roundtrip local
    opened = rsa.decrypt(keys.private_pem, sealed)
    seal_ok = opened == seal_payload

    # Riesgo / nocional agregado sin exponer cada orden al "agregador"
    notionals = [o["notional"] for o in orders]
    # Paillier demo usa primos pequenos: usar qty como proxy de exposicion unitaria
    exposures = [o["qty"] for o in orders]
    agg = aggregate_exposures_private(exposures, prime_offset=13)

    dt = time.perf_counter() - t0
    energy = estimate_run(dt, device_profile="termux_phone", label="market_integrity_audit")
    compare = compare_edge_vs_cloud_proxy(dt, cloud_hours_always_on=1.0)

    report = {
        "pilot": "market_integrity_audit",
        "version": "0.1.2",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "symbol": symbol,
        "n_orders": n,
        "ledger_tip_sha256": tip,
        "rsa_seal_ok": seal_ok,
        "rsa_alg": sealed.get("alg"),
        "risk_aggregate": agg.to_dict(),
        "energy": energy.to_dict(),
        "energy_vs_cloud_proxy": {
            "ratio": compare["energy_ratio_cloud_over_edge"],
            "interpretation": compare["interpretation"],
            "honesty": compare["honesty"],
        },
        "scope": {
            "is_real_exchange": False,
            "is_matching_engine": False,
            "is_production_market_surveillance": False,
            "what_it_demonstrates": (
                "Integridad de secuencia de ordenes sinteticas, sello RSA del tip, "
                "agregacion de exposicion con HE aditivo, proxy energetico edge."
            ),
        },
        "author": "Luis Angel Vazquez Martinez",
    }

    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"market_integrity_{symbol}_{n}.json"
    path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    report["output"] = str(path)
    return report


def main() -> None:
    p = argparse.ArgumentParser(description="Market integrity pilot (synthetic)")
    p.add_argument("--symbol", default="DEMO")
    p.add_argument("--n", type=int, default=30)
    p.add_argument("--out", default="pilot/output")
    args = p.parse_args()
    report = run(args.symbol, args.n, Path(args.out))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
