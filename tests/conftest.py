# -*- coding: utf-8 -*-
"""Pytest configuration for ROMEO-HYDRA TRL-6 suite."""

import pytest


@pytest.fixture(scope="session")
def seed():
    return 42
