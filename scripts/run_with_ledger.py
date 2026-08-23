import sys
from pathlib import Path

# Añadimos la raíz del monorepo al path de Python para encontrar simulador_tarjeta_logica
sys.path.append(str(Path(__file__).resolve().parent.parent))

from simulador_tarjeta_logica import TarjetaLogica
from core.ledger.worm_ledger import WormLedger

def main():
    ledger = WormLedger()
    card = TarjetaLogica(modo="Luminoso", vector=[1,0,0,1], ledger=ledger)
    print("Fingerprint Inicial:", card.generar_fingerprint())
    
    dual = card.calcular_dualidad()
    print("Fingerprint Dual:", dual.generar_fingerprint())
    
    print("Integridad WORM del Ledger OK:", ledger.verify_integrity())

if __name__ == "__main__":
    main()
