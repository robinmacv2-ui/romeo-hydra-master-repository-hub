from typing import Dict
def check_homeostasis(evidence: Dict) -> str:
    if not evidence: return "fail"
    if evidence.get("estado_previo_hash") is None: return "fail"
    return "pass"
