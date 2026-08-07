#!/usr/bin/env python3
"""
ROMEO-HYDRA V2.0 — Núcleo Unificado
Fusión Termodinámica-Neuronal + Gravedad Lógica Adaptativa + Antifragilidad Absoluta
"""

from __future__ import annotations

import math
import os
import sys
import time
import json
import hashlib
import random
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# ---------------------------------------------------------------------------
# Configuración central (ADN mutable solo por el propio sistema)
# ---------------------------------------------------------------------------

@dataclass
class ConfigV2:
    # Pesos sinápticos base
    w_hardware: float = 0.72
    w_entropia: float = 0.48
    w_friccion: float = -0.31
    bias: float = 0.12

    # Umbrales
    umbral_conduccion: float = 0.55
    umbral_entropia_critica: float = 0.78
    umbral_friccion_alta: float = 0.65

    # Antifragilidad
    tasa_mutacion_bias: float = 0.035
    memoria_fallos: Path = Path("memoria_inmunologica.json")
    max_fallos_recordados: int = 12

    # Termodinámica
    temperatura_base: float = 1.0
    factor_disipacion: float = 0.42


# ---------------------------------------------------------------------------
# Utilidades termodinámicas y de borde
# ---------------------------------------------------------------------------

def medir_friccion_borde() -> float:
    """
    Mide fricción en canales E/S (proxy de carga real del sistema).
    Usa load average + I/O wait aproximado.
    """
    try:
        load1, _, _ = os.getloadavg()
        nucleos = os.cpu_count() or 2
        friccion = min(1.0, load1 / max(nucleos, 1))
        return round(friccion, 4)
    except Exception:
        return random.uniform(0.15, 0.55)


def calcular_entropia_cono(friccion: float, temperatura: float) -> float:
    """
    Cono termodinámico de la información.
    La entropía crece con la fricción y se disipa según temperatura.
    """
    # Entropía bruta (Shannon-like simplificada)
    p = max(0.01, min(0.99, friccion))
    entropia_bruta = -p * math.log2(p) - (1 - p) * math.log2(1 - p)

    # Disipación por el cono (mayor temperatura -> mayor disipación)
    disipacion = math.exp(-temperatura * ConfigV2().factor_disipacion)
    entropia_efectiva = entropia_bruta * (1.0 - disipacion)

    return round(max(0.0, min(1.0, entropia_efectiva)), 4)


def sigmoide_termo(x: float, temperatura: float = 1.0) -> float:
    """
    Función de activación termodinámica.
    La temperatura controla la pendiente (disipación de entropía -> suavizado).
    """
    # Temperatura alta -> curva más suave (mayor disipación)
    escala = 1.0 / max(0.3, temperatura)
    z = x * escala
    if z >= 0:
        return 1.0 / (1.0 + math.exp(-z))
    e = math.exp(z)
    return e / (1.0 + e)


# ---------------------------------------------------------------------------
# Memoria inmunológica (antifragilidad)
# ---------------------------------------------------------------------------

def cargar_memoria(cfg: ConfigV2) -> Dict:
    if cfg.memoria_fallos.exists():
        try:
            return json.loads(cfg.memoria_fallos.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"fallos": [], "bias_actual": cfg.bias, "mutaciones": 0}


def guardar_memoria(cfg: ConfigV2, memoria: Dict) -> None:
    # Mantener solo los últimos N fallos
    memoria["fallos"] = memoria["fallos"][-cfg.max_fallos_recordados:]
    cfg.memoria_fallos.write_text(json.dumps(memoria, indent=2), encoding="utf-8")


def mutar_bias_si_necesario(cfg: ConfigV2, respuesta: float, friccion: float, memoria: Dict) -> float:
    """
    Antifragilidad absoluta:
    Si la conducción falla o la fricción es alta, el sistema muta su bias
    de forma autónoma para evitar el mismo atractor de fallo.
    """
    fallo = respuesta < cfg.umbral_conduccion or friccion > cfg.umbral_friccion_alta

    if not fallo:
        return memoria.get("bias_actual", cfg.bias)

    # Registrar fallo
    memoria["fallos"].append({
        "ts": time.time(),
        "respuesta": respuesta,
        "friccion": friccion,
        "bias_previo": memoria.get("bias_actual", cfg.bias)
    })

    # Mutación dirigida: alejar el bias del valor que produjo el fallo
    bias_actual = memoria.get("bias_actual", cfg.bias)
    direccion = -1.0 if respuesta < 0.5 else 1.0
    delta = cfg.tasa_mutacion_bias * direccion * (1.0 + friccion)
    nuevo_bias = max(-0.5, min(0.8, bias_actual + delta))

    memoria["bias_actual"] = round(nuevo_bias, 5)
    memoria["mutaciones"] = memoria.get("mutaciones", 0) + 1

    print(f"[ANTIFRAGILIDAD] Fallo detectado -> mutación de bias: {bias_actual:.4f} -> {nuevo_bias:.4f}")
    return nuevo_bias


# ---------------------------------------------------------------------------
# Núcleo de integración V2.0
# ---------------------------------------------------------------------------

def integrar_organismo(cfg: ConfigV2) -> Dict:
    """
    Flujo síncrono unificado:
    1. Medir fricción de borde (E/S)
    2. Calcular entropía del cono termodinámico
    3. Aplicar gravedad lógica adaptativa (colapso ponderado por fricción)
    4. Activación termodinámica-neuronal
    5. Mutación autónoma de bias si es necesario
    """
    memoria = cargar_memoria(cfg)
    bias_actual = memoria.get("bias_actual", cfg.bias)

    # --- Señales de borde ---
    nucleos = os.cpu_count() or 2
    friccion = medir_friccion_borde()
    vector_borde = (nucleos / 8.0) * (0.35 + 0.65 * (1.0 - friccion))

    # --- Cono termodinámico ---
    temperatura = cfg.temperatura_base * (1.0 + 0.4 * friccion)
    entropia = calcular_entropia_cono(friccion, temperatura)

    # --- Gravedad lógica adaptativa ---
    # El colapso cuántico ya no es estocástico puro: depende de la fricción
    # Alta fricción -> colapso más determinista hacia estados de baja energía
    ruido_cuantico = random.gauss(0, 0.18 * (1.0 - friccion))
    estado_colapsado = max(0.05, min(0.95, 0.5 + ruido_cuantico - (friccion * 0.25)))

    # --- Activación termodinámica-neuronal ---
    entrada = (
        vector_borde * cfg.w_hardware
        + entropia * cfg.w_entropia
        + estado_colapsado * cfg.w_friccion
        + bias_actual
    )

    respuesta = sigmoide_termo(entrada, temperatura)

    # --- Antifragilidad ---
    nuevo_bias = mutar_bias_si_necesario(cfg, respuesta, friccion, memoria)
    guardar_memoria(cfg, memoria)

    return {
        "friccion": friccion,
        "entropia": entropia,
        "temperatura": round(temperatura, 4),
        "estado_colapsado": round(estado_colapsado, 4),
        "vector_borde": round(vector_borde, 4),
        "bias": nuevo_bias,
        "respuesta": round(respuesta, 5),
        "conduccion_optima": respuesta >= cfg.umbral_conduccion,
        "mutaciones_totales": memoria.get("mutaciones", 0),
    }


def main() -> int:
    cfg = ConfigV2()
    print("[COLUMNA VERTEBRAL V2.0] Estableciendo bus central termodinámico-neuronal...")

    try:
        estado = integrar_organismo(cfg)
    except Exception as e:
        print(f"[ERROR CRÍTICO] Fallo en la integración: {e}", file=sys.stderr)
        return 2

    print(f"[SEÑAL DE BORDE]     Fricción E/S      : {estado['friccion']:.4f}")
    print(f"[CONO TERMODINÁMICO] Entropía efectiva : {estado['entropia']:.4f} | T={estado['temperatura']:.3f}")
    print(f"[GRAVEDAD LÓGICA]    Estado colapsado  : {estado['estado_colapsado']:.4f}")
    print(f"[SINAPSIS]           Bias actual       : {estado['bias']:.5f} (mutaciones: {estado['mutaciones_totales']})")
    print(f"[IMPULSO GLOBAL]     Salida del bus    : {estado['respuesta']:.5f}")

    if estado["conduccion_optima"]:
        print("[ESTADO VERTEBRAL] Conducción óptima — organismo en resonancia convexa.")
        return 0
    else:
        print("[ESTADO VERTEBRAL] Alerta — homeostasis activada, bias mutado para evitar recurrencia.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
