from __future__ import annotations
import uuid, hashlib, json
from datetime import datetime, timezone
from typing import Dict, Any, Union
from .paths import receipts_candidates
from .zettel_integration import create_atomic_note

class DenialReceipt(dict): pass
class Candidate(dict): pass

class HydraExAnteGate:
    DESTRUCTIVE = {"rm", "rmdir", "del", "unlink", "format", "dd", "mkfs"}

    def _hash(self, data: str) -> str:
        return hashlib.sha256(data.encode()).hexdigest()[:16]

    def evaluate_quantum_card(self, particula: str, card: str = "default") -> bool:
        if particula in ("exec_destructivo", "rm", "delete_system"):
            return False
        return True

    def generate_candidate(self, tool: str, args: Dict[str, Any], particula: str) -> Candidate:
        cid = str(uuid.uuid4())
        candidate = Candidate({
            "id": cid,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "particula": particula,
            "tool": tool,
            "args_hash": self._hash(json.dumps(args, sort_keys=True)),
            "politica_aplicada": "card_default",
            "capabilities_solicitadas": [particula]
        })
        path = receipts_candidates() / f"{cid}.json"
        path.write_text(json.dumps(candidate, indent=2), encoding="utf-8")
        create_atomic_note("candidate_created", candidate)
        return candidate

    def intercept_tool_call(self, tool_call: dict) -> Union[Candidate, DenialReceipt]:
        tool = tool_call.get("tool", "")
        args = tool_call.get("args", {})
        particula = tool_call.get("particula", "unknown")

        if any(d in str(args).lower() for d in self.DESTRUCTIVE) or particula == "exec_destructivo":
            denial = DenialReceipt({
                "id": str(uuid.uuid4()),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "reason": "Hydra Gate: acción destructiva bloqueada antes del shell",
                "tool": tool,
                "delivery_authorization": "denied"
            })
            path = receipts_candidates() / f"denial_{denial['id']}.json"
            path.write_text(json.dumps(denial, indent=2), encoding="utf-8")
            create_atomic_note("denial", denial)
            return denial

        if not self.evaluate_quantum_card(particula):
            denial = DenialReceipt({
                "id": str(uuid.uuid4()),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "reason": "Tarjeta Lógica Cuántica rechazó la partícula",
                "delivery_authorization": "denied"
            })
            create_atomic_note("denial_card", denial)
            return denial

        return self.generate_candidate(tool, args, particula)

    def grant_ephemeral_capability(self, candidate_id: str) -> str:
        return f"cap:{self._hash(candidate_id + 'capability')}:{candidate_id}"
