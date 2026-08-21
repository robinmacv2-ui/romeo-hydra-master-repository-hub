#!/usr/bin/env python3
"""
ROMEO-HYDRA - Sistema Inmunologico y Homeostasis
Inspecciona la coherencia del organismo digital, detecta dano y activa
respuesta inmune con regeneracion desde el historial inmutable (Git)
o reconstruccion de emergencia.
"""

from __future__ import annotations

import hashlib
import os
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Tuple


# ---------------------------------------------------------------------------
# Configuracion del sistema inmune
# ---------------------------------------------------------------------------

@dataclass
class TejidoCritico:
    nombre: str
    minimo_bytes: int = 50
    requiere_ejecutable: bool = False


@dataclass
class ConfigInmune:
    tejidos: List[TejidoCritico] = field(default_factory=lambda: [
        TejidoCritico("columna_vertebral.py", minimo_bytes=200),
        TejidoCritico("automedicina.py", minimo_bytes=300),
        # TejidoCritico("red_neuronal_nucleo.py", minimo_bytes=150),
    ])
    umbral_integridad: float = 0.8


# ---------------------------------------------------------------------------
# Funciones de inspeccion
# ---------------------------------------------------------------------------

def calcular_hash_rapido(ruta: Path) -> str:
    """Hash SHA-256 de los primeros 4 KB (deteccion rapida)."""
    try:
        with open(ruta, "rb") as f:
            return hashlib.sha256(f.read(4096)).hexdigest()[:16]
    except Exception:
        return "CORRUPTO"


def inspeccionar_tejido(tejido: TejidoCritico, root: Path) -> Tuple[str, bool, str]:
    """
    Retorna (estado, sano, detalle)
    estado: OK | AUSENTE | PEQUENO | CORRUPTO | NO_EJECUTABLE
    """
    ruta = root / tejido.nombre
    if not ruta.exists():
        return "AUSENTE", False, f"{tejido.nombre} no existe"

    try:
        size = ruta.stat().st_size
    except OSError as e:
        return "CORRUPTO", False, str(e)

    if size < tejido.minimo_bytes:
        return "PEQUENO", False, f"size={size} < minimo={tejido.minimo_bytes}"

    if tejido.requiere_ejecutable and not os.access(ruta, os.X_OK):
        return "NO_EJECUTABLE", False, "sin permiso de ejecucion"

    h = calcular_hash_rapido(ruta)
    if h == "CORRUPTO":
        return "CORRUPTO", False, "lectura fallida"

    return "OK", True, f"size={size} hash={h}"


def escanear_organismo(cfg: ConfigInmune, root: Path | None = None) -> dict:
    root = root or Path.cwd()
    resultados = []
    sanos = 0

    for t in cfg.tejidos:
        estado, sano, detalle = inspeccionar_tejido(t, root)
        resultados.append({
            "tejido": t.nombre,
            "estado": estado,
            "sano": sano,
            "detalle": detalle,
        })
        if sano:
            sanos += 1

    total = len(cfg.tejidos) or 1
    ratio = sanos / total
    integridad = ratio >= cfg.umbral_integridad

    return {
        "integridad_ok": integridad,
        "ratio": round(ratio, 3),
        "sanos": sanos,
        "total": total,
        "tejidos": resultados,
    }


def intentar_regenerar_desde_git(nombre: str) -> bool:
    """Intenta restaurar el archivo desde el ultimo commit limpio."""
    try:
        subprocess.run(
            ["git", "checkout", "HEAD", "--", nombre],
            check=True,
            capture_output=True,
            text=True,
        )
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def respuesta_inmune(reporte: dict, root: Path) -> None:
    print("=" * 64)
    print("ROMEO-HYDRA :: SISTEMA INMUNOLOGICO")
    print("=" * 64)
    print(f"Integridad : {'OK' if reporte['integridad_ok'] else 'COMPROMETIDA'}")
    print(f"Ratio      : {reporte['ratio']:.1%}  ({reporte['sanos']}/{reporte['total']})")
    print("-" * 64)

    for t in reporte["tejidos"]:
        marca = "OK " if t["sano"] else "!! "
        print(f"  {marca}{t['tejido']:<30} {t['estado']:<12} {t['detalle']}")

    if reporte["integridad_ok"]:
        print("-" * 64)
        print("Organismo estable. No se requiere intervencion.")
        return

    print("-" * 64)
    print("ACTIVANDO RESPUESTA INMUNE...")
    for t in reporte["tejidos"]:
        if not t["sano"]:
            print(f"  Regenerando {t['tejido']} desde Git...", end=" ")
            if intentar_regenerar_desde_git(t["tejido"]):
                print("OK")
            else:
                print("FALLO (sin historial o no es repo)")

    # Re-escaneo post-regeneracion
    print("-" * 64)
    print("Re-escaneo post-respuesta:")
    nuevo = escanear_organismo(ConfigInmune(), root)
    print(f"  Nueva integridad : {'OK' if nuevo['integridad_ok'] else 'SIGUE COMPROMETIDA'}")
    print(f"  Ratio            : {nuevo['ratio']:.1%}")
    print("=" * 64)


def main() -> None:
    root = Path.cwd()
    cfg = ConfigInmune()
    reporte = escanear_organismo(cfg, root)
    respuesta_inmune(reporte, root)

    if not reporte["integridad_ok"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
