#!/usr/bin/env python3
"""
ROMEO-HYDRA :: HYDRA SMART LIFE
Infraestructura de soberanía topológica offline-first.
Dualidad: flujo global ? paracaídas local.
Cero dependencias externas. Estado inmutable. Entropía mínima.
"""

from __future__ import annotations

import hashlib
import json
import socket
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from enum import Enum, auto
from pathlib import Path
from typing import Final


class ModoTopologico(Enum):
    GLOBAL = auto()          # Conectividad externa activa
    RUPTURA = auto()         # Desacople total -> malla local


@dataclass(frozen=True, slots=True)
class EstadoTopologico:
    timestamp: str
    modo: str
    conectividad_global: bool
    friccion: float          # [0.0, 1.0] - costo de red
    entropia: float          # [0.0, 1.0] - desorden del sistema
    malla_local: str
    veredicto: str
    huella: str              # SHA-256 del estado (inmutabilidad)

    def to_dict(self) -> dict:
        return asdict(self)


class HydraSmartLife:
    PROBE_HOST: Final[str] = "1.1.1.1"
    PROBE_PORT: Final[int] = 53
    PROBE_TIMEOUT: Final[float] = 1.5
    ARCHIVO_TRAZA: Final[Path] = Path("hidra_smart_life_traza.json")

    def __init__(self) -> None:
        self._ultimo: EstadoTopologico | None = None

    @staticmethod
    def _utc() -> str:
        return datetime.now(timezone.utc).isoformat(timespec="seconds")

    @staticmethod
    def _huella(payload: dict) -> str:
        raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
        return hashlib.sha256(raw).hexdigest()

    def _probe_conectividad(self) -> bool:
        try:
            with socket.create_connection(
                (self.PROBE_HOST, self.PROBE_PORT),
                timeout=self.PROBE_TIMEOUT,
            ):
                return True
        except (OSError, socket.timeout):
            return False

    def evaluar(self, forzar_modo: ModoTopologico | None = None) -> EstadoTopologico:
        if forzar_modo is None:
            online = self._probe_conectividad()
        else:
            online = forzar_modo is ModoTopologico.GLOBAL

        if online:
            modo = "GLOBAL"
            friccion = 0.04
            entropia = 0.18
            malla = "STANDBY"
            veredicto = "FLUJO EXTERNO EXPLOTADO. SOBERANÍA RETENIDA."
        else:
            modo = "RUPTURA"
            friccion = 0.91
            entropia = 0.97
            malla = "ACTIVA - BLE / WiFi-Direct / ráfagas locales"
            veredicto = "PARACAÍDAS LÓGICO DESPLEGADO. DESACOPLE COMPLETO."

        base = {
            "timestamp": self._utc(),
            "modo": modo,
            "conectividad_global": online,
            "friccion": friccion,
            "entropia": entropia,
            "malla_local": malla,
            "veredicto": veredicto,
        }
        estado = EstadoTopologico(**base, huella=self._huella(base))
        self._ultimo = estado
        return estado

    def persistir(self, estados: dict[str, EstadoTopologico]) -> Path:
        payload = {k: v.to_dict() for k, v in estados.items()}
        tmp = self.ARCHIVO_TRAZA.with_suffix(".tmp")
        tmp.write_text(
            json.dumps(payload, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        tmp.replace(self.ARCHIVO_TRAZA)
        return self.ARCHIVO_TRAZA.resolve()

    def transicion_demostracion(self) -> None:
        print("=" * 72)
        print("HYDRA SMART LIFE - TRANSICIÓN TOPOLÓGICA")
        print("=" * 72)

        e1 = self.evaluar(forzar_modo=ModoTopologico.GLOBAL)
        print("\n[1] MODO GLOBAL")
        print(json.dumps(e1.to_dict(), indent=2, ensure_ascii=False))

        time.sleep(0.4)

        e2 = self.evaluar(forzar_modo=ModoTopologico.RUPTURA)
        print("\n[2] MODO RUPTURA")
        print(json.dumps(e2.to_dict(), indent=2, ensure_ascii=False))

        path = self.persistir({"global": e1, "ruptura": e2})
        print(f"\n[OK] Traza inmutable -> {path}")
        print("=" * 72)


def main() -> None:
    engine = HydraSmartLife()
    engine.transicion_demostracion()


if __name__ == "__main__":
    main()
