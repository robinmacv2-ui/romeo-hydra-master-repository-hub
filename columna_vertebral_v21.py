#!/usr/bin/env python3
"""
ROMEO-HYDRA V2.1 — Nucleo Unificado Avanzado
- Fusion Termodinamica-Neuronal
- Gravedad Logica Adaptativa
- Antifragilidad Predictiva (mutacion anticipatoria)
- Exportacion de metricas estructuradas
- Compatible 100% con Windows (sin caracteres Unicode problematicos)
"""

from __future__ import annotations

import math
import os
import sys
import time
import json
import random
import hashlib
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Dict, List, Optional
from collections import deque

# ---------------------------------------------------------------------------
# Configuracion
# ---------------------------------------------------------------------------

@dataclass
class ConfigV21:
    # Pesos sinapticos
    w_hardware: float = 0.70
    w_entropia: float = 0.45
    w_friccion: float = -0.33
    bias_inicial: float = 0.12

    # Umbrales
    umbral_conduccion: float = 0.55
    umbral_friccion_alta: float = 0.62
    umbral_entropia_critica: float = 0.72
    umbral_prediccion_riesgo: float = 0.68

    # Antifragilidad predictiva
    tasa_mutacion: float = 0.028
    tasa_mutacion_preventiva: float = 0.015
    ventana_historica: int = 8

    # Rutas de estado
    memoria_path: Path = Path("memoria_inmunologica_v21.json")
    metricas_path: Path = Path("metricas_organismo_v21.json")
    historial_path: Path = Path("historial_senales_v21.json")


# ---------------------------------------------------------------------------
# Utilidades de borde y termodinamica
# ---------------------------------------------------------------------------

def medir_friccion() -> float:
    try:
        load1, _, _ = os.getloadavg()
        nucleos = max(os.cpu_count() or 2, 1)
        return round(min(1.0, load1 / nucleos), 4)
    except Exception:
        return round(random.uniform(0.12, 0.48), 4)


def calcular_entropia(friccion: float, temperatura: float) -> float:
    p = max(0.01, min(0.99, friccion))
    entropia_bruta = -p * math.log2(p) - (1 - p) * math.log2(1 - p)
    disipacion = math.exp(-temperatura * 0.40)
    return round(max(0.0, min(1.0, entropia_bruta * (1.0 - disipacion))), 4)


def sigmoide_termo(x: float, temperatura: float = 1.0) -> float:
    escala = 1.0 / max(0.28, temperatura)
    z = x * escala
    if z >= 0:
        return 1.0 / (1.0 + math.exp(-z))
    e = math.exp(z)
    return e / (1.0 + e)


# ---------------------------------------------------------------------------
# Memoria e historial
# ---------------------------------------------------------------------------

def cargar_json(path: Path, default: dict) -> dict:
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            pass
    return default


def guardar_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=True), encoding="utf-8")


def actualizar_historial(cfg: ConfigV21, friccion: float, entropia: float, respuesta: float) -> List[dict]:
    hist = cargar_json(cfg.historial_path, {"senales": []})
    senales = hist.get("senales", [])
    senales.append({
        "ts": time.time(),
        "friccion": friccion,
        "entropia": entropia,
        "respuesta": respuesta
    })
    # Mantener solo la ventana reciente
    senales = senales[-cfg.ventana_historica:]
    hist["senales"] = senales
    guardar_json(cfg.historial_path, hist)
    return senales


def predecir_riesgo(senales: List[dict], cfg: ConfigV21) -> float:
    """
    Prediccion simple de riesgo de fallo basada en tendencia de friccion y entropia.
    Retorna valor entre 0.0 (seguro) y 1.0 (riesgo inminente).
    """
    if len(senales) < 3:
        return 0.0

    fricciones = [s["friccion"] for s in senales]
    entropias = [s["entropia"] for s in senales]
    respuestas = [s["respuesta"] for s in senales]

    # Tendencia (pendiente aproximada)
    df = fricciones[-1] - fricciones[0]
    de = entropias[-1] - entropias[0]
    dr = respuestas[-1] - respuestas[0]

    riesgo = 0.0
    riesgo += max(0.0, df) * 1.8
    riesgo += max(0.0, de) * 1.4
    riesgo += max(0.0, -dr) * 1.6          # caida de respuesta = peligro
    riesgo += (1.0 - respuestas[-1]) * 0.5

    return round(min(1.0, max(0.0, riesgo)), 4)


# ---------------------------------------------------------------------------
# Nucleo de integracion V2.1
# ---------------------------------------------------------------------------

def integrar(cfg: ConfigV21) -> dict:
    memoria = cargar_json(cfg.memoria_path, {
        "bias_actual": cfg.bias_inicial,
        "mutaciones": 0,
        "mutaciones_preventivas": 0,
        "fallos": []
    })

    bias = memoria.get("bias_actual", cfg.bias_inicial)
    friccion = medir_friccion()
    temperatura = 1.0 + 0.38 * friccion
    entropia = calcular_entropia(friccion, temperatura)

    # Gravedad logica adaptativa
    ruido = random.gauss(0, 0.16 * (1.0 - friccion))
    estado_colapsado = max(0.04, min(0.96, 0.5 + ruido - (friccion * 0.27)))

    nucleos = os.cpu_count() or 2
    vector_borde = (nucleos / 8.0) * (0.32 + 0.68 * (1.0 - friccion))

    entrada = (
        vector_borde * cfg.w_hardware
        + entropia * cfg.w_entropia
        + estado_colapsado * cfg.w_friccion
        + bias
    )
    respuesta = sigmoide_termo(entrada, temperatura)

    # Historial + prediccion
    senales = actualizar_historial(cfg, friccion, entropia, respuesta)
    riesgo = predecir_riesgo(senales, cfg)

    # --- Antifragilidad reactiva + PREDICTIVA ---
    fallo = respuesta < cfg.umbral_conduccion or friccion > cfg.umbral_friccion_alta
    riesgo_alto = riesgo >= cfg.umbral_prediccion_riesgo

    if fallo:
        direccion = -1.0 if respuesta < 0.5 else 1.0
        delta = cfg.tasa_mutacion * direccion * (1.0 + friccion)
        nuevo_bias = max(-0.45, min(0.75, bias + delta))
        memoria["bias_actual"] = round(nuevo_bias, 5)
        memoria["mutaciones"] = memoria.get("mutaciones", 0) + 1
        memoria["fallos"].append({
            "ts": time.time(),
            "tipo": "reactivo",
            "respuesta": respuesta,
            "friccion": friccion,
            "riesgo": riesgo
        })
        print(f"[ANTIFRAGILIDAD REACTIVA] Fallo detectado -> bias {bias:.4f} -> {nuevo_bias:.4f}")
        bias = nuevo_bias

    elif riesgo_alto:
        # Mutacion preventiva (anticipatoria)
        direccion = -1.0 if respuesta < 0.6 else 1.0
        delta = cfg.tasa_mutacion_preventiva * direccion * (1.0 + riesgo)
        nuevo_bias = max(-0.45, min(0.75, bias + delta))
        memoria["bias_actual"] = round(nuevo_bias, 5)
        memoria["mutaciones_preventivas"] = memoria.get("mutaciones_preventivas", 0) + 1
        print(f"[ANTIFRAGILIDAD PREDICTIVA] Riesgo {riesgo:.3f} -> mutacion preventiva bias {bias:.4f} -> {nuevo_bias:.4f}")
        bias = nuevo_bias

    # Limpiar historial de fallos
    memoria["fallos"] = memoria.get("fallos", [])[-12:]
    guardar_json(cfg.memoria_path, memoria)

    resultado = {
        "timestamp": time.time(),
        "friccion": friccion,
        "entropia": entropia,
        "temperatura": round(temperatura, 4),
        "estado_colapsado": round(estado_colapsado, 4),
        "vector_borde": round(vector_borde, 4),
        "bias": bias,
        "respuesta": round(respuesta, 5),
        "riesgo_predicho": riesgo,
        "conduccion_optima": respuesta >= cfg.umbral_conduccion,
        "mutaciones_reactivas": memoria.get("mutaciones", 0),
        "mutaciones_preventivas": memoria.get("mutaciones_preventivas", 0),
    }

    # Exportar metricas
    guardar_json(cfg.metricas_path, resultado)
    return resultado


def main() -> int:
    cfg = ConfigV21()
    print("[COLUMNA VERTEBRAL V2.1] Bus central termodinamico-neuronal + prediccion activado...")

    try:
        estado = integrar(cfg)
    except Exception as e:
        print(f"[ERROR CRITICO] {e}", file=sys.stderr)
        return 2

    print(f"[SENAL DE BORDE]     Friccion E/S       : {estado['friccion']:.4f}")
    print(f"[CONO TERMODINAMICO] Entropia efectiva  : {estado['entropia']:.4f} | T={estado['temperatura']:.3f}")
    print(f"[GRAVEDAD LOGICA]    Estado colapsado   : {estado['estado_colapsado']:.4f}")
    print(f"[PREDICCION]         Riesgo de fallo    : {estado['riesgo_predicho']:.4f}")
    print(f"[SINAPSIS]           Bias actual        : {estado['bias']:.5f}")
    print(f"                     Mutaciones react.  : {estado['mutaciones_reactivas']}")
    print(f"                     Mutaciones prev.   : {estado['mutaciones_preventivas']}")
    print(f"[IMPULSO GLOBAL]     Salida del bus     : {estado['respuesta']:.5f}")

    if estado["conduccion_optima"]:
        print("[ESTADO VERTEBRAL] Conduccion optima - organismo en resonancia convexa.")
        return 0
    else:
        print("[ESTADO VERTEBRAL] Alerta - homeostasis + mutacion activadas.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
