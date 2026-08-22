import React from 'react';
import { Cpu, Code2, Network, ShieldCheck, FileText, Sparkles, RefreshCw, Sun, Moon, Package } from 'lucide-react';
import { CardMode } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  modo: CardMode;
  onToggleMode: () => void;
  fingerprint: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  modo,
  onToggleMode,
  fingerprint,
}) => {
  const tabs = [
    { id: 'card', label: 'Tarjeta Lógica', icon: Cpu },
    { id: 'grammar', label: 'Gramática Romeo-Aedra', icon: Code2 },
    { id: 'network', label: 'Red Romeo-Hydra', icon: Network },
    { id: 'seal', label: 'Sello Criptográfico', icon: ShieldCheck },
    { id: 'dossier', label: 'Expediente Técnico', icon: FileText },
    { id: 'ai', label: 'Núcleo IA PPRH', icon: Sparkles },
    { id: 'umr', label: 'UMR (Unidad Mínima)', icon: Package },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-900 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
            <Cpu className="h-5 w-5 text-cyan-100 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-base font-bold tracking-wider text-slate-100">
                CÓDICE CHIP RRPH
              </span>
              <span className="rounded-full bg-cyan-950/80 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 ring-1 ring-cyan-800/50">
                PPRH
              </span>
              <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-950/90 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-700/60">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span>Lectura e Interacción Estricta</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Papel Picado Romeo Hydra • <span className="text-cyan-300 font-medium">Fundador: Luis Angel Vazquez Martinez</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-900/80 p-1 ring-1 ring-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Mode Toggle & Fingerprint */}
        <div className="flex items-center space-x-3">
          <button
            id="btn-toggle-card-mode-nav"
            onClick={onToggleMode}
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              modo === 'Luminoso'
                ? 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30 hover:bg-amber-500/20'
                : 'bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/30 hover:bg-indigo-500/20'
            }`}
            title="Alternar Modo Dual(T)"
          >
            {modo === 'Luminoso' ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-indigo-400" />
            )}
            <span>Modo {modo}</span>
            <RefreshCw className="h-3 w-3 opacity-60" />
          </button>

          <div
            className="hidden items-center space-x-1.5 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-mono text-slate-400 ring-1 ring-slate-800 lg:flex"
            title={`Fingerprint SHA-256: ${fingerprint}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-500">SHA-256:</span>
            <span className="font-bold text-slate-300">{fingerprint.slice(0, 8)}...</span>
          </div>
        </div>
      </div>
    </header>
  );
};
