import json
import os
from simulador_tarjeta_logica import TarjetaLogica

LEDGER_PATH = "delta_ledger_registry.json"

def registrar_estado_en_ledger():
    card = TarjetaLogica(modo="Luminoso", vector=[1, 0, 0, 1])
    fingerprint = card.generar_fingerprint()
    nuevo_registro = {
        "modulo": "CODICE_PPRH",
        "fundador": card.FUNDADOR,
        "modo": card.modo,
        "vector_sino": card.vector,
        "anclajes_t": card.propagar_flujo(),
        "sha256_sello": fingerprint
    }
    if os.path.exists(LEDGER_PATH):
        with open(LEDGER_PATH, "r", encoding="utf-8") as pf:
            try:
                ledger_data = json.load(pf)
                if not isinstance(ledger_data, list):
                    ledger_data = [ledger_data]
            except json.JSONDecodeError:
                ledger_data = []
    else:
        ledger_data = []
    ledger_data.append(nuevo_registro)
    with open(LEDGER_PATH, "w", encoding="utf-8") as pf:
        json.dump(ledger_data, pf, indent=4)
    print(f"[OK] Estado del Códice PPRH enlazado al Ledger Local. Sello: {fingerprint[:16]}...")

if __name__ == "__main__":
    registrar_estado_en_ledger()
