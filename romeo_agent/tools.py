"""Tools solo tras is_admissible(). Stdlib only. Sin red / sin APIs."""
from __future__ import annotations

import hashlib
import json
import os
import pathlib
import subprocess
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1]
LOG_PATH = ROOT / "pilot" / "output" / "agent_log.jsonl"
CAT_MAX_BYTES = 64 * 1024


def _resolve_under_root(rel: str) -> pathlib.Path | None:
    try:
        p = (ROOT / rel).resolve()
        p.relative_to(ROOT.resolve())
        return p
    except (ValueError, OSError):
        return None


def tool_echo(args: dict) -> dict:
    return {"reply": args.get("text", ""), "tool": "echo"}


def tool_help() -> dict:
    return {
        "tool": "help",
        "syntax": "verbo :: ENTIDAD k=v",
        "verbs": {
            "echo": "eco de texto",
            "help": "esta ayuda",
            "pwd": "raíz del hub (ROOT)",
            "status": "estado del log del agente",
            "ls": "listar directorio bajo ROOT (ls :: path)",
            "cat": "leer archivo <=64KiB (cat :: path)",
            "hash": "sha256 de texto (hash :: texto)",
            "hashfile": "sha256 de archivo (hashfile :: path)",
            "log": "últimas N líneas del log (log :: n=10)",
            "verify": "buscar receipt en log (verify :: <hex>)",
            "score": "scoring offline pilot (score :: ENTITY n=5)",
            "audit": "auditoría offline (audit :: ENTITY n=7)",
        },
        "policy": "fail-closed · offline · sin red · sin shell libre",
    }


def tool_pwd() -> dict:
    return {"root": str(ROOT), "cwd": os.getcwd(), "tool": "pwd"}


def tool_status() -> dict:
    if not LOG_PATH.exists():
        return {"log_exists": False, "lines": 0, "path": str(LOG_PATH.relative_to(ROOT)), "tool": "status"}
    lines = LOG_PATH.read_text(encoding="utf-8").splitlines()
    return {
        "log_exists": True,
        "lines": len(lines),
        "path": str(LOG_PATH.relative_to(ROOT)),
        "tool": "status",
    }


def tool_ls(entity: str, args: dict) -> dict:
    rel = args.get("path", entity) or "."
    p = _resolve_under_root(rel)
    if p is None:
        return {"error": "path fuera de ROOT", "tool": "ls"}
    if not p.exists():
        return {"error": f"no existe: {rel}", "tool": "ls"}
    if not p.is_dir():
        return {"error": f"no es directorio: {rel}", "tool": "ls"}
    entries = []
    try:
        for child in sorted(p.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower())):
            try:
                st = child.stat()
                entries.append(
                    {
                        "name": child.name,
                        "type": "dir" if child.is_dir() else "file",
                        "bytes": st.st_size if child.is_file() else None,
                    }
                )
            except OSError:
                entries.append({"name": child.name, "type": "?", "bytes": None})
    except OSError as e:
        return {"error": str(e), "tool": "ls"}
    return {"path": rel, "count": len(entries), "entries": entries[:200], "tool": "ls"}


def tool_cat(entity: str, args: dict) -> dict:
    rel = args.get("path", entity) or ""
    p = _resolve_under_root(rel)
    if p is None:
        return {"error": "path fuera de ROOT", "tool": "cat"}
    if not p.exists() or not p.is_file():
        return {"error": f"no es archivo: {rel}", "tool": "cat"}
    size = p.stat().st_size
    if size > CAT_MAX_BYTES:
        return {
            "error": f"archivo > {CAT_MAX_BYTES} bytes; usa hashfile",
            "bytes": size,
            "tool": "cat",
        }
    data = p.read_bytes()
    try:
        text = data.decode("utf-8")
        return {"path": rel, "bytes": size, "content": text, "encoding": "utf-8", "tool": "cat"}
    except UnicodeDecodeError:
        return {
            "path": rel,
            "bytes": size,
            "content_b64_prefix": __import__("base64").b64encode(data[:512]).decode("ascii"),
            "encoding": "binary",
            "tool": "cat",
            "note": "binario; solo prefijo b64 512B",
        }


def tool_hash(entity: str, args: dict) -> dict:
    text = entity
    if args:
        text = entity + " " + " ".join(f"{k}={v}" for k, v in args.items())
    text = text.strip()
    if not text:
        return {"error": "texto vacio", "tool": "hash"}
    h = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return {"sha256": h, "tool": "hash"}


def tool_hashfile(entity: str, args: dict | None = None) -> dict:
    args = args or {}
    rel = args.get("path", entity) or ""
    p = _resolve_under_root(rel)
    if p is None:
        return {"error": "path fuera de ROOT, rechazado", "tool": "hashfile"}
    if not p.exists() or not p.is_file():
        return {"error": f"no existe: {rel}", "tool": "hashfile"}
    h = hashlib.sha256(p.read_bytes()).hexdigest()
    return {"path": rel, "sha256": h, "bytes": p.stat().st_size, "tool": "hashfile"}


def tool_log(args: dict) -> dict:
    n = int(args.get("n", "10"))
    if not LOG_PATH.exists():
        return {"lines": [], "count": 0, "tool": "log"}
    rows = LOG_PATH.read_text(encoding="utf-8").splitlines()
    tail = rows[-n:]
    parsed = []
    for line in tail:
        try:
            parsed.append(json.loads(line))
        except json.JSONDecodeError:
            parsed.append({"raw": line})
    return {"count": len(parsed), "lines": parsed, "tool": "log"}


def tool_verify(entity: str, args: dict) -> dict:
    receipt = args.get("receipt", entity) or ""
    if not LOG_PATH.exists():
        return {"found": False, "receipt": receipt, "tool": "verify"}
    matches = []
    for line in LOG_PATH.read_text(encoding="utf-8").splitlines():
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        if obj.get("receipt") == receipt or str(obj.get("receipt", "")).startswith(receipt):
            matches.append(obj)
    return {
        "found": bool(matches),
        "receipt": receipt,
        "matches": matches[:20],
        "tool": "verify",
    }


def tool_score(entity: str, args: dict) -> dict:
    n = int(args.get("n", 5))
    cmd = ["python3", "-m", "pilot.run_scoring_audit", "--entity", entity, "--n", str(n)]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, cwd=str(ROOT), timeout=120)
    except subprocess.TimeoutExpired:
        return {"error": "timeout", "cmd": " ".join(cmd), "tool": "score"}
    except FileNotFoundError:
        return {"error": "python3/pilot no encontrado", "tool": "score"}

    out_files = sorted((ROOT / "pilot" / "output").glob(f"scoring_{entity}_{n}.json"))
    if not out_files:
        return {
            "cmd": " ".join(cmd),
            "stdout_tail": (r.stdout or "")[-500:],
            "stderr_tail": (r.stderr or "")[-300:],
            "error": "sin archivo de salida",
            "tool": "score",
        }
    latest = out_files[-1]
    try:
        data = json.loads(latest.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        return {"error": f"json invalido: {e}", "output": str(latest), "tool": "score"}
    return {"cmd": " ".join(cmd), "output": str(latest.relative_to(ROOT)), "parsed": data, "tool": "score"}


def tool_audit(entity: str, args: dict) -> dict:
    n = int(args.get("n", 7))
    cmd = ["python3", "-m", "pilot.run_offline_audit", "--days", str(n), "--entity", entity]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, cwd=str(ROOT), timeout=120)
    except subprocess.TimeoutExpired:
        return {"error": "timeout", "cmd": " ".join(cmd), "tool": "audit"}
    except FileNotFoundError:
        return {"error": "pilot no encontrado", "tool": "audit"}
    return {
        "cmd": " ".join(cmd),
        "stdout_tail": (r.stdout or "")[-500:],
        "returncode": r.returncode,
        "tool": "audit",
    }
