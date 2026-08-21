# -*- coding: utf-8 -*-
"""Pytest configuration for ROMEO-HYDRA TRL-6 suite."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

# Repo root must be importable so `pilot` (stdlib offline kit) resolves
# without installing it as a separate distribution.
_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))


@pytest.fixture(scope="session")
def seed():
    return 42
