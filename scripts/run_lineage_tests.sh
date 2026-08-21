#!/data/data/com.termux/files/usr/bin/bash
# Smoke: lineage receipt tests (stdlib unittest). Termux-safe.
set -euo pipefail
cd "$(dirname "$0")/.."
echo "== lineage tests (hub) =="
python -m unittest tests.test_lineage_in_receipt -v
echo "OK"
