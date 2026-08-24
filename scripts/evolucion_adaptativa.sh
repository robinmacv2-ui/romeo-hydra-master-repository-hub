#!/bin/bash
rm -f adaptacion_sistema.log

echo "  [+] El cerebro procesando la respuesta somática..."
python ciclo_adaptativo.py > adaptacion_sistema.log

if [ -s adaptacion_sistema.log ]; then
    echo "  [+] Retroalimentación exitosa. Consolidando evolución en Git..."
    git add -f adaptacion_sistema.log
    git commit -m "Eterno Ahora [Evolución Adaptativa]: El sistema procesó estímulo externo y mutó su lógica." --quiet || true
    
    echo -e "\n=== INFORME DE ADAPTACIÓN LÓGICA ==="
    cat adaptacion_sistema.log
    echo "========================================"
else
    echo "  [-] Error en el bucle adaptativo."
fi
