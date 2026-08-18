from __future__ import annotations
import json, uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any
from .paths import receipts_final

class RDDReceiptGenerator:
    def generate_receipt(self, candidate: dict, evidence: dict) -> dict:
        receipts_final().mkdir(parents=True, exist_ok=True)
        receipt = {
            "candidate_id": candidate.get("id"),
            "evidence": evidence,
            "homeostasis_check": "pass" if evidence.get("estado_previo_hash") != evidence.get("estado_posterior_hash") or candidate.get("tool") == "write" else "pass",
            "quantum_logic_card_id": candidate.get("politica_aplicada", "card_default"),
            "delivery_authorization": "granted",
            "c2pa_watermark": "preserve",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        # homeostasis simple
        if evidence.get("estado_previo_hash") == evidence.get("estado_posterior_hash") and candidate.get("tool") != "write":
            receipt["homeostasis_check"] = "fail"
            receipt["delivery_authorization"] = "denied"
        return receipt
    def preserve_c2pa(self, receipt: dict) -> dict:
        receipt["c2pa_watermark"] = "preserve"
        return receipt

class DeliveryGate:
    def decide(self, receipt: dict) -> dict:
        if receipt.get("homeostasis_check") != "pass":
            return {"status": "blocked", "message": "No puedo entregar por falla de homeostasis", "receipt_id": receipt.get("candidate_id"), "c2pa": "preserve"}
        if receipt.get("delivery_authorization") != "granted":
            return {"status": "blocked", "message": "No puedo entregar por falta de evidencia estructural", "receipt_id": receipt.get("candidate_id"), "c2pa": "preserve"}
        receipts_final().mkdir(parents=True, exist_ok=True)
        path = receipts_final() / f"{receipt.get('candidate_id')}.json"
        path.write_text(json.dumps(receipt, indent=2), encoding="utf-8")
        return {"status": "delivered", "message": "Entrega autorizada", "receipt_id": receipt.get("candidate_id"), "c2pa": "preserve"}
