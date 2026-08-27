"""
Entropy Gate – frontera de seguridad fail-closed.
Ningún camino de derivación de clave puede bypassearlo.
"""

from dataclasses import dataclass


class EntropyGateError(RuntimeError):
    """Presupuesto de entropía insuficiente."""


@dataclass(frozen=True)
class EntropyBudget:
    measured_min_entropy: float
    helper_leakage: int
    safety_margin: float = 16.0

    @property
    def remaining(self) -> float:
        return (
            self.measured_min_entropy
            - self.helper_leakage
            - self.safety_margin
        )

    def authorize_key_derivation(self) -> bool:
        return self.remaining > 0


def evaluate_puf_security(
    measured_hinf: float,
    helper_bits: int,
    margin: float = 16.0,
) -> dict:
    budget = EntropyBudget(
        measured_min_entropy=measured_hinf,
        helper_leakage=helper_bits,
        safety_margin=margin,
    )
    authorized = budget.authorize_key_derivation()
    return {
        "measured_min_entropy": budget.measured_min_entropy,
        "helper_leakage": budget.helper_leakage,
        "safety_margin": budget.safety_margin,
        "remaining": budget.remaining,
        "authorized": authorized,
        "decision": (
            "PASS" if authorized
            else "FAIL – insufficient conditional entropy"
        ),
        "error_code": None if authorized else "PPRH_EC008",
    }


def require_authorization(
    measured_hinf: float,
    helper_bits: int,
    margin: float = 16.0,
) -> None:
    """
    Lanza PPRH_EC008 si el presupuesto es negativo.
    Usar obligatoriamente antes de cualquier HKDF.
    """
    report = evaluate_puf_security(measured_hinf, helper_bits, margin)
    if not report["authorized"]:
        raise EntropyGateError(
            f"PPRH_EC008: remaining={report['remaining']:.1f} bits – "
            "key derivation forbidden"
        )
