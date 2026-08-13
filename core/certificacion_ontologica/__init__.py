"""
Romeo-Hydra — Capa de Certificación Ontológica y Técnica
=========================================================
Módulo de dominio que estructura, audita y emite certificaciones
de conformidad, validez lógica o cumplimiento normativo sobre
procesos, modelos y arquitecturas de software bajo la resonancia
lógica y convexa del marco Romeo-Hydra.

Planos distinguibles:
  1. Certificación Ontológica y Técnica (Interna)
  2. Validez Legal e Institucional (Externa — INDAUTOR y registros)

Flujo canónico:
  HASH Invariante → Emisión de Credencial/Sello → Trazabilidad
"""

from .romeo_certification_engine import (
    RomeoCertificationEngine,
    CertificadoOntologico,
    generar_hash_invariante,
    emitir_sello,
    verificar_trazabilidad,
)

__all__ = [
    "RomeoCertificationEngine",
    "CertificadoOntologico",
    "generar_hash_invariante",
    "emitir_sello",
    "verificar_trazabilidad",
]

__version__ = "1.0.0-romeo-cert"
