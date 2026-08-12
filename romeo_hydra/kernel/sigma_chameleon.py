from __future__ import annotations

import hashlib
import json
import time
import math
import struct
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Tuple, Dict, Any, Union
from datetime import datetime, timezone

import numpy as np
from numpy.typing import NDArray


# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTES
# ═══════════════════════════════════════════════════════════════════════════════

DEFAULT_DIM = 128
DEFAULT_TOLERANCE = 0.05
DEFAULT_HESSIAN_TAU = 0.05
DEFAULT_FRONTIER_EPS = 0.01
DEFAULT_SIGMA_REAL = 2.0
EPS = 1e-12

SMALL_PRIMES = np.array(
    [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47],
    dtype=np.float64
)


class NormType(str, Enum):
    L2 = "l2"
    LINF = "linf"


class EnvironmentSpectrum(str, Enum):
    JSON_WORM = "json_worm"
    BINARY_VECTOR = "binary_vector"
    HUMAN_AUDIT = "human_audit"
    STEALTH_NEUTRAL = "stealth"
    SQL_ROW = "sql_row"
    JSONL_STREAM = "jsonl_stream"
    RESONANT_COMPACT = "resonant_compact"


class StressLevel(str, Enum):
    HOMEOSTASIS = "homeostasis"
    ELEVATED = "elevated"
    CRITICAL = "critical"


# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass(frozen=True)
class KernelConfig:
    state_dimension: int = DEFAULT_DIM
    error_tolerance: float = DEFAULT_TOLERANCE
    hessian_tau: float = DEFAULT_HESSIAN_TAU
    frontier_eps: float = DEFAULT_FRONTIER_EPS
    norm: NormType = NormType.L2
    kernel_version: str = "SIGMA_V∞_CHAMELEON"
    soft_projection: bool = False
    soft_temperature: float = 0.1
    use_6k_sieve: bool = True
    sigma_real: float = DEFAULT_SIGMA_REAL
    gap_dilation: bool = True
    reference_N: float = 1e6

    def fingerprint(self) -> str:
        payload = {
            "dim": self.state_dimension,
            "tol": round(self.error_tolerance, 12),
            "htau": round(self.hessian_tau, 12),
            "feps": round(self.frontier_eps, 12),
            "norm": self.norm.value,
            "ver": self.kernel_version,
            "soft": self.soft_projection,
            "temp": round(self.soft_temperature, 12),
            "sieve": self.use_6k_sieve,
            "sigma": round(self.sigma_real, 8),
            "gap": self.gap_dilation,
            "refN": self.reference_N,
        }
        raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
        return hashlib.sha256(raw).hexdigest()[:20]


# ═══════════════════════════════════════════════════════════════════════════════
# NÚCLEO INMUTABLE
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass(frozen=True)
class CoreState:
    state_vector: NDArray[np.floating]
    entropy: float
    timestamp: str
    config_fingerprint: str
    collapse_metrics: Dict[str, float] = field(default_factory=dict)

    def __post_init__(self):
        object.__setattr__(self, "state_vector", self.state_vector.copy())
        self.state_vector.setflags(write=False)

    def compute_sha256(self) -> str:
        payload = {
            "vector": self.state_vector.tobytes().hex(),
            "entropy": round(self.entropy, 12),
            "ts": self.timestamp,
            "cfg": self.config_fingerprint,
            "metrics": {k: round(v, 10) for k, v in sorted(self.collapse_metrics.items())},
        }
        raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
        return hashlib.sha256(raw).hexdigest()

    @property
    def dimension(self) -> int:
        return len(self.state_vector)


@dataclass
class CollapseResult:
    stabilized_action: NDArray[np.floating]
    original_entropy: float
    final_entropy: float
    projected: bool
    frontier_crossed: bool
    hessian_ok: bool
    max_eigenvalue: float
    config_fingerprint: str
    sieve_rejected_ratio: float = 0.0
    complex_phase: float = 0.0
    local_prime_density: float = 0.0
    effective_tolerance: float = 0.0
    metrics: Dict[str, float] = field(default_factory=dict)

    def to_core_state(self, config: KernelConfig) -> CoreState:
        return CoreState(
            state_vector=self.stabilized_action,
            entropy=self.final_entropy,
            timestamp=datetime.now(timezone.utc).isoformat(),
            config_fingerprint=self.config_fingerprint,
            collapse_metrics={
                "original_entropy": self.original_entropy,
                "sieve_rejected": self.sieve_rejected_ratio,
                "complex_phase": self.complex_phase,
                "local_density": self.local_prime_density,
                "max_eig": self.max_eigenvalue,
                **self.metrics,
            },
        )


# ═══════════════════════════════════════════════════════════════════════════════
# ADAPTADOR CAMALEÓNICO
# ═══════════════════════════════════════════════════════════════════════════════

class MimeticSurfaceAdapter:
    def __init__(self, core: CoreState):
        self._core = core
        self._core_hash = core.compute_sha256()

    @property
    def core_hash(self) -> str:
        return self._core_hash

    @property
    def core(self) -> CoreState:
        return self._core

    def sense_environment(
        self,
        noise_level: float = 0.0,
        latency_ms: float = 10.0,
        authorized: bool = True,
    ) -> Tuple[EnvironmentSpectrum, StressLevel]:
        if not authorized:
            return EnvironmentSpectrum.STEALTH_NEUTRAL, StressLevel.CRITICAL
        if noise_level > 0.7 or latency_ms > 200:
            return EnvironmentSpectrum.RESONANT_COMPACT, StressLevel.CRITICAL
        if noise_level > 0.35 or latency_ms > 80:
            return EnvironmentSpectrum.BINARY_VECTOR, StressLevel.ELEVATED
        return EnvironmentSpectrum.JSON_WORM, StressLevel.HOMEOSTASIS

    def project(
        self,
        spectrum: EnvironmentSpectrum,
        extra: Optional[Dict[str, Any]] = None,
        stress: StressLevel = StressLevel.HOMEOSTASIS,
    ) -> Union[Dict[str, Any], bytes, str]:
        extra = extra or {}
        assert self._core.compute_sha256() == self._core_hash, "Invariancia rota"

        if spectrum == EnvironmentSpectrum.JSON_WORM:
            return self._phenotype_json_worm(extra)
        if spectrum == EnvironmentSpectrum.BINARY_VECTOR:
            return self._phenotype_binary(extra)
        if spectrum == EnvironmentSpectrum.HUMAN_AUDIT:
            return self._phenotype_human(extra)
        if spectrum == EnvironmentSpectrum.STEALTH_NEUTRAL:
            return self._phenotype_stealth(extra)
        if spectrum == EnvironmentSpectrum.SQL_ROW:
            return self._phenotype_sql(extra)
        if spectrum == EnvironmentSpectrum.JSONL_STREAM:
            return self._phenotype_jsonl(extra)
        if spectrum == EnvironmentSpectrum.RESONANT_COMPACT:
            return self._phenotype_compact(extra, stress)
        raise ValueError(f"Espectro no soportado: {spectrum}")

    def _phenotype_json_worm(self, extra: Dict) -> Dict[str, Any]:
        return {
            "schema": "romeo-hydra/worm/v∞",
            "ts": self._core.timestamp,
            "core_sha256": self._core_hash,
            "entropy": round(self._core.entropy, 8),
            "dim": self._core.dimension,
            "cfg_fp": self._core.config_fingerprint,
            "payload": self._core.state_vector.tolist(),
            "metrics": self._core.collapse_metrics,
            "status": "INTEGRIDAD_VERIFICADA",
            **extra,
        }

    def _phenotype_binary(self, extra: Dict) -> bytes:
        header = struct.pack(
            "<16s d I",
            bytes.fromhex(self._core_hash[:32]),
            self._core.entropy,
            self._core.dimension,
        )
        body = self._core.state_vector.astype(np.float32).tobytes()
        return header + body

    def _phenotype_human(self, extra: Dict) -> str:
        lines = [
            "╔══════════════════════════════════════════════════════════╗",
            "║          ROMEO-HYDRA :: PROYECCIÓN DE AUDITORÍA          ║",
            "╠══════════════════════════════════════════════════════════╣",
            f"║  Timestamp     : {self._core.timestamp:<40} ║",
            f"║  Core SHA-256  : {self._core_hash[:40]}… ║",
            f"║  Entropía      : {self._core.entropy:<40.8f} ║",
            f"║  Dimensión     : {self._core.dimension:<40} ║",
            f"║  Config FP     : {self._core.config_fingerprint:<40} ║",
            "╚══════════════════════════════════════════════════════════╝",
        ]
        return "\n".join(lines)

    def _phenotype_stealth(self, extra: Dict) -> Dict[str, Any]:
        return {
            "status": "ok",
            "code": 200,
            "node": extra.get("node_id", "edge-01"),
            "sig": self._core_hash[:12],
            "ts": int(time.time()),
        }

    def _phenotype_sql(self, extra: Dict) -> Dict[str, Any]:
        return {
            "id": self._core_hash[:16],
            "created_at": self._core.timestamp,
            "entropy": self._core.entropy,
            "vector_hash": self._core_hash,
            "dim": self._core.dimension,
            "status": "committed",
        }

    def _phenotype_jsonl(self, extra: Dict) -> str:
        record = {
            "ts": self._core.timestamp,
            "h": self._core_hash,
            "e": round(self._core.entropy, 6),
            "d": self._core.dimension,
        }
        return json.dumps(record, separators=(",", ":"))

    def _phenotype_compact(self, extra: Dict, stress: StressLevel) -> Dict[str, Any]:
        return {
            "h": self._core_hash[:16],
            "e": round(self._core.entropy, 4),
            "s": stress.value,
        }


# ═══════════════════════════════════════════════════════════════════════════════
# KERNEL SIGMA V∞
# ═══════════════════════════════════════════════════════════════════════════════

class KernelSigmaController:
    def __init__(self, config: Optional[KernelConfig] = None):
        self.config = config or KernelConfig()
        self._previous_trace_hash: Optional[str] = None
        self._validate_config()
        self._euler_weights = self._build_euler_weights()

    def _validate_config(self) -> None:
        c = self.config
        if c.state_dimension < 1:
            raise ValueError("state_dimension ≥ 1")
        if c.error_tolerance <= 0 or c.hessian_tau <= 0 or c.frontier_eps <= 0:
            raise ValueError("tolerancias deben ser > 0")
        if c.sigma_real < 0.5:
            raise ValueError("sigma_real demasiado bajo")

    def _build_euler_weights(self) -> NDArray[np.complex128]:
        σ = self.config.sigma_real
        seed = int(self.config.fingerprint()[:8], 16) % 997 / 997.0 * 2 * np.pi
        return (SMALL_PRIMES ** (-σ) * np.exp(1j * seed * np.log(SMALL_PRIMES))).astype(np.complex128)

    def evaluate_and_collapse(
        self,
        current_state: NDArray[np.floating],
        candidate_action: NDArray[np.floating],
        cost_hessian: Optional[NDArray[np.floating]] = None,
        local_N: Optional[float] = None,
    ) -> CollapseResult:
        self._assert_vector(current_state, "current_state")
        self._assert_vector(candidate_action, "candidate_action")

        N = local_N if local_N is not None else self.config.reference_N
        effective_tol = self._effective_tolerance(N)

        filtered, rejected = self._apply_6k_sieve(candidate_action)
        delta = filtered - current_state
        original_entropy = self._norm(delta)

        if original_entropy > effective_tol + EPS:
            projected = True
            if self.config.soft_projection:
                scale = effective_tol / (original_entropy + EPS)
                soft = scale + (1.0 - scale) * np.exp(-original_entropy / self.config.soft_temperature)
                stabilized = current_state + delta * soft
            else:
                unit = delta / (original_entropy + EPS)
                stabilized = current_state + unit * effective_tol
        else:
            projected = False
            stabilized = filtered.copy()

        final_entropy = self._norm(stabilized - current_state)
        hessian_ok, max_eig, phase = self._check_stability_with_modulation(
            current_state, stabilized, cost_hessian
        )
        frontier = final_entropy >= (effective_tol - self.config.frontier_eps)
        density = 1.0 / max(math.log(N), 1.0)

        return CollapseResult(
            stabilized_action=stabilized,
            original_entropy=float(original_entropy),
            final_entropy=float(final_entropy),
            projected=projected,
            frontier_crossed=frontier,
            hessian_ok=hessian_ok,
            max_eigenvalue=float(max_eig),
            config_fingerprint=self.config.fingerprint(),
            sieve_rejected_ratio=float(rejected),
            complex_phase=float(phase),
            local_prime_density=float(density),
            effective_tolerance=float(effective_tol),
            metrics={
                "delta_norm": float(original_entropy),
                "projected_norm": float(final_entropy),
                "log_N": float(math.log(N)),
            },
        )

    def collapse_to_core(
        self,
        current_state: NDArray[np.floating],
        candidate_action: NDArray[np.floating],
        **kwargs,
    ) -> Tuple[CoreState, MimeticSurfaceAdapter]:
        result = self.evaluate_and_collapse(current_state, candidate_action, **kwargs)
        core = result.to_core_state(self.config)
        adapter = MimeticSurfaceAdapter(core)
        return core, adapter

    def _apply_6k_sieve(self, action: NDArray) -> Tuple[NDArray, float]:
        if not self.config.use_6k_sieve:
            return action.copy(), 0.0
        scaled = np.round(action * 1e6).astype(np.int64)
        residues = scaled % 6
        target = np.where(residues <= 3, 1, 5)
        target = np.where(residues == 0, 5, target)
        adjusted = scaled + (target - residues)
        filtered = adjusted.astype(np.float64) / 1e6
        rejected = float(np.mean((residues != 1) & (residues != 5)))
        return filtered, rejected

    def _effective_tolerance(self, N: float) -> float:
        if not self.config.gap_dilation:
            return self.config.error_tolerance
        ratio = math.log(max(N, 3.0)) / math.log(max(self.config.reference_N, 3.0))
        return self.config.error_tolerance * max(ratio, 0.5)

    def _check_stability_with_modulation(
        self,
        state: NDArray,
        action: NDArray,
        hessian: Optional[NDArray],
    ) -> Tuple[bool, float, float]:
        dim = self.config.state_dimension
        if hessian is None:
            hessian = np.diag(1.0 + np.abs(action - state))
        else:
            if hessian.shape != (dim, dim):
                raise ValueError("Hessiano de forma incorrecta")
        try:
            eigvals = np.linalg.eigvalsh(0.5 * (hessian + hessian.T))
            max_eig = float(np.max(np.real(eigvals)))
        except np.linalg.LinAlgError:
            return False, float("inf"), 0.0
        ok = max_eig <= (1.0 / self.config.hessian_tau)
        delta = action - state
        n = min(len(delta), len(self._euler_weights))
        proj = np.dot(delta[:n], self._euler_weights[:n])
        phase = float(np.angle(proj))
        return ok, max_eig, phase

    def generate_immutable_trace(
        self,
        core: CoreState,
        spectrum: EnvironmentSpectrum,
        extra: Optional[Dict[str, Any]] = None,
    ) -> str:
        payload = {
            "ts": time.time(),
            "kernel": self.config.kernel_version,
            "core_sha256": core.compute_sha256(),
            "cfg_fp": core.config_fingerprint,
            "prev": self._previous_trace_hash,
            "spectrum": spectrum.value,
            "entropy": round(core.entropy, 12),
            "extra": extra or {},
        }
        raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
        h = hashlib.sha256(raw).hexdigest()
        self._previous_trace_hash = h
        return h

    def reset_trace_chain(self) -> None:
        self._previous_trace_hash = None

    def _assert_vector(self, v: NDArray, name: str) -> None:
        if not isinstance(v, np.ndarray) or v.ndim != 1 or v.shape[0] != self.config.state_dimension:
            raise ValueError(f"{name} debe ser shape ({self.config.state_dimension},)")
        if not np.isfinite(v).all():
            raise ValueError(f"{name} contiene NaN/Inf")

    def _norm(self, v: NDArray) -> float:
        if self.config.norm == NormType.L2:
            return float(np.linalg.norm(v))
        return float(np.max(np.abs(v)))
