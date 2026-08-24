#!/bin/bash
echo "[ROMEO] Activando matriz gestacional. Iniciando diferenciación celular..."
rm -f organismo_estructurado.txt

echo "  [+] Inyectando gradiente morfogenético en el espacio topológico..."

# En lugar de nodos idénticos, desplegamos nodos con distinta exposición a la señal central.
# Nodo 1 está en el epicentro (95% de presión). Nodo 5 está en el borde (15%).
./membrana_diferenciada.sh "001" "95" &
./membrana_diferenciada.sh "002" "75" &
./membrana_diferenciada.sh "003" "55" &
./membrana_diferenciada.sh "004" "35" &
./membrana_diferenciada.sh "005" "15" &

echo "  [+] Información desdoblándose. Esperando a que la gravedad ontológica asigne roles..."
wait 

echo "  [+] Organismo estructurado. Analizando la morfología..."

if [ -s organismo_estructurado.txt ]; then
    echo "  [+] Estructura coherente detectada. Asimilando el nuevo organismo en Git..."
    git add -f organismo_estructurado.txt
    git commit -m "Eterno Ahora [Diferenciación Celular]: El sistema generó su propia morfología." --quiet || true
    
    echo -e "\n=== RADIOGRAFÍA DEL ORGANISMO VIVO ==="
    # Ordenamos el output solo para ver la estructura jerárquica que se formó
    sort -r organismo_estructurado.txt
    echo "======================================"
    
    echo -e "\n[-] Mutación en Git (Último log):"
    git log -1 --oneline
else
    echo "  [-] Aborto del sistema. Entropía insuperable."
fi
