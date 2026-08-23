import unittest
import tempfile
import gc
from pathlib import Path

from core.tarjeta_logica import TarjetaLogica
from core.ledger.worm_ledger import WormLedger
from core.ledger.worm_ledger_sqlite import WormLedgerSQLite


class TestTarjetaLogica(unittest.TestCase):
    def test_fingerprint_deterministic(self):
        t1 = TarjetaLogica(modo="Luminoso", vector=[1, 0, 0, 1])
        t2 = TarjetaLogica(modo="Luminoso", vector=[1, 0, 0, 1])
        self.assertEqual(t1.generar_fingerprint(), t2.generar_fingerprint())

    def test_dualidad(self):
        t = TarjetaLogica(modo="Luminoso", vector=[1, 0, 0, 1])
        dual = t.calcular_dualidad()
        self.assertEqual(dual.modo, "Oscuro")
        self.assertEqual(dual.vector, [0, 1, 1, 0])
        self.assertNotEqual(t.generar_fingerprint(), dual.generar_fingerprint())

    def test_integration_json_ledger(self):
        with tempfile.TemporaryDirectory() as tmp:
            ledger = WormLedger(Path(tmp) / "l.json")
            t = TarjetaLogica(modo="Luminoso", vector=[1, 0, 0, 1], ledger=ledger)
            dual = t.calcular_dualidad()
            self.assertTrue(ledger.verify_integrity())
            entries = ledger.get_entries()
            self.assertGreaterEqual(len(entries), 2)

    def test_integration_sqlite_ledger(self):
        with tempfile.TemporaryDirectory() as tmp:
            db_path = Path(tmp) / "l.db"
            ledger = WormLedgerSQLite(db_path)
            try:
                t = TarjetaLogica(modo="Luminoso", vector=[1, 0, 0, 1], ledger=ledger)
                dual = t.calcular_dualidad()
                self.assertTrue(ledger.verify_integrity())
                self.assertTrue(ledger.attempt_update_should_fail())
                self.assertGreaterEqual(len(ledger.get_entries()), 2)
            finally:
                # Forzar liberación de handles en Windows
                ledger.close()
                del ledger
                del t
                del dual
                gc.collect()


if __name__ == "__main__":
    unittest.main()
