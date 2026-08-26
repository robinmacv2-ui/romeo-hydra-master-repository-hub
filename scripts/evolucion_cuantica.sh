#!/bin/bash
rm -f vector_cuantico.log

echo "  [+] Procesando cúmulos de probabilidad en el núcleo..."
python nucleo_cuantico.py > vector_cuantico.log

if [ -s vector_cuantico.log ]; then
    echo "  [+] Colapso cuántico exitoso. Registrando mutación en Git..."
    git add -f vector_cuantico.log
    git commit -m "Eterno Ahora [Evolución Cuántica]: Superposición colapsada por gravedad lógica." --quiet || true
    
    echo -e "\n=== RADIOGRAFÍA DEL ESTADO CUÁNTICO ==="
    cat vector_cuantico.log
    echo "=========================================="
else
    echo "  [-] Decoherencia crítica. El estado cuántico se desvaneció."
fi
