import numpy as np
import hashlib
import json
from datetime import datetime

class ROMEOKernelSigma:
    def __init__(self, author: str = "Luis Angel Vazquez Martinez"):
        self.author = author
        self.threshold = 0.05

    def evaluate_risk(self, risk_score: float) -> dict:
        timestamp = datetime.utcnow().isoformat()
        status = "SECURED" if risk_score <= self.threshold else "CLIPPED_PROJECTION"
        applied_score = min(risk_score, self.threshold)
        
        raw_data = f"{timestamp}:{applied_score}:{status}:{self.author}"
        sha_hash = hashlib.sha256(raw_data.encode('utf-8')).hexdigest()

        return {
            "timestamp": timestamp,
            "original_score": risk_score,
            "applied_score": applied_score,
            "status": status,
            "hash_sha256": sha_hash,
            "author": self.author
        }

if __name__ == "__main__":
    kernel = ROMEOKernelSigma()
    res = kernel.evaluate_risk(0.09)
    print("--- INGESTION KERNEL SIGMA ---")
    print(json.dumps(res, indent=2))
