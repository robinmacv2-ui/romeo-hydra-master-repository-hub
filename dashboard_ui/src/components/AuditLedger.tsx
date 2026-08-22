import React, { useState } from 'react';
import { LedgerBlock, Regime } from '../types';
import { formatTimestamp, verifyLedgerChainIntegrity } from '../utils/helpers';
import { Database, ShieldCheck, Lock, Search, Filter, Download, Copy, Check, ChevronRight, AlertOctagon, Eye, RefreshCw, FileCode } from 'lucide-react';

interface AuditLedgerProps {
  blocks: LedgerBlock[];
  onAddToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

export const AuditLedger: React.FC<AuditLedgerProps> = ({ blocks, onAddToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegimeFilter, setSelectedRegimeFilter] = useState<string>('ALL');
  const [selectedVerdictFilter, setSelectedVerdictFilter] = useState<string>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [inspectBlock, setInspectBlock] = useState<LedgerBlock | null>(null);

  // Forensic Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ isValid: boolean; message: string } | null>(null);

  // Filter logic
  const filteredBlocks = blocks.filter((block) => {
    const matchesSearch =
      block.blockHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.arbitrationSignature.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (block.commandSource && block.commandSource.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRegime = selectedRegimeFilter === 'ALL' || block.regime === selectedRegimeFilter;
    const matchesVerdict = selectedVerdictFilter === 'ALL' || block.verdict === selectedVerdictFilter;

    return matchesSearch && matchesRegime && matchesVerdict;
  });

  const getVerdictBadge = (verdict: LedgerBlock['verdict']) => {
    switch (verdict) {
      case 'ACCEPT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'LOCKED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold';
      case 'DAMPENED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'REVIEW':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'REJECT':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    onAddToast('info', 'Hash Copiado al Portapapeles', `Hash de bloque ${hash.substring(0, 16)}... copiado.`);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleRunForensicVerification = () => {
    setIsVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      const res = verifyLedgerChainIntegrity(blocks);
      setIsVerifying(false);
      setVerificationResult(res);

      if (res.isValid) {
        onAddToast('success', 'Integridad WORM Confirmada', res.message);
      } else {
        onAddToast('error', 'Alerta de Integridad Comprometida', res.message);
      }
    }, 1200);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(blocks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ROME_HYDRA_WORM_LEDGER_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onAddToast('success', 'Exportación Completada', 'Ledger inmutable WORM exportado en formato JSON.');
  };

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center gap-2">
              Ledger de Auditoría Inmutable (WORM / Blockchain)
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                A prueba de manipulaciones
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Registro de veredictos, firmas de arbitraje multimodelo y verificabilidad de cadenas
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Forensic Integrity Check Button */}
          <button
            onClick={handleRunForensicVerification}
            disabled={isVerifying}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isVerifying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
            }`}
          >
            {isVerifying ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{isVerifying ? 'Verificando Hash Catenario...' : 'Verificar Integridad WORM'}</span>
          </button>

          {/* Export Ledger Button */}
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Exportar JSON</span>
          </button>
        </div>
      </div>

      {/* Verification Result Alert Banner */}
      {verificationResult && (
        <div
          className={`mb-4 p-3 rounded-xl border text-xs font-mono flex items-center justify-between animate-in fade-in duration-200 ${
            verificationResult.isValid
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {verificationResult.isValid ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <span>{verificationResult.message}</span>
          </div>
          <button
            onClick={() => setVerificationResult(null)}
            className="text-slate-400 hover:text-slate-200 text-xs underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Hash, Firma, Detalle o Fuente..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Regime Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedRegimeFilter}
            onChange={(e) => setSelectedRegimeFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">Todos los Regímenes</option>
            <option value="ALPHA">Alpha (Estabilidad)</option>
            <option value="BETA">Beta (Coherencia)</option>
            <option value="GAMMA">Gamma (Entropía)</option>
            <option value="DELTA">Delta (Soberanía WORM)</option>
          </select>
        </div>

        {/* Verdict Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedVerdictFilter}
            onChange={(e) => setSelectedVerdictFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">Todos los Veredictos</option>
            <option value="LOCKED">LOCKED (Sellado Soberano)</option>
            <option value="ACCEPT">ACCEPT (Aprobado)</option>
            <option value="DAMPENED">DAMPENED (Amortiguado)</option>
            <option value="REVIEW">REVIEW (Revisión)</option>
            <option value="REJECT">REJECT (Rechazado)</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
        <table className="w-full text-left font-mono border-collapse">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
              <th className="p-3">Bloque #</th>
              <th className="p-3">Timestamp ISO</th>
              <th className="p-3">Hash Criptográfico SHA-256</th>
              <th className="p-3">Veredicto</th>
              <th className="p-3">Régimen</th>
              <th className="p-3">Firma Arbitraje</th>
              <th className="p-3">Vector Ω (C,S,R)</th>
              <th className="p-3">Factor α</th>
              <th className="p-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredBlocks.map((block) => {
              const verdictClass = getVerdictBadge(block.verdict);
              const isCopied = copiedHash === block.blockHash;

              return (
                <tr
                  key={block.blockIndex}
                  className="hover:bg-slate-900/80 transition-colors group cursor-pointer"
                  onClick={() => setInspectBlock(block)}
                >
                  <td className="p-3 text-emerald-400 font-bold whitespace-nowrap">
                    #{block.blockIndex}
                  </td>
                  <td className="p-3 text-slate-300 whitespace-nowrap text-[11px]">
                    {formatTimestamp(block.timestamp)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300 group-hover:text-emerald-300 transition-colors">
                      <span>{block.blockHash.substring(0, 18)}...</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyHash(block.blockHash);
                        }}
                        className="text-slate-500 hover:text-emerald-400 transition-colors"
                        title="Copiar Hash Completo"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${verdictClass}`}>
                      {block.verdict}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-300 text-[11px]">
                    {block.regime}
                  </td>
                  <td className="p-3 whitespace-nowrap text-cyan-400 text-[11px] font-mono">
                    {block.arbitrationSignature}
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-300 text-[11px]">
                    [{block.omegaVector?.C ?? 0}, {block.omegaVector?.S ?? 0}, {block.omegaVector?.R ?? 0}]
                  </td>
                  <td className="p-3 whitespace-nowrap text-amber-300 font-bold text-[11px]">
                    {block.dampingFactor}
                  </td>
                  <td className="p-3 whitespace-nowrap text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectBlock(block);
                      }}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Ver Detalles del Bloque"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredBlocks.length === 0 && (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            No se encontraron bloques en el ledger WORM que coincidan con los filtros seleccionados.
          </div>
        )}
      </div>

      {/* Block Inspector Modal */}
      {inspectBlock && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Inspección de Bloque WORM #{inspectBlock.blockIndex}
                </h3>
              </div>
              <button
                onClick={() => setInspectBlock(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Hash SHA-256 del Bloque:</span>
                <p className="bg-slate-950 p-2 rounded border border-slate-800 text-emerald-400 break-all select-all">
                  {inspectBlock.blockHash}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Hash Previos Enlazado:</span>
                <p className="bg-slate-950 p-2 rounded border border-slate-800 text-slate-300 break-all">
                  {inspectBlock.previousHash}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px]">Veredicto:</span>
                  <p className="font-bold text-emerald-400">{inspectBlock.verdict}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Régimen:</span>
                  <p className="font-bold text-slate-200">{inspectBlock.regime}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Factor α:</span>
                  <p className="font-bold text-amber-300">{inspectBlock.dampingFactor}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Norma ||J||:</span>
                  <p className="font-bold text-amber-400">{inspectBlock.jacobianNorm}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Índice HSI:</span>
                  <p className="font-bold text-cyan-400">{inspectBlock.hsiIndex}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Fuente:</span>
                  <p className="font-bold text-slate-300">{inspectBlock.commandSource || 'SYSTEM_CORE'}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Firmas de Red Multimodelo:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px]">
                  {Object.entries(inspectBlock.modelSignatures).map(([model, sig]) => (
                    <div key={model} className="flex items-center justify-between">
                      <span className="text-slate-400 capitalize">{model}:</span>
                      <span className="text-emerald-400/90 font-mono">{sig}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Detalles del Evento:</span>
                <p className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-200 leading-relaxed">
                  {inspectBlock.details}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectBlock(null)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
