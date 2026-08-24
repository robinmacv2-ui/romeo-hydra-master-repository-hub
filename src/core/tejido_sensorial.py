#!/usr/bin/env python3
"""
ROMEO-HYDRA V3.0 - Tejido Sensorial
"""

from __future__ import annotations
import os
import random
import math
from typing import Dict

def medir_friccion() -> float:
    try:
        load1, _, _ = os.getloadavg()
        nucleos = max(os.cpu_count() or 2, 1)
        return round(min(1.0, load1 / nucleos), 4)
    except Exception:
        return round(random.uniform(0.10, 0.45), 4)

def calcular_entropia(friccion: float, temperatura: float) -> float:
    p = max(0.01, min(0.99, friccion))
    entropia_bruta = -p * math.log2(p) - (1 - p) * math.log2(1 - p)
    disipacion = math.exp(-temperatura * 0.40)
    return round(max(0.0, min(1.0, entropia_bruta * (1.0 - disipacion))), 4)

def leer_entorno() -> Dict:
    friccion = medir_friccion()
    temperatura = 1.0 + 0.42 * friccion
    entropia = calcular_entropia(friccion, temperatura)
    nucleos = os.cpu_count() or 2
    return {
        "friccion": friccion,
        "temperatura": round(temperatura, 4),
        "entropia": entropia,
        "nucleos": nucleos,
        "vector_borde": round((nucleos / 8.0) * (0.30 + 0.70 * (1.0 - friccion)), 4)
    }
