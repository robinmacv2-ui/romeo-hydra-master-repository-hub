from __future__ import annotations
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict
from .paths import receipts_zettel
def create_atomic_note(event: str, data: Dict) -> str:
    receipts_zettel().mkdir(parents=True, exist_ok=True)
    note_id = f"Z-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    note = {"id": note_id, "timestamp": datetime.now(timezone.utc).isoformat(), "event": event, "data": data, "links": []}
    path = receipts_zettel() / f"{note_id}.json"
    path.write_text(json.dumps(note, indent=2), encoding="utf-8")
    return note_id
