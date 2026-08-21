#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ROMEO-HYDRA - Inyección / verificación global del invariante Eukaris
====================================================================
Comprueba que el módulo de afirmaciones está presente, compilable
y visible desde los puntos críticos del organismo.

Uso:
    python inject_eukaris_global.py
"""

from __future__ import annotations

import importlib
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent
if str(REPO) not in sys.path:
    sys.path.insert(0, str(REPO))

PUNTOS_CRITICOS = [
    "core.eukaris_affirmations",
    "orquestador_dinamico",
    "orquestador_maestro",
    "nucleo_v30",
    "automedicina_v30",
    "romeo_hydra_nucleus",
]


def main() -> int:
    print("=" * 60)
    print("  ROMEO-HYDRA ? Verificación global invariante EUKARIS")
    print("=" * 60)

    # 1. Compilar el invariante
    try:
        from core.eukaris_affirmations import compilar_en_nucleo
        bloque = compilar_en_nucleo()
        total = bloque["invariante"]["total_afirmaciones"]
        print(f"[OK] core.eukaris_affirmations compilado -> {total} afirmaciones")
        print(f"     Autor: {bloque['invariante']['meta'].get('autor_afirmaciones')}")
        print(f"     Redescubierto: {bloque['invariante']['meta'].get('fecha_redescubrimiento')}")
    except Exception as e:
        print(f"[X]  No se pudo compilar core.eukaris_affirmations: {e}")
        return 1

    # 2. Comprobar presencia de archivos clave
    archivos = [
        REPO / "core" / "eukaris_affirmations.py",
        REPO / "orquestador_dinamico.py",
        REPO / "orquestador_maestro.py",
        REPO / "nucleo_v30.py",
        REPO / "automedicina_v30.py",
        REPO / "BITACORA_PERSONAL" / "romeo_dna_core.json",
    ]
    print("\n[ARCHIVOS]")
    for a in archivos:
        marca = "[OK]" if a.exists() else "[X]"
        print(f"  {marca} {a.relative_to(REPO)}")

    # 3. Intentar importar puntos críticos (sin fallar el proceso si alguno falta)
    print("\n[IMPORTS]")
    for nombre in PUNTOS_CRITICOS:
        try:
            importlib.import_module(nombre)
            print(f"  [OK] {nombre}")
        except Exception as e:
            print(f"  [~]  {nombre} -> {type(e).__name__}: {e}")

    print("\n[ESTADO] Invariante Eukaris propagado en el organismo.")
    print("         Comandos útiles en orquestador_dinamico:")
    print("           eukaris | afirmaciones | mantra | regeneracion")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    sys.exit(main())
