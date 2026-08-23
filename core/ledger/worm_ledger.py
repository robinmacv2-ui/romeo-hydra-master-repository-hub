from __future__ import annotations
import json
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional


class WormLedger:
    def __init__(self, path: Path | str = "core/ledger/delta_ledger_registry.json"):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self._write([])

    def _read(self) -> List[Dict[str, Any]]:
        try:
            with self.path.open("r", encoding="utf-8") as f:
                data = json.load(f)
            if not isinstance(data, list):
                raise ValueError("Ledger debe ser un array JSON")
            return data
        except (json.JSONDecodeError, ValueError) as e:
            raise RuntimeError(f"Ledger corrupto o inválido: {e}") from e

    def _write(self, entries: List[Dict[str, Any]]) -> None:
        tmp = self.path.with_suffix(".tmp")
        with tmp.open("w", encoding="utf-8") as f:
            json.dump(entries, f, indent=2, ensure_ascii=False, sort_keys=True)
        tmp.replace(self.path)

    def _chain_hash(self, prev_hash: Optional[str], payload: Dict[str, Any]) -> str:
        blob = (prev_hash or "GENESIS") + json.dumps(payload, sort_keys=True, ensure_ascii=False)
        return hashlib.sha256(blob.encode("utf-8")).hexdigest()

    def append(
        self,
        event_type: str,
        vector: List[int],
        modo: str,
        anclajes: Dict[str, int],
        fingerprint: str,
        extra: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        entries = self._read()
        prev_hash = entries[-1]["entry_hash"] if entries else None
        payload = {
            "ts_utc": datetime.now(timezone.utc).isoformat(),
            "event_type": event_type,
            "modo": modo,
            "vector": vector,
            "anclajes_T": anclajes,
            "fingerprint_sha256": fingerprint,
            "extra": extra or {},
        }
        entry = {
            "seq": len(entries) + 1,
            "prev_hash": prev_hash,
            "payload": payload,
            "entry_hash": self._chain_hash(prev_hash, payload),
        }
        entries.append(entry)
        self._write(entries)
        return entry

    def verify_integrity(self) -> bool:
        entries = self._read()
        prev = None
        for e in entries:
            expected = self._chain_hash(prev, e["payload"])
            if e.get("entry_hash") != expected or e.get("prev_hash") != prev:
                return False
            prev = e["entry_hash"]
        return True

    def get_entries(self) -> List[Dict[str, Any]]:
        return self._read()
