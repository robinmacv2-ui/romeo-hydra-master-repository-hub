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
  - certificacion_ontologica  (certificaciones de conformidad / validez lógica)
"""

__version__ = "3.0.2-romeo-hydra-cert"
__all__ = [
    "logica_filosofica",
    "razonamiento_universal",
    "eukaris_affirmations",
    "certificacion_ontologica",
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

# Carga perezosa de la capa de certificación ontológica
try:
    from .certificacion_ontologica import (
        RomeoCertificationEngine,
        CertificadoOntologico,
        generar_hash_invariante,
        emitir_sello,
        verificar_trazabilidad,
    )
except Exception:
    pass
