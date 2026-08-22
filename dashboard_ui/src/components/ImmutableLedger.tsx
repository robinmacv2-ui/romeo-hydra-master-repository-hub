import React, { useState } from 'react';
import { LedgerBlock, Regime } from '../types';
import { Database, ShieldCheck, CheckCircle2, AlertTriangle, Lock, Search, Download, Filter, Key, ChevronRight, FileCode, Check } from 'lucide-react';

interface ImmutableLedgerProps {
  ledgerBlocks: LedgerBlock[];
  onVerifyIntegrity: () => void;
  isVerifyingChain: boolean;
  onExportLedger: (format: 'json' | 'csv') => void;
  onAddNewBlock?: (block: Partial<LedgerBlock>) => void;
}

export const ImmutableLedger: React.FC<ImmutableLedgerProps> = ({
  ledgerBlocks,
  onVerifyIntegrity,
  isVerifyingChain,
  onExportLedger,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [verdictFilter, setVerdictFilter] = useState<string>('ALL');
  const [regimeFilter, setRegimeFilter] = useState<string>('ALL');
  const [selectedBlock, setSelectedBlock] = useState<LedgerBlock | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(type);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Filter logic
  const filteredBlocks = ledgerBlocks.filter((block) => {
    const matchesSearch =
      block.blockHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.previousHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.blockIndex.toString().includes(searchQuery) ||
      block.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (block.commandSource && block.commandSource.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVerdict = verdictFilter === 'ALL' || block.verdict === verdictFilter;
    const matchesRegime = regimeFilter === 'ALL' || block.regime === regimeFilter;

    return matchesSearch && matchesVerdict && matchesRegime;
  });

  const getVerdictBadge = (verdict: LedgerBlock['verdict']) => {
    switch (verdict) {
      case 'ACCEPT':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">ACEPTADO</span>;
      case 'DAMPENED':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">AMORTIGUADO</span>;
      case 'LOCKED':
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">SELLO_WORM</span>;
      case 'REVIEW':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">REVISIÓN</span>;
      case 'REJECT':
      default:
        return <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">RECHAZADO</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Ledger Header & Actions */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            Ledger Inmutable de Auditoría (WORM - Write Once Read Many)
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Registro de veredictos, firmas criptográficas de la red multimodelo y amortiguación Jacobiana.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Integrity Check Button */}
          <button
            onClick={onVerifyIntegrity}
            disabled={isVerifyingChain}
            className={`px-3.5 py-2 rounded font-mono text-xs font-bold uppercase flex items-center space-x-2 transition-all ${
              isVerifyingChain
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-900/20'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isVerifyingChain ? 'Verificando Hashes WORM...' : 'Verificar Cadena Inmutable'}</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <button
            onClick={() => onExportLedger('json')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs px-3 py-2 rounded flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => onExportLedger('csv')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs px-3 py-2 rounded flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por Hash, Bloque #, Detalle o Fuente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded pl-9 pr-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <span className="text-slate-500 text-[10px] uppercase">Veredicto:</span>
            <select
              value={verdictFilter}
              onChange={(e) => setVerdictFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">TODOS</option>
              <option value="ACCEPT">ACEPTADO</option>
              <option value="DAMPENED">AMORTIGUADO</option>
              <option value="LOCKED">SELLO_WORM</option>
              <option value="REVIEW">REVISIÓN</option>
              <option value="REJECT">RECHAZADO</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-slate-500 text-[10px] uppercase">Régimen:</span>
            <select
              value={regimeFilter}
              onChange={(e) => setRegimeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">TODOS</option>
              <option value="ALPHA">ALPHA</option>
              <option value="BETA">BETA</option>
              <option value="GAMMA">GAMMA</option>
              <option value="DELTA">DELTA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main WORM Blockchain Ledger Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                <th className="p-3">BLOQUE #</th>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">VEREDICTO_HASH</th>
                <th className="p-3 text-center">RÉGIMEN</th>
                <th className="p-3 text-center">||J|| NORMA</th>
                <th className="p-3 text-center">VECTOR Ω (C/S/R)</th>
                <th className="p-3 text-center">HSI SCORE</th>
                <th className="p-3 text-right">ESTADO</th>
                <th className="p-3 text-center">ACCIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredBlocks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No se encontraron bloques que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredBlocks.map((block) => {
                  const isFounderBlock = block.blockIndex === 1047 || block.details?.includes('Luis Angel Vazquez Martinez');
                  return (
                    <tr
                      key={block.blockIndex}
                      onClick={() => setSelectedBlock(block)}
                      className={`cursor-pointer transition-colors group ${
                        isFounderBlock
                          ? 'bg-amber-500/10 border-l-4 border-l-amber-500 hover:bg-amber-500/20'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-3 font-bold text-amber-400">
                        <div className="flex items-center space-x-1">
                          <span>#{block.blockIndex}</span>
                          {isFounderBlock && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider">
                              FOUNDER
                            </span>
                          )}
                        </div>
                      </td>
                    <td className="p-3 text-[11px] text-slate-400 whitespace-nowrap">
                      {block.timestamp}
                    </td>
                    <td className="p-3 text-emerald-400 text-[11px] font-bold">
                      {block.blockHash.substring(0, 10)}...{block.blockHash.substring(block.blockHash.length - 8)}
                    </td>
                    <td className="p-3 text-center font-bold text-purple-300 text-[11px]">
                      {block.regime}
                    </td>
                    <td className="p-3 text-center text-[11px]">
                      <span className={(block.jacobianNorm ?? 0) > 0.6 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                        {(block.jacobianNorm ?? 0).toFixed(2)}
                      </span>
                      {(block.dampingFactor ?? 1.0) < 1.0 && (
                        <span className="text-[9px] text-amber-500 block">(α={block.dampingFactor})</span>
                      )}
                    </td>
                    <td className="p-3 text-center text-[11px] text-slate-300">
                      {(block.omegaVector?.C ?? 0).toFixed(2)} / {(block.omegaVector?.S ?? 0).toFixed(2)} / {(block.omegaVector?.R ?? 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-center font-bold text-blue-400 text-[11px]">
                      {(block.hsiIndex ?? 0).toFixed(2)}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {getVerdictBadge(block.verdict)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedBlock(block); }}
                        className="text-slate-400 hover:text-emerald-400 p-1 font-bold text-[10px] uppercase flex items-center justify-center space-x-1 mx-auto"
                      >
                        <span>Detalles</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cryptographic Block Details Modal */}
      {selectedBlock && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase">
                  Inspección de Bloque WORM #{selectedBlock.blockIndex}
                </h3>
              </div>
              {getVerdictBadge(selectedBlock.verdict)}
            </div>

            {/* Block Cryptographic Details */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between gap-2 bg-emerald-950/30 p-2 rounded border border-emerald-500/20 mb-2">
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>BLINDAJE WORM (Write-Once-Read-Many): Inmutable & Forensic Stamped</span>
                </div>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                  SHA-256 PROOF
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase mb-0.5">
                  <span>Hash Criptográfico SHA-256 (Veredicto):</span>
                  <button
                    onClick={() => handleCopyHash(selectedBlock.blockHash, 'hash')}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[9px] lowercase bg-slate-900 px-2 py-0.5 rounded border border-slate-700"
                  >
                    {copiedHash === 'hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <FileCode className="w-3 h-3" />}
                    <span>{copiedHash === 'hash' ? 'copiado!' : 'copiar sha-256'}</span>
                  </button>
                </div>
                <span className="text-emerald-400 font-bold break-all text-[11px] font-mono bg-slate-900/80 p-2 rounded block border border-slate-800">
                  {selectedBlock.blockHash}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase mb-0.5">
                  <span>Hash de Bloque Anterior (Encadenamiento Criptográfico):</span>
                  <button
                    onClick={() => handleCopyHash(selectedBlock.previousHash, 'prevHash')}
                    className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[9px] lowercase bg-slate-900 px-2 py-0.5 rounded border border-slate-700"
                  >
                    {copiedHash === 'prevHash' ? <Check className="w-3 h-3 text-emerald-400" /> : <FileCode className="w-3 h-3" />}
                    <span>{copiedHash === 'prevHash' ? 'copiado!' : 'copiar prev'}</span>
                  </button>
                </div>
                <span className="text-slate-300 break-all text-[11px] font-mono bg-slate-900/80 p-2 rounded block border border-slate-800">
                  {selectedBlock.previousHash}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Firma de Arbitraje CLC:</span>
                  <span className="text-amber-400 font-bold text-[11px] font-mono">{selectedBlock.arbitrationSignature}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Régimen Legal Activo:</span>
                  <span className="text-purple-300 font-bold text-[11px] font-mono">{selectedBlock.regime}</span>
                </div>
              </div>
            </div>

            {/* Multi-Model Signatures */}
            <div className="space-y-2">
              <h4 className="text-[10px] text-slate-400 uppercase font-bold">Firmas Criptográficas de la Red Hexa-Nodo:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">ChatGPT-4o:</span>
                  <span className="text-emerald-400">{selectedBlock.modelSignatures.chatgpt}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Grok WORM:</span>
                  <span className="text-amber-400">{selectedBlock.modelSignatures.grok}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Meta Llama-3:</span>
                  <span className="text-blue-400">{selectedBlock.modelSignatures.meta}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Gemini 1.5 Pro:</span>
                  <span className="text-emerald-300">{selectedBlock.modelSignatures.gemini}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between sm:col-span-2">
                  <span className="text-slate-400">Claude 3.5 Sonnet:</span>
                  <span className="text-purple-300">{selectedBlock.modelSignatures.claude}</span>
                </div>
              </div>
            </div>

            {/* Technical Metrics & Details */}
            <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
                <div>
                  <span className="text-slate-500 block">Norma ||J||</span>
                  <span className="text-white font-bold">{(selectedBlock.jacobianNorm ?? 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Factor Amortiguación α</span>
                  <span className="text-amber-400 font-bold">{(selectedBlock.dampingFactor ?? 1).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Índice HSI</span>
                  <span className="text-blue-400 font-bold">{(selectedBlock.hsiIndex ?? 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-[10px] text-slate-500 block uppercase">Detalles del Registro:</span>
                <p className="text-slate-300 text-xs mt-1 leading-relaxed">{selectedBlock.details}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedBlock(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs px-5 py-2 rounded uppercase font-bold"
              >
                Cerrar Inspección
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
