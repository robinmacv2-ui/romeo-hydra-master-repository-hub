#!/usr/bin/env bash

MODO="${1:-once}"

echo "=============================================================="
echo "  ROMEO-HYDRA V3.0 — ORGANISMO MULTICELULAR"
echo "  Mitosis + Diferenciacion + Antifragilidad + Prediccion"
echo "=============================================================="
echo

if [[ "$MODO" == "watch" ]]; then
    echo "[MODO] Vigilancia continua (Ctrl+C para detener)"
    while true; do
        python nucleo_v30.py
        echo
        python automedicina_v30.py
        echo "--- Esperando 45s ---"
        sleep 45
    done
fi

echo "  [1/2] Ejecutando Nucleo V3.0..."
python nucleo_v30.py
CODE_NUCLEO=$?

echo
echo "  [2/2] Ejecutando Sistema Inmunologico V3.0..."
python automedicina_v30.py
CODE_INMUNE=$?

echo
echo "=============================================================="
echo "Codigos de salida -> Nucleo: $CODE_NUCLEO | Inmune: $CODE_INMUNE"
echo "=============================================================="
echo
echo "Para vigilancia continua ejecuta:"
echo "  ./activar_romeo_hydra_v30.sh watch"
echo
echo "Para guardar en Git manualmente:"
echo "  git add ."
echo "  git commit -m \"ROMEO-HYDRA V3.0 - Organismo multicelular\""
