import React from 'react';
import { 
  FolderGit2, 
  Terminal, 
  Atom, 
  ShieldCheck, 
  FileText, 
  Cpu, 
  Database, 
  Download, 
  CheckCircle2, 
  Sparkles,
  Lock
} from 'lucide-react';
import { exportMasterRepoZip } from '../lib/zipExporter';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleZipDownload = async () => {
    setIsExporting(true);
    try {
      await exportMasterRepoZip();
    } catch (err) {
      console.error("Zip export error:", err);
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  const navItems = [
    { id: 'repo', label: 'Estructura Repositorio', icon: FolderGit2, badge: '7 Archivos' },
    { id: 'terminal', label: 'Terminal Git / WSL', icon: Terminal, badge: 'Linux' },
    { id: 'convex', label: 'Partícula P_LAM & CLC', icon: Atom, badge: 'Física / CLC v1.2' },
    { id: 'auditor', label: 'Auditor RAEK-1.0-MX', icon: ShieldCheck, badge: 'Gemini AI' },
    { id: 'matrix', label: 'Matriz 7 DOIs', icon: FileText, badge: 'ISO/IEC 42001' },
    { id: 'hardware', label: 'Tarjeta Lógica', icon: Cpu, badge: 'Chip Fotónico' },
    { id: 'ledger', label: 'Ledger WORM', icon: Database, badge: 'SHA-256' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-xl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 px-4 py-2 border-b border-cyan-900/40 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono px-2 py-0.5 rounded flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            MODO FUNDADOR: ROMEO-HYDRA v3.0
          </span>
          <span className="text-slate-300 font-medium hidden sm:inline">
            Fundador: <strong className="text-slate-100">LUIS ANGEL VAZQUEZ MARTINEZ</strong>
          </span>
          <span className="text-slate-500 hidden lg:inline">|</span>
          <span className="text-slate-400 font-mono hidden lg:inline">
            Firma: <code className="text-emerald-400">0xLAVM_PPRH_HYDRA_V3_CRISTALIZADO</code>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded font-mono text-[11px]">
            <CheckCircle2 className="w-3 h-3" />
            0 ESCAPES VERIFICADOS [CLC v1.2]
          </span>
          <button
            onClick={handleZipDownload}
            disabled={isExporting}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-3 py-1 rounded text-xs transition flex items-center gap-1.5 shadow-md shadow-cyan-950 hover:shadow-cyan-900/50 active:scale-95 disabled:opacity-50"
            title="Descargar paquete completo romeo-hydra-master.zip"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? 'Exportando...' : 'Exportar Repository ZIP'}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-2">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-cyan-900/40 border border-cyan-400/30">
              <Atom className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-slate-100 font-bold text-base leading-none tracking-tight flex items-center gap-2">
                ROMEO-HYDRA MASTER
                <span className="bg-slate-800 text-cyan-400 border border-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded">
                  v3.0
                </span>
              </h1>
              <p className="text-slate-400 text-xs font-mono mt-0.5">
                Códice PPRH · Coherencia Lógico-Convexa (CLC v1.2)
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-700/50' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
