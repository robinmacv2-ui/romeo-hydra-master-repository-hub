"""
Romeo-Hydra — Paquete CORE
==========================
Núcleo de módulos de dominio:
  - logica_filosofica
  - razonamiento_universal
  - paradoja_roc
  - quantum_resolver
  - regtech_singularity
  - banking_stress
  - eukaris_affirmations  (invariante de regeneración / abundancia)
"""

__version__ = "3.0.1-romeo-hydra-eukaris"
__all__ = [
    "logica_filosofica",
    "razonamiento_universal",
    "eukaris_affirmations",
]

# Carga perezosa del invariante Eukaris para que esté disponible desde core
try:
    from .eukaris_affirmations import (
        cargar_invariante,
        compilar_en_nucleo,
        InvarianteEukaris,
        AFIRMACIONES_CANONICAS,
        META as EUKARIS_META,
    )
except Exception:
    # Si el módulo aún no está presente en algún checkout parcial, no romper el paquete
    pass
