#!/usr/bin/env python
"""
ROMEO-HYDRA — Monitor de Federacion v3.1.1
Health Score + Historial + Alertas + Tendencia
"""

from __future__ import annotations
import json
import time
import os
import sys
from pathlib import Path
from typing import List, Dict

from romeo_utils import (
    cargar_config, cargar_json_seguro,
    registrar_health, obtener_tendencia
)

FEDERATION_STATE = Path("federacion_estado.json")
AUDIT_LOG = Path("tcp_hydra_audit.jsonl")
METRICAS_PATH = Path("metricas_organismo_v30.json")

def calcular_health_score(estado: Dict, metricas: Dict) -> int:
    score = 100.0
    budget = float(estado.get("entropy_budget", 1.0))
    score -= (1.0 - max(0.0, min(1.0, budget))) * 35

    aislados = len(estado.get("isolated_nodes", []))
    score -= min(30, aislados * 8)

    conduccion = float(metricas.get("respuesta", 0.5))
    if conduccion < 0.45:
        score -= 25
    elif conduccion < 0.60:
        score -= 12

    eventos = int(estado.get("total_events", 0))
    if eventos > 50:
        score -= min(10, (eventos - 50) * 0.15)

    return max(0, min(100, int(round(score))))

def cargar_ultimos_eventos(n: int = 10) -> List[Dict]:
    if not AUDIT_LOG.exists():
        return []
    eventos = []
    try:
        with open(AUDIT_LOG, "r", encoding="utf-8") as f:
            lineas = f.readlines()
        for linea in lineas[-n:]:
            linea = linea.strip()
            if linea:
                try:
                    eventos.append(json.loads(linea))
                except Exception:
                    continue
    except Exception:
        pass
    return eventos

def formatear_hora(ts: float) -> str:
    try:
        return time.strftime("%H:%M:%S", time.localtime(ts))
    except Exception:
        return "--:--:--"

def mostrar_dashboard():
    cfg = cargar_config()
    estado = cargar_json_seguro(FEDERATION_STATE, {
        "global_bias": 0.12,
        "entropy_budget": 1.0,
        "isolated_nodes": [],
        "trusted_nodes": [],
        "total_events": 0
    })
    metricas = cargar_json_seguro(METRICAS_PATH, {})
    eventos = cargar_ultimos_eventos(cfg.get("max_eventos_auditoria_mostrar", 10))

    health = calcular_health_score(estado, metricas)
    scores = registrar_health(health)
    tendencia = obtener_tendencia(scores)
    umbral_alerta = int(cfg.get("health_alert_threshold", 55))

    os.system("cls" if os.name == "nt" else "clear")

    print("=" * 64)
    print("  ROMEO-HYDRA  |  MONITOR DE FEDERACION  v3.1.1")
    print("=" * 64)
    print()

    # Health Score + Tendencia
    barra = int(health / 5)
    barra_str = "#" * barra + "-" * (20 - barra)
    print(f"[HEALTH SCORE]  {health:3d}/100  [{barra_str}]")
    print(f"               Tendencia: {tendencia}")

    if health >= 80:
        print("               Estado: EXCELENTE")
    elif health >= 60:
        print("               Estado: ESTABLE")
    elif health >= 40:
        print("               Estado: ESTRES MODERADO")
    else:
        print("               Estado: CRITICO")

    # Alerta
    if health < umbral_alerta:
        print()
        print(f"  !!! ALERTA: Health Score por debajo de {umbral_alerta}")
    print()

    # Mini historial visual
    if len(scores) >= 2:
        print("[HISTORIAL RECIENTE DE HEALTH]")
        print("  " + " -> ".join(str(s) for s in scores[-8:]))
        print()

    # Estado global
    print("[ESTADO GLOBAL]")
    print(f"  Bias global             : {estado.get('global_bias', 0.12):.5f}")
    print(f"  Presupuesto entropia    : {estado.get('entropy_budget', 1.0):.4f}")
    print(f"  Eventos totales         : {estado.get('total_events', 0)}")
    print(f"  Nodos trusted           : {len(estado.get('trusted_nodes', []))}")
    print(f"  Nodos aislados          : {len(estado.get('isolated_nodes', []))}")
    print()

    if metricas:
        print("[ORGANISMO LOCAL]")
        print(f"  Friccion                : {metricas.get('friccion', 0):.4f}")
        print(f"  Respuesta (conduccion)  : {metricas.get('respuesta', 0):.5f}")
        print(f"  Riesgo predicho         : {metricas.get('riesgo_predicho', 0):.4f}")
        print(f"  Celulas mitosis         : {metricas.get('mitosis_celulas', 0)}")
        print()

    trusted = estado.get("trusted_nodes", [])
    isolated = estado.get("isolated_nodes", [])

    if trusted:
        print("[NODOS DE CONFIANZA]")
        for n in trusted[-5:]:
            print(f"  + {n}")
        print()

    if isolated:
        print("[NODOS AISLADOS]")
        for n in isolated[-5:]:
            print(f"  ! {n}")
        print()

    print("[ULTIMOS EVENTOS DE AUDITORIA]")
    if not eventos:
        print("  (Sin eventos)")
    else:
        print(f"  {'Hora':<10} {'Nodo':<16} {'Status':<9} {'Fric':<7} {'Entr':<7}")
        print("  " + "-" * 52)
        for ev in eventos:
            hora = formatear_hora(ev.get("ts", 0))
            nodo = str(ev.get("node_id", "?"))[:14]
            status = str(ev.get("status", "?"))[:8]
            fric = ev.get("friction", 0)
            ent = ev.get("entropy", 0)
            print(f"  {hora:<10} {nodo:<16} {status:<9} {fric:<7.3f} {ent:<7.3f}")
    print()
    print("=" * 64)
    print(f"  Version: {cfg.get('version', '3.1.1')}  |  python monitor_federacion.py")
    print("=" * 64)

def main():
    modo = sys.argv[1] if len(sys.argv) > 1 else "once"
    cfg = cargar_config()
    intervalo = int(cfg.get("intervalo_monitor_segundos", 10))

    if modo == "watch":
        print("[MONITOR] Modo continuo. Ctrl+C para detener.")
        try:
            while True:
                mostrar_dashboard()
                time.sleep(intervalo)
        except KeyboardInterrupt:
            print("\n[MONITOR] Detenido.")
    else:
        mostrar_dashboard()

if __name__ == "__main__":
    main()
