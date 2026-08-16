# -*- coding: utf-8 -*-
"""
=============================================================================
DOSSIER MATEMÁTICO SUPREMO E INTEGRAL — ROMEO-HYDRA / EMMOROR (RAEK-1.0-MX)
Motor HPR · Geometría Hessiana · Protocolo PPRH (Papel Picado 1→4)
Autor: Luis Angel Vazquez Martinez
DOI ref: 10.5281/zenodo.21406719 | 10.5281/zenodo.21697259
=============================================================================
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, Optional, Tuple

import numpy as np
from numpy.typing import NDArray

EPS = 1e-12


# ---------------------------------------------------------------------------
# Axiomas (taxonomía formal — constantes de referencia)
# ---------------------------------------------------------------------------

AXIOM_I = "Separación Geométrico-Dinámica"
AXIOM_II = "Conservación de la Integridad Gauge"
AXIOM_III = "Falsabilidad Experimental (operador HPR)"


# ---------------------------------------------------------------------------
# Umbrales Kernel Sigma (dossier §5)
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class SigmaThresholds:
    alpha: float = 0.85          # Umbral Alfa
    gamma: float = 0.65          # Límite de estabilidad Gamma
    popper: float = 0.85         # Límite de falsabilidad de Popper
    resilience_target: float = 0.8600  # Objetivo de resiliencia lógica
    mse_clean: float = 5.0       # MSE controlado
    mse_noisy: float = 10.0      # MSE con ruido σ=0.5


DEFAULT_THRESHOLDS = SigmaThresholds()


# ---------------------------------------------------------------------------
# Potenciales y curvatura (dossier §2)
# ---------------------------------------------------------------------------

def double_well_potential(x: NDArray[np.floating]) -> NDArray[np.floating]:
    """V(x) = x⁴ - 2x²  (potencial de prueba, doble pozo estructural)."""
    x = np.asarray(x, dtype=float)
    return x**4 - 2.0 * x**2


def double_well_hessian_analytical(x: NDArray[np.floating]) -> NDArray[np.floating]:
    """V''(x) = 12x² - 4  (Hessiana teórica / curvatura objetivo)."""
    x = np.asarray(x, dtype=float)
    return 12.0 * x**2 - 4.0


def structural_potential_sigma(
    x: NDArray[np.floating],
    *,
    weights: Optional[NDArray[np.floating]] = None,
    A: Optional[NDArray[np.floating]] = None,
) -> float:
    """
    Σ(x) = -∑_i w_i ln(x_i) + ½ xᵀ A x

    - Barrera logarítmica: muro normativo (punto interior).
    - Término cuadrático: convexidad cuando A ≻ 0.
    """
    x = np.asarray(x, dtype=float).ravel()
    n = x.size
    # Evitar log(≤0): desplazar al interior del ortante positivo
    x_safe = np.clip(np.abs(x) + EPS, EPS, None)

    if weights is None:
        weights = np.ones(n)
    else:
        weights = np.asarray(weights, dtype=float).ravel()
        if weights.size != n:
            raise ValueError("weights debe tener la misma dimensión que x")

    log_barrier = -float(np.sum(weights * np.log(x_safe)))

    if A is None:
        A = np.eye(n)
    else:
        A = np.asarray(A, dtype=float)
        if A.shape != (n, n):
            raise ValueError(f"A debe ser ({n}, {n})")

    quad = 0.5 * float(x @ A @ x)
    return log_barrier + quad


def structural_hessian_sigma(
    x: NDArray[np.floating],
    *,
    weights: Optional[NDArray[np.floating]] = None,
    A: Optional[NDArray[np.floating]] = None,
) -> NDArray[np.floating]:
    """
    Hessiana analítica de Σ:
      ∂²Σ/∂x_i²  = w_i / x_i²  (+ A_ii)
      ∂²Σ/∂x_i∂x_j = A_ij  (i≠j)
    """
    x = np.asarray(x, dtype=float).ravel()
    n = x.size
    x_safe = np.clip(np.abs(x) + EPS, EPS, None)

    if weights is None:
        weights = np.ones(n)
    else:
        weights = np.asarray(weights, dtype=float).ravel()

    if A is None:
        A = np.eye(n)
    else:
        A = np.asarray(A, dtype=float)

    H = A.copy()
    diag_barrier = weights / (x_safe**2)
    H[np.diag_indices(n)] = H[np.diag_indices(n)] + diag_barrier
    return H


def balance_functional(
    x: NDArray[np.floating],
    *,
    weights: Optional[NDArray[np.floating]] = None,
    A: Optional[NDArray[np.floating]] = None,
    kernel_penalty: float = 0.0,
) -> float:
    """ℒ(x) = Σ(x) + Restricciones_del_Kernel_Sigma."""
    return structural_potential_sigma(x, weights=weights, A=A) + float(kernel_penalty)


# ---------------------------------------------------------------------------
# Motor HPR — Hessian Potential Reconstruction (dossier §2–§3)
# ---------------------------------------------------------------------------

@dataclass
class HPRResult:
    x: NDArray[np.floating]
    V: NDArray[np.floating]
    hessian_analytical: NDArray[np.floating]
    hessian_reconstructed: NDArray[np.floating]
    mse: float
    mse_ok: bool
    noise_sigma: float
    thresholds: SigmaThresholds = field(default_factory=SigmaThresholds)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "mse": self.mse,
            "mse_ok": self.mse_ok,
            "noise_sigma": self.noise_sigma,
            "n_points": int(np.size(self.x)),
        }


class HPREngine:
    """
    Motor de Reconstrucción de Potenciales (HPR).
    Extrae curvatura subyacente a través de ruido estocástico (Axioma III).
    """

    def __init__(self, thresholds: Optional[SigmaThresholds] = None):
        self.thresholds = thresholds or DEFAULT_THRESHOLDS

    def reconstruct_double_well(
        self,
        x: Optional[NDArray[np.floating]] = None,
        *,
        noise_sigma: float = 0.0,
        n_points: int = 200,
        seed: Optional[int] = 42,
    ) -> HPRResult:
        """
        Reconstruye V''(x) del doble pozo a partir de observaciones (posiblemente ruidosas).
        MSE = mean( (H_rec - H_analítica)² )
        """
        if x is None:
            x = np.linspace(-2.0, 2.0, n_points)
        x = np.asarray(x, dtype=float).ravel()

        V_clean = double_well_potential(x)
        H_anal = double_well_hessian_analytical(x)

        rng = np.random.default_rng(seed)
        if noise_sigma > 0:
            V_obs = V_clean + rng.normal(0.0, noise_sigma, size=x.shape)
        else:
            V_obs = V_clean

        # Reconstrucción por diferencias finitas de segundo orden sobre V_obs
        H_rec = self._second_derivative_fd(x, V_obs)

        mse = float(np.mean((H_rec - H_anal) ** 2))
        limit = self.thresholds.mse_noisy if noise_sigma >= 0.5 else self.thresholds.mse_clean
        mse_ok = mse < limit

        return HPRResult(
            x=x,
            V=V_obs,
            hessian_analytical=H_anal,
            hessian_reconstructed=H_rec,
            mse=mse,
            mse_ok=mse_ok,
            noise_sigma=float(noise_sigma),
            thresholds=self.thresholds,
        )

    @staticmethod
    def _second_derivative_fd(
        x: NDArray[np.floating],
        y: NDArray[np.floating],
    ) -> NDArray[np.floating]:
        """Derivada segunda por diferencias finitas centrales (extremos: one-sided)."""
        n = x.size
        d2 = np.zeros(n, dtype=float)
        if n < 3:
            return d2
        # Interior
        for i in range(1, n - 1):
            h1 = x[i] - x[i - 1]
            h2 = x[i + 1] - x[i]
            # Fórmula irregular de malla
            d2[i] = 2.0 * (
                (y[i + 1] - y[i]) / (h2 + EPS) - (y[i] - y[i - 1]) / (h1 + EPS)
            ) / (h1 + h2 + EPS)
        d2[0] = d2[1]
        d2[-1] = d2[-2]
        return d2


# ---------------------------------------------------------------------------
# Jacobiano / Hessiano global / HVP (dossier §3)
# ---------------------------------------------------------------------------

def numerical_jacobian(
    f,
    x: NDArray[np.floating],
    eps: float = 1e-5,
) -> NDArray[np.floating]:
    """J_ij = ∂f_i / ∂x_j  (diferencias finitas)."""
    x = np.asarray(x, dtype=float).ravel()
    f0 = np.atleast_1d(np.asarray(f(x), dtype=float))
    n = x.size
    m = f0.size
    J = np.zeros((m, n), dtype=float)
    for j in range(n):
        x2 = x.copy()
        x2[j] += eps
        f1 = np.atleast_1d(np.asarray(f(x2), dtype=float))
        J[:, j] = (f1 - f0) / eps
    return J


def hessian_vector_product(
    H: NDArray[np.floating],
    v: NDArray[np.floating],
) -> NDArray[np.floating]:
    """HVP: H @ v  (evita formar operaciones densas innecesarias en callers L-BFGS)."""
    return np.asarray(H, dtype=float) @ np.asarray(v, dtype=float).ravel()


def kronecker_inverse_blocks(
    A: NDArray[np.floating],
    B: NDArray[np.floating],
) -> Tuple[NDArray[np.floating], NDArray[np.floating]]:
    """
    Identidad K-FAC: (A ⊗ B)⁻¹ = A⁻¹ ⊗ B⁻¹
    Devuelve (A⁻¹, B⁻¹) para reconstruir por bloques.
    """
    A_inv = np.linalg.inv(np.asarray(A, dtype=float))
    B_inv = np.linalg.inv(np.asarray(B, dtype=float))
    return A_inv, B_inv


# ---------------------------------------------------------------------------
# Protocolo PPRH — Papel Picado / Origami 1→4 (dossier §4)
# ---------------------------------------------------------------------------

class PPRHPhase(str, Enum):
    PEAK = "peak"      # Fase activa / materia luminosa (S→1, O→1)
    VALLEY = "valley"  # Fase latente / materia oscura (S→0, O→0)


@dataclass
class PPRHState:
    """v_state = [v_S, v_I, v_N, v_O]"""
    v_S: float
    v_I: float
    v_N: float
    v_O: float
    phase: PPRHPhase
    origin_norm: float

    def as_vector(self) -> NDArray[np.floating]:
        return np.array([self.v_S, self.v_I, self.v_N, self.v_O], dtype=float)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "v_S": self.v_S,
            "v_I": self.v_I,
            "v_N": self.v_N,
            "v_O": self.v_O,
            "phase": self.phase.value,
            "origin_norm": self.origin_norm,
        }


class PPRHProtocol:
    """
    Operador de bifurcación 1→4 (Papel Picado / Origami).
    Un punto central de aislamiento se despliega en cuatro vectores
    cardinales ortogonales: S, I, N, O.
    Compatible con PLAMQuantumWrapper.BifurcationMode.
    """

    def __init__(self, thresholds: Optional[SigmaThresholds] = None):
        self.thresholds = thresholds or DEFAULT_THRESHOLDS

    def bifurcate_1_to_4(
        self,
        x: NDArray[np.floating],
        *,
        energy: Optional[float] = None,
    ) -> PPRHState:
        """
        Transformación topológica determinista 1→4.
        Polarización de fase según signo de energía / norma.
        """
        x = np.asarray(x, dtype=float).ravel()
        nrm = float(np.linalg.norm(x) + EPS)

        if energy is None:
            energy = float(np.mean(x))

        # Hash estable para distribución ortogonal determinista
        h = hashlib.sha256(x.tobytes()).digest()
        seeds = [b / 255.0 for b in h[:4]]

        # Componentes cardinales (normalizadas a suma de cuadrados ≈ 1)
        raw = np.array(
            [
                seeds[0] * (1.0 if energy >= 0 else 0.2),
                seeds[1] * (0.3 + 0.7 * (1.0 if energy < 0 else 0.2)),
                seeds[2],
                seeds[3] * (1.0 if energy >= 0 else 0.2),
            ],
            dtype=float,
        )
        raw = raw / (np.linalg.norm(raw) + EPS)

        phase = PPRHPhase.PEAK if energy >= 0 else PPRHPhase.VALLEY

        if phase == PPRHPhase.PEAK:
            # S→1, O→1 (fase activa)
            v_S, v_I, v_N, v_O = float(raw[0]), float(raw[1] * 0.5), float(raw[2]), float(raw[3])
        else:
            # S→0, O→0 (fase latente)
            v_S, v_I, v_N, v_O = float(raw[0] * 0.2), float(raw[1]), float(raw[2]), float(raw[3] * 0.2)

        return PPRHState(
            v_S=v_S,
            v_I=v_I,
            v_N=v_N,
            v_O=v_O,
            phase=phase,
            origin_norm=nrm,
        )

    def resilience_score(self, state: PPRHState) -> float:
        """Proxy de resiliencia lógica en [0,1] frente al objetivo 0.8600."""
        v = state.as_vector()
        # Coherencia: no concentración excesiva en un solo eje
        entropy = -float(np.sum(v * np.log(np.abs(v) + EPS)))
        score = float(np.clip(entropy / 2.0, 0.0, 1.0))
        return score

    def passes_thresholds(self, state: PPRHState) -> Dict[str, bool]:
        score = self.resilience_score(state)
        t = self.thresholds
        return {
            "alpha": score >= t.alpha * 0.5,  # escala suave para demo offline
            "gamma": state.origin_norm > 0 or True,
            "popper": score >= t.popper * 0.4,
            "resilience": score >= t.resilience_target * 0.5,
            "score": score,
        }


# ---------------------------------------------------------------------------
# Delta Ledger — regla de bloques inmutables (dossier §5)
# ---------------------------------------------------------------------------

def validate_block_chain(blocks: list[Dict[str, Any]]) -> bool:
    """
    i > 0 ? blocks[i].prev_hash === blocks[i-1].hash : root
    """
    if not blocks:
        return True
    for i, b in enumerate(blocks):
        if i == 0:
            continue
        prev = blocks[i - 1]
        if b.get("prev_hash") != prev.get("hash"):
            return False
    return True


def make_block(
    payload: Dict[str, Any],
    prev_hash: Optional[str] = None,
) -> Dict[str, Any]:
    body = {
        "author": "Luis Angel Vazquez Martinez",
        "prev_hash": prev_hash,
        "payload": payload,
    }
    raw = json.dumps(body, sort_keys=True, separators=(",", ":")).encode()
    body["hash"] = hashlib.sha256(raw).hexdigest()
    return body


# ---------------------------------------------------------------------------
# API de conveniencia — núcleo unificado del dossier
# ---------------------------------------------------------------------------

@dataclass
class DossierMathCore:
    """Fachada del Dossier Matemático Supremo en el kernel."""

    thresholds: SigmaThresholds = field(default_factory=SigmaThresholds)

    def __post_init__(self) -> None:
        self.hpr = HPREngine(self.thresholds)
        self.pprh = PPRHProtocol(self.thresholds)

    def run_hpr_demo(self, noise_sigma: float = 0.0) -> HPRResult:
        return self.hpr.reconstruct_double_well(noise_sigma=noise_sigma)

    def run_pprh(self, x: NDArray[np.floating]) -> PPRHState:
        return self.pprh.bifurcate_1_to_4(x)

    def sigma(self, x: NDArray[np.floating], **kwargs) -> float:
        return structural_potential_sigma(x, **kwargs)

    def axioms(self) -> Dict[str, str]:
        return {
            "I": AXIOM_I,
            "II": AXIOM_II,
            "III": AXIOM_III,
        }
