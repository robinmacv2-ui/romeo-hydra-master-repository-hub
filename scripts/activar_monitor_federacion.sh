#!/usr/bin/env bash

echo "=============================================================="
echo "  ROMEO-HYDRA — MONITOR DE FEDERACION"
echo "=============================================================="
echo

MODO="${1:-once}"

if [[ "$MODO" == "watch" ]]; then
    echo "[MODO] Dashboard continuo (actualiza cada 10 segundos)"
    echo "       Presiona Ctrl+C para detener"
    echo
    python monitor_federacion.py watch
else
    python monitor_federacion.py
fi
