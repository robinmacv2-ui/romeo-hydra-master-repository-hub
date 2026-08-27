"""
Suite de invariantes – FoldGeometry + Polarity + Entropy Gate
"""

import pytest
from pprh.hydra.fold_geometry import FoldGeometry, FoldGeometryError
from pprh.hydra.pprh_polarity import bifurcar_1_a_4, PolarityError
from pprh.hydra.puf.entropy_gate import (
    evaluate_puf_security,
    require_authorization,
    EntropyGateError,
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
# Entropy Gate – fail-closed
# ------------------------------------------------------------------

def test_gate_current_budget_fails():
    """Situación experimental real: 33.9 - 495 - 16 < 0"""
    report = evaluate_puf_security(
        measured_hinf=33.9,
        helper_bits=495,
        margin=16.0,
    )
    assert report["authorized"] is False
    assert report["error_code"] == "PPRH_EC008"
    assert report["remaining"] < 0


def test_gate_require_raises():
    with pytest.raises(EntropyGateError) as exc:
        require_authorization(measured_hinf=33.9, helper_bits=495)
    assert "PPRH_EC008" in str(exc.value)


def test_gate_positive_budget_passes():
    report = evaluate_puf_security(
        measured_hinf=200.0,
        helper_bits=80,
        margin=16.0,
    )
    assert report["authorized"] is True
    assert report["error_code"] is None
    assert report["remaining"] > 0


def test_gate_require_passes_when_positive():
    # No debe lanzar
    require_authorization(measured_hinf=200.0, helper_bits=80, margin=16.0)
