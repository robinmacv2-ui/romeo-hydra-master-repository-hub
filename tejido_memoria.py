#!/usr/bin/env python3
"""
ROMEO-HYDRA V3.0 - Tejido de Memoria (Diferenciado)
"""

from __future__ import annotations
import json
import time
from pathlib import Path
from typing import Any, Dict

MEMORIA_PATH = Path("memoria_persistente_v30.json")
METRICAS_PATH = Path("metricas_organismo_v30.json")
HISTORIAL_PATH = Path("historial_senales_v30.json")

def guardar_estado(clave: str, datos: Any) -> str:
    store = {}
    if MEMORIA_PATH.exists():
        try:
            store = json.loads(MEMORIA_PATH.read_text(encoding="utf-8"))
        except Exception:
            store = {}
    store[clave] = {"ts": time.time(), "datos": datos}
    MEMORIA_PATH.write_text(json.dumps(store, indent=2, ensure_ascii=True), encoding="utf-8")
    return f"[TEJIDO_MEMORIA] Estado '{clave}' sincronizado."

def guardar_metricas(metricas: Dict) -> str:
    METRICAS_PATH.write_text(json.dumps(metricas, indent=2, ensure_ascii=True), encoding="utf-8")
    return "[TEJIDO_MEMORIA] Metricas actualizadas."

def actualizar_historial(senal: Dict, ventana: int = 8) -> str:
    hist = {"senales": []}
    if HISTORIAL_PATH.exists():
        try:
            hist = json.loads(HISTORIAL_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    senales = hist.get("senales", [])
    senales.append(senal)
    hist["senales"] = senales[-ventana:]
    HISTORIAL_PATH.write_text(json.dumps(hist, indent=2, ensure_ascii=True), encoding="utf-8")
    return f"[TEJIDO_MEMORIA] Historial actualizado ({len(hist['senales'])} senales)."

def cargar_bias() -> float:
    if not MEMORIA_PATH.exists():
        return 0.12
    try:
        store = json.loads(MEMORIA_PATH.read_text(encoding="utf-8"))
        return float(store.get("bias", {}).get("datos", {}).get("valor", 0.12))
    except Exception:
        return 0.12

def guardar_bias(bias: float, mutaciones: int = 0, mutaciones_prev: int = 0) -> str:
    return guardar_estado("bias", {
        "valor": bias,
        "mutaciones_reactivas": mutaciones,
        "mutaciones_preventivas": mutaciones_prev
    })
