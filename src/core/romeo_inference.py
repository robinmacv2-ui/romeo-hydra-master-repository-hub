#!/usr/bin/env python3
"""
ROMEO-HYDRA :: MOTOR DE INFERENCIA LOGICA
v1.0 Ultra-Pro — Determinista, offline, evidencia SHA-256.

Usa:
  - conocimiento_trino/modelo_negocio_core.py
  - texto asimilado local
  - reglas de admisibilidad ex-ante

No es generativo. Es deductivo + evidencial.
"""

from __future__ import annotations

import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# ---------------------------------------------------------------------------
# Carga del modelo de negocio
# ---------------------------------------------------------------------------

def cargar_modelo() -> Dict[str, Any]:
    core = Path("conocimiento_trino/modelo_negocio_core.py")
    if not core.exists():
        return {"error": "modelo_negocio_core.py no encontrado"}
    # Ejecucion controlada del modulo
    ns: Dict[str, Any] = {}
    code = core.read_text(encoding="utf-8")
    exec(code, ns)
    return ns.get("MODELO", {})


# ---------------------------------------------------------------------------
# Motor de reglas (admisibilidad)
# ---------------------------------------------------------------------------

REGLAS = [
    {
        "id": "R01",
        "nombre": "precio_minimo",
        "condicion": lambda ctx: "precio" in ctx["query"] or "pricing" in ctx["query"],
        "accion": lambda ctx: {
            "dictamen": "PRECIO_MINIMO_OBLIGATORIO",
            "valor": ctx["modelo"]["pricing"]["regla"],
            "evidencia": "Nunca por debajo de 12000 USD",
        },
    },
    {
        "id": "R02",
        "nombre": "cero_clientes",
        "condicion": lambda ctx: "cliente" in ctx["query"] or "mrr" in ctx["query"],
        "accion": lambda ctx: {
            "dictamen": "ESTADO_TRANSPARENTE",
            "valor": ctx["modelo"]["estado_verificable"]["clientes_pago"],
            "evidencia": "clientes_pago = 0 (no se oculta)",
        },
    },
    {
        "id": "R03",
        "nombre": "one_liner",
        "condicion": lambda ctx: any(k in ctx["query"] for k in ("one", "whatsapp", "liner", "pitch")),
        "accion": lambda ctx: {
            "dictamen": "ONE_LINER_AUDITADO",
            "valor": ctx["modelo"]["one_liner"],
            "evidencia": "Fuente: modelo_negocio_core",
        },
    },
    {
        "id": "R04",
        "nombre": "doi_orcid",
        "condicion": lambda ctx: any(k in ctx["query"] for k in ("doi", "orcid", "zenodo", "autor")),
        "accion": lambda ctx: {
            "dictamen": "IDENTIDAD_VERIFICABLE",
            "valor": ctx["modelo"]["estado_verificable"],
            "evidencia": "DOI + ORCID anclados",
        },
    },
    {
        "id": "R05",
        "nombre": "principio_gobernanza",
        "condicion": lambda ctx: "gobernanza" in ctx["query"] or "principio" in ctx["query"],
        "accion": lambda ctx: {
            "dictamen": "PRINCIPIOS_OPERATIVOS",
            "valor": ctx["modelo"]["principios"],
            "evidencia": "Gobernanza en el comando de inicio",
        },
    },
]


def inferir(query: str, modelo: Dict[str, Any]) -> Dict[str, Any]:
    q = query.lower().strip()
    ctx = {"query": q, "modelo": modelo}
    disparadas = []

    for regla in REGLAS:
        try:
            if regla["condicion"](ctx):
                resultado = regla["accion"](ctx)
                disparadas.append({
                    "regla": regla["id"],
                    "nombre": regla["nombre"],
                    **resultado,
                })
        except Exception as e:
            disparadas.append({
                "regla": regla["id"],
                "error": str(e),
            })

    if not disparadas:
        # Fallback: devolver el modelo completo con marca de no-regla
        disparadas.append({
            "regla": "FALLBACK",
            "dictamen": "SIN_REGLA_ESPECIFICA",
            "valor": modelo,
            "evidencia": "Consulta no mapeada a regla fuerte",
        })

    return {
        "query": query,
        "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "dictamenes": disparadas,
        "huella": None,  # se calcula despues
    }


def firmar(resultado: Dict[str, Any]) -> Dict[str, Any]:
    """Ancla el resultado con SHA-256 (WORM-ready)."""
    payload = json.dumps(resultado, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    huella = hashlib.sha256(payload.encode("utf-8")).hexdigest()
    resultado["huella"] = huella
    return resultado


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    if len(sys.argv) < 2:
        print("Uso: python romeo_inference.py <consulta>")
        print("Ejemplos:")
        print('  python romeo_inference.py "pricing"')
        print('  python romeo_inference.py "one liner whatsapp"')
        print('  python romeo_inference.py "doi orcid"')
        print('  python romeo_inference.py "principios de gobernanza"')
        return

    query = " ".join(sys.argv[1:])
    modelo = cargar_modelo()

    if "error" in modelo:
        print(json.dumps(modelo, indent=2, ensure_ascii=False))
        sys.exit(1)

    resultado = inferir(query, modelo)
    resultado = firmar(resultado)

    print(json.dumps(resultado, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
