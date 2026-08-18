"""Tools solo tras is_admissible(). Defensa en profundidad."""
import hashlib
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]


def tool_echo(args: dict) -> dict:
    return {"reply": args.get("text", ""), "tool": "echo"}


def tool_status() -> dict:
    logs = ROOT / "pilot" / "output" / "agent_log.jsonl"
    if not logs.exists():
        return {"log_exists": False, "lines": 0, "tool": "status"}
    return {
        "log_exists": True,
        "lines": len(logs.read_text().splitlines()),
        "tool": "status",
    }


def tool_hash(entity: str, args: dict) -> dict:
    text = entity
    if args:
        text = entity + " " + " ".join(f"{k}={v}" for k, v in args.items())
    text = text.strip()
    if not text:
        return {"error": "texto vacio", "tool": "hash"}
    h = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return {"reply": f"sha256={h}", "tool": "hash"}


def tool_hashfile(path: str) -> dict:
    p = (ROOT / path).resolve()
    try:
        p.relative_to(ROOT)
    except ValueError:
        return {"error": "path fuera de ROOT, rechazado", "tool": "hashfile"}
    if not p.exists():
        return {"error": f"no existe: {path}", "tool": "hashfile"}
    h = hashlib.sha256(p.read_bytes()).hexdigest()
    return {"path": path, "sha256": h, "bytes": p.stat().st_size, "tool": "hashfile"}


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
        data = json.loads(latest.read_text())
    except json.JSONDecodeError as e:
        return {"error": f"json invalido: {e}", "output": str(latest), "tool": "score"}
    return {"cmd": " ".join(cmd), "output": str(latest), "parsed": data, "tool": "score"}


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
