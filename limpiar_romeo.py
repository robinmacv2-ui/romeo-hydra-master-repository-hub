#!/usr/bin/env python3
"""
ROMEO-HYDRA :: LIMPIADOR DE DIRECTORIO
v1.0 - Elimina caracteres no-ASCII ilegales y convierte CRLF -> LF.
Solo toca archivos .py. Reporta todo. Falla cerrado.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Caracteres Unicode permitidos (acentos españoles + signos básicos)
PERMITIDOS = set("áéíóúñÁÉÍÓÚÑ¿¡üÜ")

EXCLUSIONES = {
    ".git", "__pycache__", "venv", ".venv", "node_modules",
    "infinity_archives_unpacked", "backups",
}

def es_excluido(parts: tuple) -> bool:
    return any(p in EXCLUSIONES for p in parts)

def limpiar_contenido(texto: str) -> tuple[str, list[str]]:
    """Retorna (texto_limpio, lista_de_problemas)."""
    problemas = []
    lineas = texto.splitlines()  # elimina \r automáticamente
    nuevas = []

    for i, linea in enumerate(lineas, 1):
        limpia = []
        for j, c in enumerate(linea):
            o = ord(c)
            if o < 128 or c in PERMITIDOS:
                limpia.append(c)
            else:
                # Reemplazos comunes
                if c in "->->->":
                    limpia.append("->")
                    problemas.append(f"L{i}:C{j} flecha Unicode -> reemplazada por ->")
                elif c in "--":
                    limpia.append("-")
                    problemas.append(f"L{i}:C{j} guión tipográfico -> -")
                elif c in """"":
                    limpia.append('"')
                    problemas.append(f"L{i}:C{j} comilla tipográfica -> \"")
                elif c in "''":
                    limpia.append("'")
                    problemas.append(f"L{i}:C{j} comilla simple tipográfica -> '")
                else:
                    limpia.append("?")
                    problemas.append(f"L{i}:C{j} U+{o:04X} eliminado")
        nuevas.append("".join(limpia))

    return "\n".join(nuevas) + "\n", problemas

def main() -> None:
    root = Path.cwd()
    dry = "--dry" in sys.argv
    print("=" * 64)
    print(f"LIMPIADOR ROMEO-HYDRA  root={root}  dry={dry}")
    print("=" * 64)

    tocados = 0
    for ruta in root.rglob("*.py"):
        if es_excluido(ruta.parts):
            continue
        try:
            original = ruta.read_text(encoding="utf-8", errors="replace")
        except Exception as e:
            print(f"[SKIP] {ruta} -> {e}")
            continue

        limpio, problemas = limpiar_contenido(original)

        if not problemas and original == limpio:
            continue

        tocados += 1
        print(f"\n[FILE] {ruta.relative_to(root)}")
        for p in problemas[:12]:
            print(f"  {p}")
        if len(problemas) > 12:
            print(f"  ... +{len(problemas)-12} más")

        if not dry:
            ruta.write_text(limpio, encoding="utf-8", newline="\n")
            print("  -> reescrito (LF + ASCII-safe)")

    print("\n" + "=" * 64)
    print(f"Archivos tocados: {tocados}")
    if dry:
        print("Modo dry-run. Ejecuta sin --dry para aplicar.")
    print("=" * 64)

if __name__ == "__main__":
    main()
