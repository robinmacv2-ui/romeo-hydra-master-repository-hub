#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Punto de entrada para evaluadores.

  python main.py

No requiere cryptography. Muestra version, DOI y como correr los pilotos.
Autor: Luis Angel Vazquez Martinez
"""

from __future__ import annotations

import json
import sys


def main() -> int:
    try:
        from romeo_hydra import get_info

        info = get_info()
    except Exception as e:  # noqa: BLE001
        print("ERROR: no se pudo importar romeo_hydra:", e, file=sys.stderr)
        print("Sugerencia: pip install -e .   o   pip install -r requirements.txt && pip install -e .", file=sys.stderr)
        return 1

    print("=== ROMEO-HYDRA ===")
    print(json.dumps({
        "version": info.get("version"),
        "doi_version": info.get("doi_version"),
        "doi_concept": info.get("doi_concept"),
        "wheel_is_compiled_tfhe": info.get("wheel_is_compiled_tfhe", False),
        "author": info.get("author"),
        "honest_note": info.get("honest_note"),
    }, indent=2))
    print()
    print("Pilotos de evidencia (stdlib, offline):")
    print("  python -m pilot.run_scoring_audit --entity EVAL --n 20")
    print("  python -m pilot.run_offline_audit --days 30 --entity EVAL")
    print("  bash scripts/smoke_termux.sh")
    print()
    print("Documentos: FOR_EVALUATORS.md | OPS_RULES.md | docs/FHE_STATUS.md")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
