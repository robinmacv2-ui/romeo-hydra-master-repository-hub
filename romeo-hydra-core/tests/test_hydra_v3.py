# tests/test_hydra_v3.py
# Adversarial test suite for ROMEO-HYDRA V3.0-RC1
# Offline · Python 3.11 stdlib only

import unittest
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from pilot.faro import proyectar, parse, check_admissibility, VERB_CLOSED_SET, ROLE_CAPABILITIES

class TestHydraV3Adversarial(unittest.TestCase):

    def test_01_closed_verb_rejection(self):
        """Any verb outside VERB_CLOSED_SET must be denied."""
        r = proyectar("rm::/tmp", role="operator")
        self.assertEqual(r["decision"], "deny")
        self.assertIn("verb_not_in_closed_set", r["reason"])

    def test_02_capability_enforcement(self):
        """Observer must not be allowed to 'construir'."""
        r = proyectar("construir::puente", role="observer")
        self.assertEqual(r["decision"], "deny")
        self.assertIn("capability_denied", r["reason"])

    def test_03_path_escape_blocked(self):
        """Path traversal / absolute paths must be rejected at parse."""
        r = proyectar("auditar::../../etc/passwd", role="auditor")
        self.assertEqual(r["decision"], "deny")
        self.assertIn("path_escape_attempt", r["reason"])

    def test_04_receipt_chain_monotonic(self):
        """Two consecutive allows must produce increasing seq and linked prev_hash."""
        r1 = proyectar("verificar::poliza_A", role="auditor")
        r2 = proyectar("verificar::poliza_B", role="auditor")
        self.assertEqual(r1["decision"], "allow")
        self.assertEqual(r2["decision"], "allow")
        self.assertGreater(r2["seq"], r1["seq"])
        self.assertEqual(r2["prev_hash"], r1["receipt"])

    def test_05_empty_and_malformed(self):
        """Empty signal and malformed verb::entity must deny."""
        r1 = proyectar("", role="operator")
        r2 = proyectar("auditar::entidad::extra", role="auditor")
        self.assertEqual(r1["decision"], "deny")
        self.assertEqual(r2["decision"], "deny")

if __name__ == "__main__":
    unittest.main()
