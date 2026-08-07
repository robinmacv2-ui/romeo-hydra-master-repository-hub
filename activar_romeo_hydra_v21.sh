#!/usr/bin/env bash
set -euo pipefail

MODO="${1:-once}"

echo "=============================================================="
echo "  ROMEO-HYDRA V2.1 — SINTESIS AVANZADA (MODO WINDOWS)"
echo "=============================================================="

LOG="romeo_hydra_v2.log"
: > "$LOG"

if [[ "$MODO" == "watch" ]]; then
    echo "[MODO] Vigilancia continua activada"
    python vigilante_v21.py
    exit $?
fi

echo "  [1/3] Ejecutando bus central V2.1..."
set +e
python columna_vertebral_v21.py >> "$LOG" 2>&1
CODE_COLUMNA=$?
set -e

echo "  [2/3] Ejecutando protocolo inmunologico V2.1..."
set +e
python automedicina_v21.py >> "$LOG" 2>&1
CODE_INMUNE=$?
set -e

echo "  [3/3] Consolidando estado..."
git add .
git commit -m "Eterno Ahora [ROMEO-HYDRA V2.1]: Consolidación Windows" --quiet || true

echo "=== RADIOGRAFIA COMPLETADA ==="
cat "$LOG"
echo "=============================="
echo "Codigos de salida -> Columna: $CODE_COLUMNA | Inmune: $CODE_INMUNE"
