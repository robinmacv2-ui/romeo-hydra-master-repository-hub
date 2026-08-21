#!/usr/bin/env python3
"""
ROMEO-HYDRA :: MAIN MÍNIMO
Punto de entrada único. Cero dependencias externas.
Comandos: status | immune | index | query <término>
"""

from __future__ import annotations

import sys
from pathlib import Path

def cmd_status() -> None:
    root = Path.cwd()
    pys = list(root.rglob("*.py"))
    print(f"Root      : {root}")
    print(f"Scripts   : {len(pys)}")
    print(f"Python    : {sys.version.split()[0]}")
    print("Estado    : listo")

def cmd_immune() -> None:
    try:
        import automedicina
        automedicina.main()
    except Exception as e:
        print(f"[IMMUNE] Error: {e}")
        print("Ejecuta primero: python limpiar_romeo.py")

def cmd_index() -> None:
    try:
        from buscador_omega import BuscadorOmega
        BuscadorOmega(punto_partida=Path.cwd(), dry_run=False).escanear()
    except Exception as e:
        print(f"[INDEX] Error: {e}")

def cmd_query(termino: str) -> None:
    # Búsqueda simple sobre archivos .txt/.md/.py ya asimilados
    root = Path.cwd()
    encontrados = 0
    for ruta in root.rglob("*"):
        if ruta.suffix.lower() not in {".txt", ".md", ".py", ".json"}:
            continue
        if any(x in ruta.parts for x in (".git", "__pycache__", "venv")):
            continue
        try:
            texto = ruta.read_text(encoding="utf-8", errors="ignore").lower()
            if termino.lower() in texto:
                print(f"[HIT] {ruta.relative_to(root)}")
                encontrados += 1
                if encontrados >= 20:
                    break
        except Exception:
            continue
    print(f"Total hits: {encontrados}")

def main() -> None:
    if len(sys.argv) < 2:
        print("Uso: python main.py <status|immune|index|query> [término]")
        return

    cmd = sys.argv[1].lower()
    if cmd == "status":
        cmd_status()
    elif cmd == "immune":
        cmd_immune()
    elif cmd == "index":
        cmd_index()
    elif cmd == "query":
        if len(sys.argv) < 3:
            print("Falta término de búsqueda")
            return
        cmd_query(" ".join(sys.argv[2:]))
    else:
        print(f"Comando desconocido: {cmd}")

if __name__ == "__main__":
    main()
