#!/usr/bin/env bash
set -euo pipefail

LOG_FILE="homeostasis_sistema.log"
PYTHON_SCRIPT="automedicina.py"

echo "  [+] Evaluando el estado de salud del organismo..."

# Ejecutar el monitor (capturamos salida y código de retorno)
set +e
python3 "$PYTHON_SCRIPT" > "$LOG_FILE" 2>&1
EXIT_CODE=$?
set -e

echo "  [+] Análisis completado (código de estado: $EXIT_CODE)."

# Registrar en Git solo si estamos dentro de un repositorio
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "  [+] Consolidando estado sanitario en el historial inmutable..."
    git add -f automedicina.py "$LOG_FILE" 2>/dev/null || true
    git commit -m "Eterno Ahora [Protocolo Inmune]: Sistema de homeostasis y autorreparación activado (estado=$EXIT_CODE)." --quiet || true
else
    echo "  [i] No se detectó repositorio Git. Se omite el commit."
fi

echo -e "\n=== RADIOGRAFÍA DE HOMEOSTASIS ==="
cat "$LOG_FILE"
echo "=================================="

# Propagar el código de estado del sistema inmune
exit $EXIT_CODE
