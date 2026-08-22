/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CardState } from './types';
import { INITIAL_CARD_STATE, generateCardFingerprint } from './utils/quantumLogic';
import { Navbar } from './components/Navbar';
import { QuantumCardRender } from './components/QuantumCardRender';
import { GrammarLab } from './components/GrammarLab';
import { HydraMeshNetwork } from './components/HydraMeshNetwork';
import { DigitalSealTool } from './components/DigitalSealTool';
import { TechnicalDossier } from './components/TechnicalDossier';
import { AiAssistant } from './components/AiAssistant';
import { UmrTerminal } from './components/UmrTerminal';
import { ShieldCheck, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('card');
  const [cardState, setCardState] = useState<CardState>(INITIAL_CARD_STATE);
  const [fingerprint, setFingerprint] = useState<string>('');

  useEffect(() => {
    async function updateFingerprint() {
      const fp = await generateCardFingerprint(cardState);
      setFingerprint(fp);
    }
    updateFingerprint();
  }, [cardState]);

  const handleToggleModeNav = () => {
    const newModo = cardState.modo === 'Luminoso' ? 'Oscuro' : 'Luminoso';
    const newVector = cardState.vector.map((v) => (v === 1 ? 0 : 1)) as [number, number, number, number];
    setCardState({
      ...cardState,
      modo: newModo,
      vector: newVector,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500 selection:text-slate-950 antialiased">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        modo={cardState.modo}
        onToggleMode={handleToggleModeNav}
        fingerprint={fingerprint}
      />

      {/* Strict Read & Interaction Security Banner */}
      <div className="border-b border-emerald-900/40 bg-slate-900/90 px-4 py-2 text-xs font-mono backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 sm:px-6">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>MODO DE LECTURA E INTERACCIÓN ESTRICTA</span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-300 font-normal">Infraestructura del Núcleo Blindada e Inmutable</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="rounded bg-emerald-950/80 px-2 py-0.5 font-bold text-emerald-300 ring-1 ring-emerald-800/60">
              Repositorios Públicos Habilitados
            </span>
            <span>DOI: <strong className="text-cyan-300">10.5281/zenodo.21406719</strong></span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'card' && (
          <QuantumCardRender cardState={cardState} setCardState={setCardState} />
        )}

        {activeTab === 'grammar' && (
          <GrammarLab cardState={cardState} setCardState={setCardState} />
        )}

        {activeTab === 'network' && (
          <HydraMeshNetwork primaryCardState={cardState} />
        )}

        {activeTab === 'seal' && (
          <DigitalSealTool cardState={cardState} fingerprint={fingerprint} />
        )}

        {activeTab === 'dossier' && <TechnicalDossier />}

        {activeTab === 'ai' && <AiAssistant cardState={cardState} />}

        {activeTab === 'umr' && <UmrTerminal />}
      </main>

      {/* Footer / Copyright & Timestamp Reference */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center space-x-2">
            <Cpu className="h-4 w-4 text-cyan-500" />
            <span className="font-mono font-bold text-slate-300">
              CÓDICE CHIP RRPH – Tarjeta Lógica Cuántica (Papel Picado Romeo Hydra)
            </span>
          </div>

          <div className="flex flex-wrap items-center space-x-4 font-mono text-[11px]">
            <span className="text-slate-300">Fundador: <strong className="text-cyan-400 font-semibold">Luis Angel Vazquez Martinez</strong></span>
            <span>•</span>
            <span>Protocolo Romeo-Aedra / Romeo-Hydra</span>
            <span>•</span>
            <span className="text-cyan-400">Fecha Ref: 28 de julio de 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
