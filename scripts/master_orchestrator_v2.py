#!/usr/bin/env python3
"""
ROMEO-HYDRA · Master Orchestrator v0.2.0 (Soberano)
Unifica:
  - Codex PPRH (TarjetaLogica)
  - Kernel Sigma Chameleon (collapse + CoreState + Adapter)
  - Dual WORM Ledgers (JSON + SQLite append-only)
  - Immutable Trace Chain
  - Fail-closed integrity gates
"""
from __future__ import annotations

import sys
import json
from pathlib import Path
from datetime import datetime, timezone
from typing import Any, Dict

# ---------------------------------------------------------------------------
# Path bootstrap (monorepo root)
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# ---------------------------------------------------------------------------
# Imports del ecosistema
# ---------------------------------------------------------------------------
import numpy as np

from core.tarjeta_logica import TarjetaLogica
from core.ledger.worm_ledger import WormLedger
from core.ledger.worm_ledger_sqlite import WormLedgerSQLite

from romeo_hydra.kernel.sigma_chameleon import (
    KernelConfig,
    KernelSigmaController,
    EnvironmentSpectrum,
    StressLevel,
    CoreState,
    MimeticSurfaceAdapter,
)

# ---------------------------------------------------------------------------
# Constantes de orquestación
# ---------------------------------------------------------------------------
VERSION = "0.2.0"
JSON_LEDGER = ROOT / "core" / "ledger" / "delta_ledger_registry.json"
SQLITE_LEDGER = ROOT / "core" / "ledger" / "delta_ledger.db"


def banner(title: str) -> None:
    print("\n" + "=" * 72)
    print(f"  {title}")
    print("=" * 72)


def section(msg: str) -> None:
    print(f"\n[*] {msg}")


def ok(msg: str) -> None:
    print(f"    → {msg}")


def main() -> int:
    banner(f"ROMEO-HYDRA · MASTER ORCHESTRATOR v{VERSION} · SOBERANO")

    # ------------------------------------------------------------------
    # 1. Ledgers WORM
    # ------------------------------------------------------------------
    section("Inicializando ledgers WORM (JSON + SQLite append-only)")
    json_ledger = WormLedger(JSON_LEDGER)
    sqlite_ledger = WormLedgerSQLite(SQLITE_LEDGER)
    ok(f"JSON  → {JSON_LEDGER}")
    ok(f"SQLite → {SQLITE_LEDGER}")

    # ------------------------------------------------------------------
    # 2. Codex PPRH (TarjetaLogica)
    # ------------------------------------------------------------------
    section("Ejecutando Codex PPRH (TarjetaLogica + anclajes T)")
    card = TarjetaLogica(
        modo="Luminoso",
        vector=[1, 0, 0, 1],
        ledger=json_ledger,          # side-effect automático
    )
    fp_base = card.generar_fingerprint()
    anclajes = card.propagar_flujo()
    ok(f"Modo        : {card.modo}")
    ok(f"Vector      : {card.vector}")
    ok(f"Anclajes T  : {anclajes}")
    ok(f"Fingerprint : {fp_base}")

    # Registro explícito también en SQLite
    sqlite_ledger.append(
        event_type="codex_init",
        vector=card.vector,
        modo=card.modo,
        anclajes=anclajes,
        fingerprint=fp_base,
        extra={"orchestrator": VERSION, "layer": "pprh"},
    )

    # Dualidad
    dual = card.calcular_dualidad()
    fp_dual = dual.generar_fingerprint()
    ok(f"Dualidad    : {dual.modo} | {dual.vector}")
    ok(f"FP Dual     : {fp_dual}")

    sqlite_ledger.append(
        event_type="codex_dualidad",
        vector=dual.vector,
        modo=dual.modo,
        anclajes=dual.propagar_flujo(),
        fingerprint=fp_dual,
        extra={"from": card.modo, "to": dual.modo},
    )

    # ------------------------------------------------------------------
    # 3. Kernel Sigma Chameleon
    # ------------------------------------------------------------------
    section("Activando Kernel Sigma Chameleon (collapse + CoreState)")
    config = KernelConfig(
        state_dimension=128,
        sigma_real=2.0,
        kernel_version="SIGMA_V1_CHAMELEON",
    )
    kernel = KernelSigmaController(config)
    ok(f"Config FP   : {config.fingerprint()}")
    ok(f"σ_real      : {config.sigma_real}")

    # Estado inicial + acción candidata (deterministas a partir del vector PPRH)
    rng = np.random.default_rng(seed=int(fp_base[:8], 16))
    current = rng.normal(0.0, 0.1, size=config.state_dimension).astype(np.float64)
    # Inyectamos señal de los anclajes T en las primeras 4 dimensiones
    current[:4] = np.array(card.vector, dtype=np.float64) * 0.5
    candidate = current + rng.normal(0.0, 0.08, size=config.state_dimension)

    core, adapter = kernel.collapse_to_core(current, candidate)
    ok(f"Core SHA-256: {core.compute_sha256()}")
    ok(f"Entropía    : {core.entropy:.8f}")
    ok(f"Dimensión   : {core.dimension}")

    # Registro del collapse en ambos ledgers
    collapse_extra = {
        "core_sha256": core.compute_sha256(),
        "entropy": core.entropy,
        "cfg_fp": core.config_fingerprint,
        "metrics": core.collapse_metrics,
    }
    json_ledger.append(
        event_type="sigma_collapse",
        vector=card.vector,
        modo=card.modo,
        anclajes=anclajes,
        fingerprint=fp_base,
        extra=collapse_extra,
    )
    sqlite_ledger.append(
        event_type="sigma_collapse",
        vector=card.vector,
        modo=card.modo,
        anclajes=anclajes,
        fingerprint=fp_base,
        extra=collapse_extra,
    )

    # ------------------------------------------------------------------
    # 4. Phenotypes camaleónicos + traza inmutable
    # ------------------------------------------------------------------
    section("Proyectando phenotypes + generando traza inmutable")
    spectrum, stress = adapter.sense_environment(
        noise_level=0.15, latency_ms=25.0, authorized=True
    )
    ok(f"Espectro    : {spectrum.value}")
    ok(f"Estrés      : {stress.value}")

    phenotype = adapter.project(spectrum, extra={"orchestrator": VERSION})
    if isinstance(phenotype, dict):
        ok(f"Phenotype keys: {list(phenotype.keys())}")
    else:
        ok(f"Phenotype type: {type(phenotype).__name__}")

    # Traza inmutable encadenada
    trace_hash = kernel.generate_immutable_trace(
        core=core,
        spectrum=spectrum,
        extra={
            "pprh_fp": fp_base,
            "pprh_dual_fp": fp_dual,
            "orchestrator": VERSION,
        },
    )
    ok(f"Trace hash  : {trace_hash}")

    # ------------------------------------------------------------------
    # 5. Gates de integridad fail-closed
    # ------------------------------------------------------------------
    section("Validando integridad WORM (fail-closed)")
    json_ok = json_ledger.verify_integrity()
    sqlite_ok = sqlite_ledger.verify_integrity()
    update_blocked = sqlite_ledger.attempt_update_should_fail()
    delete_blocked = sqlite_ledger.attempt_delete_should_fail()

    ok(f"JSON integrity     : {json_ok}")
    ok(f"SQLite integrity   : {sqlite_ok}")
    ok(f"UPDATE blocked      : {update_blocked}")
    ok(f"DELETE blocked      : {delete_blocked}")

    if not (json_ok and sqlite_ok and update_blocked and delete_blocked):
        print("\n[FAIL] Integridad comprometida. Abortando.")
        return 1

    # ------------------------------------------------------------------
    # 6. Resumen forense
    # ------------------------------------------------------------------
    banner("ORQUESTACIÓN COMPLETADA · RESUMEN FORENSE")
    summary: Dict[str, Any] = {
        "orchestrator_version": VERSION,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "pprh": {
            "modo": card.modo,
            "vector": card.vector,
            "fingerprint": fp_base,
            "dual_fingerprint": fp_dual,
        },
        "sigma": {
            "config_fp": config.fingerprint(),
            "core_sha256": core.compute_sha256(),
            "entropy": core.entropy,
            "trace_hash": trace_hash,
            "spectrum": spectrum.value,
        },
        "ledgers": {
            "json_entries": len(json_ledger.get_entries()),
            "sqlite_entries": len(sqlite_ledger.get_entries()),
            "json_integrity": json_ok,
            "sqlite_integrity": sqlite_ok,
        },
    }
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    print("\n[OK] Ecosistema unificado y verificado.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
