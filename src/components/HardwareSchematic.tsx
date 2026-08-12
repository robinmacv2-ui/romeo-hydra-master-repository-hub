import React from 'react';
import { 
  Cpu, 
  Zap, 
  Activity, 
  Radio, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  Info 
} from 'lucide-react';

export const HardwareSchematic: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded text-xs font-mono font-semibold">
              CHIP CIBERFÍSICO FOTÓNICO [DOI 2]
            </span>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-xs font-mono">
              IEEE 1588 SINCRONIZADO
            </span>
          </div>
          <h2 className="text-slate-100 font-bold text-lg">
            Tarjeta Lógica ROMEO-HYDRA & Chip Óptico PPRH
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Diseño microfotónico en Silicio sobre Aislante (SOI) para modulación de energía libre sub-nanosegundo.
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 font-mono text-xs text-right">
          <div className="text-slate-500">Resonancia Fotónica:</div>
          <div className="text-cyan-400 font-bold text-sm">193.1 THz (1550 nm Banda C)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Photonic Diagram Schematics */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-slate-100 font-bold text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Topología de Modulación Óptica Ciberfísica
          </h3>

          {/* Interactive Block Diagram SVG */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 mb-6 flex flex-col items-center justify-center">
            <svg viewBox="0 0 700 280" className="w-full h-auto text-xs font-mono">
              {/* Background Grid */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="700" height="280" fill="url(#grid)" rx="8" />

              {/* Block 1: Input Buffer */}
              <rect x="30" y="90" width="120" height="100" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
              <text x="90" y="125" fill="#22d3ee" textAnchor="middle" fontWeight="bold">Entradas x</text>
              <text x="90" y="145" fill="#94a3b8" textAnchor="middle" fontSize="10">Búfer MZI</text>
              <text x="90" y="165" fill="#64748b" textAnchor="middle" fontSize="9">Optoelectrónico</text>

              {/* Arrow 1 */}
              <path d="M 150 140 L 210 140" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrow)" />

              {/* Block 2: P_LAM Photonic Chip */}
              <rect x="210" y="70" width="160" height="140" rx="10" fill="#1e1b4b" stroke="#a855f7" strokeWidth="2" />
              <text x="290" y="110" fill="#c084fc" textAnchor="middle" fontWeight="bold">Chip P_LAM</text>
              <text x="290" y="130" fill="#e9d5ff" textAnchor="middle" fontSize="10">Partícula Luis Ángel</text>
              <circle cx="290" cy="165" r="16" fill="#581c87" stroke="#c084fc" strokeWidth="1.5" />
              <text x="290" y="169" fill="#ffffff" textAnchor="middle" fontSize="9" fontWeight="bold">193 THz</text>

              {/* Arrow 2 */}
              <path d="M 370 140 L 430 140" stroke="#a855f7" strokeWidth="2" />

              {/* Block 3: A_epsilon Isolation Envelope */}
              <rect x="430" y="90" width="130" height="100" rx="8" fill="#14532d" stroke="#22c55e" strokeWidth="2" />
              <text x="495" y="125" fill="#4ade80" textAnchor="middle" fontWeight="bold">Membrana A_ε</text>
              <text x="495" y="145" fill="#86efac" textAnchor="middle" fontSize="10">Aislamiento C</text>
              <text x="495" y="165" fill="#15803d" textAnchor="middle" fontSize="9">Q-Factor &gt; 10^5</text>

              {/* Arrow 3 */}
              <path d="M 560 140 L 620 140" stroke="#22c55e" strokeWidth="2" />

              {/* Block 4: Ledger Terminal Output */}
              <rect x="620" y="90" width="60" height="100" rx="8" fill="#451a03" stroke="#f59e0b" strokeWidth="2" />
              <text x="650" y="130" fill="#fbbf24" textAnchor="middle" fontWeight="bold" fontSize="10">WORM</text>
              <text x="650" y="150" fill="#fef3c7" textAnchor="middle" fontSize="9">SHA-256</text>
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-purple-400 font-bold block mb-1">Guias de Onda SOI:</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Silicio sobre aislante de 450 nm x 220 nm con pérdida de propagación &lt; 1.5 dB/cm.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">Anillo Resonador:</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Factor de calidad Q &gt; 10^5 para filtrado selectivo de perturbaciones no convexas.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">Sincronización IEEE 1588:</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Precisión de sellado temporal de 10 picosegundos en el ledger WORM inmutable.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Technical Specifications */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4 font-mono text-xs">
          <h3 className="text-slate-100 font-bold text-sm pb-2 border-b border-slate-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Parámetros de Fabricación
          </h3>

          <div className="space-y-2">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">Proceso Semiconductor:</span>
              <span className="text-cyan-300 font-bold">180nm Photonic SOI</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">Factor Forma:</span>
              <span className="text-cyan-300 font-bold">PCIe x16 Ciberfísico</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">Ancho de Banda:</span>
              <span className="text-cyan-300 font-bold">100 Gbps Fotónico</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">Consumo Energético:</span>
              <span className="text-emerald-400 font-bold">&lt; 15 Watts</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">Sello Criptográfico:</span>
              <span className="text-emerald-400 font-bold">0xLAVM_PPRH_HYDRA</span>
            </div>
          </div>

          <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-lg text-purple-200 text-[11px] leading-relaxed">
            <div className="font-bold mb-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              Garantía de Hardware:
            </div>
            Cualquier desviación en la fase interferométrica activa el colapso fotónico ex-ante en el chip, aislando físicamente el puerto de salida.
          </div>
        </div>

      </div>
    </div>
  );
};
