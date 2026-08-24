#!/usr/bin/env python
"""
ROMEO-HYDRA - Utilidades comunes v3.1.1
"""

from __future__ import annotations
import json
from pathlib import Path
from typing import Any, Dict, List

CONFIG_PATH = Path("config_romeo.json")
HEALTH_HISTORY_PATH = Path("health_history.json")

DEFAULT_CONFIG = {
    "umbral_conduccion": 0.63,
    "umbral_friccion_alta": 0.32,
    "umbral_prediccion_riesgo": 0.28,
    "umbral_aislamiento_friccion": 0.75,
    "umbral_aislamiento_entropia": 0.70,
    "tasa_mutacion": 0.045,
    "tasa_mutacion_preventiva": 0.028,
    "ventana_historial": 8,
    "intervalo_monitor_segundos": 10,
    "max_eventos_auditoria_mostrar": 10,
    "health_alert_threshold": 55,
    "health_history_size": 20,
    "version": "3.1.1-consolidada"
}

def cargar_config() -> Dict[str, Any]:
    if not CONFIG_PATH.exists():
        return DEFAULT_CONFIG.copy()
    try:
        data = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
        cfg = DEFAULT_CONFIG.copy()
        cfg.update(data)
        return cfg
    except Exception:
        return DEFAULT_CONFIG.copy()

def guardar_json_seguro(path: Path, data: Any) -> bool:
    try:
        path.write_text(json.dumps(data, indent=2, ensure_ascii=True), encoding="utf-8")
        return True
    except Exception:
        return False

def cargar_json_seguro(path: Path, default: Any = None) -> Any:
    if default is None:
        default = {}
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default

def registrar_health(score: int) -> List[int]:
    """Guarda el Health Score en el historial y devuelve la lista actualizada."""
    cfg = cargar_config()
    max_size = int(cfg.get("health_history_size", 20))
    historial = cargar_json_seguro(HEALTH_HISTORY_PATH, {"scores": []})
    scores = historial.get("scores", [])
    scores.append(score)
    scores = scores[-max_size:]
    historial["scores"] = scores
    guardar_json_seguro(HEALTH_HISTORY_PATH, historial)
    return scores

def obtener_tendencia(scores: List[int]) -> str:
    if len(scores) < 3:
        return "INSUFICIENTE"
    reciente = scores[-3:]
    if reciente[-1] > reciente[0] + 3:
        return "MEJORANDO"
    if reciente[-1] < reciente[0] - 3:
        return "EMPEORANDO"
    return "ESTABLE"
