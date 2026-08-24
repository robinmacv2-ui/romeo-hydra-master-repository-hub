"""
=============================================================================
Framework: ROMEO-HYDRA
Component: Kernel Sigma Controller
Author: Luis Angel Vazquez Martinez
=============================================================================
"""

from __future__ import annotations

import hashlib
import json
import time
from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import Optional, Tuple, Dict, Any

import numpy as np
from numpy.typing import NDArray


# ---------------------------------------------------------------------------
# Constantes y tipos
# ---------------------------------------------------------------------------

DEFAULT_DIM = 128
DEFAULT_TOLERANCE = 0.05
DEFAULT_HESSIAN_TAU = 0.05
DEFAULT_FRONTIER_EPS = 0.01
EPS = 1e-12


class NormType(str, Enum):
    L2 = "l2"
    LINF = "linf"


@dataclass(frozen=True)
class KernelConfig:
    """Configuración versionada e inmutable del Kernel Sigma."""
    state_dimension: int = DEFAULT_DIM
    error_tolerance: float = DEFAULT_TOLERANCE
    hessian_tau: float = DEFAULT_HESSIAN_TAU
    frontier_eps: float = DEFAULT_FRONTIER_EPS
    norm: NormType = NormType.L2
    kernel_version: str = "SIGMA_V3.1"
    soft_projection: bool = False         # si True, usa suavizado en lugar de hard clip
    soft_temperature: float = 0.1

    def fingerprint(self) -> str:
        """Hash determinista de la configuración (sin floats volátiles)."""
        payload = {
            "author": "Luis Angel Vazquez Martinez",
            "dim": self.state_dimension,
            "tol": round(self.error_tolerance, 12),
            "hessian_tau": round(self.hessian_tau, 12),
            "frontier_eps": round(self.frontier_eps, 12),
            "norm": self.norm.value,
            "version": self.kernel_version,
            "soft": self.soft_projection,
            "temp": round(self.soft_temperature, 12),
        }
        raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
        return hashlib.sha256(raw).hexdigest()[:16]


@dataclass
class CollapseResult:
    """Resultado completo del colapso de trayectorias."""
    stabilized_action: NDArray[np.floating]
    original_entropy: float
    final_entropy: float
    projected: bool
    frontier_crossed: bool
    hessian_ok: bool
    max_eigenvalue: float
    config_fingerprint: str
    metrics: Dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["stabilized_action"] = self.stabilized_action.tolist()
        return d


# ---------------------------------------------------------------------------
# Kernel Sigma Controller
# ---------------------------------------------------------------------------

class KernelSigmaController:
    """
    Controlador de gobernanza ex-ante (Kernel Sigma) para el marco ROMEO-HYDRA.
    Autor: Luis Angel Vazquez Martinez
    """

    def __init__(self, config: Optional[KernelConfig] = None):
        self.config = config or KernelConfig()
        self._previous_trace_hash: Optional[str] = None
        self._validate_config()

    def _validate_config(self) -> None:
        c = self.config
        if c.state_dimension < 1:
            raise ValueError("state_dimension debe ser ? 1")
        if c.error_tolerance <= 0:
            raise ValueError("error_tolerance debe ser > 0")
        if c.hessian_tau <= 0 or c.frontier_eps <= 0:
            raise ValueError("hessian_tau y frontier_eps deben ser > 0")

    def evaluate_and_collapse(
        self,
        current_state: NDArray[np.floating],
        candidate_action: NDArray[np.floating],
        cost_hessian: Optional[NDArray[np.floating]] = None,
    ) -> CollapseResult:
        self._assert_vector(current_state, "current_state")
        self._assert_vector(candidate_action, "candidate_action")

        delta = candidate_action - current_state
        original_entropy = self._norm(delta)

        if original_entropy > self.config.error_tolerance + EPS:
            projected = True
            if self.config.soft_projection:
                scale = self.config.error_tolerance / (original_entropy + EPS)
                soft_scale = scale + (1.0 - scale) * np.exp(
                    -original_entropy / self.config.soft_temperature
                )
                stabilized = current_state + delta * soft_scale
            else:
                unit = delta / (original_entropy + EPS)
                stabilized = current_state + unit * self.config.error_tolerance
        else:
            projected = False
            stabilized = candidate_action.copy()

        final_entropy = self._norm(stabilized - current_state)
        hessian_ok, max_eig = self._check_hessian_stability(
            current_state, stabilized, cost_hessian
        )
        frontier_crossed = final_entropy >= (self.config.error_tolerance - self.config.frontier_eps)

        metrics = {
            "delta_norm": float(original_entropy),
            "projected_norm": float(final_entropy),
            "projection_ratio": float(final_entropy / (original_entropy + EPS)),
            "max_component_change": float(np.max(np.abs(stabilized - current_state))),
        }

        return CollapseResult(
            stabilized_action=stabilized,
            original_entropy=float(original_entropy),
            final_entropy=float(final_entropy),
            projected=projected,
            frontier_crossed=frontier_crossed,
            hessian_ok=hessian_ok,
            max_eigenvalue=float(max_eig),
            config_fingerprint=self.config.fingerprint(),
            metrics=metrics,
        )

    def generate_immutable_trace(
        self,
        result: CollapseResult,
        extra_context: Optional[Dict[str, Any]] = None,
    ) -> str:
        payload = {
            "author": "Luis Angel Vazquez Martinez",
            "timestamp": time.time(),
            "kernel_version": self.config.kernel_version,
            "config_fingerprint": result.config_fingerprint,
            "previous_hash": self._previous_trace_hash,
            "projected": result.projected,
            "frontier_crossed": result.frontier_crossed,
            "hessian_ok": result.hessian_ok,
            "original_entropy": round(result.original_entropy, 12),
            "final_entropy": round(result.final_entropy, 12),
            "max_eigenvalue": round(result.max_eigenvalue, 12),
            "vector_snapshot": [round(float(x), 10) for x in result.stabilized_action],
            "extra": extra_context or {},
        }

        serialized = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
        current_hash = hashlib.sha256(serialized).hexdigest()
        self._previous_trace_hash = current_hash
        return current_hash

    def reset_trace_chain(self) -> None:
        self._previous_trace_hash = None

    def _assert_vector(self, v: NDArray, name: str) -> None:
        if not isinstance(v, np.ndarray):
            raise TypeError(f"{name} debe ser un numpy.ndarray")
        if v.ndim != 1 or v.shape[0] != self.config.state_dimension:
            raise ValueError(
                f"{name} debe tener forma ({self.config.state_dimension},), "
                f"recibido {v.shape}"
            )
        if not np.isfinite(v).all():
            raise ValueError(f"{name} contiene valores no finitos (NaN/Inf)")

    def _norm(self, v: NDArray) -> float:
        if self.config.norm == NormType.L2:
            return float(np.linalg.norm(v))
        elif self.config.norm == NormType.LINF:
            return float(np.max(np.abs(v)))
        else:
            raise ValueError(f"Norma no soportada: {self.config.norm}")

    def _check_hessian_stability(
        self,
        state: NDArray,
        action: NDArray,
        hessian: Optional[NDArray],
    ) -> Tuple[bool, float]:
        dim = self.config.state_dimension
        if hessian is None:
            diag = 1.0 + np.abs(action - state)
            hessian = np.diag(diag)
        else:
            if hessian.shape != (dim, dim):
                raise ValueError(f"Hessiano debe ser ({dim}, {dim})")

        try:
            eigenvalues = np.linalg.eigvalsh(0.5 * (hessian + hessian.T))
            max_eig = float(np.max(np.real(eigenvalues)))
        except np.linalg.LinAlgError:
            return False, float("inf")

        ok = max_eig <= (1.0 / self.config.hessian_tau)
        return ok, max_eig


if __name__ == "__main__":
    np.random.seed(42)

    cfg = KernelConfig(
        state_dimension=128,
        error_tolerance=0.02,
        hessian_tau=0.05,
        frontier_eps=0.005,
        norm=NormType.L2,
        soft_projection=False,
    )
    kernel = KernelSigmaController(cfg)

    estado_actual = np.random.randn(128).astype(np.float64)
    ruido = np.random.randn(128) * 0.08
    accion_propuesta = estado_actual + ruido

    resultado = kernel.evaluate_and_collapse(estado_actual, accion_propuesta)

    print("=== Kernel Sigma (Autor: Luis Angel Vazquez Martinez) ===")
    print(f"Entropía original : {resultado.original_entropy:.6f}")
    print(f"Entropía final    : {resultado.final_entropy:.6f}")
    print(f"Proyectado        : {resultado.projected}")
    print(f"Frontera cruzada  : {resultado.frontier_crossed}")
    print(f"Hessiano OK       : {resultado.hessian_ok} (?_max={resultado.max_eigenvalue:.4f})")
    print(f"Config fingerprint: {resultado.config_fingerprint}")

    traza = kernel.generate_immutable_trace(resultado, extra_context={"author": "Luis Angel Vazquez Martinez", "episode": 1})
    print(f"\nHash de auditoría SHA-256: {traza}")
