import React, { useState, useEffect } from 'react';
import { Cpu, Database, Eye, ShieldAlert, Terminal, Sparkles, AlertTriangle, Zap, CheckCircle2, XCircle } from 'lucide-react';

export const MegazordArchitectureView: React.FC = () => {
  const [activeZords, setActiveZords] = useState<Record<string, boolean>>({
    'Kernel Sigma': true,
    'Delta Ledger': true,
    'Sensores Físicos': true,
    'Radar IAM': true,
    'Audit Dashboard': true,
  });

  const [activeTab, setActiveTab] = useState<string>('all');

  // Read current active Zords from localStorage (synced with state togglers)
  useEffect(() => {
    const storedZords = localStorage.getItem('romeo_hydra_active_zords');
    if (storedZords) {
      try {
        setActiveZords(JSON.parse(storedZords));
      } catch (e) {
        console.error("Error loading active zords status:", e);
      }
    }

    const interval = setInterval(() => {
      const currentStored = localStorage.getItem('romeo_hydra_active_zords');
      if (currentStored) {
        try {
          setActiveZords(JSON.parse(currentStored));
        } catch (e) {}
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleZord = (zordName: string) => {
    const updated = {
      ...activeZords,
      [zordName]: !activeZords[zordName]
    };
    setActiveZords(updated);
    localStorage.setItem('romeo_hydra_active_zords', JSON.stringify(updated));
  };

  const zordsData = [
    {
      name: 'Kernel Sigma',
      role: 'Zord 1: El Cerebro Lógico',
      icon: Cpu,
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/[0.02]',
      iconBg: 'bg-amber-500/10 text-amber-400',
      description: 'El núcleo de cálculo principal. Evalúa desviaciones lógicas, verifica el drift de resistencia fiduciaria (R >= 0.85) y aplica proyecciones matemáticas sobre conjuntos convexos.',
      capabilities: [
        'Optimización Convexa en Tiempo Real',
        'Falsación de Hipótesis (Popper)',
        'Clipping de Riesgo Fiduciario a un Máximo de 5%'
      ],
      stressedOut: 'El sistema permite inferencias inestables sin mitigación matemática, exponiendo fondos y configuraciones.'
    },
    {
      name: 'Delta Ledger',
      role: 'Zord 2: La Memoria Inmutable',
      icon: Database,
      color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/[0.02]',
      iconBg: 'bg-indigo-500/10 text-indigo-400',
      description: 'Bitácora blockchain criptográfica local sincronizada con Firestore. Encadena cada diagnóstico mediante hashes SHA-256 sucesivos para evitar adulteración retroactiva de auditorías.',
      capabilities: [
        'Cadena de Bloques Sucesivos Hash-Chain',
        'Integridad Forense Verificable',
        'Sincronización en la Nube / Firebase'
      ],
      stressedOut: 'Los logs carecen de sello criptográfico. Un atacante podría adulterar los registros de intrusiones del pasado sin levantar sospechas.'
    },
    {
      name: 'Sensores Físicos',
      role: 'Zord 3: Los Escudos y Telemetría',
      icon: Eye,
      color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/[0.02]',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      description: 'El eslabón físico y espacial de la infraestructura (Nodos 4446-4487). Captura lecturas ópticas de presencia humana, lecturas térmicas infrarrojas de túneles y pulsos de tarjetas NFC.',
      capabilities: [
        'Inyección de Telemetría Multimodal',
        'Margen de Drift Temporal Máximo nominal de ±500ms',
        'Validación de Atribución Física de Hardware'
      ],
      stressedOut: 'El sistema se desvincula de la realidad espacial, tolerando accesos virtuales sin token físico.'
    },
    {
      name: 'Radar IAM',
      role: 'Zord 4: El Control de Privilegios',
      icon: ShieldAlert,
      color: 'text-rose-400 border-rose-500/20 bg-rose-500/[0.02]',
      iconBg: 'bg-rose-500/10 text-rose-400',
      description: 'Establece el axioma fundamental "Identidad ≠ Autorización". Aunque la firma digital de un operador sea válida y esté en el sitio, si carece del privilegio de rol contractual, se veta de inmediato.',
      capabilities: [
        'Detección de Escalamientos de Privilegios',
        'Alerta "FORENSIC_ALERT_CRITICAL" Inmediata',
        'Separación Estricta de Roles en Campo'
      ],
      stressedOut: 'Se anula el bloqueo de seguridad. Cualquier contratista con firma básica puede modificar umbrales críticos de infraestructura.'
    },
    {
      name: 'Audit Dashboard',
      role: 'Zord 5: El Panel de Comando',
      icon: Terminal,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.02]',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      description: 'Consola en texto plano con renderizado ASCII exacto que visibiliza la cadena causal completa. Es la materialización visual de "La Caja Blanca de la IA" para oficiales de cumplimiento.',
      capabilities: [
        'Estructura ASCII de Baja Fidelidad Auténtica',
        'Sello de Seguridad inmutable Delta Ledger',
        'Auditoría Dinámica e Ingestión de Scripts'
      ],
      stressedOut: 'Pérdida total de observabilidad operacional. Los oficiales de cumplimiento quedan a ciegas ante anomalías.'
    }
  ];

  const totalActive = Object.values(activeZords).filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fade-in" id="megazord-architecture-container">
      
      {/* Dynamic Summary Panel */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-cyan-950/20 border border-purple-500/30 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
              <span>[DISEÑO DE CONEXIÓN UNIFICADO // MEGAZORD SECUENCER]</span>
            </div>
            <h3 className="text-xl font-bold text-slate-100 font-sans tracking-tight">
              Ensamblaje Dinámico Desacoplado: ROMEO-HYDRA Megazord
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Un sistema de gobernanza automatizado no puede ser una "caja negra" monolítica. Al igual que los Zords de combate de alta fidelidad, la consola de <strong className="text-slate-200">ROMEO-HYDRA v3.0</strong> ha sido fragmentada en 5 subsistemas autónomos que operan independientes, pero que al ensamblarse forman una unidad blindada inexpugnable.
            </p>
          </div>
          
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 text-center font-mono shrink-0 min-w-[180px]">
            <span className="text-[9px] text-slate-500 uppercase block font-bold">Estado de Sincronización:</span>
            <div className="text-2xl font-black text-purple-400 my-1">{totalActive}/5</div>
            <div className="text-[10px] uppercase font-bold tracking-wide">
              {totalActive === 5 ? (
                <span className="text-emerald-400 flex items-center gap-1 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Megazord Listo
                </span>
              ) : totalActive > 2 ? (
                <span className="text-yellow-400 flex items-center gap-1 justify-center animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" /> Operación Degradada
                </span>
              ) : (
                <span className="text-red-500 flex items-center gap-1 justify-center">
                  <XCircle className="w-3.5 h-3.5" /> Falla Crítica Sinc.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid selector / Tabs */}
      <div className="flex border-b border-slate-800/60 pb-1 gap-2 overflow-x-auto scrollbar-none font-mono text-xs">
        {[
          { id: 'all', label: 'Todos los Zords' },
          { id: 'Kernel Sigma', label: 'Zord 1: Kernel Sigma' },
          { id: 'Delta Ledger', label: 'Zord 2: Delta Ledger' },
          { id: 'Sensores Físicos', label: 'Zord 3: Sensores Físicos' },
          { id: 'Radar IAM', label: 'Zord 4: Radar IAM' },
          { id: 'Audit Dashboard', label: 'Zord 5: Audit Dashboard' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-1.5 px-3 border rounded transition whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zordsData
          .filter(z => activeTab === 'all' || z.name === activeTab)
          .map((zord, i) => {
            const Icon = zord.icon;
            const isZordActive = activeZords[zord.name];
            return (
              <div 
                key={i} 
                className={`bg-slate-900 border ${isZordActive ? 'border-slate-800' : 'border-red-500/30 opacity-70'} rounded-xl p-5 flex flex-col justify-between transition duration-300 hover:border-slate-700 relative group`}
              >
                {/* Active indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 font-mono text-[9px] font-bold">
                  <span className={`w-2 h-2 rounded-full ${isZordActive ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                  <span className={isZordActive ? 'text-slate-500' : 'text-red-400'}>
                    {isZordActive ? 'ONLINE' : 'DEGRADED'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${zord.iconBg} group-hover:scale-105 transition duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wide">
                        {zord.role}
                      </h4>
                      <h3 className="text-sm font-bold text-slate-100 font-sans tracking-tight">
                        {zord.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {zord.description}
                  </p>

                  <div className="space-y-1.5 font-mono text-[10.5px]">
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wide block">
                      Capacidades Clave:
                    </span>
                    {zord.capabilities.map((cap, idx) => (
                      <div key={idx} className="flex gap-2 items-start text-slate-300">
                        <span className="text-purple-400">➔</span>
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>

                  {!isZordActive && (
                    <div className="bg-red-950/20 border border-red-500/20 p-2.5 rounded-lg text-[10.5px] font-mono text-red-400 leading-relaxed mt-2">
                      <strong className="block text-[9px] text-red-500 uppercase font-bold">⚠️ Impacto de Stress:</strong>
                      {zord.stressedOut}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-950 pt-4 mt-5">
                  <button
                    onClick={() => handleToggleZord(zord.name)}
                    className={`w-full py-2 border rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-2 ${
                      isZordActive 
                        ? 'bg-slate-950/60 hover:bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200' 
                        : 'bg-red-950/40 hover:bg-red-950/60 border-red-500/30 text-red-400 hover:text-red-300'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${isZordActive ? 'text-slate-500' : 'text-red-400 animate-pulse'}`} />
                    {isZordActive ? 'Simular Degradación' : 'Restaurar Sincronía'}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Megazord Assembly Process Sequence */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
          <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
          <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
            Protocolo de Ensamblaje en una Auditoría en Tiempo Real
          </h4>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 text-center font-mono text-xs">
          <div className="p-3 bg-slate-950 border border-slate-850/60 rounded-xl flex flex-col justify-between h-32 hover:border-cyan-500/30 transition">
            <span className="text-[10px] text-cyan-400 font-bold block mb-1">01. INGESTA</span>
            <p className="text-[10.5px] text-slate-400 leading-normal">
              Sensores de campo capturan telemetrías ópticas de túneles y pulsos NFC de Gatekeeper.
            </p>
            <span className="text-[9px] text-slate-600">Zord 3 Activo</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-850/60 rounded-xl flex flex-col justify-between h-32 hover:border-rose-500/30 transition">
            <span className="text-[10px] text-rose-400 font-bold block mb-1">02. MAPEO IAM</span>
            <p className="text-[10.5px] text-slate-400 leading-normal">
              Se analiza la firma X.509 y el rol. Identidad != Autorización es auditado de inmediato.
            </p>
            <span className="text-[9px] text-slate-600">Zord 4 Activo</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-850/60 rounded-xl flex flex-col justify-between h-32 hover:border-amber-500/30 transition">
            <span className="text-[10px] text-amber-400 font-bold block mb-1">03. CONVENCIÓN SIGMA</span>
            <p className="text-[10.5px] text-slate-400 leading-normal">
              El cerebro lógico calcula el riesgo y recorta proyecciones ante cualquier violación.
            </p>
            <span className="text-[9px] text-slate-600">Zord 1 Activo</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-850/60 rounded-xl flex flex-col justify-between h-32 hover:border-indigo-500/30 transition">
            <span className="text-[10px] text-indigo-400 font-bold block mb-1">04. CONGELACIÓN</span>
            <p className="text-[10.5px] text-slate-400 leading-normal">
              Delta Ledger sella el bloque inmutable con un hash SHA-256 encadenado y persistente.
            </p>
            <span className="text-[9px] text-slate-600">Zord 2 Activo</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-850/60 rounded-xl flex flex-col justify-between h-32 hover:border-emerald-500/30 transition">
            <span className="text-[10px] text-emerald-400 font-bold block mb-1">05. VISIBILIDAD</span>
            <p className="text-[10.5px] text-slate-400 leading-normal">
              La consola de control renderiza el dashboard exacto de baja fidelidad para el regulador.
            </p>
            <span className="text-[9px] text-slate-600">Zord 5 Activo</span>
          </div>
        </div>
      </div>

    </div>
  );
};
