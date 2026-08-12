#!/usr/bin/env bash
# ==============================================================
#  ROMEO-HYDRA — Activación del Nodo Convexo TFHE + Romeo
#  Ontología ↔ Software ↔ Cifrado  (geometría coherente)
# ==============================================================

set -e

MODO="${1:-once}"

echo "=============================================================="
echo "  ROMEO-HYDRA — NODO CONVEXO TFHE + COMPILADOR ROMEO"
echo "  Pliegue conceptual → C++ determinista / Circuitos Homomórficos"
echo "  Axiomas: TFHE como Materialización + Soberanía del Resultado"
echo "=============================================================="
echo

echo "  [1/4] TFHECore (profundidad total)..."
python -c "
from romeo_hydra.core.tfhe_core import TFHECore
t = TFHECore()
print(t.resumen())
" 2>/dev/null || python3 -c "
from romeo_hydra.core.tfhe_core import TFHECore
t = TFHECore()
print(t.resumen())
"

echo
echo "  [2/4] RomeoAbstractionLayer..."
python -c "
from romeo_hydra.core.romeo_abstraction import RomeoAbstractionLayer
r = RomeoAbstractionLayer()
print('VERSION:', r.VERSION)
" 2>/dev/null || python3 -c "
from romeo_hydra.core.romeo_abstraction import RomeoAbstractionLayer
r = RomeoAbstractionLayer()
print('VERSION:', r.VERSION)
"

echo
echo "  [3/4] RomeoTFHEBridge (unificación convexa)..."
python -c "
from romeo_hydra.core.romeo_tfhe_bridge import RomeoTFHEBridge
b = RomeoTFHEBridge()
print(b.status())
print()
print(b.pliegue_completo('circuito de prueba convexa')['note'])
" 2>/dev/null || python3 -c "
from romeo_hydra.core.romeo_tfhe_bridge import RomeoTFHEBridge
b = RomeoTFHEBridge()
print(b.status())
"

echo
echo "  [4/4] Generando esqueleto C++ de ejemplo..."
python -c "
from romeo_hydra.core.tfhe_core import TFHECore
t = TFHECore()
print(t.generar_esqueleto_cpp('demo_romeo_tfhe')[:450])
print('... [esqueleto completo vía TFHECore.generar_esqueleto_cpp()]')
" 2>/dev/null || true

echo
echo "=============================================================="
echo "  Nodo convexo TFHE + Romeo activo."
echo "  Capas sincronizadas: Ontología | Software | Cifrado"
echo "=============================================================="
echo
echo "Comandos útiles:"
echo "  python -c 'from romeo_hydra.core.romeo_tfhe_bridge import RomeoTFHEBridge; print(RomeoTFHEBridge().describe_unificado()[:800])'"
echo "  python -c 'from romeo_hydra.core.tfhe_core import TFHECore; print(TFHECore().comandos_sistema())'"
echo "  ./activar_tfhe_romeo.sh"
echo
echo "Compilación de circuito (estilo Romeo clásico):"
echo "  g++ -O3 -o circuito circuito.cpp -ltfhe-spqlios-fma && ./circuito"
echo
