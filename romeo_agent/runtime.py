"""
Runtime de agente offline.
- No llama OpenAI/Anthropic/ni red.
- Toda acción pasa un gate fail-closed (evidencia + entidad).
- Opcional: enriquecer con pilot scoring si existe.
"""
from __future__ import annotations

import json
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional


def _utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def _sha(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


class AgentRuntime:
    """Agente determinista local. Tools en whitelist."""

    ALLOWED_TOOLS = frozenset({"echo", "hash", "status", "score_demo"})

    def __init__(self, workdir: Optional[str] = None) -> None:
        self.workdir = Path(workdir or ".")
        self.log_path = self.workdir / "pilot" / "output" / "agent_log.jsonl"
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        self.history: List[Dict[str, Any]] = []

    def _gate(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Fail-closed: exige entity.id/type y evidence no vacía."""
        entity = action.get("entity") or {}
        evidence = action.get("evidence") or []
        ont_ok = bool(
            isinstance(entity, dict)
            and str(entity.get("id", "")).strip()
            and str(entity.get("type", "")).strip()
        )
        ev_ok = isinstance(evidence, list) and len(evidence) > 0
        if not ont_ok or not ev_ok:
            return {
                "status": "deny",
                "reason": "ex_ante_failed",
                "ontology_valid": ont_ok,
                "evidence_count": len(evidence) if isinstance(evidence, list) else 0,
            }
        return {"status": "allow", "reason": "ex_ante_passed", "ontology_valid": True}

    def _record(self, event: Dict[str, Any]) -> None:
        event = dict(event)
        event["ts"] = _utc()
        self.history.append(event)
        with self.log_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(event, ensure_ascii=False, sort_keys=True) + "\n")

    def run(self, user_text: str, entity_id: str = "termux", entity_type: str = "session") -> Dict[str, Any]:
        """
        Un turno de agente:
        1) arma acción
        2) gate ex-ante
        3) si allow, ejecuta tool segura
        """
        tool = "echo"
        low = user_text.strip().lower()
        if low.startswith("hash "):
            tool = "hash"
        elif low in ("status", "estado"):
            tool = "status"
        elif low.startswith("score"):
            tool = "score_demo"

        action = {
            "entity": {"id": entity_id, "type": entity_type},
            "evidence": [f"user:{_sha(user_text)[:16]}", f"tool:{tool}"],
            "intent": tool,
            "payload": {"text": user_text},
        }
        gate = self._gate(action)
        if gate["status"] != "allow":
            out = {"status": "deny", "gate": gate, "reply": "Acción rechazada (fail-closed)."}
            self._record(out)
            return out

        reply = self._exec_tool(tool, user_text)
        out = {
            "status": "allow",
            "gate": gate,
            "tool": tool,
            "reply": reply,
            "receipt": _sha(json.dumps(action, sort_keys=True))[:24],
        }
        self._record(out)
        return out

    def _exec_tool(self, tool: str, text: str) -> str:
        if tool not in self.ALLOWED_TOOLS:
            return "tool no permitida"
        if tool == "echo":
            return f"ROMEO agent (offline): {text}"
        if tool == "hash":
            payload = text[5:].strip() or text
            return f"sha256={_sha(payload)}"
        if tool == "status":
            return json.dumps(
                {"agent": "romeo_agent", "offline": True, "events": len(self.history)},
                sort_keys=True,
            )
        if tool == "score_demo":
            # Usa la librería si está; si no, respuesta local
            try:
                # no lanza pilot completo; solo señala integración
                import romeo_hydra  # noqa: F401
                return "score_demo: romeo_hydra import OK (usa pilot.run_scoring_audit para ledger completo)"
            except Exception as e:
                return f"score_demo: librería no importable ({type(e).__name__})"
        return "noop"


def main() -> None:
    agent = AgentRuntime()
    print("ROMEO agent offline — comandos: texto | hash <msg> | status | score | exit")
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
        r = agent.run(line)
        print(json.dumps(r, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
