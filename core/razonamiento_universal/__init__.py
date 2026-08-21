"""
Romeo-Hydra - Motor de Razonamiento Universal
=============================================
Capa general que responde a cualquier premisa mediante
clasificación de dominio + deducción formal / cálculo exacto.

Dominios soportados:
  - paradojas (cualquier tipo)
  - filosofía / ontología
  - matemáticas (cálculo simbólico exacto)
  - genética biocelular (estructuras y principios)
  - astrofísica (constantes y relaciones exactas)
  - geografía / geodesia (cálculos geométricos)
  - ciencias exactas en general
  - historia -> solo resolución lógica (sin afirmaciones factuales)
"""

from .motor_universal import (
    MotorRazonamientoUniversal,
    clasificar_dominio,
    procesar_premisa,
)

__all__ = [
    "MotorRazonamientoUniversal",
    "clasificar_dominio",
    "procesar_premisa",
]
