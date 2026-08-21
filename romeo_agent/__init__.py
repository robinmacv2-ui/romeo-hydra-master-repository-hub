"""
Paquete romeo_agent: gate ex-ante (DFA) + runtime offline.
Sin dependencias externas ni APIs cloud.
"""
from .runtime import run, main
from .admissible import is_admissible, VERBOS_ADMISIBLES

__all__ = ["run", "main", "is_admissible", "VERBOS_ADMISIBLES"]
