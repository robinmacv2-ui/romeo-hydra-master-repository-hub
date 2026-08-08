#!/usr/bin/env python3
"""
ROMEO-HYDRA V2.1 — Nucleo Unificado HIPERSENSIBLE
Umbral de conduccion calibrado a 0.63 (recomendado)
"""

from __future__ import annotations

import math
import os
import sys
import time
import json
import random
from dataclasses import dataclass
from pathlib import Path
from typing import List

@dataclass
class ConfigV21:
    # Pesos sinapticos
    w_hardware: float = 0.68
    w_entropia: float = 0.50
    w_friccion: float = -0.38
    bias_inicial: float = 0.12

    # Umbrales HIPERSENSIBLES (con ajuste recomendado)
    umbral_conduccion: float = 0.63          # Ajuste recomendado (antes 0.68)
    umbral_friccion_alta: float = 0.32
    umbral_entropia_critica: float = 0.38
    umbral_prediccion_riesgo: float = 0.28

    # Antifragilidad agresiva
    tasa_mutacion: float = 0.045
    tasa_mutacion_preventiva: float = 0.028
    ventana_historica: int = 6

    # Rutas de estado
    memoria_path: Path = Path("memoria_inmunologica_v21.json")
    metricas_path: Path = Path("metricas_organismo_v21.json")
    historial_path: Path = Path("historial_senales_v21.json")


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
    senales = senales[-cfg.ventana_historica:]
    hist["senales"] = senales
    guardar_json(cfg.historial_path, hist)
    return senales


def predecir_riesgo(senales: List[dict], cfg: ConfigV21) -> float:
    if len(senales) < 3:
        return 0.0

    fricciones = [s["friccion"] for s in senales]
    entropias = [s["entropia"] for s in senales]
    respuestas = [s["respuesta"] for s in senales]

    df = fricciones[-1] - fricciones[0]
    de = entropias[-1] - entropias[0]
    dr = respuestas[-1] - respuestas[0]

    riesgo = 0.0
    riesgo += max(0.0, df) * 2.1
    riesgo += max(0.0, de) * 1.7
    riesgo += max(0.0, -dr) * 1.9
    riesgo += (1.0 - respuestas[-1]) * 0.7

    return round(min(1.0, max(0.0, riesgo)), 4)


def integrar(cfg: ConfigV21) -> dict:
    memoria = cargar_json(cfg.memoria_path, {
        "bias_actual": cfg.bias_inicial,
        "mutaciones": 0,
        "mutaciones_preventivas": 0,
        "fallos": []
    })

    bias = memoria.get("bias_actual", cfg.bias_inicial)
    friccion = medir_friccion()
    temperatura = 1.0 + 0.42 * friccion
    entropia = calcular_entropia(friccion, temperatura)

    ruido = random.gauss(0, 0.15 * (1.0 - friccion))
    estado_colapsado = max(0.04, min(0.96, 0.5 + ruido - (friccion * 0.30)))

    nucleos = os.cpu_count() or 2
    vector_borde = (nucleos / 8.0) * (0.30 + 0.70 * (1.0 - friccion))

    entrada = (
        vector_borde * cfg.w_hardware
        + entropia * cfg.w_entropia
        + estado_colapsado * cfg.w_friccion
        + bias
    )
    respuesta = sigmoide_termo(entrada, temperatura)

    senales = actualizar_historial(cfg, friccion, entropia, respuesta)
    riesgo = predecir_riesgo(senales, cfg)

    fallo = respuesta < cfg.umbral_conduccion or friccion > cfg.umbral_friccion_alta
    riesgo_alto = riesgo >= cfg.umbral_prediccion_riesgo

    if fallo:
        direccion = -1.0 if respuesta < 0.5 else 1.0
        delta = cfg.tasa_mutacion * direccion * (1.0 + friccion)
        nuevo_bias = max(-0.50, min(0.80, bias + delta))
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
        direccion = -1.0 if respuesta < 0.60 else 1.0
        delta = cfg.tasa_mutacion_preventiva * direccion * (1.0 + riesgo)
        nuevo_bias = max(-0.50, min(0.80, bias + delta))
        memoria["bias_actual"] = round(nuevo_bias, 5)
        memoria["mutaciones_preventivas"] = memoria.get("mutaciones_preventivas", 0) + 1
        print(f"[ANTIFRAGILIDAD PREDICTIVA] Riesgo {riesgo:.3f} -> mutacion preventiva bias {bias:.4f} -> {nuevo_bias:.4f}")
        bias = nuevo_bias

    memoria["fallos"] = memoria.get("fallos", [])[-15:]
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
        "modo": "HIPERSENSIBLE_0.63"
    }

    guardar_json(cfg.metricas_path, resultado)
    return resultado


def main() -> int:
    cfg = ConfigV21()
    print("[COLUMNA VERTEBRAL V2.1] Modo HIPERSENSIBLE (umbral 0.63) activado...")

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
        print("[ESTADO VERTEBRAL] Conduccion optima - resonancia convexa alcanzada.")
        return 0
    else:
        print("[ESTADO VERTEBRAL] ALERTA HIPERSENSIBLE - mutacion activada.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
