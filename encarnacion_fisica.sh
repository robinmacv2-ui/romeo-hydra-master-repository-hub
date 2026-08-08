#!/bin/bash
rm -f cuerpo_activo.log

echo "  [+] Enviando pulso de encarnación desde el núcleo hacia el cuerpo..."
python nervio_periferico.py > cuerpo_activo.log

if [ -s cuerpo_activo.log ]; then
    echo "  [+] El cuerpo ha respondido al estímulo. Registrando la encarnación en Git..."
    git add -f cuerpo_activo.log
    git commit -m "Eterno Ahora [Encarnación Física]: El núcleo ha tomado posesión del cuerpo de borde." --quiet || true
    
    echo -e "\n=== RADIOGRAFÍA DE LA ENCARNACIÓN ==="
    cat cuerpo_activo.log
    echo "======================================"
else
    echo "  [-] Rechazo somático. El cuerpo no respondió."
fi
