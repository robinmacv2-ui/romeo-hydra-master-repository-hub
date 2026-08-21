"""Lineage must appear in every receipt (allow and deny). EMMOROR Delta.

Stdlib only - works without pytest.
Run from repo root:
  python -m unittest tests.test_lineage_in_receipt -v
"""
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest import mock

from romeo_agent.lineage import LINEAGE, get_lineage
from romeo_agent.runtime import run, _receipt
from romeo_agent.admissible import is_admissible, VERBOS_ADMISIBLES


class TestLineageConstants(unittest.TestCase):
    def test_required_keys(self):
        required = {
            "architect",
            "agent",
            "policy",
            "doi_concept",
            "doi_version",
            "doi_core_software",
            "doi_hardware",
            "doi_ontology",
            "regime",
        }
        self.assertTrue(required.issubset(LINEAGE.keys()))

    def test_architect_name(self):
        self.assertEqual(LINEAGE["architect"], "Luis Angel Vazquez Martinez")

    def test_get_lineage_is_copy(self):
        a = get_lineage()
        b = get_lineage()
        self.assertEqual(a, b)
        a["architect"] = "mutated"
        self.assertNotEqual(a["architect"], get_lineage()["architect"])


class TestLineageInReceipt(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.tmp_path = Path(self._tmp.name)
        self.log_patch = mock.patch(
            "romeo_agent.runtime.LOG_PATH", self.tmp_path / "agent_log.jsonl"
        )
        self.log_patch.start()

    def tearDown(self):
        self.log_patch.stop()
        self._tmp.cleanup()

    def test_allow_has_lineage(self):
        out = run("echo :: hola")
        self.assertEqual(out["gate"]["status"], "allow")
        self.assertIn("lineage", out)
        self.assertEqual(out["lineage"]["architect"], LINEAGE["architect"])
        self.assertEqual(out["lineage"]["doi_concept"], LINEAGE["doi_concept"])
        self.assertIn("receipt", out)
        self.assertEqual(len(out["receipt"]), 16)

    def test_deny_has_lineage(self):
        out = run("rm :: /tmp")
        self.assertEqual(out["gate"]["status"], "deny")
        self.assertIn("lineage", out)
        self.assertEqual(out["lineage"]["doi_version"], LINEAGE["doi_version"])
        self.assertIn("receipt", out)

    def test_lineage_verb(self):
        out = run("lineage ::")
        self.assertEqual(out["gate"]["status"], "allow")
        self.assertEqual(out["result"]["tool"], "lineage")
        self.assertEqual(out["result"]["lineage"]["architect"], LINEAGE["architect"])

    def test_receipt_covers_lineage(self):
        """If lineage changes, receipt must change (WORM integrity)."""
        base = {
            "ts": 1.0,
            "input": "echo :: x",
            "parsed": {"verb": "echo", "entity": "", "args": {}},
            "gate": {"status": "allow", "reason": "ex_ante_passed"},
            "result": {"tool": "echo"},
            "lineage": get_lineage(),
        }
        r1 = _receipt(base)
        mutated = dict(base)
        mutated["lineage"] = dict(get_lineage())
        mutated["lineage"]["doi_concept"] = "10.5281/zenodo.00000000"
        r2 = _receipt(mutated)
        self.assertNotEqual(r1, r2)

    def test_verbo_no_admisible_still_lineage(self):
        out = run("delete :: secret")
        self.assertEqual(out["gate"]["status"], "deny")
        self.assertTrue(out["gate"]["reason"].startswith("verbo_no_admisible"))
        self.assertIn("lineage", out)


class TestAdmissibleLineage(unittest.TestCase):
    def test_lineage_in_c(self):
        self.assertIn("lineage", VERBOS_ADMISIBLES)

    def test_lineage_admissible(self):
        ok, reason = is_admissible({"verb": "lineage", "entity": "", "args": {}})
        self.assertTrue(ok)
        self.assertEqual(reason, "ex_ante_passed")


if __name__ == "__main__":
    unittest.main()
