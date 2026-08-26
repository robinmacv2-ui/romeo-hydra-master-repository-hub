#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="$PROJECT_ROOT/cripto"

echo "============================================================"
echo " ROMEO-HYDRA — ENVIRONMENT BOOTSTRAP"
echo "============================================================"

echo "[1] Project:"
echo "    $PROJECT_ROOT"

echo "[2] Virtual environment:"
echo "    $VENV"

if [[ ! -x "$VENV/Scripts/python.exe" ]]; then
    echo
    echo "ERROR: entorno virtual 'cripto' no encontrado."
    echo
    echo "Creándolo..."
    python -m venv "$VENV"
fi

PYTHON="$VENV/Scripts/python.exe"

echo
echo "[3] Python:"
"$PYTHON" --version

echo
echo "[4] Interpreter:"
"$PYTHON" -c "import sys; print(sys.executable)"

echo
echo "[5] Installing dependencies..."
"$PYTHON" -m pip install --upgrade pip
"$PYTHON" -m pip install numpy==2.4.6

echo
echo "[6] Dependency verification..."
"$PYTHON" -c "import numpy; print('NUMPY_OK'); print(numpy.__version__); print(numpy.__file__)"

echo
echo "============================================================"
echo " BOOTSTRAP PASSED"
echo "============================================================"
