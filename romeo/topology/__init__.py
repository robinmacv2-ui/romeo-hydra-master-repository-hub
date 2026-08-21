"""
ROMEO topology - fold information by preserving structural invariants.

Principle (Structure-Before-Specificity):
  Any digital object induces a space. Stable information lives in
  persistent structural features (components, cycles, critical order).
  Scaffolding (high-entropy, low-persistence detail) can be discarded
  or regenerated. Encoding the invariants is "folding"; reconstruction
  is "unfolding".

This is the foundation. Video compression (romeo.tools.video) is one
concrete application: temporal+spatial redundancy is scaffold; face,
voice and motion structure are the invariants we keep under a rate budget.

Applies to any file type: text, code, ledgers, binaries, media.
Offline. No cloud. Stdlib + optional numpy.
"""

from .fold import (
    FoldResult,
    fold_bytes,
    fold_text,
    unfold_text,
    structural_ratio,
)

__all__ = [
    "FoldResult",
    "fold_bytes",
    "fold_text",
    "unfold_text",
    "structural_ratio",
]
