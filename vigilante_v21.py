#!/usr/bin/env python3
"""
ROMEO-HYDRA V2.1 — Vigilante Continuo
"""

from __future__ import annotations

import sys
import time
import subprocess

INTERVALO_SEGUNDOS = 45
MAX_CICLOS = 0          # 0 = infinito

def main() -> int:
    print("[VIGILANTE V2.1] Iniciando supervision continua...")
    print(f"                 Intervalo: {INTERVALO_SEGUNDOS}s | Ctrl+C para detener\n")

    ciclo = 0
    try:
        while True:
            ciclo += 1
            print(f"--- Ciclo {ciclo} ---")
            r1 = subprocess.run([sys.executable, "columna_vertebral_v21.py"])
            r2 = subprocess.run([sys.executable, "automedicina_v21.py"])
            print(f"Resultados -> Columna: {r1.returncode} | Inmune: {r2.returncode}\n")

            if MAX_CICLOS > 0 and ciclo >= MAX_CICLOS:
                break
            time.sleep(INTERVALO_SEGUNDOS)
    except KeyboardInterrupt:
        print("\n[VIGILANTE] Detenido por usuario. Organismo en reposo.")
        return 0
    return 0

if __name__ == "__main__":
    sys.exit(main())
