#!/usr/bin/env python3
"""
ROMEO-HYDRA V3.0 — Nucleo Central
Incluye resonancia del invariante Eukaris (regeneración / abundancia).
"""

from __future__ import annotations
import math
import random
import sys
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict

import tejido_sensorial
import tejido_memoria
import motor_mitosis

@dataclass
class ConfigV30:
    w_hardware: float = 0.68
    w_entropia: float = 0.50
    w_friccion: float = -0.38
    bias_inicial: float = 0.12
    umbral_conduccion: float = 0.63
    umbral_friccion_alta: float = 0.32
    umbral_prediccion_riesgo: float = 0.28
    tasa_mutacion: float = 0.045
    tasa_mutacion_preventiva: float = 0.028

def sigmoide_termo(x: float, temperatura: float = 1.0) -> float:
    escala = 1.0 / max(0.28, temperatura)
    z = x * escala
    if z >= 0:
        return 1.0 / (1.0 + math.exp(-z))
    e = math.exp(z)
    return e / (1.0 + e)

def predecir_riesgo(historial: list) -> float:
    if len(historial) < 3:
        return 0.0
    fric = [s.get("friccion", 0) for s in historial]
    resp = [s.get("respuesta", 0.5) for s in historial]
    df = fric[-1] - fric[0]
    dr = resp[-1] - resp[0]
    riesgo = max(0.0, df) * 2.0 + max(0.0, -dr) * 1.8 + (1.0 - resp[-1]) * 0.6
    return round(min(1.0, riesgo), 4)

def resonar_eukaris() -> None:
    """Carga el invariante de regeneración si está disponible."""
    try:
        from core.eukaris_affirmations import cargar_invariante
        inv = cargar_invariante()
        print(f"[EUKARIS] Resonancia activa — {len(inv.afirmaciones)} afirmaciones | regeneración celular alineada.")
    except Exception:
        pass

def main() -> int:
    cfg = ConfigV30()
    print("[NUCLEO V3.0] Iniciando organismo multicelular...")
    resonar_eukaris()

    entorno = tejido_sensorial.leer_entorno()
    friccion = entorno["friccion"]
    temperatura = entorno["temperatura"]
    entropia = entorno["entropia"]
    vector_borde = entorno["vector_borde"]

    resultados_mitosis = motor_mitosis.ejecutar_mitosis(friccion)

    bias = tejido_memoria.cargar_bias()

    ruido = random.gauss(0, 0.15 * (1.0 - friccion))
    estado_colapsado = max(0.04, min(0.96, 0.5 + ruido - (friccion * 0.30)))

    bonus_mitosis = 0.0
    if resultados_mitosis:
        bonus_mitosis = sum(r["carga_procesada"] for r in resultados_mitosis) * 0.04

    entrada = (
        vector_borde * cfg.w_hardware
        + entropia * cfg.w_entropia
        + estado_colapsado * cfg.w_friccion
        + bias
        + bonus_mitosis
    )
    respuesta = sigmoide_termo(entrada, temperatura)

    senal = {"friccion": friccion, "entropia": entropia, "respuesta": respuesta}
    tejido_memoria.actualizar_historial(senal)

    hist = []
    hp = Path("historial_senales_v30.json")
    if hp.exists():
        try:
            hist = json.loads(hp.read_text(encoding="utf-8")).get("senales", [])
        except Exception:
            pass
    riesgo = predecir_riesgo(hist)

    mutaciones = 0
    mutaciones_prev = 0
    fallo = respuesta < cfg.umbral_conduccion or friccion > cfg.umbral_friccion_alta
    riesgo_alto = riesgo >= cfg.umbral_prediccion_riesgo

    if fallo:
        direccion = -1.0 if respuesta < 0.5 else 1.0
        delta = cfg.tasa_mutacion * direccion * (1.0 + friccion)
        nuevo_bias = max(-0.50, min(0.80, bias + delta))
        print(f"[ANTIFRAGILIDAD REACTIVA] bias {bias:.4f} -> {nuevo_bias:.4f}")
        bias = nuevo_bias
        mutaciones = 1
    elif riesgo_alto:
        direccion = -1.0 if respuesta < 0.60 else 1.0
        delta = cfg.tasa_mutacion_preventiva * direccion * (1.0 + riesgo)
        nuevo_bias = max(-0.50, min(0.80, bias + delta))
        print(f"[ANTIFRAGILIDAD PREDICTIVA] Riesgo {riesgo:.3f} -> bias {bias:.4f} -> {nuevo_bias:.4f}")
        bias = nuevo_bias
        mutaciones_prev = 1

    tejido_memoria.guardar_bias(bias, mutaciones, mutaciones_prev)

    metricas = {
        "friccion": friccion,
        "entropia": entropia,
        "temperatura": temperatura,
        "estado_colapsado": round(estado_colapsado, 4),
        "bias": bias,
        "respuesta": round(respuesta, 5),
        "riesgo_predicho": riesgo,
        "mitosis_celulas": len(resultados_mitosis),
        "bonus_mitosis": round(bonus_mitosis, 4),
        "conduccion_optima": respuesta >= cfg.umbral_conduccion,
        "modo": "V3.0_MULTICELULAR+EUKARIS"
    }
    tejido_memoria.guardar_metricas(metricas)

    print(f"[SENAL DE BORDE]     Friccion E/S       : {friccion:.4f}")
    print(f"[CONO TERMODINAMICO] Entropia           : {entropia:.4f} | T={temperatura:.3f}")
    print(f"[GRAVEDAD LOGICA]    Estado colapsado   : {estado_colapsado:.4f}")
    print(f"[MITOSIS]            Celulas activadas  : {len(resultados_mitosis)}")
    print(f"[PREDICCION]         Riesgo             : {riesgo:.4f}")
    print(f"[SINAPSIS]           Bias               : {bias:.5f}")
    print(f"[IMPULSO GLOBAL]     Salida del bus     : {respuesta:.5f}")

    if respuesta >= cfg.umbral_conduccion:
        print("[ESTADO] Conduccion optima - organismo multicelular en resonancia.")
        return 0
    else:
        print("[ESTADO] ALERTA - mutacion y/o mitosis activadas.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
