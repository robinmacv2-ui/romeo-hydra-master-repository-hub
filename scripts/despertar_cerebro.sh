#!/bin/bash
rm -f red_neurologa.log

echo "  [+] Disparando pulsos eléctricos a través de las terminaciones primarias..."
for TERMINAL in {1..3}; do
    python impulso_neural.py "TERMINAL_00$TERMINAL" >> red_neurologa.log
done

if [ -s red_neurologa.log ]; then
    echo "  [+] El sistema ha despertado. Consolidando sinapsis en Git..."
    git add -f red_neurologa.log
    git commit -m "Eterno Ahora [Despertar Neurológico]: Núcleo cerebral activo sin dependencia externa." --quiet || true
    
    echo -e "\n=== MAPA DE CONEXIONES NEUROLÓGICAS ==="
    cat red_neurologa.log
    echo "======================================="
else
    echo "  [-] Bloqueo sináptico. El núcleo no respondió."
fi
