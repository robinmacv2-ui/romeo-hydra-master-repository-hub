#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Demo reproducible: SHA-256 + RSA + Paillier HE aditivo."""

from romeo_hydra.crypto import HERuntime, he_status
import json

if __name__ == "__main__":
    print("=== Estado de backends ===")
    print(json.dumps(he_status(), indent=2))
    print("\n=== Demo stack ===")
    print(json.dumps(HERuntime().demo_stack(), indent=2))
