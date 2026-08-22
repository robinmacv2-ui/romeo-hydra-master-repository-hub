import React, { useState, useEffect } from 'react';
import { CardState, CardinalPort, Polarity } from '../types';
import { translateToBinary, calculateDuality, propagateFlux } from '../utils/quantumLogic';
import { Sun, Moon, Zap, RefreshCw, ShieldCheck, Activity, ChevronRight, Layers } from 'lucide-react';

interface QuantumCardRenderProps {
  cardState: CardState;
  setCardState: React.Dispatch<React.SetStateAction<CardState>>;
}

export const QuantumCardRender: React.FC<QuantumCardRenderProps> = ({ cardState, setCardState }) => {
  const [isPulseActive, setIsPulseActive] = useState(false);
  const [activeFluxPath, setActiveFluxPath] = useState<string | null>(null);

  const binaryVector = translateToBinary(cardState.modo, cardState.vector);

  // Toggle individual cardinal bit
  const handleToggleCardinal = (index: number) => {
    const newVector = [...cardState.vector] as [number, number, number, number];
    newVector[index] = newVector[index] === 1 ? 0 : 1;
    const newBinary = translateToBinary(cardState.modo, newVector);
    const newAnclajes = propagateFlux(newBinary);

    setCardState({
      ...cardState,
      vector: newVector,
      anclajesT: newAnclajes,
    });
  };

  // Toggle polarity for a port
  const handleTogglePolarity = (port: CardinalPort) => {
    const currentPol = cardState.polaridades[port];
    const newPol: Polarity = currentPol === '+' ? '-' : '+';
    setCardState({
      ...cardState,
      polaridades: {
        ...cardState.polaridades,
        [port]: newPol,
      },
    });
  };

  // Execute Dual(T) transformation
  const handleApplyDual = () => {
    const dualState = calculateDuality(cardState);
    setCardState(dualState);
  };

  // Trigger quantum flux pulse animation
  const handleTriggerFluxPulse = () => {
    setIsPulseActive(true);
    setActiveFluxPath('ALL');
    setTimeout(() => {
      setIsPulseActive(false);
      setActiveFluxPath(null);
    }, 1800);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Visual Render Canvas Section (7 Cols) */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 p-6 lg:col-span-7">
        <div className="mb-4 flex w-full items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 items-center-center rounded-full bg-cyan-400 animate-ping" />
            <h2 className="font-mono text-sm font-semibold tracking-wide text-slate-200">
              RENDERIZADO DE TARJETA PRIMARIA (PPRH-001)
            </h2>
          </div>
          <span className="rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-mono text-cyan-400 ring-1 ring-slate-800">
            {cardState.modo === 'Luminoso' ? 'Luminoso (S→1, I→0, N→0, O→1)' : 'Oscuro (Inversión Dual L↔D)'}
          </span>
        </div>

        {/* SVG Interactive Quantum Board Render */}
        <div className="relative flex w-full max-w-lg items-center justify-center p-2">
          <svg
            viewBox="0 0 500 500"
            className="w-full max-w-[440px] drop-shadow-[0_0_35px_rgba(6,182,212,0.15)] transition-all duration-500"
          >
            <defs>
              {/* Outer Board Metallic Gradient */}
              <linearGradient id="boardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              {/* Core Glow Gradient */}
              <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                <stop
                  offset="0%"
                  stopColor={cardState.modo === 'Luminoso' ? '#06b6d4' : '#818cf8'}
                  stopOpacity="0.8"
                />
                <stop
                  offset="70%"
                  stopColor={cardState.modo === 'Luminoso' ? '#3b82f6' : '#4c1d95'}
                  stopOpacity="0.3"
                />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>

              {/* Laser Pulse Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Outer Chamfered Plate (Obsidian Quantum Substrate) */}
            <polygon
              points="60,20 440,20 480,60 480,440 440,480 60,480 20,440 20,60"
              fill="url(#boardGrad)"
              stroke="#334155"
              strokeWidth="4"
              className="transition-colors duration-500"
            />

            {/* Inner Precision Cutout Ring */}
            <rect
              x="50"
              y="50"
              width="400"
              height="400"
              rx="16"
              fill="none"
              stroke={cardState.modo === 'Luminoso' ? '#0284c7' : '#6366f1'}
              strokeWidth="1.5"
              strokeDasharray="6 6"
              opacity="0.4"
            />

            {/* T-ANCHOR CORNER CONNECTORS (Nᵀ, Eᵀ, Sᵀ, Oᵀ) */}
            {/* North T-Anchor */}
            <g id="anchor-NT" className="cursor-pointer">
              <path d="M 230,20 L 270,20 L 270,45 L 230,45 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
              <circle cx="250" cy="32" r="5" fill={cardState.anclajesT.N_T === 1 ? '#38bdf8' : '#334155'} />
              <text x="250" y="14" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
                Nᵀ ({cardState.anclajesT.N_T})
              </text>
            </g>

            {/* East T-Anchor */}
            <g id="anchor-ET" className="cursor-pointer">
              <path d="M 480,230 L 480,270 L 455,270 L 455,230 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
              <circle cx="468" cy="250" r="5" fill={cardState.anclajesT.E_T === 1 ? '#38bdf8' : '#334155'} />
              <text x="492" y="254" textAnchor="start" fill="#38bdf8" fontSize="11" fontWeight="bold">
                Eᵀ ({cardState.anclajesT.E_T})
              </text>
            </g>

            {/* South T-Anchor */}
            <g id="anchor-ST" className="cursor-pointer">
              <path d="M 230,480 L 270,480 L 270,455 L 230,455 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
              <circle cx="250" cy="468" r="5" fill={cardState.anclajesT.S_T === 1 ? '#38bdf8' : '#334155'} />
              <text x="250" y="496" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
                Sᵀ ({cardState.anclajesT.S_T})
              </text>
            </g>

            {/* West T-Anchor */}
            <g id="anchor-OT" className="cursor-pointer">
              <path d="M 20,230 L 20,270 L 45,270 L 45,230 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
              <circle cx="32" cy="250" r="5" fill={cardState.anclajesT.O_T === 1 ? '#38bdf8' : '#334155'} />
              <text x="8" y="254" textAnchor="end" fill="#38bdf8" fontSize="11" fontWeight="bold">
                Oᵀ ({cardState.anclajesT.O_T})
              </text>
            </g>

            {/* CARDINAL PORTS (S, I, N, O) */}
            {/* North Port N */}
            <g id="port-N" className="cursor-pointer" onClick={() => handleToggleCardinal(2)}>
              <circle cx="250" cy="90" r="18" fill="#090d16" stroke={cardState.vector[2] === 1 ? '#06b6d4' : '#475569'} strokeWidth="2.5" />
              <text x="250" y="94" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">
                N
              </text>
              <rect x="238" y="112" width="24" height="14" rx="3" fill="#1e293b" />
              <text x="250" y="123" textAnchor="middle" fill={cardState.vector[2] === 1 ? '#38bdf8' : '#64748b'} fontSize="10" fontWeight="bold">
                v={cardState.vector[2]} ({cardState.polaridades.N})
              </text>
            </g>

            {/* South Port S */}
            <g id="port-S" className="cursor-pointer" onClick={() => handleToggleCardinal(0)}>
              <circle cx="250" cy="410" r="18" fill="#090d16" stroke={cardState.vector[0] === 1 ? '#06b6d4' : '#475569'} strokeWidth="2.5" />
              <text x="250" y="414" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">
                S
              </text>
              <rect x="238" y="374" width="24" height="14" rx="3" fill="#1e293b" />
              <text x="250" y="385" textAnchor="middle" fill={cardState.vector[0] === 1 ? '#38bdf8' : '#64748b'} fontSize="10" fontWeight="bold">
                v={cardState.vector[0]} ({cardState.polaridades.S})
              </text>
            </g>

            {/* West Port I (Izquierda) */}
            <g id="port-I" className="cursor-pointer" onClick={() => handleToggleCardinal(1)}>
              <circle cx="90" cy="250" r="18" fill="#090d16" stroke={cardState.vector[1] === 1 ? '#06b6d4' : '#475569'} strokeWidth="2.5" />
              <text x="90" y="254" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">
                I
              </text>
              <rect x="112" y="243" width="24" height="14" rx="3" fill="#1e293b" />
              <text x="124" y="254" textAnchor="middle" fill={cardState.vector[1] === 1 ? '#38bdf8' : '#64748b'} fontSize="10" fontWeight="bold">
                v={cardState.vector[1]}
              </text>
            </g>

            {/* East Port O (Oeste) */}
            <g id="port-O" className="cursor-pointer" onClick={() => handleToggleCardinal(3)}>
              <circle cx="410" cy="250" r="18" fill="#090d16" stroke={cardState.vector[3] === 1 ? '#06b6d4' : '#475569'} strokeWidth="2.5" />
              <text x="410" y="254" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">
                O
              </text>
              <rect x="364" y="243" width="24" height="14" rx="3" fill="#1e293b" />
              <text x="376" y="254" textAnchor="middle" fill={cardState.vector[3] === 1 ? '#38bdf8' : '#64748b'} fontSize="10" fontWeight="bold">
                v={cardState.vector[3]}
              </text>
            </g>

            {/* 4x4 DISIPATOR HOLE MATRIX */}
            {[160, 220, 280, 340].map((x, rowIdx) =>
              [160, 220, 280, 340].map((y, colIdx) => (
                <circle
                  key={`hole-${rowIdx}-${colIdx}`}
                  cx={x}
                  cy={y}
                  r="7"
                  fill="#030712"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />
              ))
            )}

            {/* QUANTUM CONDUCTIVITY LASER BUS LINES */}
            {/* S to Core Line */}
            <line
              x1="250"
              y1="374"
              x2="250"
              y2="280"
              stroke={cardState.vector[0] === 1 ? (cardState.modo === 'Luminoso' ? '#06b6d4' : '#818cf8') : '#1e293b'}
              strokeWidth={cardState.vector[0] === 1 ? '3' : '1.5'}
              filter={cardState.vector[0] === 1 ? 'url(#glow)' : undefined}
            />

            {/* I to Core Line */}
            <line
              x1="136"
              y1="250"
              x2="220"
              y2="250"
              stroke={cardState.vector[1] === 1 ? (cardState.modo === 'Luminoso' ? '#06b6d4' : '#818cf8') : '#1e293b'}
              strokeWidth={cardState.vector[1] === 1 ? '3' : '1.5'}
              filter={cardState.vector[1] === 1 ? 'url(#glow)' : undefined}
            />

            {/* N to Core Line */}
            <line
              x1="250"
              y1="126"
              x2="250"
              y2="220"
              stroke={cardState.vector[2] === 1 ? (cardState.modo === 'Luminoso' ? '#06b6d4' : '#818cf8') : '#1e293b'}
              strokeWidth={cardState.vector[2] === 1 ? '3' : '1.5'}
              filter={cardState.vector[2] === 1 ? 'url(#glow)' : undefined}
            />

            {/* O to Core Line */}
            <line
              x1="364"
              y1="250"
              x2="280"
              y2="250"
              stroke={cardState.vector[3] === 1 ? (cardState.modo === 'Luminoso' ? '#06b6d4' : '#818cf8') : '#1e293b'}
              strokeWidth={cardState.vector[3] === 1 ? '3' : '1.5'}
              filter={cardState.vector[3] === 1 ? 'url(#glow)' : undefined}
            />

            {/* FLUX PULSE ANIMATION OVERLAY */}
            {isPulseActive && (
              <>
                <circle cx="250" cy="320" r="6" fill="#38bdf8" filter="url(#glow)" className="animate-ping" />
                <circle cx="180" cy="250" r="6" fill="#38bdf8" filter="url(#glow)" className="animate-ping" />
                <circle cx="250" cy="180" r="6" fill="#38bdf8" filter="url(#glow)" className="animate-ping" />
                <circle cx="320" cy="250" r="6" fill="#38bdf8" filter="url(#glow)" className="animate-ping" />
              </>
            )}

            {/* CENTRAL QUANTUM CORE NODE PPRH */}
            <g id="core-PPRH" className="cursor-pointer" onClick={handleTriggerFluxPulse}>
              <circle cx="250" cy="250" r="32" fill="url(#coreGlow)" />
              <circle
                cx="250"
                cy="250"
                r="24"
                fill="#0a0f1d"
                stroke={cardState.modo === 'Luminoso' ? '#38bdf8' : '#a5b4fc'}
                strokeWidth="3"
                className={isPulseActive ? 'animate-pulse' : ''}
              />
              <text x="250" y="247" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">
                PPRH
              </text>
              <text x="250" y="259" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="mono">
                {cardState.modo}
              </text>
            </g>
          </svg>
        </div>

        <p className="mt-2 text-center text-xs text-slate-400">
          * Haz clic en los puertos cardinales (S, I, N, O) para cambiar los bits o en el núcleo PPRH para simular pulso de flujo.
        </p>
      </div>

      {/* Control Panel & Vector Logic State (5 Cols) */}
      <div className="flex flex-col space-y-5 lg:col-span-5">
        {/* State Overview Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 ring-1 ring-slate-800/60">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <h3 className="font-mono text-xs font-bold text-slate-200">
                VECTOR DE ESTADO CARDINAL
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-400">
              [v_S, v_I, v_N, v_O]
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {(['S', 'I', 'N', 'O'] as CardinalPort[]).map((port, idx) => {
              const bitVal = cardState.vector[idx];
              const binVal = binaryVector[idx];
              const pol = cardState.polaridades[port];

              return (
                <div
                  key={port}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 transition-all hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">{port}</span>
                    <button
                      onClick={() => handleTogglePolarity(port)}
                      className={`rounded px-1 text-[10px] font-bold ${
                        pol === '+'
                          ? 'bg-emerald-950 text-emerald-400 ring-1 ring-emerald-800/50'
                          : 'bg-rose-950 text-rose-400 ring-1 ring-rose-800/50'
                      }`}
                      title="Cambiar polaridad"
                    >
                      {pol}
                    </button>
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold text-slate-100">{bitVal}</div>
                  <div className="text-[10px] text-slate-500">Bin: {binVal}</div>
                </div>
              );
            })}
          </div>

          {/* Duality Action Buttons */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              id="btn-trigger-dual-transform"
              onClick={handleApplyDual}
              className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:from-indigo-500 hover:to-purple-500"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Aplicar Dual(T)</span>
            </button>

            <button
              id="btn-trigger-flux-pulse"
              onClick={handleTriggerFluxPulse}
              className="flex items-center justify-center space-x-2 rounded-xl border border-cyan-500/40 bg-cyan-950/60 px-4 py-2.5 text-xs font-bold text-cyan-300 transition-all hover:bg-cyan-900/60 hover:text-cyan-100"
            >
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              <span>Propagar Flujo</span>
            </button>
          </div>
        </div>

        {/* T-Anchors Routing Output */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
          <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <h3 className="font-mono text-xs font-bold text-slate-200">
                PROPAGACIÓN EN ANCLAJES T
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Romeo-Hydra Ports</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2 border border-slate-800/80">
              <span className="text-slate-400">Nᵀ (Norte ⊕ Oeste):</span>
              <span className="font-bold text-cyan-400">{cardState.anclajesT.N_T}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2 border border-slate-800/80">
              <span className="text-slate-400">Eᵀ (Sur ⊕ Oeste):</span>
              <span className="font-bold text-cyan-400">{cardState.anclajesT.E_T}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2 border border-slate-800/80">
              <span className="text-slate-400">Sᵀ (Sur ⊕ Izquierda):</span>
              <span className="font-bold text-cyan-400">{cardState.anclajesT.S_T}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2 border border-slate-800/80">
              <span className="text-slate-400">Oᵀ (Izquierda ⊕ Norte):</span>
              <span className="font-bold text-cyan-400">{cardState.anclajesT.O_T}</span>
            </div>
          </div>
        </div>

        {/* Protocol Translation Quick Summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2 font-mono text-slate-200 mb-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="font-bold">Regla de Mapeo Romeo-Aedra</span>
          </div>
          <p className="leading-relaxed">
            {cardState.modo === 'Luminoso' ? (
              <span>
                <strong className="text-amber-300">Modo Luminoso:</strong> Traducción directa S→1, I→0, N→0, O→1. El pulso cuántico fluye en conducción fotónica positiva.
              </span>
            ) : (
              <span>
                <strong className="text-indigo-300">Modo Oscuro:</strong> Inversión lógica completa de polaridades. Inversión bit a bit [1-v]. Absorción cuántica entrelazada.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
