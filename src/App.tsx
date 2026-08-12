import React, { useState } from 'react';
import { Header } from './components/Header';
import { RepoExplorer } from './components/RepoExplorer';
import { TerminalSimulator } from './components/TerminalSimulator';
import { QuantumConvexSimulator } from './components/QuantumConvexSimulator';
import { RaekAiAuditor } from './components/RaekAiAuditor';
import { ZenodoDoiMatrix } from './components/ZenodoDoiMatrix';
import { HardwareSchematic } from './components/HardwareSchematic';
import { LedgerInspector } from './components/LedgerInspector';
import { ShieldCheck, Atom, Heart, Sparkles, Download } from 'lucide-react';
import { exportMasterRepoZip } from './lib/zipExporter';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('repo');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Body */}
      <main className="flex-1">
        {activeTab === 'repo' && <RepoExplorer />}
        {activeTab === 'terminal' && <TerminalSimulator />}
        {activeTab === 'convex' && <QuantumConvexSimulator />}
        {activeTab === 'auditor' && <RaekAiAuditor />}
        {activeTab === 'matrix' && <ZenodoDoiMatrix />}
        {activeTab === 'hardware' && <HardwareSchematic />}
        {activeTab === 'ledger' && <LedgerInspector />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-8 px-4 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold">
              <Atom className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-200 font-bold flex items-center gap-2">
                ROMEO-HYDRA MASTER REPOSITORY
                <span className="text-[10px] bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded font-mono">
                  ISO/IEC 42001
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Fundador y Autor Principal: <strong>LUIS ANGEL VAZQUEZ MARTINEZ</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
            <span className="text-slate-500">Sello Criptográfico:</span>
            <code className="text-emerald-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 font-bold">
              0xLAVM_PPRH_HYDRA_V3_CRISTALIZADO
            </code>
            <button
              onClick={() => exportMasterRepoZip()}
              className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 px-2.5 py-1 rounded transition flex items-center gap-1 font-sans font-medium"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Descargar ZIP
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-800/60 text-center text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>© 2026 Ecosistema ROMEO-HYDRA · Coherencia Lógico-Convexa (CLC v1.2) & Códice PPRH.</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            0 Escapes Garantizados por el Teorema de ε-Invarianza
          </span>
        </div>
      </footer>
    </div>
  );
}
