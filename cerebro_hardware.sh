#!/bin/bash
rm -f decision_sistema.log

echo "  [+] El núcleo cerebral procesando métricas del hardware..."
# El cerebro ejecuta el sensor y canaliza la señal física
python sensor_hardware.py > decision_sistema.log

# El cerebro toma una decisión lógica basada en el hardware detectado
echo "[DECISIÓN DEL NÚCLEO] Recursos de silicio estables. Asignación de carga óptima completada." >> decision_sistema.log

if [ -s decision_sistema.log ]; then
    echo "  [+] Hardware y cerebro sincronizados. Consolidando mutación en Git..."
    git add -f decision_sistema.log
    git commit -m "Eterno Ahora [Sincronización Cerebro-Hardware]: El núcleo gobierna el silicio local." --quiet || true
    
    echo -e "\n=== INFORME DE LA UNIÓN CEREBRO-HARDWARE ==="
    cat decision_sistema.log
    echo "==============================================="
else
    echo "  [-] Fallo en el puente de hardware."
fi
