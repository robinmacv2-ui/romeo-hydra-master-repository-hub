# pilot/faro.py
# ROMEO-HYDRA V3.1 - Formal DFA Gate (Ex-Ante Admissibility)
# Offline · Python 3.11 stdlib only · Fail-closed
# Architect: Luis Angel Vazquez Martinez
#
# Legal/technical principle (corrected):
# Missing or invalid PRE-RECEIPT does NOT produce "acto nulo".
# It produces TRACEABILITY_FAILURE → DECISION_NOT_ADMISSIBLE → DENY/HOLD
# + FAILURE_RECEIPT. This is a technical condition of admissibility,
# not a claim of automatic legal nullity.

from pathlib import Path
import hashlib
import json
import time
import re
from typing import Dict, Any, Optional, Tuple, List, Set

ROOT = Path(__file__).resolve().parent.parent
LEDGER_PATH = ROOT / "delta_ledger_registry.json"

STATES: Set[str] = {
    "INIT", "PARSED", "ADMISSIBLE", "DENIED",
    "RECEIPTED", "DISPATCHED", "TERMINAL", "TRACEABILITY_FAILURE"
}

TRANSITIONS: Dict[str, Dict[str, str]] = {
    "INIT":                  {"parse_ok": "PARSED", "parse_fail": "DENIED"},
    "PARSED":                {"admit": "ADMISSIBLE", "reject": "DENIED", "trace_fail": "TRACEABILITY_FAILURE"},
    "ADMISSIBLE":            {"receipt_ok": "RECEIPTED", "receipt_fail": "TRACEABILITY_FAILURE"},
    "RECEIPTED":             {"dispatch": "DISPATCHED"},
    "DISPATCHED":            {"end": "TERMINAL"},
    "DENIED":                {"end": "TERMINAL"},
    "TRACEABILITY_FAILURE":  {"end": "TERMINAL"},
    "TERMINAL":              {}
}

VERB_CLOSED_SET: Set[str] = {
    "faro", "auditar", "verificar", "validar", "construir",
    "sellar", "registrar", "evaluar", "filtrar", "colapsar", "proyectar"
}

ROLE_CAPABILITIES: Dict[str, Set[str]] = {
    "auditor":  {"auditar", "verificar", "validar", "evaluar", "filtrar", "faro"},
    "operator": {"construir", "registrar", "sellar", "proyectar", "colapsar", "faro"},
    "observer": {"faro", "verificar"},
    "system":   set(VERB_CLOSED_SET)
}

def get_lineage() -> Dict[str, str]:
    return {
        "architect": "Luis Angel Vazquez Martinez",
        "project": "ROMEO-HYDRA",
        "version": "V3.1",
        "doi_concept": "10.5281/zenodo.21744014",
        "doi_core": "10.5281/zenodo.21406719",
        "module": "faro_dfa",
        "formalization": "FORMAL_DFA_V3.1 (agosto 2026) - Traceability as admissibility condition"
    }

class FaroDFA:
    def __init__(self, role: str = "operator"):
        if role not in ROLE_CAPABILITIES:
            raise ValueError(f"Unknown role: {role}")
        self.role = role
        self.capabilities = ROLE_CAPABILITIES[role]
        self.state = "INIT"
        self.history: List[str] = ["INIT"]

    def transition(self, event: str) -> str:
        if self.state not in TRANSITIONS:
            self.state = "DENIED"
            self.history.append(self.state)
            return self.state
        next_state = TRANSITIONS[self.state].get(event)
        if next_state is None:
            self.state = "DENIED"
        else:
            self.state = next_state
        self.history.append(self.state)
        return self.state

def parse(signal: str) -> Tuple[bool, Optional[str], Optional[str], str]:
    if not isinstance(signal, str) or not signal.strip():
        return False, None, None, "empty_signal"
    raw = signal.strip()
    if ".." in raw or raw.startswith("/") or re.search(r"[A-Za-z]:\\", raw):
        return False, None, None, "path_escape_attempt"
    if "::" in raw:
        parts = raw.split("::")
        if len(parts) != 2:
            return False, None, None, "malformed_verb_entity"
        verb, entity = parts[0].strip().lower(), parts[1].strip()
    else:
        verb, entity = raw.lower(), ""
    if verb not in VERB_CLOSED_SET:
        return False, None, None, f"verb_not_in_closed_set:{verb}"
    return True, verb, entity, "ok"

def check_admissibility(verb: str, entity: str, role: str) -> Tuple[bool, str]:
    caps = ROLE_CAPABILITIES.get(role, set())
    if verb not in caps:
        return False, f"capability_denied:{verb}_for_role:{role}"
    if entity and ("/" in entity or "\\" in entity):
        try:
            candidate = (ROOT / entity).resolve()
            if not str(candidate).startswith(str(ROOT)):
                return False, "root_confinement_violation"
        except Exception:
            return False, "path_resolution_error"
    return True, "admissible"

def _load_ledger() -> List[Dict[str, Any]]:
    if not LEDGER_PATH.exists():
        return []
    try:
        with LEDGER_PATH.open("r", encoding="utf-8") as f:
            return [json.loads(line) for line in f if line.strip()]
    except Exception:
        return []

def _append_ledger(entry: Dict[str, Any]) -> None:
    try:
        with LEDGER_PATH.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception:
        pass

def _next_seq_and_prev_hash() -> Tuple[int, str]:
    chain = _load_ledger()
    if not chain:
        return 1, "GENESIS"
    last = chain[-1]
    return last.get("seq", 0) + 1, last.get("receipt", "GENESIS")

def make_receipt(payload: Dict[str, Any], receipt_type: str = "decision") -> Dict[str, Any]:
    seq, prev_hash = _next_seq_and_prev_hash()
    ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    body = {
        "seq": seq,
        "prev_hash": prev_hash,
        "timestamp": ts,
        "receipt_type": receipt_type,
        "payload": payload,
        "lineage": get_lineage()
    }
    canonical = json.dumps(body, sort_keys=True, ensure_ascii=False)
    receipt = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    body["receipt"] = receipt
    _append_ledger(body)
    return body

def proyectar(signal: str, role: str = "operator") -> Dict[str, Any]:
    dfa = FaroDFA(role=role)
    ok, verb, entity, reason = parse(signal)
    if not ok:
        dfa.transition("parse_fail")
        receipt = make_receipt({
            "decision": "deny",
            "reason": reason,
            "failure_class": "PARSE_FAILURE",
            "signal": signal,
            "role": role,
            "dfa_history": dfa.history
        }, receipt_type="failure")
        return {
            "decision": "deny",
            "reason": reason,
            "failure_class": "PARSE_FAILURE",
            "state": dfa.state,
            "receipt": receipt["receipt"],
            "seq": receipt["seq"],
            "prev_hash": receipt["prev_hash"]
        }
    dfa.transition("parse_ok")
    adm_ok, adm_reason = check_admissibility(verb, entity or "", role)
    if not adm_ok:
        dfa.transition("reject")
        receipt = make_receipt({
            "decision": "deny",
            "reason": adm_reason,
            "failure_class": "ADMISSIBILITY_FAILURE",
            "verb": verb,
            "entity": entity,
            "role": role,
            "dfa_history": dfa.history
        }, receipt_type="failure")
        return {
            "decision": "deny",
            "reason": adm_reason,
            "failure_class": "ADMISSIBILITY_FAILURE",
            "state": dfa.state,
            "receipt": receipt["receipt"],
            "seq": receipt["seq"],
            "prev_hash": receipt["prev_hash"]
        }
    dfa.transition("admit")
    dfa.transition("receipt_ok")
    receipt = make_receipt({
        "decision": "allow",
        "verb": verb,
        "entity": entity,
        "role": role,
        "signal": signal,
        "dfa_history": dfa.history,
        "note": "PRE_RECEIPT_VALID + POLICY_VALID + INPUT_VALID"
    }, receipt_type="decision")
    dfa.transition("dispatch")
    dfa.transition("end")
    return {
        "decision": "allow",
        "verb": verb,
        "entity": entity,
        "role": role,
        "state": dfa.state,
        "receipt": receipt["receipt"],
        "seq": receipt["seq"],
        "prev_hash": receipt["prev_hash"],
        "dfa_history": dfa.history
    }

def faro_verb(signal: str, role: str = "operator") -> Dict[str, Any]:
    return proyectar(signal, role=role)
