#!/usr/bin/env bash
set -euo pipefail

MODO="${1:-once}"

echo "=============================================================="
echo "  ROMEO-HYDRA V2.1 — SINTESIS AVANZADA (HIPERSENSIBLE 0.63)"
echo "  Termodinamica + Neuronal + Gravedad Logica + Prediccion"
echo "  + Antifragilidad Hipersensible + Vigilancia Continua"
echo "=============================================================="
echo

LOG="romeo_hydra_v21.log"
: > "$LOG"

if [[ "$MODO" == "watch" ]]; then
    echo "[MODO] Vigilancia continua activada"
    python3 vigilante_v21.py
    exit $?
fi

echo "  [1/3] Ejecutando bus central V2.1..."
set +e
python3 columna_vertebral_v21.py >> "$LOG" 2>&1
CODE_COLUMNA=$?
set -e

echo "  [2/3] Ejecutando protocolo inmunologico V2.1..."
set +e
python3 automedicina_v21.py >> "$LOG" 2>&1
CODE_INMUNE=$?
set -e

echo "  [3/3] Consolidando estado en repositorio inmutable..."

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git add -f columna_vertebral_v21.py automedicina_v21.py vigilante_v21.py \
             activar_romeo_hydra_v21.sh \
             memoria_inmunologica_v21.json metricas_organismo_v21.json \
             historial_senales_v21.json "$LOG" 2>/dev/null || true

    git commit -m "Eterno Ahora [ROMEO-HYDRA V2.1]: Hipersensible umbral 0.63 + prediccion + antifragilidad (columna=$CODE_COLUMNA, inmune=$CODE_INMUNE)" --quiet || true
    echo "  [+] Mutacion consolidada en Git."
else
    echo "  [i] Sin repositorio Git. Estado solo local."
fi

echo
echo "=== RADIOGRAFIA COMPLETA DEL ORGANISMO V2.1 ==="
cat "$LOG"
echo "================================================"
echo
echo "Codigos de salida -> Columna: $CODE_COLUMNA | Inmune: $CODE_INMUNE"
echo
echo "Archivos de estado:"
echo "  - metricas_organismo_v21.json"
echo "  - memoria_inmunologica_v21.json"
echo "  - historial_senales_v21.json"
echo
echo "Para vigilancia continua:"
echo "  ./activar_romeo_hydra_v21.sh watch"

if [[ $CODE_COLUMNA -eq 0 && $CODE_INMUNE -eq 0 ]]; then
    exit 0
else
    exit 1
fi
