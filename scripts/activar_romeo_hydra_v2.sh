#!/usr/bin/env bash
set -euo pipefail

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          ROMEO-HYDRA V2.0 — SÍNTESIS UNIFICADA               ║"
echo "║  Termodinámica ↔ Neuronal ↔ Gravedad Lógica ↔ Antifragilidad ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo

LOG="romeo_hydra_v2.log"
: > "$LOG"

echo "  [1/3] Ejecutando bus central termodinámico-neuronal..."
set +e
python columna_vertebral_v2.py >> "$LOG" 2>&1
CODE_COLUMNA=$?
set -e

echo "  [2/3] Ejecutando protocolo inmunológico V2.0..."
set +e
python automedicina_v2.py >> "$LOG" 2>&1
CODE_INMUNE=$?
set -e

echo "  [3/3] Consolidando estado en el repositorio inmutable..."

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git add -f columna_vertebral_v2.py automedicina_v2.py activar_romeo_hydra_v2.sh \
             memoria_inmunologica.json "$LOG" 2>/dev/null || true
    git commit -m "Eterno Ahora [ROMEO-HYDRA V2.0]: Síntesis unificada — termodinámica-neuronal + gravedad lógica adaptativa + antifragilidad absoluta (columna=$CODE_COLUMNA, inmune=$CODE_INMUNE)" --quiet || true
    echo "  [+] Mutación consolidada en Git."
else
    echo "  [i] Entorno sin Git. Estado registrado solo localmente."
fi

echo
echo "=== RADIOGRAFÍA COMPLETA DEL ORGANISMO V2.0 ==="
cat "$LOG"
echo "================================================"
echo
echo "Códigos de salida → Columna: $CODE_COLUMNA | Inmune: $CODE_INMUNE"

# Código de salida global: 0 solo si ambos subsistemas están óptimos
if [[ $CODE_COLUMNA -eq 0 && $CODE_INMUNE -eq 0 ]]; then
    exit 0
else
    exit 1
fi
