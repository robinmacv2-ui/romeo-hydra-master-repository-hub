import unittest
import tempfile
from pathlib import Path
from core.ledger.worm_ledger import WormLedger


class TestWormLedgerJSON(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / "ledger.json"
        self.ledger = WormLedger(self.path)

    def tearDown(self):
        self.tmp.cleanup()

    def test_append_and_chain(self):
        e1 = self.ledger.append("init", [1, 0, 0, 1], "Luminoso",
                                {"N_T": 1, "E_T": 0, "S_T": 0, "O_T": 1},
                                "fp1")
        e2 = self.ledger.append("dual", [0, 1, 1, 0], "Oscuro",
                                {"N_T": 0, "E_T": 1, "S_T": 1, "O_T": 0},
                                "fp2")
        self.assertEqual(e1["seq"], 1)
        self.assertEqual(e2["seq"], 2)
        self.assertEqual(e2["prev_hash"], e1["entry_hash"])
        self.assertTrue(self.ledger.verify_integrity())

    def test_integrity_breaks_on_tamper(self):
        self.ledger.append("init", [1, 0, 0, 1], "Luminoso",
                           {"N_T": 1, "E_T": 0, "S_T": 0, "O_T": 1}, "fp1")
        data = self.ledger._read()
        data[0]["payload"]["vector"] = [0, 0, 0, 0]
        self.ledger._write(data)
        self.assertFalse(self.ledger.verify_integrity())

    def test_empty_ledger_integrity(self):
        self.assertTrue(self.ledger.verify_integrity())


if __name__ == "__main__":
    unittest.main()
