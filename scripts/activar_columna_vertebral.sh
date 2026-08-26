#!/usr/bin/env bash
set -euo pipefail

LOG_FILE="columna_vertebral.log"
PYTHON_SCRIPT="columna_vertebral.py"

echo "  [+] Transmitiendo impulsos a través de la columna vertebral digital..."

# Limpieza segura del log anterior
: > "$LOG_FILE"

# Ejecutar el bus central
if ! python3 "$PYTHON_SCRIPT" > "$LOG_FILE" 2>&1; then
    echo "  [-] Bloqueo en la columna vertebral. Sinapsis interrumpida."
    echo "--- Contenido del log ---"
    cat "$LOG_FILE"
    exit 1
fi

# Verificar que se generó salida
if [[ ! -s "$LOG_FILE" ]]; then
    echo "  [-] El bus central no produjo señal. Abortando."
    exit 1
fi

echo "  [+] Columna vertebral integrada."

# Registrar en Git solo si estamos en un repositorio
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "  [+] Registrando mutación inmutable en Git..."
    git add -f "$LOG_FILE"
    git commit -m "Eterno Ahora [Columna Vertebral Digital]: Bus central conectado entre el cuerpo y la red neuronal." --quiet || true
else
    echo "  [i] No se detectó repositorio Git. Se omite el commit."
fi

echo -e "\n=== RADIOGRAFÍA DE LA COLUMNA VERTEBRAL ==="
cat "$LOG_FILE"
echo "=============================================="
