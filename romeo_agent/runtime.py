"""Bucle DFA: ESPERANDO -> EJECUTANDO|RECHAZADO -> ESPERANDO."""
import hashlib
import json
import pathlib
import time

from .admissible import is_admissible
from .parser import parse_neutral
from .tools import (
    tool_echo,
    tool_status,
    tool_hash,
    tool_hashfile,
    tool_score,
    tool_audit,
)

ROOT = pathlib.Path(__file__).resolve().parents[1]
LOG_PATH = ROOT / "pilot" / "output" / "agent_log.jsonl"


def _receipt(payload: dict) -> str:
    raw = json.dumps(payload, sort_keys=True, ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()[:16]


def _log(entry: dict) -> None:
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False, sort_keys=True) + "\n")


def _dispatch(parsed: dict) -> dict:
    verb = parsed["verb"]
    entity = parsed.get("entity", "")
    args = parsed.get("args", {}) or {}
    if verb == "echo":
        return tool_echo(args)
    if verb == "status":
        return tool_status()
    if verb == "hash":
        return tool_hash(entity, args)
    if verb == "hashfile":
        return tool_hashfile(entity)
    if verb == "score":
        return tool_score(entity, args)
    if verb == "audit":
        return tool_audit(entity, args)
    return {"error": "verbo admitido sin tool asociada", "tool": None}


def run(line: str) -> dict:
    t0 = time.time()
    parsed = parse_neutral(line)
    admitido, motivo = is_admissible(parsed)

    if not admitido:
        entry = {
            "ts": t0,
            "input": line,
            "parsed": parsed,
            "gate": {"status": "deny", "reason": motivo},
        }
        entry["receipt"] = _receipt(entry)
        _log(entry)
        return entry

    result = _dispatch(parsed)
    entry = {
        "ts": t0,
        "input": line,
        "parsed": parsed,
        "gate": {"status": "allow", "reason": motivo},
        "result": result,
    }
    entry["receipt"] = _receipt(entry)
    _log(entry)
    return entry


def main() -> None:
    print("ROMEO agent offline (DFA)")
    print("Sintaxis: verbo :: ENTIDAD k=v")
    print("Ej: echo :: hola | hash :: secreto | score :: EVAL n=5 | status :: ledger | exit")
    while True:
        try:
            line = input("agent> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if not line:
            continue
        if line.lower() in ("exit", "quit"):
            break
        print(json.dumps(run(line), ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
