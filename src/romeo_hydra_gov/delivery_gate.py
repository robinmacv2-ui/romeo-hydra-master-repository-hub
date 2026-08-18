from typing import Dict, Any, Union

class DeliveryGate:
    def decide(self, receipt: dict) -> dict:
        if receipt.get("delivery_authorization") == "granted" and receipt.get("homeostasis_check") == "pass":
            return {
                "status": "delivered",
                "message": "Entrega autorizada",
                "receipt_id": receipt.get("candidate_id"),
                "c2pa": receipt.get("c2pa_watermark")
            }
        return {
            "status": "blocked",
            "message": f"No puedo entregar por falta de evidencia estructural. Receipt: {receipt.get('candidate_id')}",
            "receipt_id": receipt.get("candidate_id")
        }
