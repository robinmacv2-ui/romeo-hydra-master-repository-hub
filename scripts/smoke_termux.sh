#!/usr/bin/env bash
# Prueba de humo obligatoria antes de push (Termux / laptop).
# No requiere cryptography ni ruff.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "[smoke] root=$ROOT"

python -m pilot.run_scoring_audit --entity SOFIPO-DEMO --n 20
python -m pilot.run_offline_audit --days 30 --entity SOFIPO-DEMO

SCORING=$(ls -1 pilot/output/scoring_SOFIPO-DEMO_20.json 2>/dev/null || true)
OFFLINE=$(ls -1 pilot/output/offline_SOFIPO-DEMO_30d.json 2>/dev/null || true)

if [[ -z "$SCORING" || -z "$OFFLINE" ]]; then
  echo "[smoke] FAIL: faltan JSON en pilot/output/"
  ls -la pilot/output/ || true
  exit 1
fi

if ! grep -qi "folio CNBV" "$SCORING"; then
  echo "[smoke] FAIL: scoring JSON sin mencion a folio CNBV (disclaimer)"
  exit 1
fi

if ! grep -qi "NO es folio CNBV\|no es folio CNBV" "$SCORING"; then
  echo "[smoke] FAIL: scoring debe decir explicitamente que NO es folio CNBV"
  exit 1
fi

if ! grep -qi "NO es folio CNBV\|no es folio CNBV" "$OFFLINE"; then
  echo "[smoke] FAIL: offline debe decir explicitamente que NO es folio CNBV"
  exit 1
fi

echo "[smoke] OK"
echo "  - $SCORING"
echo "  - $OFFLINE"
echo "Listo para considerar push (si ademas git status esta limpio)."
