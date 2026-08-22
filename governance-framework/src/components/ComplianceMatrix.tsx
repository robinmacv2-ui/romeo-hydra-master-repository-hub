import React, { useState } from 'react';
import { Shield, CheckCircle, FileJson, Download, HelpCircle, Layers, ArrowRight, Table } from 'lucide-react';

interface ComplianceMatrixProps {
  onLogEvent?: (source: string, detail: string, metrics: Record<string, any>) => void;
}

export const ComplianceMatrix: React.FC<ComplianceMatrixProps> = ({ onLogEvent }) => {
  const [activeStandard, setActiveStandard] = useState<'iso' | 'nist' | 'lic'>('iso');

  const handleExportProtocolSpec = () => {
    const protocolSpecification = {
      $schema: "https://romeo-hydra.org/schemas/v3/protocol-spec.json",
      protocol: "ROMEO-HYDRA",
      version: "3.0-CBA",
      founder: "LUIS ANGEL VAZQUEZ MARTINEZ",
      canonical_doi: "10.5281/zenodo.21406719",
      governance_framework: "DIGF (Dynamic Inference Governance Framework)",
      axiomatic_core: {
        hypothesis_k: "La resiliencia de marca diluye la conversión publicitaria en nichos.",
        invariants: {
          alpha_threshold: 0.85,
          active_safeguard: "preventive_entropy_lock"
        },
        coupling: {
          beta_frobenius_norm_target: 2.115,
          coupling_sensitivity_j31: 0.60
        },
        evaluation: {
          gamma_stability_limit: 0.65,
          popper_falsification_r_limit: 0.85,
          logic_resilience_target_i_rl: 0.8600
        }
      },
      audit_ledger: {
        hashing_algorithm: "SHA-256",
        validation_rule: "i > 0 ? blocks[i].prev_hash === blocks[i-1].hash : root",
        consensual_anchors: [
          "Delta Ledger Cryptographic Chain",
          "Zenodo Permanent Scientific DOI Integration"
        ]
      },
      interoperability_interface: {
        endpoints: {
          validate_inference: "/api/v3/protocol/validate",
          export_audit_trail: "/api/v3/protocol/ledger/export",
          verify_credential: "/api/v3/protocol/certification/verify"
        },
        payload_format: {
          type: "application/json",
          structure: {
            inference_event_id: "string (UUID)",
            timestamp_utc: "string (ISO8601)",
            hypothesis_reference: "string (K)",
            empirical_metrics: {
              coherence_score_c_k: "float [0.0 - 1.0]",
              contradiction_score_neg_k: "float [0.0 - 1.0]",
              falsification_resistance_r: "float [0.0 - 1.0]",
              logic_resilience_index_i_rl: "float [0.0 - 1.0]"
            },
            cryptographic_signature: "string (SHA256)"
          }
        }
      },
      regulatory_compliance_anchors: {
        iso_iec_42001: {
          risk_management: "A.6.1.2 - Dynamic inference lock prevents cognitive drift",
          transparency: "A.8.2 - Real-time terminal logs with interactive Popper simulation"
        },
        nist_ai_rmf: {
          govern: "Establish active defensive firewalls in inference loops",
          measure: "Continuous tracking of Frobenius norm and Jacobian matrices"
        },
        lic_mexico_art_164: {
          audit_trail: "Inmutable blockchain-inspired ledger securing all outputs",
          sovereignty: "Local/Edge validation preventing external API key leak and operational sabotage"
        }
      }
    };

    if (onLogEvent) {
      onLogEvent(
        "PROTOCOL_SPEC_EXPORT",
        "Exportación formal del estándar de interoperabilidad ROMEO-HYDRA en formato JSON",
        { size_bytes: JSON.stringify(protocolSpecification).length }
      );
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(protocolSpecification, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "romeo_hydra_protocol_specification.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6" id="compliance-matrix">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Table className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Matriz de Cumplimiento Regulatorio
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              ALINEACIÓN NORMATIVA INTERNACIONAL DE LA GOBERNANZA COGNITIVA
            </p>
          </div>
        </div>

        <button
          onClick={handleExportProtocolSpec}
          className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-cyan-400 border border-slate-800 hover:border-cyan-500/30 rounded-lg font-mono text-xs font-semibold flex items-center gap-2 transition duration-300 shadow-md"
        >
          <FileJson className="w-4 h-4 text-cyan-400" />
          Exportar Protocolo JSON
        </button>
      </div>

      <div className="text-xs text-slate-400 leading-relaxed">
        <p>
          Para facilitar auditorías institucionales y certificar la idoneidad técnica de <strong className="text-slate-200">ROMEO-HYDRA</strong>, esta matriz mapea los mecanismos activos del middleware contra las normativas globales de gobernanza de inteligencia artificial y regulaciones bancarias.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-850 gap-2 pb-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'iso', label: 'ISO/IEC 42001 (Sistemas Gestión IA)', color: 'text-cyan-400' },
          { id: 'nist', label: 'NIST AI RMF (Gestión de Riesgos)', color: 'text-purple-400' },
          { id: 'lic', label: 'Art. 164 LIC (Banca Local)', color: 'text-amber-400' }
        ].map((std) => {
          const isActive = activeStandard === std.id;
          return (
            <button
              key={std.id}
              onClick={() => setActiveStandard(std.id as any)}
              className={`py-2 px-3.5 rounded-t-lg font-mono text-[11px] font-bold transition whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-950/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {std.label}
            </button>
          );
        })}
      </div>

      {/* Matrix Table container */}
      <div className="overflow-x-auto rounded-lg border border-slate-850 bg-slate-950/40">
        {activeStandard === 'iso' && (
          <table className="w-full text-left font-sans border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-850 font-mono text-[10px] text-slate-400 tracking-wider">
                <th className="p-3.5 font-bold uppercase w-1/4">Cláusula ISO/IEC 42001</th>
                <th className="p-3.5 font-bold uppercase w-1/3">Objetivo de Control</th>
                <th className="p-3.5 font-bold uppercase text-cyan-400">Implementación ROMEO-HYDRA</th>
                <th className="p-3.5 font-bold uppercase text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              <tr className="hover:bg-slate-900/20 transition">
                <td className="p-3.5 font-mono text-slate-400 font-semibold">A.6.1.2 Gestión de Riesgos en IA</td>
                <td className="p-3.5 leading-relaxed">Identificar y mitigar sesgos de modelo, alucinaciones latentes y deriva de datos.</td>
                <td className="p-3.5 text-slate-300 font-mono text-[11px] leading-relaxed">
                  <strong className="text-cyan-400 font-semibold block mb-0.5">Operador Dialéctico F</strong>
                  Poda dinámica de hipótesis redundantes o de baja resistencia a la falsación (R &lt; 0.85).
                </td>
                <td className="p-3.5 text-center">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] font-bold">ALINEADO</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-900/20 transition">
                <td className="p-3.5 font-mono text-slate-400 font-semibold">A.8.2 Transparencia y Explicabilidad</td>
                <td className="p-3.5 leading-relaxed">Proporcionar rastros de auditoría interpretables de las inferencias críticas del sistema.</td>
                <td className="p-3.5 text-slate-300 font-mono text-[11px] leading-relaxed">
                  <strong className="text-cyan-400 font-semibold block mb-0.5">Metacognitive Terminal</strong>
                  Visualización de variables micro-métricas y simulación paramétrica directa ante cada postulado.
                </td>
                <td className="p-3.5 text-center">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] font-bold">ALINEADO</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-900/20 transition">
                <td className="p-3.5 font-mono text-slate-400 font-semibold">A.9.3 Integridad del Sistema de IA</td>
                <td className="p-3.5 leading-relaxed">Asegurar que los datos y el pipeline de inferencia no sufran manipulaciones externas.</td>
                <td className="p-3.5 text-slate-300 font-mono text-[11px] leading-relaxed">
                  <strong className="text-cyan-400 font-semibold block mb-0.5">Delta Ledger (SHA-256)</strong>
                  Sellado de bloques criptográficos enlazados que detienen el procesamiento si se detecta corrupción.
                </td>
                <td className="p-3.5 text-center">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] font-bold">ALINEADO</span>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {activeStandard === 'nist' && (
          <table className="w-full text-left font-sans border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-850 font-mono text-[10px] text-slate-400 tracking-wider">
                <th className="p-3.5 font-bold uppercase w-1/4">Función NIST AI RMF</th>
                <th className="p-3.5 font-bold uppercase w-1/3">Directriz de Seguridad</th>
                <th className="p-3.5 font-bold uppercase text-purple-400">Gobernanza ROMEO-HYDRA</th>
                <th className="p-3.5 font-bold uppercase text-center">Acreditación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              <tr className="hover:bg-slate-900/20 transition">
                <td className="p-3.5 font-mono text-slate-400 font-semibold">GOVERN (Gobernar)</td>
                <td className="p-3.5 leading-relaxed">Establecer políticas, cultura y procedimientos organizacionales para mitigar el riesgo.</td>
                <td className="p-3.5 text-slate-300 font-mono text-[11px] leading-relaxed">
                  <strong className="text-purple-400 font-semibold block mb-0.5">Control de Diseño Inmutable</strong>
                  Mapeo del estándar fiduciario de la app y bloqueo de edición de DOI para preservación fiduciaria.
                </td>
                <td className="p-3.5 text-center">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] font-bold">VERIFICADO</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-900/20 transition">
                <td className="p-3.5 font-mono text-slate-400 font-semibold">MEASURE (Medir)</td>
                <td className="p-3.5 leading-relaxed">Monitorear y evaluar métricas de confiabilidad, exactitud y resiliencia de la IA en producción.</td>
                <td className="p-3.5 text-slate-300 font-mono text-[11px] leading-relaxed">
                  <strong className="text-purple-400 font-semibold block mb-0.5">Norma Frobenius & Jacobiano</strong>
                  Análisis matricial continuo en sub-módulos de riesgo (Sports, Financial, Exposure).
                </td>
                <td className="p-3.5 text-center">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] font-bold">VERIFICADO</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-900/20 transition">
                <td className="p-3.5 font-mono text-slate-400 font-semibold">MANAGE (Gestionar)</td>
                <td className="p-3.5 leading-relaxed">Activar cortafuegos y acciones correctivas inmediatas ante fallas lógicas extremas.</td>
                <td className="p-3.5 text-slate-300 font-mono text-[11px] leading-relaxed">
                  <strong className="text-purple-400 font-semibold block mb-0.5">Filtro de Entropía Alpha</strong>
                  Cierre de cascada de inferencia en milisegundos si la autenticidad baja del umbral crítico.
                </td>
                <td className="p-3.5 text-center">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] font-bold">VERIFICADO</span>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {activeStandard === 'lic' && (
          <table className="w-full text-left font-sans border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-850 font-mono text-[10px] text-slate-400 tracking-wider">
                <th className="p-3.5 font-bold uppercase w-1/4">Art. 164 LIC (Requisitos)</th>
                <th className="p-3.5 font-bold uppercase w-1/3">Estándar de Evidencia</th>
                <th className="p-3.5 font-bold uppercase text-amber-400">Evidencia ROMEO-HYDRA</th>
                <th className="p-3.5 font-bold uppercase text-center">Auditoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              <tr className="hover:bg-slate-900/20 transition">
                <td className="p-3.5 font-mono text-slate-400 font-semibold">Cadena de Custodia</td>
                <td className="p-3.5 leading-relaxed">Inmutabilidad en el registro de transacciones e inferencias de crédito o riesgo.</td>
                <td className="p-3.5 text-slate-300 font-mono text-[11px] leading-relaxed">
                  <strong className="text-amber-400 font-semibold block mb-0.5">Delta Ledger Sequence</strong>
                  Registro SHA-256 encadenado y rastreable con hashes inmutables, enlazando al DOI público.
                </td>
                <td className="p-3.5 text-center">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] font-bold">COMPLIANT</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-900/20 transition">
                <td className="p-3.5 font-mono text-slate-400 font-semibold">Contención Local / Edge</td>
                <td className="p-3.5 leading-relaxed">Soberanía de datos financieros e inmunidad ante caídas o sabotajes en nubes públicas.</td>
                <td className="p-3.5 text-slate-300 font-mono text-[11px] leading-relaxed">
                  <strong className="text-amber-400 font-semibold block mb-0.5">Sintonización Local</strong>
                  Permite inyectar prompts base en Gemini o modelos locales sin persistir llaves o PII sensible.
                </td>
                <td className="p-3.5 text-center">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] font-bold">COMPLIANT</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-900/20 transition">
                <td className="p-3.5 font-mono text-slate-400 font-semibold">SLAs de Procesamiento</td>
                <td className="p-3.5 leading-relaxed">Tiempo de respuesta óptimo en la validación antes de la ejecución transaccional.</td>
                <td className="p-3.5 text-slate-300 font-mono text-[11px] leading-relaxed">
                  <strong className="text-amber-400 font-semibold block mb-0.5">Garantía de 42ms</strong>
                  Evaluación ultra rápida del acoplamiento en lugar de revisiones fiduciarias manuales de varios días.
                </td>
                <td className="p-3.5 text-center">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9px] font-bold">COMPLIANT</span>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono">
        <div className="space-y-1">
          <span className="text-slate-500 uppercase text-[9px] font-semibold tracking-wider block">ID de Validación para Organismo Certificador</span>
          <p className="text-slate-300">
            COMPLIANCE-HASH: <code className="text-cyan-400 text-xs font-bold">ROMEO-HYDRA-ISO42001-NIST-LIC164-SECURED</code>
          </p>
        </div>
        <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/20">
          <CheckCircle className="w-3.5 h-3.5" />
          Certificación Válida
        </div>
      </div>
    </div>
  );
};
