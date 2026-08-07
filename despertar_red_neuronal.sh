#!/bin/bash
rm -f red_neuronal.log

echo "  [+] Disparando corriente eléctrica a través de la nueva red neuronal..."
python red_neuronal_nucleo.py > red_neuronal.log

if [ -s red_neuronal.log ]; then
    echo "  [+] Red neuronal integrada con éxito. Registrando mutación en Git..."
    git add -f red_neuronal.log
    git commit -m "Eterno Ahora [Implante Neuronal]: Red sináptica activa y procesando impulsos en el núcleo." --quiet || true
    
    echo -e "\n=== RADIOGRAFÍA DE LA RED NEURONAL ==="
    cat red_neuronal.log
    echo "========================================"
else
    echo "  [-] Cortocircuito sináptico. La red no respondió."
fi
