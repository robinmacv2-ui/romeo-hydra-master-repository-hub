#!/usr/bin/env bash
# Protocolo de prueba del juez — entorno limpio aislado.
# Uso: bash scripts/audit_judge.sh
# O copiar los comandos a una VM limpia.
set -euo pipefail

AUDIT_ROOT="${AUDIT_ROOT:-/tmp/auditoria_jurado}"
REPO_URL="https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git"

echo "[audit] root=$AUDIT_ROOT"
rm -rf "$AUDIT_ROOT"
mkdir -p "$AUDIT_ROOT"
cd "$AUDIT_ROOT"

git clone --depth 1 "$REPO_URL"
cd romeo-hydra-master-repository-hub

python3 -m venv .venv_audit
# shellcheck disable=SC1091
source .venv_audit/bin/activate

pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
pip install -e .

echo "[audit] main.py"
python main.py

echo "[audit] pilotos evidencia"
python -m pilot.run_scoring_audit --entity EVAL --n 10
python -m pilot.run_offline_audit --days 5 --entity EVAL

echo "[audit] OK — entorno limpio ejecuto version + ledgers"
ls -la pilot/output/ || true
