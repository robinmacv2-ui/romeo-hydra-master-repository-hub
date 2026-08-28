# -*- coding: utf-8 -*-
"""
HYDRA-FOLD-v1 — feature extraction skeleton (physical layer).

Purpose
-------
Turn stills / video frames of the paper accordion prototype into a
feature vector that can later feed measured_hinf and the Entropy Gate.

This module is intentionally a skeleton:
- No claim of production-grade PUF quality.
- No key derivation.
- Default path still yields PPRH_EC008 (KEY DERIVATION FORBIDDEN)
  until real measurements replace the experimental constants.

Consumes GateResult from entropy_gate (Option 1: R > 0).
Does not import romeo-hydra-crypto.

Related
-------
- evidencia/dataset/HYDRA-PHYS-2026-08-27-v1/DATASET_MANIFEST.md
- pprh/hydra/puf/entropy_gate.py
- pprh/hydra/fold_geometry.py
- tag: v3.0.0-c1-geometry-gate
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass, field
from decimal import Decimal
from pathlib import Path
from typing import Any, Iterable, Sequence

from pprh.hydra.puf.entropy_gate import (
    ERROR_CODE,
    GateResult,
    evaluate,
)

# ---------------------------------------------------------------------------
# Experimental constants (Phase C.1) — same budget as the gate release
# ---------------------------------------------------------------------------

EXPERIMENTAL_HINF = Decimal("33.9")
EXPERIMENTAL_HELPER_BITS = Decimal("495")
EXPERIMENTAL_SAFETY_MARGIN = Decimal("16")

DATASET_ID = "HYDRA-PHYS-2026-08-27-v1"
PROTOCOL = "HYDRA-FOLD-v1"


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------


@dataclass
class ImageRecord:
    """One still or extracted video frame."""

    path: str
    role: str = "still"  # still | scale | expanded | folded | topography
    notes: str = ""


@dataclass
class FeatureVector:
    """
    Minimal feature set for HYDRA-FOLD physical response.

    Geometric fields start as placeholders. Entropy fields default to
    the experimental budget (remaining < 0 → PPRH_EC008).
    """

    dataset_id: str = DATASET_ID
    protocol: str = PROTOCOL
    n_images: int = 0
    fold_count_estimate: float | None = None
    mean_edge_density: float | None = None
    residual_stress_proxy: float | None = None
    scale_mm_per_pixel: float | None = None
    volume_cm3_estimate: float | None = None
    measured_hinf: Decimal = EXPERIMENTAL_HINF
    helper_bits: Decimal = EXPERIMENTAL_HELPER_BITS
    safety_margin: Decimal = EXPERIMENTAL_SAFETY_MARGIN
    feature_digest: str = field(default="", init=False)
    extra: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        payload = {
            "dataset_id": self.dataset_id,
            "protocol": self.protocol,
            "n_images": self.n_images,
            "fold_count_estimate": self.fold_count_estimate,
            "mean_edge_density": self.mean_edge_density,
            "residual_stress_proxy": self.residual_stress_proxy,
            "scale_mm_per_pixel": self.scale_mm_per_pixel,
            "volume_cm3_estimate": self.volume_cm3_estimate,
            "measured_hinf": str(self.measured_hinf),
            "helper_bits": str(self.helper_bits),
            "safety_margin": str(self.safety_margin),
            "extra": self.extra,
        }
        raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode(
            "utf-8"
        )
        self.feature_digest = hashlib.sha256(raw).hexdigest()

    def gate(self) -> GateResult:
        return evaluate(
            min_entropy_bits=self.measured_hinf,
            helper_bits=self.helper_bits,
            security_margin_bits=self.safety_margin,
        )


# ---------------------------------------------------------------------------
# Loaders (skeleton)
# ---------------------------------------------------------------------------


def discover_images(
    root: str | Path,
    patterns: Sequence[str] = ("*.jpg", "*.jpeg", "*.png", "*.webp"),
) -> list[ImageRecord]:
    """List image files under root. Does not open or analyse them yet."""
    root = Path(root)
    if not root.is_dir():
        raise FileNotFoundError(f"Image root not found: {root}")

    records: list[ImageRecord] = []
    for pattern in patterns:
        for path in sorted(root.rglob(pattern)):
            name = path.name.lower()
            role = "still"
            if "scale" in name or "coin" in name or "peso" in name:
                role = "scale"
            elif "expand" in name or "spring" in name:
                role = "expanded"
            elif "fold" in name or "compact" in name:
                role = "folded"
            elif "topo" in name or "stress" in name:
                role = "topography"
            records.append(ImageRecord(path=str(path), role=role))
    return records


# ---------------------------------------------------------------------------
# Feature extractors (stubs — replace with real CV / metrology)
# ---------------------------------------------------------------------------


def _stub_edge_density(_path: str) -> float | None:
    return None


def _stub_fold_count(_path: str) -> float | None:
    return None


def _stub_residual_stress(_path: str) -> float | None:
    return None


def _stub_scale_mm_per_pixel(_path: str) -> float | None:
    """Placeholder: mm/pixel using 1-peso coin (~21 mm)."""
    return None


def extract_features(images: Iterable[ImageRecord]) -> FeatureVector:
    """Build a FeatureVector from ImageRecord list (stubs + experimental entropy)."""
    image_list = list(images)
    fv = FeatureVector(n_images=len(image_list))

    edge_vals: list[float] = []
    fold_vals: list[float] = []
    stress_vals: list[float] = []
    scale_vals: list[float] = []

    for rec in image_list:
        e = _stub_edge_density(rec.path)
        f = _stub_fold_count(rec.path)
        s = _stub_residual_stress(rec.path)
        sc = _stub_scale_mm_per_pixel(rec.path)
        if e is not None:
            edge_vals.append(e)
        if f is not None:
            fold_vals.append(f)
        if s is not None:
            stress_vals.append(s)
        if sc is not None:
            scale_vals.append(sc)

    if edge_vals:
        fv.mean_edge_density = sum(edge_vals) / len(edge_vals)
    if fold_vals:
        fv.fold_count_estimate = sum(fold_vals) / len(fold_vals)
    if stress_vals:
        fv.residual_stress_proxy = sum(stress_vals) / len(stress_vals)
    if scale_vals:
        fv.scale_mm_per_pixel = sum(scale_vals) / len(scale_vals)

    fv.volume_cm3_estimate = 1.0
    fv.extra["roles"] = sorted({r.role for r in image_list})
    fv.extra["source_count"] = len(image_list)
    fv.__post_init__()
    return fv


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------


def run_pipeline(image_root: str | Path) -> dict[str, Any]:
    """Discover → extract → GateResult → JSON-serialisable report."""
    images = discover_images(image_root)
    fv = extract_features(images)
    decision = fv.gate()

    return {
        "dataset_id": fv.dataset_id,
        "protocol": fv.protocol,
        "n_images": fv.n_images,
        "features": {
            **{k: v for k, v in asdict(fv).items() if k != "extra"},
            "measured_hinf": str(fv.measured_hinf),
            "helper_bits": str(fv.helper_bits),
            "safety_margin": str(fv.safety_margin),
            "extra": fv.extra,
        },
        "gate": decision.as_dict(),
        "feature_digest": fv.feature_digest,
        "note": (
            "Skeleton only. measured_hinf / helper_bits are experimental. "
            "Do not derive keys until residual > 0 with real data."
        ),
    }


def main() -> None:
    import argparse
    import sys

    parser = argparse.ArgumentParser(
        description="HYDRA-FOLD-v1 feature extraction skeleton (fail-closed, R > 0)."
    )
    parser.add_argument(
        "image_root",
        nargs="?",
        default=".",
        help="Directory containing stills / frames (default: current dir)",
    )
    parser.add_argument(
        "-o",
        "--output",
        default="-",
        help="Write JSON report to this path (default: stdout)",
    )
    args = parser.parse_args()

    report = run_pipeline(args.image_root)
    text = json.dumps(report, indent=2, ensure_ascii=False)

    if args.output == "-":
        sys.stdout.write(text + "\n")
    else:
        Path(args.output).write_text(text, encoding="utf-8")
        print(f"Wrote report to {args.output}", file=sys.stderr)

    if not report["gate"]["authorized"]:
        sys.exit(8)  # EC008


if __name__ == "__main__":
    main()


__all__ = [
    "DATASET_ID",
    "PROTOCOL",
    "ERROR_CODE",
    "ImageRecord",
    "FeatureVector",
    "discover_images",
    "extract_features",
    "run_pipeline",
]
