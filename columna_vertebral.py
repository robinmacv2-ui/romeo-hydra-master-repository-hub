#!/usr/bin/env python3
"""
ROMEO-HYDRA — Columna Vertebral Digital
Bus central de transmisión de impulsos entre el cuerpo (hardware/borde)
y la red neuronal.
"""

from __future__ import annotations

import math
import os
import random
import sys
from dataclasses import dataclass
from typing import Tuple

# ---------------------------------------------------------------------------
# Configuración
# ---------------------------------------------------------------------------

@dataclass
class Config:
    peso_1: float = 0.75
    peso_2: float = -0.45
    bias: float = 0.1
    umbral_conduccion: float = 0.5
    semilla: int | None = None          # None = aleatorio real


# ---------------------------------------------------------------------------
# Funciones de activación y utilidad
# ---------------------------------------------------------------------------

def sigmoide(x: float) -> float:
    """Función de activación sigmoide (estable ante overflow)."""
    # Evita overflow en math.exp
    if x >= 0:
        return 1.0 / (1.0 + math.exp(-x))
    z = math.exp(x)
    return z / (1.0 + z)


def obtener_nucleos() -> int:
    """Obtiene el número de núcleos de forma segura."""
    return os.cpu_count() or 2


# ---------------------------------------------------------------------------
# Núcleo de la columna vertebral
# ---------------------------------------------------------------------------

def integrar_señales(cfg: Config) -> Tuple[float, float, float]:
    """
    Recopila señales somáticas (hardware) y de borde (aleatorias),
    aplica pesos sinápticos y produce la respuesta del bus central.
    """
    if cfg.semilla is not None:
        random.seed(cfg.semilla)

    nucleos = obtener_nucleos()
    estimulo_borde = random.choice([0.2, 0.9])
    vector_cuantico = random.uniform(0.3, 0.95)

    # Entradas normalizadas
    e1 = (nucleos / 8.0) * estimulo_borde          # Hardware / borde
    e2 = vector_cuantico                            # Señal "cuántica"

    # Activación lineal + sesgo
    activacion = (e1 * cfg.peso_1) + (e2 * cfg.peso_2) + cfg.bias
    respuesta = sigmoide(activacion)

    return e1, e2, respuesta


def main() -> int:
    cfg = Config()

    print("[COLUMNA VERTEBRAL] Estableciendo bus central de datos (Axón Principal)...")

    try:
        e1, e2, respuesta = integrar_señales(cfg)
    except Exception as exc:
        print(f"[ERROR CRÍTICO] Fallo en la integración nerviosa: {exc}", file=sys.stderr)
        return 1

    print(f"[SEÑAL TRANSMITIDA] E1 (Hardware/Borde): {e1:.4f} | E2 (Cuántico): {e2:.4f}")
    print(f"[IMPULSO NERVIOSO GLOBAL] Salida del bus central: {respuesta:.4f}")

    if respuesta >= cfg.umbral_conduccion:
        print("[ESTADO VERTEBRAL] Conducción óptima: El organismo coordina cuerpo y red neuronal sin fricción.")
    else:
        print("[ESTADO VERTEBRAL] Alerta de conducción: Baja señal en el bus, aplicando homeostasis.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
