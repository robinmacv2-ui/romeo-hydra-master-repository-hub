import React, { useState } from 'react';
import { AuditBlock } from '../types';
import { calculateLedgerHash } from '../utils';
import { KeyRound, ShieldCheck, AlertOctagon, HelpCircle, FileText, Trash2, RefreshCw, HeartPulse } from 'lucide-react';

interface AuditLedgerViewProps {
  ledger: AuditBlock[];
  onTamperBlock: (index: number, tamperedDetail: string) => void;
  onClearLedger: () => void;
  onResetLedger?: () => void;
  onHealLedger?: () => void;
  isChainValid: boolean;
  brokenIndex: number | null;
  isLocked?: boolean;
}

export const AuditLedgerView: React.FC<AuditLedgerViewProps> = ({
  ledger,
  onTamperBlock,
  onClearLedger,
  onResetLedger,
  onHealLedger,
  isChainValid,
  brokenIndex,
  isLocked = false
}) => {
  const [activePayloadBlock, setActivePayloadBlock] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tamperText, setTamperText] = useState<string>("");

  const handleTamperSubmit = (idx: number) => {
    if (tamperText.trim()) {
      onTamperBlock(idx, tamperText);
      setEditingIndex(null);
      setTamperText("");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="audit-ledger-container">
      {/* Ledger Status Summary */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        {/* Status Indicators */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">
              Auditoría Regimen Delta
            </h3>
          </div>

          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Un registro inmutable basado en cadena de bloques lógicas. Cada perturbación, cambio de parámetros o colisión del operador F queda sellada con firmas criptográficas sucesivas.
          </p>

          <div className={`p-4 rounded-xl border flex flex-col gap-2 items-center text-center ${
            isChainValid 
              ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-400' 
              : 'bg-red-500/5 border-red-500/30 text-red-400 animate-pulse'
          }`}>
            {isChainValid ? (
              <>
                <ShieldCheck className="w-10 h-10 text-emerald-400 mb-1" />
                <span className="text-sm font-bold font-mono uppercase tracking-wide">Integridad de Cadena Verificada</span>
                <span className="text-[10px] font-mono text-slate-500 leading-tight">
                  Todos los bloques lógicos están debidamente encadenados. No se detectan alteraciones maliciosas.
                </span>
              </>
            ) : (
              <>
                <AlertOctagon className="w-10 h-10 text-red-500 mb-1 animate-bounce" />
                <span className="text-sm font-bold font-mono uppercase tracking-wider">¡CONTAMINACIÓN DETECTADA!</span>
                <span className="text-[11px] font-mono text-red-400/90 leading-tight">
                  Fallo criptográfico en Bloque #{brokenIndex}. La firma SHA-256 no coincide con el hash del bloque siguiente.
                </span>
              </>
            )}
          </div>

          <div className="space-y-2 mt-4">
            {!isChainValid && onHealLedger && (
              <button
                onClick={onHealLedger}
                disabled={isLocked}
                className={`w-full py-2.5 border rounded-lg text-xs font-mono transition flex items-center justify-center gap-2 ${
                  isLocked
                    ? 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
                    : 'bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-400 font-bold hover:text-indigo-300 shadow-md shadow-indigo-950/30'
                }`}
              >
                <HeartPulse className={`w-3.5 h-3.5 ${isLocked ? 'text-slate-600' : 'text-indigo-400 animate-pulse'}`} />
                {isLocked ? "Reparación Bloqueada" : "Reparar Contaminación"}
              </button>
            )}

            <button
              onClick={onResetLedger || onClearLedger}
              disabled={isLocked}
              className={`w-full py-2 border rounded-lg text-xs font-mono transition flex items-center justify-center gap-2 ${
                isLocked
                  ? 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400 font-bold hover:text-emerald-300 shadow-md shadow-emerald-950/30'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLocked ? 'text-slate-600' : 'text-emerald-400 animate-pulse'}`} />
              {isLocked ? "Reinicio Bloqueado por Gobernanza" : "Reiniciar Ledger (Génesis)"}
            </button>

            <button
              onClick={onClearLedger}
              disabled={isLocked}
              className={`w-full py-2 border rounded-lg text-xs font-mono transition flex items-center justify-center gap-2 ${
                isLocked
                  ? 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-600" />
              {isLocked ? "Vaciado Bloqueado" : "Vaciar Todo el Ledger"}
            </button>
          </div>
        </div>

        {/* Payload Visualizer Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-slate-400" />
            <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
              Inspector de Payload de Inferencia
            </h4>
          </div>

          {activePayloadBlock !== null ? (
            <div>
              <div className="bg-slate-950 rounded p-3 font-mono text-[11px] text-slate-300 border border-slate-900 overflow-x-auto h-[210px]">
                <div className="text-slate-500 border-b border-slate-900 pb-1 mb-2 uppercase text-[9px] flex justify-between">
                  <span>Detalles de Bloque #{activePayloadBlock}</span>
                  <span className="text-cyan-400 font-semibold">{ledger[activePayloadBlock]?.evidence.source}</span>
                </div>
                <div className="mb-2">
                  <span className="text-slate-500">Detalle:</span> {ledger[activePayloadBlock]?.evidence.detail}
                </div>
                <div>
                  <span className="text-slate-500">Metrología:</span>
                  <pre className="text-purple-400 mt-1 whitespace-pre-wrap">
                    {JSON.stringify(ledger[activePayloadBlock]?.evidence.metrics, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 rounded border border-slate-900 h-[210px] flex flex-col items-center justify-center text-slate-600 font-mono text-[11px]">
              <HelpCircle className="w-6 h-6 text-slate-800 mb-2" />
              <span>Haz clic en "Ver Payload" en cualquier bloque</span>
            </div>
          )}
        </div>
      </div>

      {/* Ledger Block List Chain */}
      <div className="xl:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
        <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wide mb-4">
          Secuencia de Bloques Logged ({ledger.length})
        </h3>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar flex-1">
          {ledger.map((block, idx) => {
            const isCorrupted = brokenIndex !== null && idx >= brokenIndex;
            const isPayloadSelected = activePayloadBlock === idx;

            return (
              <div 
                key={block.index} 
                className={`border rounded-xl p-4 transition-all duration-300 relative ${
                  isCorrupted 
                    ? 'border-red-500/40 bg-red-950/10' 
                    : isPayloadSelected
                    ? 'border-indigo-500 bg-indigo-950/10'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3 border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                      BLOQUE #{block.index}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                      isCorrupted 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {isCorrupted ? 'CORRUPTED_HASH' : 'VERIFIED_SIGNATURE'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {block.timestamp}
                  </span>
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-400 mb-3">
                  <div>
                    <span className="text-[10px] text-slate-600 block uppercase mb-0.5">Módulo Origen</span>
                    <span className="text-slate-300 font-bold">{block.evidence.source}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 block uppercase mb-0.5">Detalle Operación</span>
                    <span className="text-slate-300 truncate block">{block.evidence.detail}</span>
                  </div>
                </div>

                {/* Signature Chain panel */}
                <div className="bg-slate-950/80 rounded p-2.5 border border-slate-900 font-mono text-[10px] space-y-1 text-slate-500 mb-3 overflow-hidden">
                  <div className="flex justify-between gap-2">
                    <span>PREV_HASH:</span>
                    <span className="text-slate-600 text-right truncate max-w-[280px] sm:max-w-none">{block.prev_hash}</span>
                  </div>
                  <div className="flex justify-between gap-2 border-t border-slate-900 pt-1 mt-1">
                    <span>SELF_HASH:</span>
                    <span className={`${isCorrupted ? 'text-red-500 font-bold' : 'text-indigo-400'} text-right truncate max-w-[280px] sm:max-w-none`}>
                      {block.hash}
                    </span>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex flex-wrap gap-2 justify-between items-center pt-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActivePayloadBlock(idx)}
                      className={`px-3 py-1.5 rounded font-mono text-[10px] border transition ${
                        isPayloadSelected
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Ver Payload
                    </button>

                    {isLocked ? (
                      <span className="px-3 py-1.5 bg-slate-950 border border-slate-900 text-slate-500 rounded font-mono text-[10px] flex items-center gap-1 cursor-default select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse" />
                        Registro Sellado (Sólo Lectura)
                      </span>
                    ) : editingIndex !== idx ? (
                      <button
                        onClick={() => {
                          setEditingIndex(idx);
                          setTamperText(block.evidence.detail);
                        }}
                        className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15 rounded font-mono text-[10px] transition"
                        title="Simulate data altering"
                      >
                        Manipular Datos
                      </button>
                    ) : (
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          value={tamperText}
                          onChange={(e) => setTamperText(e.target.value)}
                          className="bg-slate-950 border border-red-500/40 rounded px-2 py-1 text-[11px] font-mono text-slate-200 focus:outline-none w-[180px]"
                        />
                        <button
                          onClick={() => handleTamperSubmit(idx)}
                          className="px-2.5 py-1 bg-red-600 text-white rounded text-[10px] font-mono font-bold"
                        >
                          Atacar
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="px-2 py-1 bg-slate-900 text-slate-400 rounded text-[10px] font-mono"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {isCorrupted && (
                    <span className="text-[10px] font-mono text-red-500 font-bold animate-pulse">
                      ⚠ HASH BROKEN HERE
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
