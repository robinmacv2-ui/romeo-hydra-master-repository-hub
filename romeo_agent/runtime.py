"""Bucle DFA: ESPERANDO -> EJECUTANDO|RECHAZADO -> ESPERANDO. CLI offline."""
from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import sys
import time

from .admissible import is_admissible, VERBOS_ADMISIBLES
from .parser import parse_neutral
from .tools import (
    tool_echo,
    tool_status,
    tool_help,
    tool_pwd,
    tool_ls,
    tool_cat,
    tool_hash,
    tool_hashfile,
    tool_log,
    tool_verify,
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
    entity = parsed.get("entity", "") or ""
    args = parsed.get("args", {}) or {}

    if verb == "echo":
        return tool_echo(args)
    if verb == "help":
        return tool_help()
    if verb == "pwd":
        return tool_pwd()
    if verb == "status":
        return tool_status()
    if verb == "ls":
        return tool_ls(entity, args)
    if verb == "cat":
        return tool_cat(entity, args)
    if verb == "hash":
        return tool_hash(entity, args)
    if verb == "hashfile":
        return tool_hashfile(entity, args)
    if verb == "log":
        return tool_log(args)
    if verb == "verify":
        return tool_verify(entity, args)
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


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="romeo_agent",
        description="ROMEO agent offline (DFA) — fail-closed, sin red ni APIs",
    )
    parser.add_argument(
        "-c",
        "--command",
        metavar="CMD",
        help='comando único no interactivo, ej: -c "echo :: hola"',
    )
    parser.add_argument(
        "-q",
        "--quiet",
        action="store_true",
        help="solo imprime JSON (sin banner)",
    )
    args = parser.parse_args(argv)

    if args.command is not None:
        out = run(args.command)
        print(json.dumps(out, ensure_ascii=False, sort_keys=True))
        return 0 if out.get("gate", {}).get("status") == "allow" else 2

    if not args.quiet:
        print("ROMEO agent offline (DFA)")
        print("Sintaxis: verbo :: ENTIDAD k=v")
        print("Verbos:", ", ".join(sorted(VERBOS_ADMISIBLES)))
        print("Ej: help :: | ls :: romeo_agent | cat :: README.md | hash :: x | exit")
        print("No interactivo: python -m romeo_agent -c \"echo :: hola\"")

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
    return 0


if __name__ == "__main__":
    sys.exit(main())
