#!/usr/bin/env bash
# ==============================================================
#  ROMEO-HYDRA — Activación del Núcleo TFHE + Abstracción Romeo
#  Estilo organismo multicelular / pliegue conceptual a bajo nivel
# ==============================================================

set -e

MODO="${1:-once}"

echo "=============================================================="
echo "  ROMEO-HYDRA — MÓDULO TFHE + COMPILADOR ROMEO"
echo "  Pliegue conceptual → C++ determinista / Circuitos Homomórficos"
echo "=============================================================="
echo

echo "  [1/3] Cargando TFHECore (profundidad total)..."
python -c "
from romeo_hydra.core.tfhe_core import TFHECore
t = TFHECore()
print(t.resumen())
print()
print(t.fundamentos()[:600], '...')
" || python3 -c "
from romeo_hydra.core.tfhe_core import TFHECore
t = TFHECore()
print(t.resumen())
"

echo
echo "  [2/3] Cargando RomeoAbstractionLayer..."
python -c "
from romeo_hydra.core.romeo_abstraction import RomeoAbstractionLayer
r = RomeoAbstractionLayer()
print('VERSION:', r.VERSION)
print(r.describe()[:400], '...')
" || python3 -c "
from romeo_hydra.core.romeo_abstraction import RomeoAbstractionLayer
r = RomeoAbstractionLayer()
print('VERSION:', r.VERSION)
"

echo
echo "  [3/3] Generando esqueleto C++ de ejemplo..."
python -c "
from romeo_hydra.core.tfhe_core import TFHECore
t = TFHECore()
print(t.generar_esqueleto_cpp('demo_romeo_tfhe')[:500])
print('... [esqueleto completo disponible vía TFHECore.generar_esqueleto_cpp()]')
" || true

echo
echo "=============================================================="
echo "  Núcleo TFHE + Romeo activo."
echo "=============================================================="
echo
echo "Comandos útiles:"
echo "  python -c 'from romeo_hydra.core.tfhe_core import TFHECore; print(TFHECore().comandos_sistema())'"
echo "  ./activar_tfhe_romeo.sh          # ejecución única"
echo "  ./activar_tfhe_romeo.sh watch    # (reservado para vigilancia futura)"
echo
echo "Para compilar un circuito generado (estilo Romeo clásico):"
echo "  g++ -O3 -o circuito circuito.cpp -ltfhe-spqlios-fma && ./circuito"
echo
