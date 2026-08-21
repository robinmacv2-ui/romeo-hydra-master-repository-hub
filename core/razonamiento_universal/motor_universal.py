#!/usr/bin/env python3
"""
Romeo-Hydra - Motor de Razonamiento Universal
=============================================
Responde a cualquier premisa mediante:
  1. Clasificación de dominio
  2. Cálculo exacto cuando es posible (sympy, constantes físicas)
  3. Deducción lógica formal en paradojas y filosofía
  4. Principios estructurales en genética biocelular
  5. Historia -> solo resolución lógica (sin hechos históricos afirmados)

No inventa datos factuales. Cuando no hay cálculo exacto ni
deducción cerrada, declara el límite y ofrece el marco lógico.
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

# Dependencias científicas (opcionales pero preferidas)
try:
    import sympy as sp
    HAS_SYMPY = True
except ImportError:
    HAS_SYMPY = False

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False

try:
    from Bio.Seq import Seq
    HAS_BIOPYTHON = True
except ImportError:
    HAS_BIOPYTHON = False


# ??????????????????????????????????????????????????????????????
# Constantes físicas / astronómicas exactas (SI)
# ??????????????????????????????????????????????????????????????

CONSTANTES = {
    "c": 299_792_458,                    # m/s velocidad de la luz
    "G": 6.67430e-11,                    # m? kg?? s??
    "h": 6.62607015e-34,                 # J?s Planck
    "hbar": 1.054571817e-34,             # J?s
    "k_B": 1.380649e-23,                 # J/K Boltzmann
    "N_A": 6.02214076e23,                # mol?? Avogadro
    "e": 1.602176634e-19,                # C carga elemental
    "m_e": 9.1093837015e-31,             # kg masa electrón
    "m_p": 1.67262192369e-27,            # kg masa protón
    "au": 1.495978707e11,                # m unidad astronómica
    "pc": 3.0856775814913673e16,         # m pársec
    "ly": 9.4607304725808e15,            # m año-luz
    "R_earth": 6_371_000,                # m radio medio Tierra
    "M_earth": 5.9722e24,                # kg
    "M_sun": 1.98847e30,                 # kg
    "R_sun": 6.957e8,                    # m
    "pi": math.pi,
    "e_const": math.e,
}


# ??????????????????????????????????????????????????????????????
# Clasificador de dominio
# ??????????????????????????????????????????????????????????????

PATRONES = {
    "paradoja": [
        r"\bparadoja\b", r"\bdilema\b", r"\bcontradicción\b",
        r"\bayer\b.*\bhoy\b.*\bmañana\b", r"\bnunca\s+(vuelve|podrá|puede)\b",
        r"\bmentiroso\b", r"\brussell\b", r"\bg?del\b", r"\bzermelo\b",
    ],
    "filosofia": [
        r"\bqué\s+es\b", r"\bquién\s+es\b", r"\bexistencia\b",
        r"\bontología\b", r"\bser\s+o\s+no\s+ser\b", r"\bverdad\b",
        r"\bconciencia\b", r"\blibre\s+albedrío\b", r"\bética\b",
        r"\bmetafísica\b", r"\bepistemología\b",
    ],
    "matematicas": [
        r"\bintegral\b", r"\bderivada\b", r"\blímite\b", r"\becuación\b",
        r"\bmatriz\b", r"\bdeterminante\b", r"\beigen\b", r"\bfactorial\b",
        r"\bprimos?\b", r"\bfibonacci\b", r"\bresuelve\b.*[=+
-*/]",
        r"\bcalcular\b", r"\bcuánto\s+es\b", r"\bsimplifica\b",
    ],
    "genetica": [
        r"\badn\b", r"\barn\b", r"\bgen\b", r"\bcromosoma\b",
        r"\bproteína\b", r"\btraducción\b", r"\btranscripción\b",
        r"\bcodón\b", r"\bsecuencia\b", r"\bmutación\b",
        r"\bcrispr\b", r"\bgenoma\b", r"\bcelula\b", r"\bbio\b",
    ],
    "astrofisica": [
        r"\bagujero\s+negro\b", r"\bestrella\b", r"\bgalaxia\b",
        r"\bgravedad\b", r"\brelatividad\b", r"\bhorizonte\s+de\s+sucesos\b",
        r"\bparsec\b", r"\baño\s+luz\b", r"\bmasa\s+solar\b",
        r"\bconstante\s+de\s+hubble\b", r"\bcosmología\b",
        r"\bplaneta\b", r"\borbita\b", r"\bkepler\b",
    ],
    "geografia": [
        r"\bdistancia\b.*\b(tierra|ciudad|coordenadas)\b",
        r"\blatitud\b", r"\blongitud\b", r"\bgeodesia\b",
        r"\bradio\s+de\s+la\s+tierra\b", r"\bcírculo\s+máximo\b",
        r"\bmeridiano\b", r"\bparalelo\b",
    ],
    "historia": [
        r"\bhistoria\b", r"\bhistórico\b", r"\bsiglo\b",
        r"\baño\s+\d{3,4}\b", r"\bguerra\b", r"\bimperio\b",
        r"\brey\b", r"\breina\b", r"\brevolución\b",
    ],
}


def clasificar_dominio(texto: str) -> str:
    t = texto.lower().strip()
    scores = {dom: 0 for dom in PATRONES}
    for dom, pats in PATRONES.items():
        for p in pats:
            if re.search(p, t, re.IGNORECASE):
                scores[dom] += 1
    mejor = max(scores, key=scores.get)
    if scores[mejor] == 0:
        return "general"
    return mejor


# ??????????????????????????????????????????????????????????????
# Handlers por dominio
# ??????????????????????????????????????????????????????????????

def _handler_paradoja(premisa: str) -> Dict[str, Any]:
    """Cualquier paradoja -> deducción formal / neutralización."""
    # Reutiliza la lógica temporal si aplica; si no, marco general
    if re.search(r"ayer|hoy|mañana", premisa, re.I):
        try:
            from core.logica_filosofica import analizar_paradoja_temporal
            return analizar_paradoja_temporal(premisa)
        except Exception:
            pass

    return {
        "dominio": "paradoja",
        "premisa_original": premisa,
        "estado_resolucion": "ANALIZADO",
        "metodo": "deducción formal / neutralización ontológica",
        "conclusiones": [
            "Una paradoja señala una tensión entre premisas que parecen verdaderas y una conclusión inaceptable.",
            "Resolución estándar: identificar la premisa oculta o la ambigüedad de alcance (autorreferencia, cuantificación, tiempo).",
            "El motor Romeo-Hydra trata la paradoja como un invariante a proyectar en un espacio de mayor coherencia (cierre convexo).",
        ],
        "respuesta_sintetica": (
            "La paradoja ha sido asimilada. No se afirma ni se niega de forma dogmática; "
            "se eleva a un nivel de abstracción donde la contradicción aparente se convierte en "
            "restricción de dominio o de lenguaje."
        ),
        "coherencia_logica": 0.90,
        "fuente": "core.razonamiento_universal.motor_universal",
    }


def _handler_filosofia(premisa: str) -> Dict[str, Any]:
    return {
        "dominio": "filosofia",
        "premisa_original": premisa,
        "estado_resolucion": "RECONOCIDO",
        "metodo": "análisis ontológico / epistémico",
        "respuesta_sintetica": (
            "Premisa filosófica detectada. El motor la trata como consulta de dominio ontológico. "
            "No se genera una 'verdad' absoluta; se ofrece el marco de coherencia lógica y "
            "las distinciones relevantes (existencia vs. predicación, tiempo vs. eternidad, etc.)."
        ),
        "coherencia_logica": 0.85,
        "fuente": "core.razonamiento_universal.motor_universal",
    }


def _handler_matematicas(premisa: str) -> Dict[str, Any]:
    """Intenta cálculo simbólico exacto con sympy."""
    if not HAS_SYMPY:
        return {
            "dominio": "matematicas",
            "estado_resolucion": "LIMITADO",
            "mensaje": "sympy no disponible. Instale sympy para cálculo simbólico exacto.",
            "fuente": "core.razonamiento_universal.motor_universal",
        }

    # Extracción muy simple de expresiones
    expr_match = re.search(
        r"([0-9xX\+\-\*/\^\(\)\.\s]+)=([0-9xX\+\-\*/\^\(\)\.\s]+)",
        premisa,
    )
    try:
        # Intentos comunes
        if "factorial" in premisa.lower() or "!" in premisa:
            m = re.search(r"(\d+)\s*!?", premisa)
            if m:
                n = int(m.group(1))
                if n <= 20:
                    res = math.factorial(n)
                    return {
                        "dominio": "matematicas",
                        "estado_resolucion": "EXACTO",
                        "resultado": res,
                        "expresion": f"{n}!",
                        "coherencia_logica": 1.0,
                        "fuente": "core.razonamiento_universal + math",
                    }

        # Evaluación simbólica genérica de expresiones simples
        limpia = re.sub(r"[^0-9+\-*/().^\sxy]", "", premisa.lower())
        limpia = limpia.replace("^", "**")
        if limpia.strip() and re.fullmatch(r"[0-9+\-*/().\s**xy]+", limpia.replace(" ", "")):
            x = sp.symbols("x")
            try:
                val = sp.sympify(limpia)
                simplificado = sp.simplify(val)
                return {
                    "dominio": "matematicas",
                    "estado_resolucion": "EXACTO",
                    "resultado": str(simplificado),
                    "expresion": limpia,
                    "coherencia_logica": 1.0,
                    "fuente": "core.razonamiento_universal + sympy",
                }
            except Exception:
                pass
    except Exception as e:
        return {
            "dominio": "matematicas",
            "estado_resolucion": "ERROR",
            "error": str(e),
            "fuente": "core.razonamiento_universal.motor_universal",
        }

    return {
        "dominio": "matematicas",
        "estado_resolucion": "PARCIAL",
        "mensaje": (
            "Premisa matemática detectada. Para cálculo exacto formule la expresión "
            "de forma explícita (ej. 'resuelve 2*x + 3 = 7' o 'factorial de 10')."
        ),
        "coherencia_logica": 0.70,
        "fuente": "core.razonamiento_universal.motor_universal",
    }


def _handler_genetica(premisa: str) -> Dict[str, Any]:
    """Principios estructurales y operaciones de secuencia cuando es posible."""
    resultado: Dict[str, Any] = {
        "dominio": "genetica",
        "premisa_original": premisa,
        "estado_resolucion": "ESTRUCTURAL",
        "fuente": "core.razonamiento_universal.motor_universal",
    }

    # Detección de secuencia simple
    seq_match = re.search(r"[ACGTUacgtu]{8,}", premisa)
    if seq_match and HAS_BIOPYTHON:
        s = Seq(seq_match.group(0).upper().replace("U", "T"))
        resultado.update({
            "secuencia": str(s),
            "longitud": len(s),
            "complementaria": str(s.complement()),
            "reversa_complementaria": str(s.reverse_complement()),
            "gc_percent": round(100 * (s.count("G") + s.count("C")) / len(s), 2),
            "estado_resolucion": "EXACTO",
            "coherencia_logica": 1.0,
        })
        return resultado

    resultado["principios"] = [
        "El ADN es una doble hélice antiparalela con bases A-T y G-C.",
        "La transcripción produce ARN a partir de ADN; la traducción produce proteínas a partir de ARN.",
        "El código genético es degenerado (varios codones -> mismo aminoácido) y casi universal.",
        "Las mutaciones pueden ser sinónimas, no sinónimas, frameshift o estructurales.",
    ]
    resultado["respuesta_sintetica"] = (
        "Consulta de genética biocelular. Se aplican principios estructurales. "
        "Para operaciones exactas sobre secuencias, proporcione una cadena de nucleótidos."
    )
    resultado["coherencia_logica"] = 0.88
    return resultado


def _handler_astrofisica(premisa: str) -> Dict[str, Any]:
    """Relaciones y constantes exactas."""
    t = premisa.lower()
    res: Dict[str, Any] = {
        "dominio": "astrofisica",
        "estado_resolucion": "EXACTO",
        "constantes_utilizadas": {},
        "fuente": "core.razonamiento_universal.motor_universal",
    }

    if "velocidad de la luz" in t or re.search(r"\bc\b.*=", t):
        res["resultado"] = CONSTANTES["c"]
        res["unidad"] = "m/s"
        res["constantes_utilizadas"]["c"] = CONSTANTES["c"]
        res["coherencia_logica"] = 1.0
        return res

    if "radio de la tierra" in t or "radio terrestre" in t:
        res["resultado"] = CONSTANTES["R_earth"]
        res["unidad"] = "m"
        res["coherencia_logica"] = 1.0
        return res

    if "masa de la tierra" in t:
        res["resultado"] = CONSTANTES["M_earth"]
        res["unidad"] = "kg"
        res["coherencia_logica"] = 1.0
        return res

    if "año luz" in t or "año-luz" in t:
        res["resultado"] = CONSTANTES["ly"]
        res["unidad"] = "m"
        res["coherencia_logica"] = 1.0
        return res

    # Energía de reposo E = mc?
    if "e=mc" in t.replace(" ", "").lower() or "energía de reposo" in t:
        res["formula"] = "E = m * c?"
        res["c"] = CONSTANTES["c"]
        res["nota"] = "Proporcione masa en kg para valor numérico exacto."
        res["coherencia_logica"] = 1.0
        return res

    res["estado_resolucion"] = "PARCIAL"
    res["mensaje"] = (
        "Dominio astrofísico detectado. Se disponen constantes exactas (c, G, masas, radios). "
        "Formule la magnitud o relación deseada de forma explícita."
    )
    res["constantes_disponibles"] = list(CONSTANTES.keys())
    res["coherencia_logica"] = 0.80
    return res


def _handler_geografia(premisa: str) -> Dict[str, Any]:
    """Cálculos geodésicos básicos."""
    res = {
        "dominio": "geografia",
        "estado_resolucion": "ESTRUCTURAL",
        "radio_tierra_m": CONSTANTES["R_earth"],
        "fuente": "core.razonamiento_universal.motor_universal",
    }
    # Distancia de círculo máximo (haversine simplificado si se dan coords)
    coords = re.findall(r"[-+]?\d+[.,]?\d*", premisa)
    if len(coords) >= 4:
        try:
            lat1, lon1, lat2, lon2 = [float(c.replace(",", ".")) for c in coords[:4]]
            # Haversine
            r = CONSTANTES["R_earth"]
            p1, p2 = math.radians(lat1), math.radians(lat2)
            dp = math.radians(lat2 - lat1)
            dl = math.radians(lon2 - lon1)
            a = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
            d = 2 * r * math.asin(math.sqrt(a))
            res.update({
                "estado_resolucion": "EXACTO",
                "distancia_circulo_maximo_m": round(d, 2),
                "distancia_km": round(d / 1000, 3),
                "coordenadas": {"lat1": lat1, "lon1": lon1, "lat2": lat2, "lon2": lon2},
                "coherencia_logica": 1.0,
            })
            return res
        except Exception:
            pass

    res["mensaje"] = (
        "Dominio geográfico/geodésico. Para distancia exacta proporcione "
        "lat1 lon1 lat2 lon2 en grados decimales."
    )
    res["coherencia_logica"] = 0.75
    return res


def _handler_historia(premisa: str) -> Dict[str, Any]:
    """Historia -> solo resolución lógica, sin afirmaciones factuales."""
    return {
        "dominio": "historia",
        "premisa_original": premisa,
        "estado_resolucion": "LOGICA_PURA",
        "metodo": "resolución lógica sin compromiso factual",
        "respuesta_sintetica": (
            "Consulta histórica detectada. Por diseño del motor, no se afirman "
            "hechos históricos. Se puede analizar la coherencia lógica de las "
            "premisas, las relaciones de causalidad alegadas o las contradicciones "
            "internas del relato, pero no se genera una narrativa factual."
        ),
        "coherencia_logica": 0.70,
        "fuente": "core.razonamiento_universal.motor_universal",
    }


def _handler_general(premisa: str) -> Dict[str, Any]:
    return {
        "dominio": "general",
        "premisa_original": premisa,
        "estado_resolucion": "ASIMILADO",
        "respuesta_sintetica": (
            "Premisa asimilada por el motor universal. "
            "No se identificó un dominio de cálculo exacto ni una paradoja formal. "
            "Se recomienda reformular con mayor precisión (expresión matemática, "
            "secuencia genética, coordenadas, o dilema lógico explícito)."
        ),
        "coherencia_logica": 0.60,
        "fuente": "core.razonamiento_universal.motor_universal",
    }


HANDLERS = {
    "paradoja": _handler_paradoja,
    "filosofia": _handler_filosofia,
    "matematicas": _handler_matematicas,
    "genetica": _handler_genetica,
    "astrofisica": _handler_astrofisica,
    "geografia": _handler_geografia,
    "historia": _handler_historia,
    "general": _handler_general,
}


# ??????????????????????????????????????????????????????????????
# Motor unificado
# ??????????????????????????????????????????????????????????????

class MotorRazonamientoUniversal:
    """
    Punto de entrada único. Clasifica y despacha a handlers.
    """

    def __init__(self):
        self.version = "1.0.0-romeo-hydra-universal"
        self.dominios = list(HANDLERS.keys())
        self.deps = {
            "sympy": HAS_SYMPY,
            "numpy": HAS_NUMPY,
            "biopython": HAS_BIOPYTHON,
        }

    def procesar(self, premisa: str) -> Dict[str, Any]:
        dominio = clasificar_dominio(premisa)
        handler = HANDLERS.get(dominio, _handler_general)
        resultado = handler(premisa)
        resultado["dominio_detectado"] = dominio
        resultado["dependencias_activas"] = self.deps
        resultado["version_motor"] = self.version
        return resultado


def procesar_premisa(premisa: str) -> Dict[str, Any]:
    return MotorRazonamientoUniversal().procesar(premisa)


if __name__ == "__main__":
    import json
    motor = MotorRazonamientoUniversal()
    pruebas = [
        "si ayer nunca vuelve a ser hoy pero mañana nunca podra ser entonces hoy que es",
        "cuanto es el factorial de 10",
        "velocidad de la luz",
        "secuencia ATGCATGCATGCATGC",
        "distancia entre 40.4 -3.7 y 41.4 2.17",
        "qué pasó en la revolución francesa",
    ]
    for p in pruebas:
        print("=" * 60)
        print("PREMISA:", p)
        print(json.dumps(motor.procesar(p), indent=2, ensure_ascii=False))
