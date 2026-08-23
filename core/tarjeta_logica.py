from __future__ import annotations
import hashlib
import json
from typing import Dict, List, Optional, Any

class TarjetaLogica:
    def __init__(
        self,
        modo: str = "Luminoso",
        vector: Optional[List[int]] = None,
        ledger: Any = None,
    ):
        if vector is None:
            vector = [1, 0, 0, 1]
        if len(vector) != 4 or not all(v in (0, 1) for v in vector):
            raise ValueError("vector debe ser lista de 4 bits (0/1)")
        self.modo = modo
        self.vector = list(vector)
        self._ledger = ledger
        self._log("init")

    def traducir_a_binario(self) -> List[int]:
        return list(self.vector)

    def propagar_flujo(self) -> Dict[str, int]:
        n, e, s, o = self.vector
        return {"N_T": n, "E_T": e, "S_T": s, "O_T": o}

    def generar_fingerprint(self) -> str:
        payload = {
            "modo": self.modo,
            "vector": self.vector,
            "anclajes": self.propagar_flujo(),
        }
        serialized = json.dumps(payload, sort_keys=True).encode("utf-8")
        return hashlib.sha256(serialized).hexdigest()

    def calcular_dualidad(self) -> "TarjetaLogica":
        dual_vector = [1 - v for v in self.vector]
        dual_modo = "Oscuro" if self.modo == "Luminoso" else "Luminoso"
        dual = TarjetaLogica(modo=dual_modo, vector=dual_vector, ledger=self._ledger)
        self._log("calcular_dualidad", {"to_modo": dual_modo, "to_vector": dual_vector})
        return dual

    def _log(self, event_type: str, extra: Optional[Dict] = None) -> None:
        if self._ledger is None:
            return
        self._ledger.append(
            event_type=event_type,
            vector=self.vector,
            modo=self.modo,
            anclajes=self.propagar_flujo(),
            fingerprint=self.generar_fingerprint(),
            extra=extra or {},
        )
