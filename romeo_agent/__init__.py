"""
Paquete romeo_agent: gate ex-ante (automata finito determinista) +
runtime de despacho. Ver docs/FORMALIZACION_DFA.md para la
demostracion formal del teorema de invarianza (cero escapes).
"""
from .runtime import run, main
from .admissible import is_admissible, VERBOS_ADMISIBLES

__all__ = ["run", "main", "is_admissible", "VERBOS_ADMISIBLES"]
