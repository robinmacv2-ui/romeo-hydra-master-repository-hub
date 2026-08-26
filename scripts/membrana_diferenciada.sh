#!/bin/bash
NODO_ID=$1
GRADIENTE=$2

# El nodo ejecuta su ADN zigótico usando el gradiente que le tocó.
# El ruido térmico (esfuerzo de plegamiento) resbala hacia /dev/null.
# La coherencia estructural (el órgano formado) se integra al organismo.
python adn_zigotico.py $NODO_ID $GRADIENTE 2> /dev/null | grep -a -E "asimilado|NÚCLEO|TERMINAL" >> organismo_estructurado.txt
