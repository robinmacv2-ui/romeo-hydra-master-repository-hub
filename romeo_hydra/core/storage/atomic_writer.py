# -*- coding: utf-8 -*-
"""
Atomic two-phase ledger writer - zero external dependencies.

Lifecycle per entry:
  PENDING  -> fsync -> COMMITTED -> fsync

On startup, sanitize_startup() truncates any trailing PENDING block
(fail-closed recovery after power-loss / kill -9).

Root of trust: GENESIS_HASH (Satoshi model). Writer refuses to open if
genesis verification fails.

Author: Luis Angel Vazquez Martinez
"""

from __future__ import annotations

import hashlib
import json
import os
import tempfile
from pathlib import Path
from typing import Any, Dict, List

from romeo_hydra.genesis import GENESIS_HASH, assert_genesis_or_die

SEPARATOR = "\n---\n"
STATUS_PENDING = "STATUS: PENDING"
STATUS_COMMITTED = "STATUS: COMMITTED"
STATUS_GENESIS = "STATUS: GENESIS"


def _sha256_payload(payload: dict) -> str:
    raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def _format_block(status_line: str, payload_hash: str, payload_str: str) -> str:
    return (
        f"{status_line}\n"
        f"HASH: {payload_hash}\n"
        f"PAYLOAD: {payload_str}\n"
    )


class AtomicLedgerWriter:
    """
    Native-file two-phase append for a JSONL-like ledger.

    No databases. No third-party deps. Only os / pathlib / hashlib / json.
    Requires valid GENESIS_HASH before any operation.
    """

    def __init__(self, ledger_path: str | Path, *, require_genesis: bool = True):
        if require_genesis:
            assert_genesis_or_die()
        self.ledger_path = Path(ledger_path)
        self.genesis_hash = GENESIS_HASH
        self._ensure_ledger_exists()

    def _ensure_ledger_exists(self) -> None:
        self.ledger_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.ledger_path.exists():
            # Seal empty ledger with genesis marker (root of chain).
            # One clean block + single SEPARATOR (no blank line before ---).
            marker = (
                f"{STATUS_GENESIS}\n"
                f"HASH: {GENESIS_HASH}\n"
                f"PAYLOAD: {{\"role\":\"genesis\",\"hash\":\"{GENESIS_HASH}\"}}"
                f"{SEPARATOR}"
            )
            self._atomic_write_bytes(marker.encode("utf-8"))

    def sanitize_startup(self) -> int:
        """
        Scan ledger at boot. Drop any trailing PENDING block (incomplete
        transaction after power-loss). Keep GENESIS + COMMITTED blocks.

        Returns number of COMMITTED blocks retained (excludes genesis marker).
        """
        assert_genesis_or_die()
        if not self.ledger_path.exists():
            self._ensure_ledger_exists()
            return 0

        content = self.ledger_path.read_text(encoding="utf-8")
        if not content.strip():
            self._ensure_ledger_exists()
            return 0

        blocks = [
            b.strip()
            for b in content.strip().split(SEPARATOR)
            if b.strip() and b.strip() != "---"
        ]
        keep: List[str] = []

        for block in blocks:
            if STATUS_PENDING in block:
                break
            if STATUS_GENESIS in block or STATUS_COMMITTED in block:
                keep.append(block)

        # Fail-closed: genesis marker must remain first if present
        if keep and STATUS_GENESIS not in keep[0] and STATUS_GENESIS in content:
            # Reconstruct with genesis first
            genesis_blocks = [b for b in keep if STATUS_GENESIS in b]
            committed = [b for b in keep if STATUS_COMMITTED in b]
            keep = genesis_blocks[:1] + committed

        self._atomic_rewrite(keep)
        return sum(1 for b in keep if STATUS_COMMITTED in b)

    def append_entry(self, payload: Dict[str, Any]) -> bool:
        """
        Two-phase write:
          1) Append PENDING block + fsync
          2) Rewrite last block as COMMITTED + fsync

        On any I/O failure -> sanitize_startup() and return False.
        """
        assert_genesis_or_die()
        payload_str = json.dumps(payload, sort_keys=True, separators=(",", ":"))
        payload_hash = _sha256_payload(payload)

        pending_body = _format_block(STATUS_PENDING, payload_hash, payload_str)

        try:
            with open(self.ledger_path, "a", encoding="utf-8") as f:
                f.write(pending_body)
                f.write(SEPARATOR)
                f.flush()
                os.fsync(f.fileno())

            content = self.ledger_path.read_text(encoding="utf-8")
            marker = f"{STATUS_PENDING}\nHASH: {payload_hash}\n"
            idx = content.rfind(marker)
            if idx < 0:
                self.sanitize_startup()
                return False

            updated = content[:idx] + content[idx:].replace(
                STATUS_PENDING, STATUS_COMMITTED, 1
            )
            self._atomic_write_bytes(updated.encode("utf-8"))
            return True

        except OSError:
            self.sanitize_startup()
            return False

    def list_committed(self) -> List[Dict[str, Any]]:
        """Return parsed COMMITTED payloads in order (read-only; skips genesis)."""
        if not self.ledger_path.exists():
            return []
        content = self.ledger_path.read_text(encoding="utf-8")
        out: List[Dict[str, Any]] = []
        for block in content.strip().split(SEPARATOR):
            block = block.strip()
            if not block or STATUS_COMMITTED not in block:
                continue
            for line in block.splitlines():
                if line.startswith("PAYLOAD: "):
                    try:
                        out.append(json.loads(line[len("PAYLOAD: "):]))
                    except json.JSONDecodeError:
                        pass
                    break
        return out

    def chain_ok(self) -> bool:
        """True if genesis matches, no PENDING, and every COMMITTED hash matches payload."""
        if not verify_soft():
            return False
        if not self.ledger_path.exists():
            return True
        content = self.ledger_path.read_text(encoding="utf-8")
        if STATUS_PENDING in content:
            return False
        if GENESIS_HASH not in content and content.strip():
            # Non-empty ledger without genesis hash is illegitimate
            return False
        for block in content.strip().split(SEPARATOR):
            block = block.strip()
            if not block or block == "---":
                # Tolerate leftover separator noise from older writes / rewrites
                continue
            if STATUS_GENESIS in block:
                if GENESIS_HASH not in block:
                    return False
                continue
            if STATUS_COMMITTED not in block:
                return False
            h_line = None
            p_line = None
            for line in block.splitlines():
                if line.startswith("HASH: "):
                    h_line = line[len("HASH: "):].strip()
                elif line.startswith("PAYLOAD: "):
                    p_line = line[len("PAYLOAD: "):]
            if not h_line or p_line is None:
                return False
            try:
                payload = json.loads(p_line)
            except json.JSONDecodeError:
                return False
            if _sha256_payload(payload) != h_line:
                return False
        return True

    def _atomic_rewrite(self, blocks: List[str]) -> None:
        # Normalize: strip each block, drop empties / pure separators
        clean = [b.strip() for b in blocks if b and b.strip() and b.strip() != "---"]
        if clean:
            text = SEPARATOR.join(clean) + SEPARATOR
        else:
            text = ""
        self._atomic_write_bytes(text.encode("utf-8"))

    def _atomic_write_bytes(self, data: bytes) -> None:
        """Write via temp file + fsync + os.replace (atomic on POSIX)."""
        directory = self.ledger_path.parent
        fd, tmp_name = tempfile.mkstemp(
            prefix=".ledger_", suffix=".tmp", dir=str(directory)
        )
        try:
            with os.fdopen(fd, "wb") as tmp:
                tmp.write(data)
                tmp.flush()
                os.fsync(tmp.fileno())
            os.replace(tmp_name, self.ledger_path)
            try:
                dir_fd = os.open(str(directory), os.O_RDONLY)
                try:
                    os.fsync(dir_fd)
                finally:
                    os.close(dir_fd)
            except OSError:
                pass
        except Exception:
            try:
                os.unlink(tmp_name)
            except OSError:
                pass
            raise


def verify_soft() -> bool:
    from romeo_hydra.genesis import verify_genesis

    return verify_genesis()
