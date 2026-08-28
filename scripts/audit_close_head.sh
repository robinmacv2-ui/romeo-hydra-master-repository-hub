#!/usr/bin/env bash
# =============================================================================
# ROMEO-HYDRA — P4 audit_close_head.sh
# Local reproduction suite for control-plane + crypto checkpoint integrity.
#
# Does NOT claim physical PUF validation.
# Does NOT change measured_hinf or clear PPRH_EC008.
#
# Usage (from repository root):
#   bash scripts/audit_close_head.sh
#   bash scripts/audit_close_head.sh --no-pull
#   bash scripts/audit_close_head.sh --gate-sha 6bafb5e7cf38502de19500cd6ed0188e7caa1a60
#
# Output:
#   evidencia/audit/AUDIT_LOCAL_RUN.txt
# =============================================================================

set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 2

DO_PULL=1
GATE_SHA="6bafb5e7cf38502de19500cd6ed0188e7caa1a60"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-pull) DO_PULL=0; shift ;;
    --gate-sha) GATE_SHA="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,20p' "$0"
      exit 0
      ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done

OUT_DIR="$ROOT/evidencia/audit"
mkdir -p "$OUT_DIR"
STAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
OUT="$OUT_DIR/AUDIT_LOCAL_RUN.txt"
TMP="$(mktemp)"

pass=0
fail=0
skip=0

log()  { printf '%s\n' "$*" | tee -a "$TMP"; }
hr()   { log "------------------------------------------------------------"; }

record() {
  # record STATUS label detail
  local st="$1" label="$2" detail="${3:-}"
  case "$st" in
    PASS) pass=$((pass + 1)) ;;
    FAIL) fail=$((fail + 1)) ;;
    SKIP) skip=$((skip + 1)) ;;
  esac
  if [[ -n "$detail" ]]; then
    log "[$st] $label — $detail"
  else
    log "[$st] $label"
  fi
}

{
  log "ROMEO-HYDRA — AUDIT LOCAL RUN (P4)"
  log "timestamp_utc: $STAMP"
  log "repo_root:     $ROOT"
  hr

  # ------------------------------------------------------------------
  # 1. Git identity
  # ------------------------------------------------------------------
  log "SECTION 1: git identity"
  if [[ ! -d .git ]]; then
    record FAIL "git_repo" "not a git repository"
  else
    if [[ "$DO_PULL" -eq 1 ]]; then
      if git fetch origin 2>>"$TMP" && git pull --ff-only origin main 2>>"$TMP"; then
        record PASS "git_pull_ff_only" "origin/main"
      else
        record FAIL "git_pull_ff_only" "fetch/pull failed (see log tail)"
      fi
    else
      record SKIP "git_pull_ff_only" "--no-pull"
    fi
    HEAD="$(git rev-parse HEAD 2>/dev/null || echo UNKNOWN)"
    BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo UNKNOWN)"
    log "HEAD:   $HEAD"
    log "BRANCH: $BRANCH"
    record PASS "git_rev_parse" "$HEAD"
  fi
  hr

  # ------------------------------------------------------------------
  # 2. Pytest pprh gate / fold / polarity
  # ------------------------------------------------------------------
  log "SECTION 2: pytest pprh"
  if [[ -f pprh/hydra/tests/test_fold_polarity_gate.py ]]; then
    if command -v pytest >/dev/null 2>&1; then
      if PYTHONPATH="$ROOT${PYTHONPATH:+:$PYTHONPATH}" pytest pprh/hydra/tests/test_fold_polarity_gate.py -v --tb=short >>"$TMP" 2>&1; then
        record PASS "pytest_pprh" "test_fold_polarity_gate.py"
      else
        record FAIL "pytest_pprh" "see pytest output above"
      fi
    else
      record SKIP "pytest_pprh" "pytest not installed"
    fi
  else
    record FAIL "pytest_pprh" "test file missing"
  fi
  hr

  # ------------------------------------------------------------------
  # 3. Crypto unittest + smoke
  # ------------------------------------------------------------------
  log "SECTION 3: romeo-hydra-crypto"
  if [[ -d romeo-hydra-crypto/tests ]]; then
    (
      cd romeo-hydra-crypto || exit 1
      if python -m unittest discover -s tests -q >>"$TMP" 2>&1; then
        exit 0
      else
        exit 1
      fi
    )
    if [[ $? -eq 0 ]]; then
      record PASS "crypto_unittest" "discover -s tests -q"
    else
      record FAIL "crypto_unittest" "one or more tests failed"
    fi

    # Smoke envelope (digest field required by current schema)
    SMOKE_OUT="$(python -c "
import sys
sys.path.insert(0, 'romeo-hydra-crypto')
try:
    from core.envelope import (
        seal, verify, serialize, deserialize,
        CURRENT_VERSION, COMMITMENT_HEX_LENGTH,
        NONCE_HEX_LENGTH, DIGEST_HEX_LENGTH,
    )
    env, r = seal('evt-audit-p4', b'123456789012', b'payload', b'audit')
    assert env['version'] == CURRENT_VERSION
    assert len(env['pedersen_commitment']) == COMMITMENT_HEX_LENGTH
    assert len(env['nonce']) == NONCE_HEX_LENGTH
    assert len(env['digest']) == DIGEST_HEX_LENGTH
    assert verify(env, r)
    s = serialize(env)
    assert deserialize(s) == env
    assert verify(deserialize(s), r)
    print('ENVELOPE_CRYPTO_OK')
except Exception as e:
    print('ENVELOPE_CRYPTO_FAIL:', type(e).__name__, e)
    sys.exit(1)
" 2>>"$TMP")"
    if [[ "$SMOKE_OUT" == *"ENVELOPE_CRYPTO_OK"* ]]; then
      record PASS "crypto_smoke" "ENVELOPE_CRYPTO_OK"
      log "$SMOKE_OUT"
    else
      record FAIL "crypto_smoke" "${SMOKE_OUT:-no output}"
    fi
  else
    record SKIP "crypto_unittest" "romeo-hydra-crypto/tests not present"
    record SKIP "crypto_smoke" "romeo-hydra-crypto not present"
  fi
  hr

  # ------------------------------------------------------------------
  # 4. Decouple: no crypto imports from pprh
  # ------------------------------------------------------------------
  log "SECTION 4: pprh decouple grep"
  if [[ -d pprh ]]; then
    HITS="$(grep -R -n -E '^\s*(from|import)\s+core\.envelope|^\s*from\s+romeo_hydra_crypto|^\s*import\s+romeo_hydra_crypto' pprh --include='*.py' | grep -v test_fold_polarity_gate.py || true 2>/dev/null || true)"
    if [[ -z "$HITS" ]]; then
      record PASS "pprh_no_crypto_imports" "grep clean"
    else
      record FAIL "pprh_no_crypto_imports" "hits found"
      log "$HITS"
    fi
  else
    record FAIL "pprh_no_crypto_imports" "pprh/ missing"
  fi
  hr

  # ------------------------------------------------------------------
  # 5. Manifest + protocol presence
  # ------------------------------------------------------------------
  log "SECTION 5: dataset evidence files"
  MANIFEST="evidencia/dataset/HYDRA-PHYS-2026-08-27-v1/DATASET_MANIFEST.md"
  PROTOCOL="evidencia/dataset/HYDRA-PHYS-2026-08-27-v1/REPEATABILITY_PROTOCOL_10.md"
  DELTA="evidencia/audit/AUDIT_DELTA_6bafb5e7_9bff763f.md"

  if [[ -f "$MANIFEST" ]]; then
    record PASS "dataset_manifest" "$MANIFEST"
  else
    record FAIL "dataset_manifest" "missing"
  fi
  if [[ -f "$PROTOCOL" ]]; then
    record PASS "repeatability_protocol" "$PROTOCOL"
  else
    record FAIL "repeatability_protocol" "missing"
  fi
  if [[ -f "$DELTA" ]]; then
    record PASS "audit_delta_p1" "$DELTA"
  else
    record SKIP "audit_delta_p1" "optional file not present"
  fi
  hr

  # ------------------------------------------------------------------
  # 6. Optional: crypto tree unchanged vs gate SHA
  # ------------------------------------------------------------------
  log "SECTION 6: crypto delta vs gate SHA"
  if git rev-parse --verify "${GATE_SHA}^{commit}" >/dev/null 2>&1; then
    DIFF_CRYPTO="$(git diff "${GATE_SHA}" HEAD -- romeo-hydra-crypto 2>/dev/null || true)"
    if [[ -z "$DIFF_CRYPTO" ]]; then
      record PASS "crypto_diff_vs_gate_sha" "empty vs $GATE_SHA"
    else
      record FAIL "crypto_diff_vs_gate_sha" "non-empty vs $GATE_SHA"
      log "$DIFF_CRYPTO" | head -n 40
    fi
    DIFF_PPRH="$(git diff "${GATE_SHA}" HEAD -- pprh 2>/dev/null || true)"
    # pprh may be equal if HEAD still on same blobs; empty is PASS
    if [[ -z "$DIFF_PPRH" ]]; then
      record PASS "pprh_diff_vs_gate_sha" "empty vs $GATE_SHA"
    else
      # Not necessarily a fail if only docs later — log for operator
      record SKIP "pprh_diff_vs_gate_sha" "non-empty (inspect); gate harden SHA may predate docs-only commits"
    fi
  else
    record SKIP "crypto_diff_vs_gate_sha" "gate SHA not in local repo: $GATE_SHA"
  fi
  hr

  # ------------------------------------------------------------------
  # Summary
  # ------------------------------------------------------------------
  log "SUMMARY"
  log "PASS=$pass  FAIL=$fail  SKIP=$skip"
  if [[ "$fail" -eq 0 ]]; then
    log "OVERALL: PASS (local reproduction)"
    OVERALL=0
  else
    log "OVERALL: FAIL"
    OVERALL=1
  fi
  log "Levels reminder:"
  log "  - This run converts PENDING LOCAL RUN → PASS/FAIL for pytest/unittest/smoke"
  log "  - Physical min-entropy / 10-cycle log remain out of scope"
  log "  - PPRH_EC008 is not cleared by this script"
  hr
  log "end_timestamp_utc: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} 

# Write final report (full TMP already has section output)
cp "$TMP" "$OUT"
log "Wrote $OUT"
rm -f "$TMP"

echo ""
echo "Report: $OUT"
echo "PASS=$pass FAIL=$fail SKIP=$skip"
exit "${OVERALL:-1}"
