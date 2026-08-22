import React, { useState } from 'react';
import { CardState, NetworkCard } from '../types';
import { propagateFlux } from '../utils/quantumLogic';
import { Network, Cpu, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface HydraMeshNetworkProps {
  primaryCardState: CardState;
}

export const HydraMeshNetwork: React.FC<HydraMeshNetworkProps> = ({ primaryCardState }) => {
  const [cards, setCards] = useState<NetworkCard[]>([
    {
      ...primaryCardState,
      id: 'alpha',
      nombre: 'Tarjeta Alpha (Primaria)',
      x: 0,
      y: 0,
    },
    {
      modo: 'Luminoso',
      vector: [0, 1, 1, 0],
      polaridades: { S: '-', I: '+', N: '+', O: '-' },
      anclajesT: propagateFlux([0, 1, 1, 0]),
      referenciaFecha: '28 de julio de 2026',
      identificador: 'PPRH-TARJETA-002-BETA',
      id: 'beta',
      nombre: 'Tarjeta Beta (Secundaria)',
      x: 1,
      y: 0,
    },
    {
      modo: 'Oscuro',
      vector: [1, 1, 0, 0],
      polaridades: { S: '+', I: '+', N: '-', O: '-' },
      anclajesT: propagateFlux([0, 0, 1, 1]), // Dark inversion
      referenciaFecha: '28 de julio de 2026',
      identificador: 'PPRH-TARJETA-003-GAMMA',
      id: 'gamma',
      nombre: 'Tarjeta Gamma (Secundaria)',
      x: 0,
      y: 1,
    },
  ]);

  const [activeSignal, setActiveSignal] = useState<string | null>(null);

  const handleSimulateMeshPropagation = () => {
    setActiveSignal('ALPHA_TO_BETA');
    setTimeout(() => {
      setActiveSignal('BETA_TO_GAMMA');
      setTimeout(() => {
        setActiveSignal(null);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-950 text-indigo-400 ring-1 ring-indigo-800">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-mono text-base font-bold text-slate-100">
                TOPOLOGÍA DE RED ROMEO-HYDRA
              </h2>
              <p className="text-xs text-slate-400">
                Interconexión cuántica multitarjeta a través de anclajes periféricos T (Nᵀ, Eᵀ, Sᵀ, Oᵀ).
              </p>
            </div>
          </div>

          <button
            onClick={handleSimulateMeshPropagation}
            className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Simular Malla de Flujo</span>
          </button>
        </div>
      </div>

      {/* Grid Network Topology */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`rounded-2xl border bg-slate-950 p-5 transition-all ${
              card.id === 'alpha'
                ? 'border-cyan-500/50 ring-1 ring-cyan-500/30'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <span className="font-mono text-xs font-bold text-slate-100">{card.nombre}</span>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  card.modo === 'Luminoso'
                    ? 'bg-amber-950 text-amber-300 ring-1 ring-amber-800/50'
                    : 'bg-indigo-950 text-indigo-300 ring-1 ring-indigo-800/50'
                }`}
              >
                {card.modo}
              </span>
            </div>

            <div className="my-3 rounded-xl bg-slate-900 p-3 font-mono text-xs border border-slate-800">
              <div className="text-slate-400 text-[10px] mb-1">Vector Cardinal [S, I, N, O]:</div>
              <div className="text-slate-100 font-bold text-sm">[{card.vector.join(', ')}]</div>
            </div>

            {/* T Anchors Output */}
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="text-slate-400 text-[10px]">Anclajes T Activos:</div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <span className="rounded bg-slate-900 py-1 border border-slate-800 text-slate-300">
                  Eᵀ: <strong className="text-cyan-400">{card.anclajesT.E_T}</strong>
                </span>
                <span className="rounded bg-slate-900 py-1 border border-slate-800 text-slate-300">
                  Sᵀ: <strong className="text-cyan-400">{card.anclajesT.S_T}</strong>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mesh Flow Visualization Line */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="mb-3 font-mono text-xs font-bold text-slate-200">
          ACOPLAMIENTO DE MALLA POR ANCLAJES T
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-slate-300">
          <div className="flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-2 border border-slate-800">
            <span className="text-cyan-400 font-bold">Tarjeta Alpha [Eᵀ]</span>
            <ArrowRight className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="text-slate-200">Tarjeta Beta [Oᵀ]</span>
          </div>

          <div className="flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-2 border border-slate-800">
            <span className="text-indigo-400 font-bold">Tarjeta Beta [Sᵀ]</span>
            <ArrowRight className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span className="text-slate-200">Tarjeta Gamma [Nᵀ]</span>
          </div>
        </div>
      </div>
    </div>
  );
};
