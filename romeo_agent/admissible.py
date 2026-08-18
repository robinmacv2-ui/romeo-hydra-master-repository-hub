"""Gate ex-ante: conjunto admisible C. Fail-closed. O(1)."""
from __future__ import annotations

# Conjunto cerrado C — sin red, sin shell libre, sin APIs externas.
VERBOS_ADMISIBLES = {
    "echo",
    "status",
    "help",
    "pwd",
    "ls",
    "cat",
    "hash",
    "hashfile",
    "log",
    "verify",
    "score",
    "audit",
}

N_MIN, N_MAX = 1, 1000
CAT_MAX_BYTES = 64 * 1024  # 64 KiB techo de lectura


def _path_safe(path: str) -> bool:
    """Rutas relativas dentro de ROOT; rechaza traversal y absolutas."""
    if not path or not isinstance(path, str):
        return False
    p = path.strip()
    if not p:
        return False
    if ".." in p:
        return False
    if p.startswith("/") or p.startswith("~"):
        return False
    if p.startswith("\\") or ":" in p[:3]:
        return False
    return True


def is_admissible(parsed: dict) -> tuple[bool, str]:
    """Predicado total sobre (verb, entity, args). Fail-closed."""
    verb = parsed.get("verb", "") or ""
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

    if verb in ("hashfile", "cat", "ls"):
        path = args.get("path", entity) or "."
        if verb == "ls" and path in ("", "."):
            return True, "ex_ante_passed"
        if not _path_safe(path):
            return False, "path_fuera_de_envolvente_root"
        return True, "ex_ante_passed"

    if verb == "verify":
        receipt = args.get("receipt", entity)
        if not receipt or len(receipt) < 8:
            return False, "receipt_invalido"
        return True, "ex_ante_passed"

    if verb == "log":
        n_raw = str(args.get("n", "10"))
        if not n_raw.isdigit():
            return False, "n_no_numerico"
        n = int(n_raw)
        if not (1 <= n <= 500):
            return False, f"n_fuera_de_rango:{n}"
        return True, "ex_ante_passed"

    if verb in ("echo", "status", "help", "pwd", "hash"):
        return True, "ex_ante_passed"

    return False, "caso_no_contemplado"
