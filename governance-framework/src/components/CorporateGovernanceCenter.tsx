import React, { useState } from 'react';
import { 
  BookOpen, 
  Terminal, 
  Briefcase, 
  FileCheck, 
  Download, 
  ExternalLink,
  ShieldCheck,
  Cpu,
  Key,
  Copy,
  Check
} from 'lucide-react';

export const CorporateGovernanceCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rfc' | 'sandbox' | 'legal' | 'compliance'>('compliance');
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText("sk_live_romhyd_sigma_8f92a1b3c4d5e6f7g8h9");
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0b0f19] border border-[#1e293b] rounded-xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <Briefcase className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-mono text-slate-100 flex items-center gap-2">
                  GOBERNANZA CORPORATIVA Y CUMPLIMIENTO B2B
                  <span className="text-[10px] px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded-full font-mono uppercase tracking-wider">
                    Enterprise Ready
                  </span>
                </h2>
                <p className="text-xs font-sans text-slate-400 mt-1">
                  Matriz de Evidencias Fiduciarias para Adopción Institucional y Auditoría de Terceros
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex flex-wrap border-b border-slate-800 gap-1 font-mono text-xs">
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'compliance'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          Mapeo de Cumplimiento (Compliance)
        </button>
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'sandbox'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          API Sandbox Reproducible
        </button>
        <button
          onClick={() => setActiveTab('rfc')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'rfc'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Especificación Técnica (RFC)
        </button>
        <button
          onClick={() => setActiveTab('legal')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'legal'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Estructura Legal MVP
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5">
              <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Matriz de Mapeo contra Regulación Vigente
              </h3>
              <p className="text-xs text-slate-400 mb-6 font-sans">
                Documento digerido para Oficiales de Cumplimiento (CCOs). Mapeo directo de exigencias regulatorias contra bloques arquitectónicos de ROMEO-HYDRA v3.0.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#0b0f19] text-slate-300 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="px-4 py-3 border-y border-[#1e293b]">Marco Regulatorio</th>
                      <th className="px-4 py-3 border-y border-[#1e293b]">Exigencia Específica</th>
                      <th className="px-4 py-3 border-y border-[#1e293b]">Solución ROMEO-HYDRA</th>
                      <th className="px-4 py-3 border-y border-[#1e293b]">Prueba Forense Generada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b] text-slate-400">
                    <tr className="hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-semibold text-slate-300">CNBV / Banxico (Art. 164)</td>
                      <td className="px-4 py-3">Controles de acceso robustos y trazabilidad inalterable de operaciones críticas en infraestructura financiera.</td>
                      <td className="px-4 py-3">Invariante de Identidad ≠ Autorización. Validación estricta en Kernel Sigma.</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-cyan-400">Delta Ledger Hash + WORM ACK</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-semibold text-slate-300">ISO/IEC 42001:2023 (AI MS)</td>
                      <td className="px-4 py-3">Transparencia, explicabilidad y gestión de riesgos en sistemas de Inteligencia Artificial (Caja Blanca).</td>
                      <td className="px-4 py-3">Arquitectura "Caja Blanca" con explicabilidad determinista en cada decisión del Detective Analítico.</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-purple-400">Kernel Sigma Counterfactual Log</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-semibold text-slate-300">GDPR / LFPDPPP</td>
                      <td className="px-4 py-3">Privacidad por diseño, limitación de propósito y seguridad del procesamiento de PII.</td>
                      <td className="px-4 py-3">Aislamiento de lectura, telemetría cifrada y contención de escalamiento de privilegios.</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-emerald-400">Data Sanitization Event (Hash)</td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-semibold text-slate-300">NIST AI RMF</td>
                      <td className="px-4 py-3">Monitorizar, medir y gestionar riesgos de sesgo, robustez (Data Drift) y seguridad.</td>
                      <td className="px-4 py-3">Monitorización continua de Entropía y Shocks de Liquidez con acciones de contención (Step-Down).</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-amber-400">SimulationRun Degradation Report</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sandbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5">
              <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                API de Pruebas B2B (Ingeniería)
              </h3>
              <p className="text-xs text-slate-400 mb-6 font-sans">
                Entorno reproducible para que ingenieros de seguridad y auditores del banco inyecten "datos sucios", pongan a prueba las invariantes del Kernel Sigma y comprueben el rechazo determinista.
              </p>

              <div className="space-y-4">
                <div className="bg-[#0b0f19] border border-slate-800 p-4 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Endpoint REST (POST)</span>
                  <div className="text-cyan-400 font-mono text-xs font-bold break-all">
                    https://api.romeo-hydra.com/v3/sandbox/inject-shock
                  </div>
                </div>

                <div className="bg-[#0b0f19] border border-slate-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Token de Acceso (Test)</span>
                    <button onClick={handleCopyKey} className="text-slate-400 hover:text-white transition">
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-emerald-400 font-mono text-xs blur-sm hover:blur-none transition-all cursor-pointer">
                    sk_live_romhyd_sigma_8f92a1b3c4d5e6f7g8h9
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0b0f19] border border-[#1e293b] rounded-xl p-5 flex flex-col justify-center">
              <div className="text-center space-y-4">
                <Cpu className="w-12 h-12 text-slate-700 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-300 font-mono">Consola de Simulación Activa</h4>
                  <p className="text-xs text-slate-500 font-sans mt-2 max-w-xs mx-auto">
                    Para ejecutar pruebas visuales interactivas, utiliza el módulo "Sandbox SimulationRun" en el menú principal.
                  </p>
                </div>
                <button className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-mono font-bold hover:bg-blue-600/30 transition">
                  Ir al Sandbox Visual
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rfc' && (
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  Especificación Técnica (Whitepaper RFC)
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Sometimiento al escrutinio público. Matemáticas del Kernel Sigma y restricciones convexas.
                </p>
              </div>
              <button className="px-3 py-1.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded flex items-center gap-1.5 text-xs font-mono hover:bg-purple-600/30 transition">
                <Download className="w-3.5 h-3.5" /> PDF (14 pags)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4 text-xs font-sans text-slate-300 leading-relaxed bg-[#0b0f19] p-5 rounded-lg border border-slate-800">
                <h4 className="font-bold text-white text-sm">Abstracto: La Caja Blanca de la IA</h4>
                <p>
                  Este documento (RFC) expone la arquitectura determinista de ROMEO-HYDRA v3.0, demostrando matemáticamente cómo el <strong>Kernel Sigma</strong> garantiza la inmutabilidad de los estados en la toma de decisiones asistida por IA.
                </p>
                <p>
                  A diferencia de los modelos de "Caja Negra" basados puramente en inferencia probabilística, el Kernel Sigma envuelve los resultados del LLM en un sistema de <strong>restricciones convexas</strong>. Cualquier desviación estadística (Data Drift) o violación de invariantes (e.g. Autorización vs Identidad) empuja el vector de decisión fuera del espacio permitido, forzando un <em>Circuit Breaker</em> instantáneo.
                </p>
                <div className="p-3 bg-slate-900 border border-slate-700 rounded text-slate-400 font-mono text-[10px]">
                  <strong>Mathematical Constraint:</strong><br/>
                  ∀x ∈ StateSpace: if f_policy(x) ∉ ConvexHull(SafeStates) ⇒ Trigger(QuarantineMode)
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#0b0f19] p-4 rounded-lg border border-slate-800">
                  <h4 className="font-mono text-[10px] text-slate-500 uppercase mb-2">Identificador de Objeto Digital</h4>
                  <div className="text-purple-400 font-mono text-xs font-bold">
                    DOI: 10.13140/RG.2.2.XXXXX.XXXXX
                  </div>
                  <a href="#" className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 mt-2">
                    Ver en ResearchGate <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                
                <div className="bg-[#0b0f19] p-4 rounded-lg border border-slate-800">
                  <h4 className="font-mono text-[10px] text-slate-500 uppercase mb-2">Estatus de Peer-Review</h4>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-slate-300 text-xs font-bold">Public Draft (Open)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Estructura Legal Mínima Viable (MVP)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0b0f19] p-5 rounded-lg border border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-slate-200 text-sm">Entidad Corporativa</h4>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-mono uppercase">
                    Ready for B2B
                  </span>
                </div>
                <div className="space-y-3 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tipo Societario:</span>
                    <span className="text-slate-300 font-bold">S.A.P.I. de C.V. (México) / LLC (US)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gobernanza:</span>
                    <span className="text-slate-300">Asamblea de Accionistas Formalizada</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contratos B2B:</span>
                    <span className="text-slate-300">NDA, SLA y Piloto Estructurados</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Facturación:</span>
                    <span className="text-slate-300">Alta Fiscal Completada</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0b0f19] p-5 rounded-lg border border-slate-800 flex flex-col justify-center text-center space-y-3">
                <Briefcase className="w-10 h-10 text-amber-500/50 mx-auto" />
                <h4 className="font-bold text-slate-300 text-sm">Contratación Institucional</h4>
                <p className="text-xs text-slate-500 font-sans max-w-xs mx-auto leading-relaxed">
                  La estructura S.A.P.I. permite integrar cláusulas de propiedad intelectual, protección de datos y acuerdos de nivel de servicio (SLA) exigidos por instituciones financieras (Banxico / CNBV).
                </p>
                <div className="pt-2">
                  <button className="px-4 py-2 bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-mono font-bold hover:bg-amber-600/30 transition">
                    Descargar NDA Standard (Borrador)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
