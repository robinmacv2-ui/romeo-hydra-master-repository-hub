import React, { useState } from 'react';
import { CardState, GrammarEvaluation } from '../types';
import { evaluateRomeoAedraExpression } from '../utils/quantumLogic';
import { Code2, Play, Terminal, CheckCircle2, AlertCircle, ArrowRight, Copy, Check } from 'lucide-react';

interface GrammarLabProps {
  cardState: CardState;
  setCardState: React.Dispatch<React.SetStateAction<CardState>>;
}

export const GrammarLab: React.FC<GrammarLabProps> = ({ cardState, setCardState }) => {
  const [expression, setExpression] = useState<string>(
    'T_L[S+, I-, N-, O+] => Dual(T_D) => Flux(Nᵀ, Eᵀ)'
  );
  const [copied, setCopied] = useState(false);

  const presets = [
    {
      title: 'Transición Luminosa a Oscura',
      code: 'T_L[S+, I-, N-, O+] => Dual(T) => Output(Sᵀ)',
    },
    {
      title: 'Superposición Cardinal (⊕)',
      code: 'S(+) ⊕ O(+) -> Core(PPRH) -> Nᵀ(⊕)',
    },
    {
      title: 'Malla Romeo-Hydra',
      code: 'Card_Alpha[Eᵀ] -> Interconnect -> Card_Beta[Oᵀ]',
    },
    {
      title: 'Entrelazamiento Diferencial (⊖)',
      code: 'I(-) ⊖ N(-) => Dual(T_D) => Propagate(Sᵀ, Oᵀ)',
    },
  ];

  const evaluation: GrammarEvaluation = evaluateRomeoAedraExpression(expression, cardState);

  const handleApplyToCard = () => {
    setCardState({
      ...cardState,
      vector: evaluation.vectorResult,
      anclajesT: evaluation.fluxPropagation,
      modo: evaluation.dualityFlipped
        ? cardState.modo === 'Luminoso'
          ? 'Oscuro'
          : 'Luminoso'
        : cardState.modo,
    });
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 text-cyan-400 ring-1 ring-cyan-800">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-mono text-base font-bold text-slate-100">
                SINTAXIS & GRAMÁTICA FORMAL ROMEO-AEDRA
              </h2>
              <p className="text-xs text-slate-400">
                Analizador de lenguaje formal y compilador de expresiones vectoriales para la Tarjeta Cuántica.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-slate-300 ring-1 ring-slate-800">
              Alfabeto: Σ = {'{ S, I, N, O, +, -, L/D, Nᵀ, Eᵀ, Sᵀ, Oᵀ, ⊕, ⊖ }'}
            </span>
          </div>
        </div>
      </div>

      {/* Preset Pickers */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => setExpression(preset.code)}
            className="flex flex-col items-start justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-left transition-all hover:border-cyan-500/40 hover:bg-slate-900"
          >
            <span className="font-mono text-xs font-bold text-cyan-400 mb-1">{preset.title}</span>
            <span className="font-mono text-[11px] text-slate-400 line-clamp-1">{preset.code}</span>
          </button>
        ))}
      </div>

      {/* Code Editor & Execution Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Editor Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 lg:col-span-7">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <label htmlFor="grammar-code-input" className="font-mono text-xs font-bold text-slate-200">
                EDITOR DE EXPRESIÓN ROMEO-AEDRA
              </label>
            </div>
            <button
              onClick={() => handleCopyCode(expression)}
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          <textarea
            id="grammar-code-input"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3.5 font-mono text-xs text-slate-100 shadow-inner focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder="Escribe una expresión de la gramática Romeo-Aedra..."
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs">
              {evaluation.isValid ? (
                <span className="flex items-center space-x-1.5 text-emerald-400 font-mono">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Sintaxis Válida</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1.5 text-amber-400 font-mono">
                  <AlertCircle className="h-4 w-4" />
                  <span>Expresión No Reconocida</span>
                </span>
              )}
            </div>

            <button
              id="btn-apply-expression-to-card"
              onClick={handleApplyToCard}
              className="flex items-center space-x-2 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-cyan-500"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Ejecutar en Tarjeta Activa</span>
            </button>
          </div>
        </div>

        {/* Evaluation Analysis Results */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 lg:col-span-5">
          <h3 className="mb-3 border-b border-slate-800 pb-2 font-mono text-xs font-bold text-slate-200">
            RESULTADO DE COMPILACIÓN VECTORIAL
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <span className="text-slate-400">Vector Resultante [S,I,N,O]:</span>
              <span className="font-bold text-cyan-400">
                [{evaluation.vectorResult.join(', ')}]
              </span>
            </div>

            <div className="flex justify-between rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <span className="text-slate-400">Traducción Luminosa:</span>
              <span className="font-bold text-amber-400">
                [{evaluation.binaryLuminous.join(', ')}]
              </span>
            </div>

            <div className="flex justify-between rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <span className="text-slate-400">Traducción Oscura (Dual):</span>
              <span className="font-bold text-indigo-400">
                [{evaluation.binaryDark.join(', ')}]
              </span>
            </div>

            <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <span className="text-slate-400 block mb-1">Propagación Anclajes T:</span>
              <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
                <span className="rounded bg-slate-900 py-1 text-cyan-300">Nᵀ: {evaluation.fluxPropagation.N_T}</span>
                <span className="rounded bg-slate-900 py-1 text-cyan-300">Eᵀ: {evaluation.fluxPropagation.E_T}</span>
                <span className="rounded bg-slate-900 py-1 text-cyan-300">Sᵀ: {evaluation.fluxPropagation.S_T}</span>
                <span className="rounded bg-slate-900 py-1 text-cyan-300">Oᵀ: {evaluation.fluxPropagation.O_T}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lexical Tokens Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <h3 className="mb-3 font-mono text-xs font-bold text-slate-200">
          ANÁLISIS LÉXICO DE TOKENS extraídos
        </h3>

        {evaluation.tokens.length === 0 ? (
          <p className="text-xs text-slate-500">No se encontraron tokens sintácticos en la expresión.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {evaluation.tokens.map((token, idx) => (
              <span
                key={idx}
                className={`rounded-lg px-2.5 py-1 font-mono text-xs font-semibold ring-1 ${
                  token.type === 'CARDINAL'
                    ? 'bg-cyan-950 text-cyan-300 ring-cyan-800'
                    : token.type === 'POLARITY'
                    ? 'bg-emerald-950 text-emerald-300 ring-emerald-800'
                    : token.type === 'MODE'
                    ? 'bg-amber-950 text-amber-300 ring-amber-800'
                    : token.type === 'T_ANCHOR'
                    ? 'bg-indigo-950 text-indigo-300 ring-indigo-800'
                    : 'bg-slate-900 text-slate-300 ring-slate-800'
                }`}
              >
                {token.value} <span className="text-[10px] opacity-60">({token.type})</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
