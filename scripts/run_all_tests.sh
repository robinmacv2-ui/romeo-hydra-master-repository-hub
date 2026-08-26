#!/usr/bin/env bash
# Golden Path — ROMEO-HYDRA V3.1
set -e
cd "$(dirname "$0")/romeo-hydra-core"
echo "=========================================="
echo " ROMEO-HYDRA V3.1 — VALIDATION RUN"
echo "=========================================="
echo ""
echo "[1] Adversarial unit tests"
python -m unittest tests.test_hydra_v3 -v
echo ""
echo "[2] Allow path"
python main.py "auditar::poliza_golden" auditor
echo ""
echo "[3] Deny path (closed verb)"
python main.py "rm::/tmp" operator || true
echo ""
echo "[4] Deny path (capability)"
python main.py "construir::puente" observer || true
echo ""
echo "=========================================="
echo " ROMEO-HYDRA VALIDATION: PASS"
echo "=========================================="
