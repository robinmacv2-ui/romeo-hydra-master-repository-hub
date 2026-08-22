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
