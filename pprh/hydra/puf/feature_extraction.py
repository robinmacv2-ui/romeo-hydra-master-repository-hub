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
from pathlib import Path
from typing import Any, Iterable, Sequence

# ---------------------------------------------------------------------------
# Experimental constants (Phase C.1) — same budget as the gate release
# ---------------------------------------------------------------------------

EXPERIMENTAL_HINF = 33.9
EXPERIMENTAL_HELPER_BITS = 495.0
EXPERIMENTAL_SAFETY_MARGIN = 16.0

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

    All numeric fields start as placeholders. Replace with real
    measurements from image analysis when available.
    """

    dataset_id: str = DATASET_ID
    protocol: str = PROTOCOL
    n_images: int = 0
    # Geometric / visual proxies (to be filled by real extractors)
    fold_count_estimate: float | None = None
    mean_edge_density: float | None = None
    residual_stress_proxy: float | None = None
    scale_mm_per_pixel: float | None = None
    volume_cm3_estimate: float | None = None
    # Entropy placeholders
    measured_hinf: float = EXPERIMENTAL_HINF
    helper_bits: float = EXPERIMENTAL_HELPER_BITS
    safety_margin: float = EXPERIMENTAL_SAFETY_MARGIN
    remaining: float = field(init=False)
    feature_digest: str = field(default="", init=False)
    extra: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.remaining = (
            self.measured_hinf - self.helper_bits - self.safety_margin
        )
        # Stable digest of the public feature payload (no secrets).
        payload = {
            "dataset_id": self.dataset_id,
            "protocol": self.protocol,
            "n_images": self.n_images,
            "fold_count_estimate": self.fold_count_estimate,
            "mean_edge_density": self.mean_edge_density,
            "residual_stress_proxy": self.residual_stress_proxy,
            "scale_mm_per_pixel": self.scale_mm_per_pixel,
            "volume_cm3_estimate": self.volume_cm3_estimate,
            "measured_hinf": self.measured_hinf,
            "helper_bits": self.helper_bits,
            "safety_margin": self.safety_margin,
            "remaining": self.remaining,
            "extra": self.extra,
        }
        raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode(
            "utf-8"
        )
        self.feature_digest = hashlib.sha256(raw).hexdigest()


@dataclass
class GateDecision:
    authorized: bool
    code: str
    remaining: float
    message: str
    feature_digest: str


# ---------------------------------------------------------------------------
# Loaders (skeleton)
# ---------------------------------------------------------------------------


def discover_images(
    root: str | Path,
    patterns: Sequence[str] = ("*.jpg", "*.jpeg", "*.png", "*.webp"),
) -> list[ImageRecord]:
    """
    List image files under root. Does not open or analyse them yet.

    Assigns a coarse role from the filename when possible.
    """
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
    """Placeholder: mean edge density. Replace with Canny / Sobel pipeline."""
    return None


def _stub_fold_count(_path: str) -> float | None:
    """Placeholder: estimated number of visible folds."""
    return None


def _stub_residual_stress(_path: str) -> float | None:
    """Placeholder: residual plastic stress proxy from topography."""
    return None


def _stub_scale_mm_per_pixel(_path: str) -> float | None:
    """
    Placeholder: mm per pixel using the 1-peso coin (~21 mm diameter).
    Replace with circle detection + known diameter.
    """
    return None


def extract_features(images: Iterable[ImageRecord]) -> FeatureVector:
    """
    Build a FeatureVector from a list of ImageRecord.

    Current behaviour:
    - Counts images.
    - Leaves geometric fields as None (stubs).
    - Uses experimental entropy constants → remaining < 0.
    """
    image_list = list(images)
    fv = FeatureVector(n_images=len(image_list))

    # Aggregate simple stubs (still None until real extractors exist)
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

    # Volume remains experimental default (~1 cm3) until metrology exists
    fv.volume_cm3_estimate = 1.0
    fv.extra["roles"] = sorted({r.role for r in image_list})
    fv.extra["source_count"] = len(image_list)

    # Recompute digest / remaining after mutation
    fv.__post_init__()
    return fv


# ---------------------------------------------------------------------------
# Entropy gate interface (local mirror of the formal gate)
# ---------------------------------------------------------------------------


def evaluate_gate(fv: FeatureVector) -> GateDecision:
    """
    Fail-closed decision compatible with PPRH_EC008.

    Prefer importing the real gate from pprh.hydra.puf.entropy_gate when
    available; this local copy keeps the skeleton self-contained.
    """
    remaining = fv.remaining
    if remaining > 0:
        return GateDecision(
            authorized=True,
            code="PPRH_OK",
            remaining=remaining,
            message="Entropy budget positive; authorization granted (experimental).",
            feature_digest=fv.feature_digest,
        )
    return GateDecision(
        authorized=False,
        code="PPRH_EC008",
        remaining=remaining,
        message=(
            "KEY DERIVATION FORBIDDEN: remaining entropy budget is not positive. "
            "Replace experimental Hinf / helper with real measurements."
        ),
        feature_digest=fv.feature_digest,
    )


def try_real_gate(fv: FeatureVector) -> GateDecision:
    """
    Prefer the official entropy_gate if importable; fall back to local evaluate_gate.
    """
    try:
        from pprh.hydra.puf.entropy_gate import evaluate_puf_security  # type: ignore

        report = evaluate_puf_security(
            measured_hinf=fv.measured_hinf,
            helper_bits=fv.helper_bits,
        )
        authorized = bool(report.get("authorized", False))
        return GateDecision(
            authorized=authorized,
            code=str(report.get("code", "PPRH_EC008" if not authorized else "PPRH_OK")),
            remaining=float(report.get("remaining", fv.remaining)),
            message=str(report.get("message", "")),
            feature_digest=fv.feature_digest,
        )
    except Exception:
        return evaluate_gate(fv)


# ---------------------------------------------------------------------------
# Pipeline entry point
# ---------------------------------------------------------------------------


def run_pipeline(image_root: str | Path) -> dict[str, Any]:
    """
    End-to-end skeleton:

    1. Discover images under image_root
    2. Extract (stub) features
    3. Evaluate entropy gate
    4. Return a JSON-serialisable report
    """
    images = discover_images(image_root)
    fv = extract_features(images)
    decision = try_real_gate(fv)

    return {
        "dataset_id": fv.dataset_id,
        "protocol": fv.protocol,
        "n_images": fv.n_images,
        "features": asdict(fv),
        "gate": asdict(decision),
        "note": (
            "Skeleton only. measured_hinf / helper_bits are experimental constants. "
            "Do not use for key derivation until remaining > 0 with real data."
        ),
    }


def main() -> None:
    import argparse
    import sys

    parser = argparse.ArgumentParser(
        description="HYDRA-FOLD-v1 feature extraction skeleton (fail-closed)."
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

    # Exit non-zero if gate forbids derivation (expected today)
    if not report["gate"]["authorized"]:
        sys.exit(8)  # 8 ~ EC008


if __name__ == "__main__":
    main()


__all__ = [
    "DATASET_ID",
    "PROTOCOL",
    "ImageRecord",
    "FeatureVector",
    "GateDecision",
    "discover_images",
    "extract_features",
    "evaluate_gate",
    "try_real_gate",
    "run_pipeline",
]
