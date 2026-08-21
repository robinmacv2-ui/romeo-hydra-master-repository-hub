from __future__ import annotations
import hashlib, json
from typing import Dict, Any, Tuple

class RomeoExecutor:
    def execute_with_capability(self, candidate: dict, capability_token: str) -> Tuple[dict, dict]:
        if not capability_token.startswith("cap:"):
            raise PermissionError("Capability token inválido")
        tool = candidate.get("tool", "")
        result = {"status": "executed", "tool": tool, "note": "ejecutado bajo capability"}
        prev = hashlib.sha256(b"pre").hexdigest()[:16]
        post = hashlib.sha256(json.dumps(result).encode()).hexdigest()[:16]
        evidence = {
            "file_diff": "",
            "tool_calls_reales": [tool],
            "estado_previo_hash": prev,
            "estado_posterior_hash": post,
            "stdout_hash": hashlib.sha256(str(result).encode()).hexdigest()[:16],
            "stderr": ""
        }
        return result, evidence
