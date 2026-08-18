"""Gate ex-ante: conjunto admisible C. Fail-closed. O(1)."""
from __future__ import annotations

VERBOS_ADMISIBLES = {"score", "audit", "hash", "hashfile", "status", "echo"}
N_MIN, N_MAX = 1, 1000


def is_admissible(parsed: dict) -> tuple[bool, str]:
    """delta: predicado total sobre (verb, entity, args)."""
    verb = parsed.get("verb", "")
    entity = parsed.get("entity", "") or ""
    args = parsed.get("args", {}) or {}

    if verb not in VERBOS_ADMISIBLES:
        return False, f"verbo_no_admisible:{verb}"

    if verb in ("score", "audit"):
        n_raw = str(args.get("n", "5"))
        if not n_raw.isdigit():
            return False, "n_no_numerico"
        n = int(n_raw)
        if not (N_MIN <= n <= N_MAX):
            return False, f"n_fuera_de_rango:{n}"
        if not entity.isalnum():
            return False, "entity_no_alfanumerica"
        return True, "ex_ante_passed"

    if verb == "hashfile":
        path = args.get("path", entity)
        if not path or ".." in path or path.startswith("/") or path.startswith("\~"):
            return False, "path_fuera_de_envolvente_root"
        return True, "ex_ante_passed"

    if verb in ("hash", "status", "echo"):
        return True, "ex_ante_passed"

    return False, "caso_no_contemplado"
