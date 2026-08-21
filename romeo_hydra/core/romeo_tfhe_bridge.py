# -*- coding: utf-8 -*-
"""
ROMEO-HYDRA - Puente Romeo ? TFHE ? HElib
=========================================
Unifica RomeoAbstractionLayer, TFHECore y HElibCore en un único nodo convexo.
Materializa el axioma ?Unificación de Capas: Ontología ? Software ? Cifrado?.

- TFHE: circuitos booleanos / enteros de baja-media precisión
- HElib (BGV/CKKS): aritmética matricial y vectorial (RegTech, analítica financiera)

Copyright (C) 2026 Luis Ángel Vázquez Martínez
Licencia Dual: AGPL-3.0 / Comercial EMMOROR
"""

from __future__ import annotations

from typing import Any, Dict, Literal
from datetime import datetime

from .romeo_abstraction import RomeoAbstractionLayer
from .tfhe_core import TFHECore
from .helib_core import HElibCore


class RomeoTFHEBridge:
    """
    Nodo de unificación multi-esquema.
    Pliegue conceptual (Romeo) + materialización cifrada (TFHE | HElib) en un solo objeto.
    """

    VERSION = "3.0-RC1+bridge-convex-helib"

    def __init__(self) -> None:
        self.romeo = RomeoAbstractionLayer()
        self.tfhe = TFHECore()
        self.helib = HElibCore()
        self.activated_at = datetime.now().isoformat()

    def status(self) -> Dict[str, Any]:
        return {
            "bridge_version": self.VERSION,
            "romeo_version": self.romeo.VERSION,
            "tfhe_version": self.tfhe.VERSION,
            "helib_version": self.helib.VERSION,
            "activated_at": self.activated_at,
            "convexity": "sincronizado",
            "capas": ["ontología", "software", "cifrado"],
            "backends_he": ["TFHE", "HElib-BGV", "HElib-CKKS"],
            "estado": "nodo convexo multi-esquema activo",
        }

    def pliegue_completo(
        self,
        logica_conceptual: str,
        backend: Literal["tfhe", "helib"] = "tfhe",
    ) -> Dict[str, Any]:
        """
        Ejecuta el ciclo completo: alto nivel -> bajo nivel -> esqueleto del backend elegido.

        backend="tfhe"  -> circuitos booleanos / control lógico
        backend="helib" -> aritmética matricial/vectorial (RegTech, finanzas)
        """
        folded = self.romeo.fold_high_level(logica_conceptual)
        nombre = "bridge_" + logica_conceptual[:20].replace(" ", "_")

        if backend == "helib":
            cpp = self.helib.generar_esqueleto_cpp(nombre_circuito=nombre)
            he_summary = self.helib.resumen()
            note = (
                "Ciclo de pliegue conceptual -> C++ HElib (BGV/CKKS) completado. "
                "Orientado a operaciones matriciales/vectoriales y RegTech."
            )
        else:
            cpp = self.tfhe.generar_esqueleto_cpp(nombre_circuito=nombre)
            he_summary = self.tfhe.resumen()
            note = (
                "Ciclo de pliegue conceptual -> C++ TFHE completado bajo geometría convexa."
            )

        verificacion = self.romeo.verify_homomorphic_circuit(logica_conceptual)

        return {
            "fold": folded,
            "backend": backend,
            "cpp_skeleton_preview": cpp[:600] + "...",
            "verification": verificacion,
            "he_summary": he_summary,
            "note": note,
        }

    def recomendar_backend(self, tipo_carga: str) -> Dict[str, str]:
        """
        Recomienda TFHE o HElib según el tipo de carga de trabajo.

        tipo_carga ejemplos:
          - "boolean" / "control" / "circuito" -> TFHE
          - "matriz" / "vector" / "regtech" / "financiero" / "float" -> HElib
        """
        t = tipo_carga.lower()
        if any(k in t for k in ("matriz", "vector", "regtech", "financ", "float", "ckks", "bgv", "linear", "algebra")):
            return {
                "recomendado": "helib",
                "esquema": "BGV o CKKS",
                "razon": "Procesamiento numérico denso, álgebra lineal o analítica financiera.",
            }
        return {
            "recomendado": "tfhe",
            "esquema": "TFHE (Torus)",
            "razon": "Circuitos booleanos, control lógico o enteros de precisión baja/media.",
        }

    def describe_unificado(self) -> str:
        partes = [
            "=== ROMEO MULTI-HE BRIDGE (Nodo Convexo) ===",
            self.romeo.describe()[:500] + "...",
            "",
            "=== TFHE CORE ===",
            self.tfhe.fundamentos()[:400] + "...",
            "",
            "=== HELIB CORE (BGV/CKKS) ===",
            self.helib.fundamentos()[:400] + "...",
            "",
            "=== COMPARATIVA ===",
            str(self.helib.comparativa_tfhe()),
            "",
            str(self.status()),
        ]
        return "\n".join(partes)


if __name__ == "__main__":
    bridge = RomeoTFHEBridge()
    print(bridge.status())
    print()
    print(bridge.recomendar_backend("regtech stress testing"))
    print(bridge.pliegue_completo("agregación de carteras cifradas", backend="helib")["note"])
