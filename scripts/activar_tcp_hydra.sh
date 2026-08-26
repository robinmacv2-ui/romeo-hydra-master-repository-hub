#!/usr/bin/env bash

echo "=============================================================="
echo "  ROMEO-HYDRA — TCP-HYDRA PROTOCOL DEMO"
echo "  Protocolo de Acoplamiento Termodinamico-Convexo"
echo "=============================================================="
echo

echo "[1] Ejecutando simulacion de nodos externos..."
python nodo_externo_demo.py

echo
echo "=============================================================="
echo "Archivos generados por el protocolo:"
echo "  - tcp_hydra_protocol.py     (nucleo del protocolo)"
echo "  - nodo_externo_demo.py      (simulador de agente externo)"
echo "  - federacion_estado.json    (estado global de la federacion)"
echo "  - tcp_hydra_audit.jsonl     (registro de auditoria inmutable)"
echo "=============================================================="
echo
echo "Para volver a probar:"
echo "  python nodo_externo_demo.py"
