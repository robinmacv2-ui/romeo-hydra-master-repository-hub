from __future__ import annotations
import json, uuid
from datetime import datetime, timezone
from typing import Dict, Any
from .paths import receipts_final
from .homeostasis import check_homeostasis
from .zettel_integration import create_atomic_note

class RDDReceiptGenerator:
    def generate_receipt(self, candidate: dict, evidence: dict) -> dict:
        homeo = check_homeostasis(evidence)
        receipt = {
            "candidate_id": candidate.get("id"),
            "evidence": evidence,
            "homeostasis_check": homeo,
            "quantum_logic_card_id": "card_default",
            "delivery_authorization": "granted" if homeo == "pass" else "denied",
            "c2pa_watermark": "preserve",
            "zettelkasten_note_id": create_atomic_note("receipt", {"candidate": candidate.get("id")}),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        path = receipts_final() / f"receipt_{candidate.get('id')}.json"
        path.write_text(json.dumps(receipt, indent=2), encoding="utf-8")
        return receipt

    def authorize_delivery(self, receipt: dict) -> bool:
        return receipt.get("homeostasis_check") == "pass" and receipt.get("delivery_authorization") == "granted"

    def preserve_c2pa(self, receipt: dict) -> dict:
        receipt["c2pa_watermark"] = "preserve"
        return receipt
