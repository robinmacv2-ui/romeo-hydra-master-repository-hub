"""
Romeo-Hydra - Capa de Lógica Formal, Retórica y Análisis Filosófico
===================================================================
Módulo de dominio para paradojas temporales, silogismos, lógica modal
y resolución retórica. Se activa automáticamente desde el Orquestador
Maestro cuando se detecta una premisa filosófica o paradoja.
"""

from .romeo_logica_filosofica import (
    MotorLogicaFilosofica,
    analizar_paradoja_temporal,
    evaluar_silogismo,
    detectar_dominio_filosofico,
)

__all__ = [
    "MotorLogicaFilosofica",
    "analizar_paradoja_temporal",
    "evaluar_silogismo",
    "detectar_dominio_filosofico",
]
