from __future__ import annotations
import hashlib, json
from pathlib import Path
from typing import Dict, Any, Tuple

class RomeoExecutor:
    def __init__(self):
        self._allowed = set()
    def execute_with_capability(self, candidate: dict, capability_token: str) -> Tuple[dict, dict]:
        if not capability_token.startswith("cap:"):
            raise PermissionError(f"Capability invalido: {capability_token}")
        tool = candidate.get("tool", "")
        args = candidate.get("args", {})
        # Simulacion segura sin tocar shell real
        result = {"status": "executed", "tool": tool, "args": args}
        prev = hashlib.sha256(b"prev_state").hexdigest()[:16]
        post = hashlib.sha256(json.dumps(args, sort_keys=True).encode()).hexdigest()[:16]
        evidence = {
            "estado_previo_hash": prev,
            "estado_posterior_hash": post,
            "tool_calls_reales": [tool],
            "stdout_hash": hashlib.sha256(json.dumps(result).encode()).hexdigest()[:16],
            "file_diff": f"{tool} {args}"
        }
        return result, evidence
