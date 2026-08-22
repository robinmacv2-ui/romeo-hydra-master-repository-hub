import React, { useState, useEffect } from 'react';
import { Role, Regime } from '../types';
import { Shield, ShieldAlert, Cpu, Terminal, BookOpen, Settings, Lock, UserCheck, Activity, Database, CheckCircle2, Compass } from 'lucide-react';

interface HeaderProps {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRegime: Regime;
  setActiveRegime: (regime: Regime) => void;
  nodeCount: number;
  arbitrationLoad: number;
  onOpenSpecModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeRole,
  setActiveRole,
  activeTab,
  setActiveTab,
  activeRegime,
  setActiveRegime,
  nodeCount,
  arbitrationLoad,
  onOpenSpecModal,
}) => {
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(14858529);

  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d:${h.toString().padStart(2, '0')}h:${m.toString().padStart(2, '0')}m:${s.toString().padStart(2, '0')}s`;
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">ADMIN [LEVEL 9]</span>;
      case 'OPERATOR':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">OPERATOR [LEVEL 5]</span>;
      case 'AUDITOR':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">AUDITOR [READ-ONLY]</span>;
    }
  };

  return (
    <header className="bg-[#020617]/90 border-b border-slate-800 text-slate-300 sticky top-0 z-40 backdrop-blur-md">
      {/* Top Banner Status Bar */}
      <div className="max-w-[1700px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 bg-emerald-500/15 border border-emerald-500/50 flex items-center justify-center rounded-lg shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <div className="w-3.5 h-3.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-white font-bold tracking-tight text-lg leading-none font-mono">
                ROMEO-HYDRA
              </h1>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono px-1.5 py-0.2 rounded font-bold">
                v3.0-RC1
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.15em] flex items-center gap-1.5 mt-0.5">
              <span>Cognitive Governance Core</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-500 hover:underline" onClick={(e) => { e.stopPropagation(); onOpenSpecModal(); }}>
                DOI: 10.5281/zenodo.21406719
              </span>
            </p>
          </div>
        </div>

        {/* Live System Telemetry Indicators */}
        <div className="hidden md:flex items-center space-x-6 text-[11px] font-mono border-x border-slate-800/80 px-6 py-1">
          <div className="flex flex-col items-start">
            <span className="text-slate-500 text-[9px] uppercase tracking-wider">CORE_UPTIME</span>
            <span className="text-emerald-400 font-bold">{formatUptime(uptimeSeconds)}</span>
          </div>

          <div className="flex flex-col items-start">
            <span className="text-slate-500 text-[9px] uppercase tracking-wider">ARBITRATION_LOAD</span>
            <span className="text-emerald-400 font-bold">{(arbitrationLoad ?? 0).toFixed(1)}% <span className="text-[9px] text-slate-500">(CLC)</span></span>
          </div>

          <div className="flex flex-col items-start">
            <span className="text-slate-500 text-[9px] uppercase tracking-wider">HEXA_NODES</span>
            <span className="text-emerald-400 font-bold">{nodeCount}/6 SINC</span>
          </div>

          <div className="flex flex-col items-start">
            <span className="text-slate-500 text-[9px] uppercase tracking-wider">REGIME_ACTIVO</span>
            <select
              value={activeRegime}
              onChange={(e) => setActiveRegime(e.target.value as Regime)}
              className="bg-slate-900 text-amber-400 border border-amber-500/40 rounded px-1.5 py-0.5 text-[10px] font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALPHA">α ALPHA (Estructura)</option>
              <option value="BETA">β BETA (Adaptativo)</option>
              <option value="GAMMA">γ GAMMA (Entropía)</option>
              <option value="DELTA">δ DELTA (Soberano)</option>
            </select>
          </div>
        </div>

        {/* Role Switcher & User Profile */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 flex items-center space-x-2">
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline uppercase pl-1">Rol:</span>
            <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800">
              <button
                onClick={() => setActiveRole('ADMIN')}
                className={`px-2 py-1 text-[10px] font-mono rounded transition-all ${
                  activeRole === 'ADMIN'
                    ? 'bg-red-500/20 text-red-400 font-bold border border-red-500/40 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Acceso total. Permite ejecutar purgas, aislamiento de nodos e inyección crítica."
              >
                ADMIN
              </button>
              <button
                onClick={() => setActiveRole('OPERATOR')}
                className={`px-2 py-1 text-[10px] font-mono rounded transition-all ${
                  activeRole === 'OPERATOR'
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Operación estándar. Permite calibrar Jacobiano y sincronizar veredictos WORM."
              >
                OPERADOR
              </button>
              <button
                onClick={() => setActiveRole('AUDITOR')}
                className={`px-2 py-1 text-[10px] font-mono rounded transition-all ${
                  activeRole === 'AUDITOR'
                    ? 'bg-blue-500/20 text-blue-400 font-bold border border-blue-500/40 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Modo lectura y auditoría. Bloquea ejecución de comandos de modificación."
              >
                AUDITOR
              </button>
            </div>
          </div>

          <button
            onClick={onOpenSpecModal}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-colors"
            title="Ver Especificación Formal y Documentación DOI"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline text-[11px]">Especificación DOI</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 lg:px-6">
        <div className="max-w-[1700px] mx-auto flex space-x-1 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-xs font-mono rounded-md flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Topología Hexa-Nodo</span>
          </button>

          <button
            onClick={() => setActiveTab('genesis')}
            className={`px-4 py-2 text-xs font-mono rounded-md flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'genesis'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 font-bold shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Génesis & Evolución (Entropy to Hydra)</span>
          </button>

          <button
            onClick={() => setActiveTab('commands')}
            className={`px-4 py-2 text-xs font-mono rounded-md flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'commands'
                ? 'bg-red-500/15 text-red-400 border border-red-500/40 font-bold shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Consola de Inyección</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 text-xs font-mono rounded-md flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'ledger'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 font-bold shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Ledger Inmutable (WORM)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-mono rounded-md flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/40 font-bold shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Ajustes de Gobernanza</span>
          </button>

          <button
            onClick={onOpenSpecModal}
            className={`px-4 py-2 text-xs font-mono rounded-md flex items-center space-x-2 transition-all whitespace-nowrap text-slate-400 hover:text-slate-200 hover:bg-slate-900/60`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>Documentación & DOI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
