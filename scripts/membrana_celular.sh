#!/bin/bash
NODO_ID=$1
# El -a obliga a Bash a leer el flujo ortogonal como texto humano.
python nucleo_estocastico.py $NODO_ID 2> /dev/null | grep -a -E "Plegado|Eterno" >> tejido_coherente.txt
