#!/usr/bin/env python3
"""
ROMEO-HYDRA — TCP-Hydra Protocol
Protocolo de Acoplamiento Termodinamico-Convexo
"""

from __future__ import annotations
import json
import time
import hashlib
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, Optional, Literal

# Rutas de estado del protocolo
AUDIT_LOG = Path("tcp_hydra_audit.jsonl")
FEDERATION_STATE = Path("federacion_estado.json")

Status = Literal["accept", "mutate", "isolate", "defer"]

@dataclass
class ThermoPacket:
    """Paquete de estado termodinamico que debe enviar cualquier nodo externo."""
    node_id: str
    timestamp: float
    friction: float          # 0.0 - 1.0
    entropy: float           # 0.0 - 1.0
    conduction: float        # 0.0 - 1.0
    bias_local: float
    intent: str              # "propose" | "report" | "request"
    payload_hash: str
    signature: str = ""      # opcional por ahora

    def is_valid(self) -> bool:
        if not (0.0 <= self.friction <= 1.0):
            return False
        if not (0.0 <= self.entropy <= 1.0):
            return False
        if not (0.0 <= self.conduction <= 1.0):
            return False
        if self.intent not in ("propose", "report", "request"):
            return False
        if not self.node_id or not self.payload_hash:
            return False
        return True


@dataclass
class GovernanceEdict:
    """Respuesta de gobernanza que emite la Hidra."""
    status: Status
    global_bias_adjustment: float
    recommended_action: str
    entropy_budget_remaining: float
    audit_id: str
    timestamp: float


def compute_audit_id(packet: ThermoPacket, status: str) -> str:
    raw = f"{packet.node_id}:{packet.timestamp}:{status}:{packet.friction}:{packet.entropy}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def load_federation_state() -> Dict:
    if FEDERATION_STATE.exists():
        try:
            return json.loads(FEDERATION_STATE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {
        "global_bias": 0.12,
        "entropy_budget": 1.0,
        "isolated_nodes": [],
        "trusted_nodes": [],
        "total_events": 0
    }


def save_federation_state(state: Dict) -> None:
    FEDERATION_STATE.write_text(json.dumps(state, indent=2, ensure_ascii=True), encoding="utf-8")


def append_audit(event: Dict) -> None:
    with open(AUDIT_LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(event, ensure_ascii=True) + "\n")


def evaluate_packet(packet: ThermoPacket, state: Dict) -> GovernanceEdict:
    """
    Nucleo de decision del protocolo.
    Decide: accept | mutate | isolate | defer
    segun friccion, entropia y conduccion.
    """
    if not packet.is_valid():
        return GovernanceEdict(
            status="isolate",
            global_bias_adjustment=0.0,
            recommended_action="Paquete invalido. Nodo aislado.",
            entropy_budget_remaining=state["entropy_budget"],
            audit_id=compute_audit_id(packet, "isolate"),
            timestamp=time.time()
        )

    # Nodo ya aislado
    if packet.node_id in state.get("isolated_nodes", []):
        return GovernanceEdict(
            status="isolate",
            global_bias_adjustment=0.0,
            recommended_action="Nodo previamente aislado. Acceso denegado.",
            entropy_budget_remaining=state["entropy_budget"],
            audit_id=compute_audit_id(packet, "isolate"),
            timestamp=time.time()
        )

    friction = packet.friction
    entropy = packet.entropy
    conduction = packet.conduction

    # Reglas termodinamicas-convexas
    if friction > 0.75 or entropy > 0.70:
        # Demasiado caos → aislamiento
        status = "isolate"
        action = "Friccion/Entropia critica. Nodo desacoplado para proteger la federacion."
        bias_adj = 0.0
        state["isolated_nodes"].append(packet.node_id)

    elif friction > 0.45 or entropy > 0.48 or conduction < 0.40:
        # Zona de estres → mutacion preventiva
        status = "mutate"
        action = "Estres detectado. Se recomienda ajuste de bias local y reduccion de carga."
        bias_adj = -0.025 if conduction < 0.5 else 0.015

    elif conduction >= 0.62 and friction < 0.35 and entropy < 0.35:
        # Zona optima → aceptacion
        status = "accept"
        action = "Nodo en resonancia convexa. Acoplamiento aceptado."
        bias_adj = 0.0
        if packet.node_id not in state.get("trusted_nodes", []):
            state["trusted_nodes"].append(packet.node_id)

    else:
        # Zona intermedia → defer
        status = "defer"
        action = "Estado intermedio. Se solicita mas informacion o espera."
        bias_adj = 0.0

    # Actualizar presupuesto de entropia (simple)
    state["entropy_budget"] = max(0.0, state["entropy_budget"] - entropy * 0.08)
    state["total_events"] = state.get("total_events", 0) + 1
    state["global_bias"] = round(state.get("global_bias", 0.12) + bias_adj, 5)

    audit_id = compute_audit_id(packet, status)

    edict = GovernanceEdict(
        status=status,
        global_bias_adjustment=bias_adj,
        recommended_action=action,
        entropy_budget_remaining=round(state["entropy_budget"], 4),
        audit_id=audit_id,
        timestamp=time.time()
    )

    # Registrar auditoria
    append_audit({
        "audit_id": audit_id,
        "node_id": packet.node_id,
        "status": status,
        "friction": friction,
        "entropy": entropy,
        "conduction": conduction,
        "bias_adjustment": bias_adj,
        "ts": edict.timestamp
    })

    save_federation_state(state)
    return edict
