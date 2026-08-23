import unittest
import tempfile
import gc
from pathlib import Path

from core.ledger.worm_ledger_sqlite import WormLedgerSQLite


class TestWormLedgerSQLite(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / "ledger.db"
        self.ledger = WormLedgerSQLite(self.path)

    def tearDown(self):
        self.ledger.close()
        del self.ledger
        gc.collect()
        self.tmp.cleanup()

    def test_append_and_chain(self):
        e1 = self.ledger.append(
            "init", [1, 0, 0, 1], "Luminoso",
            {"N_T": 1, "E_T": 0, "S_T": 0, "O_T": 1}, "fp1"
        )
        e2 = self.ledger.append(
            "dual", [0, 1, 1, 0], "Oscuro",
            {"N_T": 0, "E_T": 1, "S_T": 1, "O_T": 0}, "fp2"
        )
        self.assertEqual(e1["seq"], 1)
        self.assertEqual(e2["prev_hash"], e1["entry_hash"])
        self.assertTrue(self.ledger.verify_integrity())

    def test_append_only_triggers(self):
        self.ledger.append(
            "init", [1, 0, 0, 1], "Luminoso",
            {"N_T": 1, "E_T": 0, "S_T": 0, "O_T": 1}, "fp1"
        )
        self.assertTrue(self.ledger.attempt_update_should_fail())
        self.assertTrue(self.ledger.attempt_delete_should_fail())
        self.assertEqual(len(self.ledger.get_entries()), 1)
        self.assertTrue(self.ledger.verify_integrity())

    def test_integrity_after_multiple(self):
        for i in range(5):
            self.ledger.append(
                f"evt_{i}", [i % 2, 0, 1, 1], "Luminoso",
                {"N_T": i % 2, "E_T": 0, "S_T": 1, "O_T": 1}, f"fp{i}"
            )
        self.assertTrue(self.ledger.verify_integrity())
        self.assertEqual(len(self.ledger.get_entries()), 5)


if __name__ == "__main__":
    unittest.main()
