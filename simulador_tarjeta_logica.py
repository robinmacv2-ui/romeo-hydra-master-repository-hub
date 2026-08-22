import hashlib
import json
from typing import Optional, Dict, Any
from core.ledger.worm_ledger import WormLedger

class TarjetaLogica:
    FUNDADOR = "Luis Angel Vazquez Martinez"
    
    def __init__(self, modo="Luminoso", vector=None, ledger: Optional[WormLedger] = None):
        self.modo = modo
        self.vector = vector if vector is not None else [1, 0, 0, 1]
        self.anclajes_T = {"N_T": 0, "E_T": 0, "S_T": 0, "O_T": 0}
        self.polaridades = {"S": "+", "I": "-", "N": "-", "O": "+"}
        self._ledger = ledger
        self._log("init")

    def _log(self, event_type: str, extra: Optional[Dict[str, Any]] = None):
        if self._ledger is None:
            return
        self._ledger.append(
            event_type=event_type,
            vector=self.vector,
            modo=self.modo,
            anclajes=self.propagar_flujo(),
            fingerprint=self.generar_fingerprint(),
            extra=extra,
        )

    def traducir_a_binario(self):
        res = []
        for i, val in enumerate(self.vector):
            if self.modo == "Luminoso":
                res.append(val)
            else:
                res.append(1 - val)
        return res

    def calcular_dualidad(self):
        nuevo_modo = "Oscuro" if self.modo == "Luminoso" else "Luminoso"
        nuevo_vector = [1 - v for v in self.vector]
        nuevas_polaridades = {k: ("-" if v == "+" else "+") for k, v in self.polaridades.items()}
        
        dual_card = TarjetaLogica(modo=nuevo_modo, vector=nuevo_vector, ledger=self._ledger)
        dual_card.polaridades = nuevas_polaridades
        
        self._log("calcular_dualidad", {"from": self.modo, "to": nuevo_modo})
        return dual_card

    def propagar_flujo(self):
        bin_vals = self.traducir_a_binario()
        v_S, v_I, v_N, v_O = bin_vals
        
        self.anclajes_T["N_T"] = v_N ^ v_O
        self.anclajes_T["E_T"] = v_S ^ v_O
        self.anclajes_T["S_T"] = v_S ^ v_I
        self.anclajes_T["O_T"] = v_I ^ v_N
        return self.anclajes_T

    def generar_fingerprint(self):
        payload = {
            "fundador": self.FUNDADOR,
            "protocolo": "Romeo-Aedra / Romeo-Hydra",
            "codice": "Códice Chip RRPH (Papel Picado Romeo Hydra)",
            "modo": self.modo,
            "vector": self.vector,
            "polaridades": self.polaridades,
            "anclajes_T": self.propagar_flujo()
        }
        serialized = json.dumps(payload, sort_keys=True).encode('utf-8')
        return hashlib.sha256(serialized).hexdigest()
