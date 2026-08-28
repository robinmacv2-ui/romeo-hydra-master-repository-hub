"""
Entropy Gate – frontera de seguridad fail-closed.
Ningún camino de derivación de clave puede bypassearlo.

Contrato canónico (C.1, Opción 1):

    R = H_inf - helper_bits - safety_margin

    R > 0  => ALLOWED
    R <= 0 => PPRH_EC008 (KEY_DERIVATION_FORBIDDEN)

En particular: R == 0 => BLOCK.

evaluate() / evaluate_puf_security() no lanzan excepción.
require_authorization() lanza EntropyGateError cuando R <= 0.

PPRH_EC008 es el código estable del protocolo (string), no una
segunda jerarquía de excepción.

Cero imports de romeo-hydra-crypto.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Any, Optional, Union

Number = Union[int, float, Decimal, str]

ERROR_CODE = "PPRH_EC008"
DEFAULT_MARGIN = Decimal("16")


class EntropyGateError(RuntimeError):
    """Presupuesto de entropía insuficiente (PPRH_EC008)."""


def _to_decimal(value: Number) -> Decimal:
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


@dataclass(frozen=True)
class GateResult:
    """Resultado inmutable de la evaluación entrópica."""

    residual: Decimal
    derivation_allowed: bool
    error_code: Optional[str]
    measured_min_entropy: Decimal
    helper_leakage: Decimal
    safety_margin: Decimal

    @property
    def blocked(self) -> bool:
        return not self.derivation_allowed

    @property
    def remaining(self) -> Decimal:
        """Alias de residual (compatibilidad con reportes previos)."""
        return self.residual

    def as_dict(self) -> dict[str, Any]:
        return {
            "measured_min_entropy": float(self.measured_min_entropy),
            "helper_leakage": float(self.helper_leakage),
            "safety_margin": float(self.safety_margin),
            "remaining": float(self.residual),
            "residual": str(self.residual),
            "authorized": self.derivation_allowed,
            "derivation_allowed": self.derivation_allowed,
            "decision": (
                "PASS"
                if self.derivation_allowed
                else "FAIL – insufficient conditional entropy"
            ),
            "error_code": self.error_code,
            "gate_status": (
                "ALLOWED"
                if self.derivation_allowed
                else "KEY_DERIVATION_FORBIDDEN"
            ),
            "rule": "remaining > 0 required for authorization",
        }


@dataclass(frozen=True)
class EntropyBudget:
    """Presupuesto entrópico (compatibilidad con API C.1)."""

    measured_min_entropy: float
    helper_leakage: int
    safety_margin: float = 16.0

    @property
    def remaining(self) -> float:
        return float(
            _to_decimal(self.measured_min_entropy)
            - _to_decimal(self.helper_leakage)
            - _to_decimal(self.safety_margin)
        )

    def authorize_key_derivation(self) -> bool:
        return self.remaining > 0


def evaluate(
    min_entropy_bits: Number,
    helper_bits: Number,
    security_margin_bits: Number = DEFAULT_MARGIN,
) -> GateResult:
    """
    Evalúa exclusivamente el balance entrópico. No lanza excepción.

    residual = H_inf - helper_bits - security_margin_bits

    residual > 0  => derivation_allowed=True,  error_code=None
    residual <= 0 => derivation_allowed=False, error_code=PPRH_EC008

    Superar este gate NO constituye certificación de seguridad total.
    """
    h_inf = _to_decimal(min_entropy_bits)
    helper = _to_decimal(helper_bits)
    margin = _to_decimal(security_margin_bits)
    residual = h_inf - helper - margin

    if residual > 0:
        return GateResult(
            residual=residual,
            derivation_allowed=True,
            error_code=None,
            measured_min_entropy=h_inf,
            helper_leakage=helper,
            safety_margin=margin,
        )

    return GateResult(
        residual=residual,
        derivation_allowed=False,
        error_code=ERROR_CODE,
        measured_min_entropy=h_inf,
        helper_leakage=helper,
        safety_margin=margin,
    )


def evaluate_puf_security(
    measured_hinf: Number,
    helper_bits: Number,
    margin: Number = DEFAULT_MARGIN,
) -> dict:
    """
    Fachada de compatibilidad C.1: devuelve dict a partir de GateResult.
    No lanza excepción.
    """
    result = evaluate(
        min_entropy_bits=measured_hinf,
        helper_bits=helper_bits,
        security_margin_bits=margin,
    )
    return result.as_dict()


def require_authorization(
    measured_hinf: Number,
    helper_bits: Number,
    margin: Number = DEFAULT_MARGIN,
) -> GateResult:
    """
    Obligatoria antes de cualquier HKDF / derivación de clave.
    Lanza EntropyGateError si residual <= 0 (PPRH_EC008).
    """
    result = evaluate(
        min_entropy_bits=measured_hinf,
        helper_bits=helper_bits,
        security_margin_bits=margin,
    )
    if not result.derivation_allowed:
        raise EntropyGateError(
            f"{ERROR_CODE}: remaining={result.residual} bits – "
            "key derivation forbidden"
        )
    return result
