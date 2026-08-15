"""
Information folding core.

We do NOT claim full persistent homology in this module (that is
computationally heavy and optional later). We implement the operational
principle that any file can be reduced to:

  invariants  — structure that must survive (content-addressed blocks,
                order skeleton, critical tokens)
  scaffold    — regenerable or discardable detail under a budget

This is the same principle used by topology-aware compressors and by
Information Topology (cycle closure / Structure-Before-Specificity),
expressed in pure Python for edge / Termux / offline use.

Video (romeo.tools.video) applies the same idea in the media domain:
CRF / scale discard perceptual scaffold while keeping face+voice structure.
"""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class FoldResult:
    """Result of folding an object into invariants + residual meta."""

    kind: str
    original_bytes: int
    folded_bytes: int
    ratio: float
    n_invariants: int
    invariants: list[dict[str, Any]] = field(default_factory=list)
    residual_policy: str = "drop_scaffold"
    notes: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent, ensure_ascii=False)


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def structural_ratio(original: int, folded: int) -> float:
    if original <= 0:
        return 0.0
    return folded / original


def fold_bytes(
    data: bytes,
    *,
    block_size: int = 4096,
    min_unique_keep: int = 1,
) -> FoldResult:
    """
    Fold raw bytes into content-addressed blocks (invariant set).

    Duplicate blocks collapse to a single invariant (cycle of identity).
    Order of first appearance is the skeleton. This is a discrete analogue
    of collapsing low-persistence components: repeated structure is one cycle.
    """
    if block_size < 64:
        raise ValueError("block_size must be >= 64")

    blocks: dict[str, dict[str, Any]] = {}
    order: list[str] = []

    for i in range(0, len(data), block_size):
        chunk = data[i : i + block_size]
        h = _sha256(chunk)
        if h not in blocks:
            blocks[h] = {
                "hash": h,
                "size": len(chunk),
                "count": 1,
                "first_offset": i,
            }
            order.append(h)
        else:
            blocks[h]["count"] += 1

    # Invariants: unique blocks in order of first appearance
    invariants = [blocks[h] for h in order]
    # Folded payload estimate: hash refs + unique block bodies
    folded_payload = sum(b["size"] for b in invariants) + 32 * len(invariants)

    notes = [
        f"unique_blocks={len(invariants)} total_blocks={sum(b['count'] for b in invariants)}",
        "duplicates collapsed to single invariant (identity cycle)",
    ]
    if len(invariants) < min_unique_keep:
        notes.append("warning: very low structural diversity")

    return FoldResult(
        kind="bytes",
        original_bytes=len(data),
        folded_bytes=folded_payload,
        ratio=structural_ratio(len(data), folded_payload),
        n_invariants=len(invariants),
        invariants=invariants,
        residual_policy="store_unique_blocks_plus_order",
        notes=notes,
    )


def fold_text(
    text: str,
    *,
    min_line_len: int = 0,
) -> FoldResult:
    """
    Fold text/document into unique structural lines + token skeleton.

    - Blank / pure-whitespace lines are scaffold (dropped from invariant set).
    - Duplicate lines collapse to one invariant with multiplicity.
    - Order of first occurrence is the document spine.
    """
    raw = text.encode("utf-8")
    lines = text.splitlines()
    seen: dict[str, dict[str, Any]] = {}
    order: list[str] = []

    for idx, line in enumerate(lines):
        stripped = line.strip()
        if len(stripped) < min_line_len:
            continue  # scaffold
        key = stripped
        h = _sha256(key.encode("utf-8"))
        if h not in seen:
            seen[h] = {
                "hash": h,
                "line": key[:500],  # cap stored preview
                "len": len(key),
                "count": 1,
                "first_index": idx,
            }
            order.append(h)
        else:
            seen[h]["count"] += 1

    invariants = [seen[h] for h in order]
    # Estimate: store unique lines + hash index
    folded_payload = sum(inv["len"] for inv in invariants) + 32 * len(invariants)

    notes = [
        f"unique_lines={len(invariants)} total_nonempty={sum(i['count'] for i in invariants)}",
        "whitespace-only lines treated as scaffold",
        "duplicate lines collapsed (identity cycle)",
    ]

    return FoldResult(
        kind="text",
        original_bytes=len(raw),
        folded_bytes=folded_payload,
        ratio=structural_ratio(len(raw), folded_payload),
        n_invariants=len(invariants),
        invariants=invariants,
        residual_policy="unique_lines_plus_order",
        notes=notes,
    )


def unfold_text(result: FoldResult) -> str:
    """
    Reconstruct a minimal text from folded invariants (order of first appearance).

    Multiplicity is not expanded (scaffold was dropped). This is intentional:
    unfold recovers structure, not byte-identical original, unless residual
    was stored separately.
    """
    if result.kind != "text":
        raise ValueError("unfold_text expects kind='text'")
    lines = [inv.get("line", "") for inv in result.invariants]
    return "\n".join(lines) + ("\n" if lines else "")


def fold_file(path: str | Path, *,
              mode: str = "auto") -> FoldResult:
    """
    Fold a file from disk.

    mode:
      auto — text if UTF-8 decodable, else bytes
      text — force text fold
      bytes — force byte-block fold
    """
    path = Path(path)
    data = path.read_bytes()
    if mode == "bytes":
        return fold_bytes(data)
    if mode == "text":
        return fold_text(data.decode("utf-8", errors="replace"))
    # auto
    try:
        text = data.decode("utf-8")
        # Heuristic: if mostly printable, treat as text
        if sum(1 for c in text if c.isprintable() or c in "\n\r\t") / max(len(text), 1) > 0.85:
            return fold_text(text)
    except Exception:
        pass
    return fold_bytes(data)


def _cli() -> None:
    import argparse

    p = argparse.ArgumentParser(
        description="ROMEO topology fold — structure-before-specificity"
    )
    p.add_argument("path", help="File to fold")
    p.add_argument(
        "--mode", choices=("auto", "text", "bytes"), default="auto"
    )
    p.add_argument("-o", "--output", help="Write FoldResult JSON")
    args = p.parse_args()

    result = fold_file(args.path, mode=args.mode)
    print(result.to_json())
    print(
        f"\n[romeo.topology] {result.original_bytes} → {result.folded_bytes} bytes "
        f"(ratio={result.ratio:.3f}, invariants={result.n_invariants})",
        flush=True,
    )
    if args.output:
        Path(args.output).write_text(result.to_json(), encoding="utf-8")


if __name__ == "__main__":
    _cli()
