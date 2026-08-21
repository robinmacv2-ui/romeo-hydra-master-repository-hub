# -*- coding: utf-8 -*-
"""
ROMEO-HYDRA Gateway / Control Plane
===================================
Adaptador central que recibe la salida de cualquier LLM,
la valida con Kernel Sigma y, si aprueba, la sella en el Delta Ledger.

REGLA CERO: esto NO es un LLM. Es infraestructura de gobernanza.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional
import hashlib
import json
import time

from romeo_hydra.genesis import assert_genesis_or_die, GENESIS_HASH


@dataclass
class ValidationResult:
    approved: bool
    reason: str
    entropy_score: float
    timestamp: float
    input_hash: str


class RomeoGateway:
    """
    Control Plane: punto de entrada obligatorio para cualquier
    propuesta proveniente de un modelo de lenguaje externo.
    """

    def __init__(self, max_entropy: float = 0.85):
        # Verificación de ancla génesis al arrancar (fail-closed)
        assert_genesis_or_die()
        self.max_entropy = max_entropy
        self._pending: list[dict[str, Any]] = []

    def _hash_payload(self, payload: Any) -> str:
        raw = json.dumps(payload, sort_keys=True, default=str).encode("utf-8")
        return hashlib.sha256(raw).hexdigest()

    def _estimate_entropy(self, text: str) -> float:
        """
        Estimación simple de entropía (placeholder).
        En producción se sustituye por la métrica real del Kernel Sigma.
        Valor entre 0.0 (muy ordenado) y 1.0 (ruido puro).
        """
        if not text or len(text) < 10:
            return 0.0
        # Heurística básica: diversidad de caracteres / longitud
        unique = len(set(text.lower()))
        return min(1.0, unique / max(len(text) * 0.15, 1))

    def validate_llm_output(self, llm_output: str, context: Optional[dict] = None) -> ValidationResult:
        """
        Gobernanza ex-ante: evalúa la propuesta del LLM ANTES de cualquier ejecución.
        """
        entropy = self._estimate_entropy(llm_output)
        input_hash = self._hash_payload({"output": llm_output, "context": context or {}})

        if entropy > self.max_entropy:
            return ValidationResult(
                approved=False,
                reason=f"Entropía excesiva ({entropy:.3f} > {self.max_entropy}). Rechazado por Kernel Sigma.",
                entropy_score=entropy,
                timestamp=time.time(),
                input_hash=input_hash,
            )

        # Aquí se conectaría la evaluación real del Kernel Sigma
        # (estabilidad, invariantes, límites de acción, etc.)

        return ValidationResult(
            approved=True,
            reason="Aprobado por gobernanza ex-ante",
            entropy_score=entropy,
            timestamp=time.time(),
            input_hash=input_hash,
        )

    def process(self, llm_output: str, context: Optional[dict] = None) -> dict[str, Any]:
        """
        Flujo completo:
        1. Validar con Kernel Sigma (ex-ante)
        2. Si aprueba -> sellar en ledger (PENDING -> COMMITTED)
        3. Devolver decisión + evidencia
        """
        result = self.validate_llm_output(llm_output, context)

        record = {
            "status": "APPROVED" if result.approved else "REJECTED",
            "reason": result.reason,
            "entropy_score": result.entropy_score,
            "input_hash": result.input_hash,
            "genesis_root": GENESIS_HASH,
            "timestamp": result.timestamp,
            "llm_output_preview": llm_output[:200] + ("..." if len(llm_output) > 200 else ""),
        }

        if result.approved:
            # En una implementación completa aquí se llama a AtomicLedgerWriter
            # con transición PENDING -> fsync -> COMMITTED
            record["ledger_action"] = "SEALED_OFFLINE"
        else:
            record["ledger_action"] = "REJECTED_NO_SEAL"

        return record


def create_gateway(max_entropy: float = 0.85) -> RomeoGateway:
    """Factory simple para el Control Plane."""
    return RomeoGateway(max_entropy=max_entropy)
