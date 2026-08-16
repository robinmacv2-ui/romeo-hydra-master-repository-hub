#!/usr/bin/env bash
# Inicializa / actualiza todos los submódulos del Master Hub
# Uso: bash scripts/init_all_submodules.sh
set -euo pipefail

echo "=== ROMEO-HYDRA Master Hub · Inicialización de submódulos ==="
echo "Autor: Luis Angel Vázquez Martínez"
echo

git submodule sync --recursive
git submodule update --init --recursive

echo
echo "Submódulos registrados en .gitmodules:"
git config --file .gitmodules --get-regexp path | awk '{print "  - " $2}'

echo
echo "Estado:"
git submodule status

echo
echo "Listo. Para clonar desde cero:"
echo "  git clone --recurse-submodules https://github.com/robinmacv2-ui/romeo-hydra-master-repository-hub.git"
