#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON="$PROJECT_ROOT/cripto/Scripts/python.exe"
KERNEL="$PROJECT_ROOT/romeo_kernel_core.py"

echo "============================================================"
echo " ROMEO-HYDRA — DETERMINISTIC RUNNER"
echo "============================================================"

if [[ ! -f "$PYTHON" ]]; then
    echo "ERROR: Python del entorno 'cripto' no existe."
    echo "Ejecuta primero: ./setup_romeo_hydra.sh"
    exit 1
fi

if [[ ! -f "$KERNEL" ]]; then
    echo "ERROR: Kernel no encontrado:"
    echo "$KERNEL"
    exit 1
fi

echo
echo "[1] Python:"
"$PYTHON" --version

echo
echo "[2] Interpreter:"
"$PYTHON" -c "import sys; print(sys.executable)"

echo
echo "[3] NumPy:"
"$PYTHON" -c "import numpy; print(numpy.__version__)"

echo
echo "[4] Executing kernel..."
echo

exec "$PYTHON" "$KERNEL"
