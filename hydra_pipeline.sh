#!/bin/bash
echo "[ROMEO] Iniciando colapso de información en el sistema operativo..."

echo "  [+] Evaluando polaridades del entorno..."
python --version > /dev/null 2>&1 && echo "      - Python detectado (SÍ)" || { echo "      - Python ausente (NO). Abortando."; exit 1; }

echo "  [+] Inyectando script en el Embudo Termodinámico..."
# Aquí ocurre la magia física: 2> /dev/null mata el ruido, grep filtra la gravedad.
python romeo_hydra_core.py 2> /dev/null | grep -E "coherencia|plegado|ortogonales|Eterno" > estado_coherente.log

echo "  [+] Aplicando gravedad lógica al repositorio..."
if [ -s estado_coherente.log ]; then
    git add estado_coherente.log
    # Usamos || true por si Git se queja de que no hay un repositorio iniciado
    git commit -m "Eterno Ahora: Coherencia alcanzada y ruido térmico purgado." --quiet || true
    echo "  [+] Sistema estabilizado. El estado ha sido asimilado en el ADN de Git."
else
    echo "  [-] El embudo termodinámico vació todo. Entropía pura. No se guardan registros."
fi
