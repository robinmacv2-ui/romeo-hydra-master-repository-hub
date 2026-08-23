from __future__ import annotations

import json
import hashlib
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional


class WormLedgerSQLite:
    """
    Append-only ledger con SQLite.
    Triggers impiden UPDATE y DELETE (fail-closed).
    Gestión explícita de conexiones para evitar locks en Windows.
    """

    def __init__(self, path: Path | str = "core/ledger/delta_ledger.db"):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(
            self.path,
            timeout=30.0,
            check_same_thread=False,
        )
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA foreign_keys=ON;")
        conn.execute("PRAGMA busy_timeout=30000;")
        return conn

    def _init_db(self) -> None:
        conn = self._connect()
        try:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS ledger_entries (
                    seq INTEGER PRIMARY KEY AUTOINCREMENT,
                    prev_hash TEXT,
                    entry_hash TEXT NOT NULL UNIQUE,
                    payload_json TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );

                CREATE TRIGGER IF NOT EXISTS prevent_update
                BEFORE UPDATE ON ledger_entries
                BEGIN
                    SELECT RAISE(ABORT, 'UPDATE forbidden: append-only ledger');
                END;

                CREATE TRIGGER IF NOT EXISTS prevent_delete
                BEFORE DELETE ON ledger_entries
                BEGIN
                    SELECT RAISE(ABORT, 'DELETE forbidden: append-only ledger');
                END;
                """
            )
            conn.commit()
        finally:
            conn.close()

    def _chain_hash(self, prev_hash: Optional[str], payload: Dict[str, Any]) -> str:
        blob = (prev_hash or "GENESIS") + json.dumps(
            payload, sort_keys=True, ensure_ascii=False
        )
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
        conn = self._connect()
        try:
            cur = conn.execute(
                "SELECT entry_hash FROM ledger_entries ORDER BY seq DESC LIMIT 1"
            )
            row = cur.fetchone()
            prev_hash = row["entry_hash"] if row else None

            payload = {
                "ts_utc": datetime.now(timezone.utc).isoformat(),
                "event_type": event_type,
                "modo": modo,
                "vector": vector,
                "anclajes_T": anclajes,
                "fingerprint_sha256": fingerprint,
                "extra": extra or {},
            }
            entry_hash = self._chain_hash(prev_hash, payload)

            cur = conn.execute(
                """
                INSERT INTO ledger_entries (prev_hash, entry_hash, payload_json, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (
                    prev_hash,
                    entry_hash,
                    json.dumps(payload, ensure_ascii=False, sort_keys=True),
                    payload["ts_utc"],
                ),
            )
            seq = cur.lastrowid
            conn.commit()
        finally:
            conn.close()

        return {
            "seq": seq,
            "prev_hash": prev_hash,
            "payload": payload,
            "entry_hash": entry_hash,
        }

    def verify_integrity(self) -> bool:
        conn = self._connect()
        try:
            cur = conn.execute(
                "SELECT seq, prev_hash, entry_hash, payload_json "
                "FROM ledger_entries ORDER BY seq"
            )
            rows = cur.fetchall()
        finally:
            conn.close()

        prev = None
        for r in rows:
            payload = json.loads(r["payload_json"])
            expected = self._chain_hash(prev, payload)
            if r["entry_hash"] != expected or r["prev_hash"] != prev:
                return False
            prev = r["entry_hash"]
        return True

    def get_entries(self) -> List[Dict[str, Any]]:
        conn = self._connect()
        try:
            cur = conn.execute(
                "SELECT seq, prev_hash, entry_hash, payload_json "
                "FROM ledger_entries ORDER BY seq"
            )
            rows = cur.fetchall()
        finally:
            conn.close()

        return [
            {
                "seq": r["seq"],
                "prev_hash": r["prev_hash"],
                "entry_hash": r["entry_hash"],
                "payload": json.loads(r["payload_json"]),
            }
            for r in rows
        ]

    def attempt_update_should_fail(self) -> bool:
        conn = self._connect()
        try:
            conn.execute(
                "UPDATE ledger_entries SET entry_hash = 'tampered' WHERE seq = 1"
            )
            conn.commit()
            return False
        except sqlite3.IntegrityError as e:
            msg = str(e).lower()
            return "update forbidden" in msg or "append-only" in msg
        except Exception:
            return False
        finally:
            conn.close()

    def attempt_delete_should_fail(self) -> bool:
        conn = self._connect()
        try:
            conn.execute("DELETE FROM ledger_entries WHERE seq = 1")
            conn.commit()
            return False
        except sqlite3.IntegrityError as e:
            msg = str(e).lower()
            return "delete forbidden" in msg or "append-only" in msg
        except Exception:
            return False
        finally:
            conn.close()

    def close(self) -> None:
        """No-op explícito para compatibilidad con tests. Las conexiones ya se cierran."""
        pass
