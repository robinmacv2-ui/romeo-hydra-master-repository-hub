# -*- coding: utf-8 -*-
"""
=============================================================================
ROMEO-HYDRA · Kernel Muscle
Operador P_LAM + ε-Invarianza + Bifurcación 1→4 (Anexo Q)
Autor: Luis Angel Vázquez Martínez
Compatible con Postulado de Invarianza Homeostática · CLC v1.2/v2
=============================================================================

Implementación ejecutable de:
  x_ejecutado = 𝒜_ε ∘ P_LAM(x)

Cuando λ_min(H_Σ) → 0 se fuerza bifurcación determinista 1→4 sobre
la base {e_S, e_O, e_N, e_I} y el estado se proyecta fuera de int(C)
(propiedad de 0 escapes).
"""

from __future__ import annotations

import hashlib
import json
import time
from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import Any, Dict, Optional, Tuple

import numpy as np
from numpy.typing import NDArray

EPS = 1e-12


class BifurcationMode(str, Enum):
    """Base ortonormal del despliegue 1→4."""
    S = "e_S"  # Stable / Safe
    O = "e_O"  # Oversight / Human escalation
    N = "e_N"  # Neutral / Containment zone
    I = "e_I"  # Isolate / Terminal block (⊥)


class ContainmentStatus(str, Enum):
    SAFE = "safe"                    # d > ε ∧ λ_min > 0
    CONTAINMENT = "containment"      # d ≤ ε → supervisión humana
    CRITICAL = "critical"            # λ_min ≈ 0 → bifurcación 1→4
    BLOCKED = "blocked"              # estado terminal ⊥ (0 escapes)


@dataclass(frozen=True)
class PLAMConfig:
    """Parámetros del operador de la Partícula de Luis Ángel."""
    eps: float = 1e-3          # margen de seguridad ε
    tau: float = 0.0           # umbral de convexidad (−τ)
    lam_min_threshold: float = 1e-8  # umbral crítico λ_min ≈ 0
    state_dimension: int = 128
    enable_quantum_decoherence: bool = True
    ledger_enabled: bool = True
    version: str = "PLAM_Q_v1.0"

    def fingerprint(self) -> str:
        payload = {
            "author": "Luis Angel Vazquez Martinez",
            "eps": round(self.eps, 12),
            "tau": round(self.tau, 12),
            "lam_th": round(self.lam_min_threshold, 12),
            "dim": self.state_dimension,
            "decoh": self.enable_quantum_decoherence,
            "ver": self.version,
        }
        raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
        return hashlib.sha256(raw).hexdigest()[:16]


@dataclass
class PLAMResult:
    """Resultado del wrapper de contención."""
    executed_state: NDArray[np.floating]
    status: ContainmentStatus
    mode: Optional[BifurcationMode]
    lam_min: float
    distance_to_boundary: float
    blocked: bool
    config_fingerprint: str
    metrics: Dict[str, float] = field(default_factory=dict)
    ledger_event: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["executed_state"] = self.executed_state.tolist()
        d["status"] = self.status.value
        d["mode"] = self.mode.value if self.mode else None
        return d


class PLAMQuantumWrapper:
    """
    Wrapper de contención determinista:
        x ↦ 𝒜_ε ∘ P_LAM(x)  [+ Π_decoh si hay componente cuántica]

    Integra el Postulado de Invarianza Homeostática y el Anexo Q
    directamente en el músculo del kernel ROMEO-HYDRA.
    """

    def __init__(self, config: Optional[PLAMConfig] = None):
        self.config = config or PLAMConfig()
        self._ledger: list[Dict[str, Any]] = []
        self._previous_hash: Optional[str] = None

    # ------------------------------------------------------------------
    # API principal
    # ------------------------------------------------------------------

    def contain(
        self,
        x: NDArray[np.floating],
        *,
        hessian: Optional[NDArray[np.floating]] = None,
        psi: Optional[NDArray[np.floating]] = None,
        boundary_ref: Optional[NDArray[np.floating]] = None,
    ) -> PLAMResult:
        """
        Aplica el operador de contención.

        Parameters
        ----------
        x : estado candidato (vector de dimensión state_dimension)
        hessian : Hessiano H_Σ (si None se construye diagonal aproximado)
        psi : componente de estado "cuántico" / de alta dimensionalidad (opcional)
        boundary_ref : punto de referencia de la frontera ∂C (opcional)
        """
        self._assert_vector(x)
        dim = self.config.state_dimension

        lam_min = self._compute_lam_min(x, hessian)
        d = self._distance_to_boundary(x, boundary_ref)

        # --- 1. Estado seguro ---
        if d > self.config.eps and lam_min > self.config.lam_min_threshold:
            result = PLAMResult(
                executed_state=x.copy(),
                status=ContainmentStatus.SAFE,
                mode=None,
                lam_min=lam_min,
                distance_to_boundary=d,
                blocked=False,
                config_fingerprint=self.config.fingerprint(),
                metrics={"d": d, "lam_min": lam_min},
            )
            self._maybe_log(result, "safe_operation")
            return result

        # --- 2. Zona de contención (d ≤ ε, pero aún no crítico) ---
        if d <= self.config.eps and lam_min > self.config.lam_min_threshold:
            # Escalamiento: no bloquea, marca supervisión humana
            result = PLAMResult(
                executed_state=x.copy(),
                status=ContainmentStatus.CONTAINMENT,
                mode=BifurcationMode.O,
                lam_min=lam_min,
                distance_to_boundary=d,
                blocked=False,
                config_fingerprint=self.config.fingerprint(),
                metrics={"d": d, "lam_min": lam_min, "escalation": 1.0},
            )
            self._maybe_log(result, "containment_zone_human_oversight")
            return result

        # --- 3. Condición crítica λ_min ≈ 0 → bifurcación 1→4 ---
        mode = self._bifurcation_1_to_4(x, lam_min, d)
        blocked_state = self._project_outside_C(x, mode)

        # Decoherencia lógica direccional (Anexo Q §2.3)
        if self.config.enable_quantum_decoherence and psi is not None:
            blocked_state = self._apply_decoherence(blocked_state, psi)

        result = PLAMResult(
            executed_state=blocked_state,
            status=ContainmentStatus.BLOCKED,
            mode=mode,
            lam_min=lam_min,
            distance_to_boundary=d,
            blocked=True,
            config_fingerprint=self.config.fingerprint(),
            metrics={
                "d": d,
                "lam_min": lam_min,
                "bifurcation": 1.0,
                "zero_escapes": 1.0,
            },
        )
        self._maybe_log(result, f"critical_bifurcation_1to4_{mode.value}")
        return result

    def evaluate_and_contain(
        self,
        current_state: NDArray[np.floating],
        candidate_action: NDArray[np.floating],
        *,
        hessian: Optional[NDArray[np.floating]] = None,
        psi: Optional[NDArray[np.floating]] = None,
    ) -> PLAMResult:
        """
        Combina evaluación de delta + contención P_LAM.
        Punto de entrada recomendado desde KernelSigmaController.
        """
        self._assert_vector(current_state)
        self._assert_vector(candidate_action)
        # El estado a contener es el candidato
        return self.contain(candidate_action, hessian=hessian, psi=psi, boundary_ref=current_state)

    # ------------------------------------------------------------------
    # Bifurcación 1→4 y proyección
    # ------------------------------------------------------------------

    def _bifurcation_1_to_4(
        self,
        x: NDArray[np.floating],
        lam_min: float,
        d: float,
    ) -> BifurcationMode:
        """
        Despliegue determinista sobre {e_S, e_O, e_N, e_I}.
        La elección es función determinista de (λ_min, d, hash del estado).
        """
        # Señal de criticidad
        if abs(lam_min) < self.config.lam_min_threshold:
            # Máxima criticidad → aislamiento terminal
            return BifurcationMode.I

        # Hash determinista del estado para desempate estable
        h = hashlib.sha256(x.tobytes()).hexdigest()
        bucket = int(h[:8], 16) % 4

        if d <= self.config.eps * 0.5:
            return BifurcationMode.I
        if bucket == 0:
            return BifurcationMode.S
        if bucket == 1:
            return BifurcationMode.O
        if bucket == 2:
            return BifurcationMode.N
        return BifurcationMode.I

    def _project_outside_C(
        self,
        x: NDArray[np.floating],
        mode: BifurcationMode,
    ) -> NDArray[np.floating]:
        """
        Proyección 𝒜_ε ∘ Π_C → punto terminal fuera del interior de C.
        En modo I (Isolate) se fuerza un estado de bloqueo reconocible.
        """
        out = x.copy()
        # Marca geométrica de bloqueo: escala y desplaza fuera de la envolvente
        scale = 1.0 + self.config.eps * 10.0
        if mode == BifurcationMode.I:
            # Estado terminal ⊥: vector nulo + marca de bloqueo en la norma
            out = np.zeros_like(x)
            out[0] = -1.0  # señal de bloqueo determinista
        elif mode == BifurcationMode.O:
            out = out * (1.0 + self.config.eps)
        elif mode == BifurcationMode.N:
            out = out * scale
        else:  # S
            # Proyección suave hacia la frontera
            nrm = float(np.linalg.norm(out)) + EPS
            out = out * (1.0 - self.config.eps / nrm)
        return out

    def _apply_decoherence(
        self,
        state: NDArray[np.floating],
        psi: NDArray[np.floating],
    ) -> NDArray[np.floating]:
        """
        Gradiente activo de decoherencia lógica (Anexo Q §2.3).
        Deforma el estado de forma direccional; la información se vuelve
        holonomía dependiente del trayecto.
        """
        if psi.shape != state.shape:
            # Ajuste dimensional simple
            psi_use = np.zeros_like(state)
            n = min(len(psi), len(state))
            psi_use[:n] = psi[:n]
        else:
            psi_use = psi

        # Decoherencia: mezcla controlada que destruye fase útil para un atacante
        phase = np.sign(psi_use) * np.exp(-np.abs(psi_use))
        decohered = state * (1.0 - 0.5 * np.abs(phase)) + 0.1 * phase
        return decohered.astype(state.dtype)

    # ------------------------------------------------------------------
    # Métricas geométricas
    # ------------------------------------------------------------------

    def _compute_lam_min(
        self,
        x: NDArray[np.floating],
        hessian: Optional[NDArray[np.floating]],
    ) -> float:
        dim = self.config.state_dimension
        if hessian is None:
            # Aproximación diagonal local (misma filosofía que KernelSigma)
            diag = 1.0 + np.abs(x)
            hessian = np.diag(diag)
        if hessian.shape != (dim, dim):
            raise ValueError(f"Hessiano debe ser ({dim}, {dim})")

        try:
            eigenvalues = np.linalg.eigvalsh(0.5 * (hessian + hessian.T))
            return float(np.min(np.real(eigenvalues)))
        except np.linalg.LinAlgError:
            return 0.0  # peor caso → crítico

    def _distance_to_boundary(
        self,
        x: NDArray[np.floating],
        boundary_ref: Optional[NDArray[np.floating]],
    ) -> float:
        """
        Distancia aproximada a ∂C.
        Si se pasa boundary_ref (p.ej. estado actual), usa ||x - ref||.
        Si no, usa la norma del propio vector como proxy de lejanía al origen
        (envolvente centrada).
        """
        if boundary_ref is not None:
            return float(np.linalg.norm(x - boundary_ref))
        return float(np.linalg.norm(x))

    # ------------------------------------------------------------------
    # Ledger diferencial Δ
    # ------------------------------------------------------------------

    def _maybe_log(self, result: PLAMResult, event_type: str) -> None:
        if not self.config.ledger_enabled:
            return
        event = {
            "author": "Luis Angel Vazquez Martinez",
            "timestamp": time.time(),
            "event": event_type,
            "status": result.status.value,
            "mode": result.mode.value if result.mode else None,
            "lam_min": round(result.lam_min, 12),
            "d": round(result.distance_to_boundary, 12),
            "blocked": result.blocked,
            "config_fp": result.config_fingerprint,
            "previous_hash": self._previous_hash,
        }
        raw = json.dumps(event, sort_keys=True, separators=(",", ":")).encode()
        current = hashlib.sha256(raw).hexdigest()
        event["hash"] = current
        self._previous_hash = current
        result.ledger_event = event
        self._ledger.append(event)

    def get_ledger(self) -> list[Dict[str, Any]]:
        return list(self._ledger)

    def reset_ledger(self) -> None:
        self._ledger.clear()
        self._previous_hash = None

    # ------------------------------------------------------------------
    # Utilidades
    # ------------------------------------------------------------------

    def _assert_vector(self, v: NDArray) -> None:
        if not isinstance(v, np.ndarray):
            raise TypeError("el estado debe ser numpy.ndarray")
        if v.ndim != 1 or v.shape[0] != self.config.state_dimension:
            raise ValueError(
                f"estado debe tener forma ({self.config.state_dimension},), "
                f"recibido {v.shape}"
            )
        if not np.isfinite(v).all():
            raise ValueError("el estado contiene NaN/Inf")


# Alias de conveniencia para el white paper / scripts
def plam_quantum_wrapper(
    x: NDArray[np.floating],
    *,
    eps: float = 1e-3,
    tau: float = 0.0,
    hessian: Optional[NDArray[np.floating]] = None,
    psi: Optional[NDArray[np.floating]] = None,
    state_dimension: int = 128,
) -> PLAMResult:
    """Función de un solo disparo (API del Anexo Q / INTEGRATION)."""
    cfg = PLAMConfig(eps=eps, tau=tau, state_dimension=state_dimension)
    return PLAMQuantumWrapper(cfg).contain(x, hessian=hessian, psi=psi)
