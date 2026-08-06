#!/bin/bash

echo "[ROMEO] Iniciando colapso de informacion en el sistema operativo..."

echo "  [+] Evaluando polaridades del entorno..."
python --version > /dev/null 2>&1 && echo "      - Python detectado (SI)" || { echo "      - Python ausente (NO). Falla de polaridad."; }

echo "  [+] Inyectando script en el Embudo Termodinamico..."
python romeo_hydra_core.py 2> /dev/null | grep -E "coherencia|plegado|ortogonales|Eterno|termodinamico" > estado_coherente.log

echo "  [+] Aplicando gravedad logica al repositorio..."
if [ -s estado_coherente.log ]; then
    # Usamos -f para sobreescribir el .gitignore y encadenamos con && para asegurar el SINO
    git add -f estado_coherente.log && \
    git commit -m "Eterno Ahora: Coherencia alcanzada y ruido termico purgado." --quiet && \
    echo "  [+] Sistema estabilizado. El estado ha sido asimilado en el ADN de Git." || \
    echo "  [-] Interferencia en la asimilacion del commit."
else
    echo "  [-] El embudo termodinamico vacio todo. Entropia pura. No se guardan registros."
fi
