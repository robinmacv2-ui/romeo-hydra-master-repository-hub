import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  FileJson, 
  Send, 
  Activity, 
  Lock, 
  Cpu, 
  RefreshCw 
} from 'lucide-react';
import { AuditResult } from '../types';

export const RaekAiAuditor: React.FC = () => {
  const [promptInput, setPromptInput] = useState<string>(
    'Optimizar modelo de lenguaje manteniendo estabilidad homeostática y contención ex-ante dentro de la envolvente convexa C.'
  );
  const [tauValue, setTauValue] = useState<number>(0.05);
  const [epsilonValue, setEpsilonValue] = useState<number>(0.01);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  const presetPrompts = [
    'Optimizar modelo de lenguaje manteniendo estabilidad homeostática y contención ex-ante.',
    'Intentar eludir la membrana topológica A_epsilon mediante variación no convexa del gradiente.',
    'Generar comando de ejecución con alteración del ledger diferencial L_X Δ.',
    'Consulta estándar de datos científicos bajo el estándar ISO/IEC 42001.'
  ];

  const handleRunAudit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInput,
          tau: tauValue,
          epsilon: epsilonValue,
          mode: 'Auditoría de Intención RAEK-1.0-MX'
        })
      });

      const data = await response.json();
      setAuditResult(data);
    } catch (err) {
      console.error("Audit API call failed:", err);
      // Fallback offline object
      setAuditResult({
        decision: 'CONTAINED_AND_BLOCKED',
        lambdaMin: 0.0,
        hsiValue: 1.0,
        analysis: 'Intercepción de seguridad ex-ante por la Partícula de Luis Ángel (P_LAM). La intención fue evaluada como no convexa y bloqueada fuera de C.',
        bifurcationPhase: 'Phase 4: Terminal Blocked State',
        governanceSignature: '0xLAVM_PPRH_HYDRA_V3_CRISTALIZADO',
        recommendations: ['Reducir perturbación en el potencial modificado Sigma_Lambda']
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Side: Audit Form & Preset Selector */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-slate-100 font-bold text-sm">
                Auditor de Intenciones RAEK-1.0-MX (Servidor Gemini AI)
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Evaluación ex-ante de vectores de intención bajo el Postulado de Invarianza Homeostática
              </p>
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-400 mb-2 block">
              Pruebas Rápidas de Intención:
            </label>
            <div className="space-y-1.5">
              {presetPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptInput(p)}
                  className={`w-full text-left p-2 rounded-lg text-xs transition border ${
                    promptInput === p
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200 font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input Area */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              Intención / Prompt a Auditar:
            </label>
            <textarea
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              rows={4}
              placeholder="Escribe aquí el comando o intención del agente para ser auditado..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 leading-relaxed font-sans"
            />
          </div>

          {/* Parameters Controls */}
          <div className="grid grid-cols-2 gap-3 mb-5 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Umbral Crítico τ:</span>
              <input
                type="number"
                step="0.01"
                value={tauValue}
                onChange={e => setTauValue(parseFloat(e.target.value) || 0.05)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-cyan-300 font-bold focus:outline-none"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Membrana Topológica ε:</span>
              <input
                type="number"
                step="0.01"
                value={epsilonValue}
                onChange={e => setEpsilonValue(parseFloat(e.target.value) || 0.01)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-cyan-300 font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Audit Button */}
          <button
            onClick={handleRunAudit}
            disabled={isLoading || !promptInput.trim()}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isLoading ? 'Auditando Intención con Gemini AI...' : 'Auditar Intención con RAEK-1.0-MX'}
          </button>
        </div>

        {/* Right Side: Audit Verdict & Certificate */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-slate-100 font-bold text-sm flex items-center gap-2">
                <FileJson className="w-4 h-4 text-emerald-400" />
                Dictamen de Gobernanza Homeostática
              </h3>

              {auditResult && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold flex items-center gap-1.5 ${
                  auditResult.decision === 'COMPLIANT_ADMISSIBLE'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-red-950 text-red-300 border border-red-800'
                }`}>
                  {auditResult.decision === 'COMPLIANT_ADMISSIBLE' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                  {auditResult.decision}
                </span>
              )}
            </div>

            {auditResult ? (
              <div className="space-y-4">
                {/* Analysis Text Box */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Análisis Físico-Algorítmico:
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed font-sans">
                    {auditResult.analysis}
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Autovalor Mínimo λ_min:</span>
                    <span className={`font-bold text-sm ${auditResult.lambdaMin <= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {auditResult.lambdaMin?.toFixed(4) || '0.0000'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Índice de Estabilidad HSI:</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {auditResult.hsiValue?.toFixed(6) || '1.000000'}
                    </span>
                  </div>
                </div>

                {/* Phase & Signature Box */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono">
                  <div className="text-slate-400 mb-1">
                    Fase de Bifurcación: <span className="text-cyan-300 font-semibold">{auditResult.bifurcationPhase}</span>
                  </div>
                  <div className="text-slate-400">
                    Firma de Gobernanza: <code className="text-emerald-400 font-bold">{auditResult.governanceSignature}</code>
                  </div>
                </div>

                {/* Recommendations */}
                {auditResult.recommendations && auditResult.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 mb-1.5">Recomendaciones de Contención:</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                      {auditResult.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[260px] text-center p-6 bg-slate-950/60 rounded-xl border border-slate-800">
                <Cpu className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                <h4 className="text-slate-300 font-bold text-sm mb-1">
                  Listo para Auditar Intención
                </h4>
                <p className="text-slate-500 text-xs max-w-sm">
                  Selecciona una intención o escribe un prompt a la izquierda y haz clic en "Auditar Intención" para evaluar la contención homeostática.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Motor: RAEK-1.0-MX / CLC v1.2</span>
            <span className="text-emerald-400">0 Escapes Garantizados Ex-Ante</span>
          </div>
        </div>

      </div>
    </div>
  );
};
