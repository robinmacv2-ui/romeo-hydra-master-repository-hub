#!/usr/bin/env python3
"""
Simulador de un sistema externo que quiere acoplarse a la Hidra
usando el protocolo TCP-Hydra.
"""

from __future__ import annotations
import time
import hashlib
import random
from tcp_hydra_protocol import ThermoPacket, evaluate_packet, load_federation_state

def crear_paquete(node_id: str, friction: float, entropy: float, conduction: float, intent: str = "report") -> ThermoPacket:
    payload = f"{node_id}:{friction}:{entropy}:{conduction}"
    payload_hash = hashlib.sha256(payload.encode()).hexdigest()[:16]
    return ThermoPacket(
        node_id=node_id,
        timestamp=time.time(),
        friction=friction,
        entropy=entropy,
        conduction=conduction,
        bias_local=round(random.uniform(0.05, 0.25), 4),
        intent=intent,
        payload_hash=payload_hash,
        signature="demo-signature"
    )

def main():
    print("[NODO EXTERNO] Intentando acoplarse al bus neuronal de la Hidra...\n")

    state = load_federation_state()
    print(f"[FEDERACION] Bias global actual: {state.get('global_bias', 0.12)}")
    print(f"[FEDERACION] Presupuesto de entropia: {state.get('entropy_budget', 1.0):.4f}")
    print(f"[FEDERACION] Nodos de confianza: {len(state.get('trusted_nodes', []))}")
    print(f"[FEDERACION] Nodos aislados: {len(state.get('isolated_nodes', []))}\n")

    # Caso 1: Nodo saludable
    print("--- Caso 1: Nodo en buena salud ---")
    pkt1 = crear_paquete("agent-alpha-01", friction=0.22, entropy=0.18, conduction=0.71)
    edict1 = evaluate_packet(pkt1, state)
    print(f"  Status     : {edict1.status}")
    print(f"  Accion     : {edict1.recommended_action}")
    print(f"  Audit ID   : {edict1.audit_id}")
    print(f"  Bias adj   : {edict1.global_bias_adjustment}")
    print(f"  Entropia   : {edict1.entropy_budget_remaining}\n")

    # Caso 2: Nodo con estres moderado
    print("--- Caso 2: Nodo con estres ---")
    pkt2 = crear_paquete("agent-beta-07", friction=0.51, entropy=0.44, conduction=0.38)
    edict2 = evaluate_packet(pkt2, state)
    print(f"  Status     : {edict2.status}")
    print(f"  Accion     : {edict2.recommended_action}")
    print(f"  Audit ID   : {edict2.audit_id}")
    print(f"  Bias adj   : {edict2.global_bias_adjustment}\n")

    # Caso 3: Nodo caotico (debe ser aislado)
    print("--- Caso 3: Nodo caotico ---")
    pkt3 = crear_paquete("agent-gamma-99", friction=0.88, entropy=0.79, conduction=0.19)
    edict3 = evaluate_packet(pkt3, state)
    print(f"  Status     : {edict3.status}")
    print(f"  Accion     : {edict3.recommended_action}")
    print(f"  Audit ID   : {edict3.audit_id}\n")

    print("[NODO EXTERNO] Secuencia de acoplamiento finalizada.")
    print("Revisa tcp_hydra_audit.jsonl y federacion_estado.json para el registro completo.")

if __name__ == "__main__":
    main()
