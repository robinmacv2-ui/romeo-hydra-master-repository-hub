from __future__ import annotations
import hashlib, json, uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Union
from .paths import receipts_candidates

class HydraExAnteGate:
    def __init__(self):
        self._allowed = set()
        self.destructive_markers = ["rm -rf", "rm", "delete_system", "exec_destructivo", "mkfs", "shutdown"]
    def _is_destructive(self, tool: str, args: dict, particula: str) -> bool:
        text = f"{tool} {json.dumps(args)} {particula}".lower()
        return any(m in text for m in self.destructive_markers)
    def evaluate_quantum_card(self, particula: str) -> bool:
        return "delete_system" not in particula and "destructivo" not in particula and "exec_destructivo" not in particula
    def generate_candidate(self, tool: str, args: Dict[str, Any], particula: str) -> Dict[str, Any]:
        cid = str(uuid.uuid4())
        candidate = {
            "id": cid,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "tool": tool,
            "args": args,
            "particula": particula,
            "politica_aplicada": "card_default",
            "capabilities_solicitadas": [particula],
            "args_hash": hashlib.sha256(json.dumps(args, sort_keys=True).encode()).hexdigest()[:16]
        }
        receipts_candidates().mkdir(parents=True, exist_ok=True)
        path = receipts_candidates() / f"{cid}.json"
        path.write_text(json.dumps(candidate, indent=2), encoding="utf-8")
        return candidate
    def intercept_tool_call(self, tool_call: dict) -> Union[Dict, Dict]:
        tool = tool_call.get("tool", "unknown")
        args = tool_call.get("args", {})
        particula = tool_call.get("particula", "unknown")
        if self._is_destructive(tool, args, particula) or not self.evaluate_quantum_card(particula):
            denial = {
                "id": str(uuid.uuid4()),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "reason": "Hydra Gate: accion destructiva bloqueada antes del shell",
                "particula": particula,
                "tool": tool,
                "delivery_authorization": "denied"
            }
            receipts_candidates().mkdir(parents=True, exist_ok=True)
            p = receipts_candidates() / f"denial_{denial['id']}.json"
            p.write_text(json.dumps(denial, indent=2), encoding="utf-8")
            return denial
        candidate = self.generate_candidate(tool, args, particula)
        candidate["delivery_authorization"] = "pending"
        return candidate
    def grant_ephemeral_capability(self, candidate_id: str) -> str:
        token = f"cap:{candidate_id}:{uuid.uuid4().hex[:8]}"
        self._allowed.add(token)
        return token
