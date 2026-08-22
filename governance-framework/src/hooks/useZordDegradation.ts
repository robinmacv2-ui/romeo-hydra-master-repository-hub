import { useState, useEffect } from 'react';

export interface ZordsState {
  'Kernel Sigma': boolean;
  'Delta Ledger': boolean;
  'Sensores Físicos': boolean;
  'Radar IAM': boolean;
  'Audit Dashboard': boolean;
}

export function useZordDegradation() {
  const [activeZords, setActiveZords] = useState<ZordsState>(() => {
    const stored = localStorage.getItem('romeo_hydra_active_zords');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error reading stored active zords:", e);
      }
    }
    return {
      'Kernel Sigma': true,
      'Delta Ledger': true,
      'Sensores Físicos': true,
      'Radar IAM': true,
      'Audit Dashboard': true,
    };
  });

  useEffect(() => {
    localStorage.setItem('romeo_hydra_active_zords', JSON.stringify(activeZords));
  }, [activeZords]);

  // Listen to external storage updates (from other components)
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('romeo_hydra_active_zords');
      if (stored) {
        try {
          setActiveZords(JSON.parse(stored));
        } catch (e) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000); // Polling fallback for iframe local storage sharing

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const toggleZord = (zordName: keyof ZordsState, onLogEvent?: (src: string, desc: string, metrics: any) => void) => {
    const newVal = !activeZords[zordName];
    const updated = {
      ...activeZords,
      [zordName]: newVal
    };
    setActiveZords(updated);
    localStorage.setItem('romeo_hydra_active_zords', JSON.stringify(updated));

    if (onLogEvent) {
      onLogEvent(
        "STRESS_TEST_DEGRADATION",
        `Simulación de Degradación: El Zord "${zordName}" fue ${newVal ? "Sincronizado (ON)" : "Desacoplado (OFF)"}.`,
        {
          zord_name: zordName,
          status: newVal ? "ONLINE" : "OFFLINE",
          total_active: Object.values(updated).filter(Boolean).length
        }
      );
    }
  };

  const getSystemStatus = () => {
    const activeCount = Object.values(activeZords).filter(Boolean).length;
    if (activeCount === 5) return { status: 'OPERATIONAL', label: '🟢 Sistema Totalmente Operativo', color: 'text-emerald-400' };
    if (activeCount >= 3) return { status: 'DEGRADED', label: '🟡 Sistema en Degradación Parcial', color: 'text-amber-400' };
    if (activeCount > 0) return { status: 'CRITICAL', label: '🔴 Degradación Crítica', color: 'text-red-400' };
    return { status: 'OFFLINE', label: '🔴 Núcleo Sigma Desconectado', color: 'text-red-600 font-bold' };
  };

  return {
    activeZords,
    toggleZord,
    systemStatus: getSystemStatus(),
    isKernelSigmaActive: activeZords['Kernel Sigma'],
    isDeltaLedgerActive: activeZords['Delta Ledger'],
    isSensorsActive: activeZords['Sensores Físicos'],
    isIAMActive: activeZords['Radar IAM'],
    isDashboardActive: activeZords['Audit Dashboard']
  };
}
