"""
Suite de invariantes – FoldGeometry + Polarity + Entropy Gate

Contrato del gate (Opción 1):
  R > 0  => ALLOWED
  R <= 0 => PPRH_EC008 (incluye R == 0)
"""

from decimal import Decimal
from pathlib import Path

import pytest

from pprh.hydra.fold_geometry import FoldGeometry, FoldGeometryError
from pprh.hydra.pprh_polarity import bifurcar_1_a_4, PolarityError
from pprh.hydra.puf.entropy_gate import (
    ERROR_CODE,
    EntropyBudget,
    EntropyGateError,
    GateResult,
    evaluate,
    evaluate_puf_security,
    require_authorization,
)


# ------------------------------------------------------------------
# FoldGeometry
# ------------------------------------------------------------------

def test_fold_vector_length():
    g = FoldGeometry()
    v = g.generate_fold_vector()
    assert len(v) == 704
    assert g.n3 == 704
    assert g.n2 == 88
    assert g.n1 == 22


def test_fold_vector_values_binary():
    v = FoldGeometry().generate_fold_vector()
    assert all(bit in (0, 1) for bit in v)


def test_fold_descriptor_stable():
    g1 = FoldGeometry()
    g2 = FoldGeometry()
    assert g1.descriptor_hash() == g2.descriptor_hash()
    assert len(g1.descriptor_hash()) == 64


def test_fold_descriptor_note():
    s = FoldGeometry().summary()
    assert "experimental" in s["note"]


def test_fold_invalid_n1():
    with pytest.raises(FoldGeometryError):
        FoldGeometry(n1=0)


# ------------------------------------------------------------------
# Polarity
# ------------------------------------------------------------------

def test_polarity_L():
    p = bifurcar_1_a_4("L")
    assert p.vector == "1001"
    assert p.signos == {"S": 1, "I": 0, "N": 0, "O": 1}
    assert p.mode == "L"


def test_polarity_D():
    p = bifurcar_1_a_4("D")
    assert p.vector == "0110"
    assert p.signos == {"S": 0, "I": 1, "N": 1, "O": 0}


def test_polarity_duality():
    L = bifurcar_1_a_4("L")
    D = L.dual()
    assert D.vector == "0110"
    assert D.dual().vector == "1001"


def test_polarity_invalid_mode():
    with pytest.raises(PolarityError):
        bifurcar_1_a_4("X")


# ------------------------------------------------------------------
# Entropy Gate – contratos 1–13 (Opción 1: R > 0)
# ------------------------------------------------------------------

def test_gate_negative_residual_blocked():
    """1. residual negativo → bloqueado (dataset experimental)."""
    result = evaluate(33.9, 495, 16)
    assert result.residual == Decimal("-477.1")
    assert result.derivation_allowed is False
    assert result.blocked is True
    assert result.error_code == ERROR_CODE


def test_gate_zero_residual_blocked():
    """2. residual exactamente cero → BLOCK (R > 0 requerido)."""
    result = evaluate(100, 84, 16)  # 100 - 84 - 16 = 0
    assert result.residual == Decimal("0")
    assert result.derivation_allowed is False
    assert result.error_code == ERROR_CODE


def test_gate_positive_residual_allowed():
    """3. residual positivo → permitido."""
    result = evaluate(200, 80, 16)
    assert result.residual == Decimal("104")
    assert result.derivation_allowed is True
    assert result.error_code is None


def test_gate_error_code_on_block():
    """4. código PPRH_EC008 en bloqueo."""
    result = evaluate(33.9, 495, 16)
    assert result.error_code == "PPRH_EC008"


def test_gate_no_error_code_when_allowed():
    """5. ausencia de error_code cuando ALLOWED."""
    result = evaluate(200, 80, 16)
    assert result.error_code is None


def test_gate_residual_calculation():
    """6. cálculo correcto del residual (Decimal)."""
    result = evaluate("33.9", "495", "16")
    assert result.residual == Decimal("33.9") - Decimal("495") - Decimal("16")
    assert result.residual == Decimal("-477.1")


def test_gate_default_margin_is_16():
    """7. margen de seguridad por defecto = 16."""
    result = evaluate(100, 50)  # margin default 16 → residual 34
    assert result.safety_margin == Decimal("16")
    assert result.residual == Decimal("34")
    assert result.derivation_allowed is True


def test_gate_margin_configurable():
    """8. margen configurable."""
    result = evaluate(100, 50, 40)
    assert result.safety_margin == Decimal("40")
    assert result.residual == Decimal("10")


def test_gate_helper_configurable():
    """9. helper_bits configurable."""
    a = evaluate(100, 10, 16)
    b = evaluate(100, 90, 16)
    assert a.residual > b.residual
    assert a.derivation_allowed is True
    assert b.derivation_allowed is False


def test_gate_min_entropy_configurable():
    """10. min_entropy configurable."""
    low = evaluate(10, 50, 16)
    high = evaluate(200, 50, 16)
    assert low.derivation_allowed is False
    assert high.derivation_allowed is True


def test_gate_decimal_preserves_precision():
    """11. valores Decimal conservan precisión."""
    result = evaluate("33.9", 495, 16)
    assert isinstance(result.residual, Decimal)
    assert result.residual == Decimal("-477.1")


def test_gate_result_immutable():
    """12. GateResult es inmutable."""
    result = evaluate(33.9, 495, 16)
    with pytest.raises(Exception):
        result.derivation_allowed = True  # type: ignore[misc]


def test_gate_module_does_not_import_crypto():
    """13. evaluate / módulo gate no importan romeo-hydra-crypto."""
    import pprh.hydra.puf.entropy_gate as eg

    src = Path(eg.__file__).read_text(encoding="utf-8")
    assert "romeo-hydra-crypto" not in src
    assert "romeo_hydra_crypto" not in src
    assert "from core.envelope" not in src
    assert "import core.envelope" not in src


def test_gate_compat_dict_api():
    """Fachada evaluate_puf_security conserva contrato C.1 (dict)."""
    report = evaluate_puf_security(
        measured_hinf=33.9,
        helper_bits=495,
        margin=16.0,
    )
    assert report["authorized"] is False
    assert report["error_code"] == "PPRH_EC008"
    assert report["remaining"] < 0
    assert report["rule"] == "remaining > 0 required for authorization"


def test_gate_require_raises_on_block():
    with pytest.raises(EntropyGateError) as exc:
        require_authorization(measured_hinf=33.9, helper_bits=495)
    assert "PPRH_EC008" in str(exc.value)


def test_gate_require_passes_when_positive():
    out = require_authorization(measured_hinf=200.0, helper_bits=80, margin=16.0)
    assert isinstance(out, GateResult)
    assert out.derivation_allowed is True


def test_gate_budget_compat_class():
    budget = EntropyBudget(measured_min_entropy=33.9, helper_leakage=495, safety_margin=16.0)
    assert budget.remaining < 0
    assert budget.authorize_key_derivation() is False


def test_gate_best_case_uncertainty_still_blocked():
    """33.9 + 1.8 - 495 - 16 = -475.3 < 0 → sigue bloqueado."""
    result = evaluate(Decimal("33.9") + Decimal("1.8"), 495, 16)
    assert result.residual == Decimal("-475.3")
    assert result.derivation_allowed is False
