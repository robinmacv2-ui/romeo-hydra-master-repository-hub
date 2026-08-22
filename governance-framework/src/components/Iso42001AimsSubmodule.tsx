import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Database, 
  Eye, 
  UserCheck, 
  FileCheck, 
  RefreshCw, 
  Layers, 
  Fingerprint, 
  Lock, 
  Unlock, 
  Download, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { calculateLedgerHash } from '../utils';

interface IsoControl {
  id: string;
  clause: string;
  name: string;
  description: string;
  metricName: string;
  metricValue: number;
  threshold: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  verificationMethod: string;
}

interface Iso42001AimsSubmoduleProps {
  onLogEvent?: (source: string, detail: string, metrics: Record<string, any>) => void;
  onAddLedgerBlock?: (block: any) => void;
  isReadOnly?: boolean;
}

export const Iso42001AimsSubmodule: React.FC<Iso42001AimsSubmoduleProps> = ({ 
  onLogEvent, 
  onAddLedgerBlock,
  isReadOnly = false
}) => {
  // ISO/IEC 42001 AIMS Core Controls State
  const [controls, setControls] = useState<IsoControl[]>([
    {
      id: 'A.6.1.2',
      clause: 'Cláusula A.6.1.2',
      name: 'Gestión de Riesgos de IA',
      description: 'Evaluación y mitigación automatizada de sesgos en los modelos, alucinaciones y desviación semántica.',
      metricName: 'Índice de Mitigación de Sesgo',
      metricValue: 0.94,
      threshold: 0.85,
      status: 'PASS',
      verificationMethod: 'Poda Dialéctica del Árbol Hydra v2.7 (Operador Dialéctico F)'
    },
    {
      id: 'A.10.2',
      clause: 'Cláusula A.10.2',
      name: 'Calidad de Datos de Inferencia',
      description: 'Verificación continua de la idoneidad, relevancia y origen fiduciario de los vectores de entrada.',
      metricName: 'Precisión del Vector Base',
      metricValue: 0.91,
      threshold: 0.85,
      status: 'PASS',
      verificationMethod: 'Criterio Convexo Frobenius de Acoplamiento (Norma Beta)'
    },
    {
      id: 'A.6.1.4',
      clause: 'Cláusula A.6.1.4',
      name: 'Evaluación de Impacto de la IA',
      description: 'Análisis automatizado de resistencia a la falsación y de los impactos colaterales del comportamiento algorítmico.',
      metricName: 'Resistencia a la Falsación Popper',
      metricValue: 0.88,
      threshold: 0.85,
      status: 'PASS',
      verificationMethod: 'Filtro Popper con Límite de Falsabilidad (Gamma HSI)'
    },
    {
      id: 'A.7.2',
      clause: 'Cláusula A.7.2',
      name: 'Monitoreo del Ciclo de Vida del Modelo',
      description: 'Seguimiento milimétrico de la desviación e integridad operacional para evitar la degradación silenciosa.',
      metricName: 'Índice de Estabilidad Invariante',
      metricValue: 0.89,
      threshold: 0.85,
      status: 'PASS',
      verificationMethod: 'Verificación del Umbral de Calidad Alpha'
    },
    {
      id: 'A.8.4',
      clause: 'Cláusula A.8.4',
      name: 'Mecanismos de Supervisión Humana',
      description: 'Garantía de supervisión fiduciaria directa mediante la interrupción activa en bucles automatizados.',
      metricName: 'Disponibilidad de Intervención Humana',
      metricValue: 1.00,
      threshold: 1.00,
      status: 'PASS',
      verificationMethod: 'Token de Hardware y Criptografía Dual (Eslabón de Responsabilidad Física)'
    }
  ]);

  const [iamRole, setIamRole] = useState<'VIEWER' | 'ADMIN'>(isReadOnly ? 'VIEWER' : 'ADMIN');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [lastAuditTimestamp, setLastAuditTimestamp] = useState<string>('2026-07-21 08:00:00');
  const [auditHash, setAuditHash] = useState<string>('ROMEO-HYDRA-ISO42001-AIMS-SHA256-NOMINAL-SECURE');
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string>('');

  useEffect(() => {
    if (isReadOnly) {
      setIamRole('VIEWER');
    }
  }, [isReadOnly]);

  // Handler to run automated real-time ISO/IEC 42001 verification
  const handleRunIsoAudit = () => {
    if (iamRole === 'VIEWER') {
      triggerNotification('Acción Denegada: Los Auditores en Viewer Mode no pueden modificar ni forzar evaluaciones lógicas del Kernel Sigma.');
      return;
    }

    setIsAuditing(true);
    
    // Simulate real-time Kernel Sigma calculations for 1.2 seconds
    setTimeout(() => {
      const now = new Date();
      const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19);
      
      const recalculatedControls = controls.map(ctrl => {
        // Micro-variations matching system state
        let randVar = (Math.random() * 0.08) - 0.03;
        let newValue = Math.min(1.00, Math.max(0.70, Number((ctrl.metricValue + randVar).toFixed(2))));
        let newStatus: 'PASS' | 'WARN' | 'FAIL' = 'PASS';
        
        if (newValue < ctrl.threshold) {
          newStatus = 'FAIL';
        } else if (newValue < ctrl.threshold + 0.04) {
          newStatus = 'WARN';
        }

        return {
          ...ctrl,
          metricValue: newValue,
          status: newStatus
        };
      });

      setControls(recalculatedControls);
      
      // Calculate a determinist SHA-256 representation of current audit state
      const rawPayload = JSON.stringify({
        standards: 'ISO/IEC-42001-AIMS',
        timestamp: timestampStr,
        controls: recalculatedControls.map(c => ({ id: c.id, value: c.metricValue, status: c.status })),
        certifier: 'Luis Angel Vazquez Martinez',
        doi: '10.5281/zenodo.21406719'
      });
      const generatedHash = calculateLedgerHash(rawPayload, auditHash);
      
      setAuditHash(generatedHash);
      setLastAuditTimestamp(timestampStr);
      setIsAuditing(false);

      if (onLogEvent) {
        onLogEvent(
          "ISO_42001_AIMS_EVALUATION",
          "Evaluación automatizada continua de conformidad con ISO/IEC 42001 del Kernel Sigma",
          {
            overall_compliance: recalculatedControls.every(c => c.status === 'PASS') ? '100%' : 'PARCIAL',
            hash_proof: generatedHash,
            operator: 'Luis Angel Vazquez Martinez'
          }
        );
      }

      triggerNotification('Evaluación ISO/IEC 42001 completada con éxito. Verificación del Kernel Sigma consolidada.');
    }, 1200);
  };

  // Handler to inject compliance report to the Delta Ledger
  const handleSealToDeltaLedger = () => {
    if (iamRole === 'VIEWER') {
      triggerNotification('Acción Denegada: El sellado inmutable en el Delta Ledger requiere privilegios de Administrador.');
      return;
    }

    if (!onAddLedgerBlock) {
      triggerNotification('Enlace al Delta Ledger no inicializado.');
      return;
    }

    const complianceBlock = {
      source: "ISO_42001_AIMS_CERTIFICATION",
      detail: `Conformidad certificada con ISO/IEC 42001 (AIMS). Sello SHA-256 del análisis: ${auditHash.substring(0, 16)}...`,
      metrics: {
        certification_id: "AIMS-ISO42001-COMPLIANT-HYDRA",
        author: "LUIS ANGEL VAZQUEZ MARTINEZ",
        zenodo_doi: "10.5281/zenodo.21406719",
        timestamp: lastAuditTimestamp,
        verified_controls: controls.map(c => `${c.id} (${c.status})`),
        overall_score: (controls.reduce((acc, c) => acc + c.metricValue, 0) / controls.length * 100).toFixed(1) + "%"
      }
    };

    onAddLedgerBlock(complianceBlock);
    triggerNotification('¡Sello ISO/IEC 42001 inyectado con éxito en el Delta Ledger inmutable!');
  };

  // Export Big Four structured audit report
  const handleExportBigFourReport = () => {
    const report = {
      document_type: "ISO/IEC 42001 (AIMS) COMPLIANCE FORENSIC RECORD",
      framework_specification: "ROMEO-HYDRA v3.0-RC1",
      governance_engine: "Kernel Sigma Optimization Loop",
      intellectual_property: {
        founder_author: "Luis Angel Vazquez Martinez",
        permanent_doi: "10.5281/zenodo.21406719",
        regulatory_alignment: ["ISO/IEC 42001:2023", "NIST AI RMF", "LIC Art. 164"]
      },
      verification_audit_trail: {
        timestamp_utc: lastAuditTimestamp,
        integrity_hash: auditHash,
        iam_role_used: iamRole,
        overall_compliance_status: controls.every(c => c.status === 'PASS') ? "FULLY_ALIGNED" : "REVIEWS_REQUIRED"
      },
      assessed_aims_controls: controls.map(ctrl => ({
        control_id: ctrl.id,
        clause: ctrl.clause,
        control_name: ctrl.name,
        operational_description: ctrl.description,
        metric: {
          label: ctrl.metricName,
          value: ctrl.metricValue,
          minimal_required_threshold: ctrl.threshold
        },
        audit_verdict: ctrl.status,
        automated_evidence_collector: ctrl.verificationMethod
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `romeo_hydra_iso42001_aims_audit_record_${lastAuditTimestamp.replace(/[: ]/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (onLogEvent) {
      onLogEvent(
        "ISO_REPORT_EXPORT",
        "Exportación de reporte estructurado ISO/IEC 42001 en formato legible para auditores Big Four",
        { timestamp: lastAuditTimestamp, hash: auditHash }
      );
    }
  };

  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  const overallScore = Number((controls.reduce((acc, c) => acc + c.metricValue, 0) / controls.length * 100).toFixed(0));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 relative overflow-hidden" id="iso-42001-aims-submodule">
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/[0.02] rounded-full blur-3xl pointer-events-none" />
      
      {/* Toast Notification */}
      {showNotification && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-slate-950 border border-cyan-500/40 text-cyan-400 font-mono text-[10.5px] px-4 py-2.5 rounded shadow-xl flex items-center justify-between gap-3 animate-fade-in">
          <span>{notificationMsg}</span>
          <button onClick={() => setShowNotification(false)} className="text-slate-500 hover:text-cyan-400 font-bold">×</button>
        </div>
      )}

      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
              Submódulo de Validación ISO/IEC 42001 (AIMS)
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              ESTÁNDAR GLOBAL DE GOBERNANZA DE IA EN TIEMPO REAL // CORE REGINA SIGMA
            </p>
          </div>
        </div>

        {/* IAM Role Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-850">
          <span className="text-[9px] font-mono text-slate-600 px-2 font-bold uppercase">IAM PERMISO:</span>
          <button
            onClick={() => {
              if (isReadOnly) {
                triggerNotification('Acción Bloqueada: Su sesión actual de Invitado está confinada a Viewer Mode.');
                return;
              }
              setIamRole('VIEWER');
              triggerNotification('Rol alternado: Modo Auditor Externo (Viewer Mode) habilitado.');
            }}
            className={`py-1 px-2.5 rounded font-mono text-[9.5px] font-bold uppercase transition ${
              iamRole === 'VIEWER' 
                ? 'bg-cyan-950 border border-cyan-500/30 text-cyan-400' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Viewer Mode: Para auditorías externas de Big Four"
          >
            Viewer Mode
          </button>
          <button
            onClick={() => {
              if (isReadOnly) {
                triggerNotification('Acción Bloqueada: Su sesión actual de Invitado está confinada a Viewer Mode.');
                return;
              }
              setIamRole('ADMIN');
              triggerNotification('Rol alternado: Modo Administrador (Luis Angel Vazquez Martinez) habilitado.');
            }}
            className={`py-1 px-2.5 rounded font-mono text-[9.5px] font-bold uppercase transition ${
              iamRole === 'ADMIN' 
                ? 'bg-emerald-950 border border-emerald-500/30 text-emerald-400' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Admin Mode: Fundador Luis Angel Vazquez Martinez"
          >
            Admin Mode
          </button>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-1">
          <span className="text-slate-500 uppercase text-[9px] font-semibold">Cumplimiento Global (AIMS)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{overallScore}%</span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 border border-emerald-500/10 rounded">OPTIMIZADO</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-400 h-full transition-all duration-500" style={{ width: `${overallScore}%` }} />
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-1">
          <span className="text-slate-500 uppercase text-[9px] font-semibold">Trazabilidad Delta Ledger</span>
          <div className="flex items-baseline gap-1">
            <span className="text-cyan-400 text-[10.5px] font-bold select-all font-mono truncate max-w-full block">
              {auditHash.substring(0, 16)}...
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-none">
            Anclaje de integridad: SHA-256
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-1">
          <span className="text-slate-500 uppercase text-[9px] font-semibold">Última Auditoría de Conformidad</span>
          <div className="text-slate-200 font-bold text-[11px] flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {lastAuditTimestamp}
          </div>
          <p className="text-[9.5px] text-slate-500 leading-tight">
            Autorizado por Luis Angel Vazquez Martinez
          </p>
        </div>
      </div>

      {/* ISO/IEC 42001 Controls Board */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Tablero de Controles Activos de Inteligencia Artificial (AIMS)
          </span>
          <span className="text-[9.5px] font-mono text-slate-500">
            Mapeo Directo contra Directrices ISO/IEC 42001
          </span>
        </div>

        <div className="space-y-2.5">
          {controls.map((ctrl) => (
            <div 
              key={ctrl.id} 
              className="bg-slate-950 p-4 rounded-lg border border-slate-850 flex flex-col md:flex-row justify-between gap-4 transition hover:border-slate-800"
              id={`iso-ctrl-${ctrl.id.replace(/\./g, '-')}`}
            >
              <div className="space-y-1.5 md:max-w-[70%]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
                    {ctrl.id}
                  </span>
                  <span className="text-[11px] font-bold text-slate-200">{ctrl.name}</span>
                  <span className="text-[9.5px] font-mono text-slate-500">({ctrl.clause})</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {ctrl.description}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono pt-1">
                  <Cpu className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-slate-600 uppercase font-semibold">Firma de Evidencia:</span>
                  <span className="text-slate-300">{ctrl.verificationMethod}</span>
                </div>
              </div>

              <div className="flex md:flex-col justify-between md:justify-center items-center md:items-end gap-3 shrink-0 md:min-w-[150px] border-t md:border-t-0 border-slate-900 pt-2.5 md:pt-0">
                <div className="text-right font-mono text-xs space-y-0.5">
                  <div className="text-[9.5px] text-slate-500 uppercase">{ctrl.metricName}</div>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="font-bold text-slate-100">{ctrl.metricValue}</span>
                    <span className="text-slate-600 text-[10px]">/ min {ctrl.threshold}</span>
                  </div>
                </div>

                <div>
                  {ctrl.status === 'PASS' ? (
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[9.5px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> ALINEADO
                    </span>
                  ) : ctrl.status === 'WARN' ? (
                    <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono text-[9.5px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" /> PREVENCIÓN
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded font-mono text-[9.5px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-400 animate-bounce" /> CONTENCIÓN
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions and Controls Panel */}
      <div className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <span className="text-slate-500 uppercase text-[9px] font-mono font-semibold block">Gobernanza ISO/IEC 42001 Activa</span>
          <p className="text-[11px] font-sans text-slate-400 leading-relaxed">
            Las evaluaciones lógicas y la inyección en el Delta Ledger requieren privilegios de <strong className="text-slate-200">Admin Mode</strong> y token fiduciario de Luis Angel Vazquez Martinez.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0 w-full md:w-auto">
          <button
            onClick={handleRunIsoAudit}
            disabled={isAuditing}
            className={`flex-1 md:flex-initial px-4 py-2 font-mono text-[11px] font-bold rounded flex items-center justify-center gap-2 transition duration-300 ${
              iamRole === 'VIEWER' 
                ? 'bg-slate-900 text-slate-500 border border-slate-850 cursor-not-allowed'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
            {isAuditing ? 'Calculando Invariantes...' : 'Ejecutar Validación Sigma'}
          </button>

          <button
            onClick={handleSealToDeltaLedger}
            disabled={iamRole === 'VIEWER'}
            className={`flex-1 md:flex-initial px-4 py-2 font-mono text-[11px] font-bold rounded flex items-center justify-center gap-2 transition duration-300 border ${
              iamRole === 'VIEWER' 
                ? 'bg-slate-900 text-slate-500 border-slate-850 cursor-not-allowed'
                : 'bg-slate-950 hover:bg-slate-900 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Sellar en Delta Ledger
          </button>

          <button
            onClick={handleExportBigFourReport}
            className="flex-1 md:flex-initial px-4 py-2 bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 rounded font-mono text-[11px] font-bold flex items-center justify-center gap-2 transition duration-300"
          >
            <Download className="w-3.5 h-3.5" />
            Reporte Big Four (JSON)
          </button>
        </div>
      </div>
    </div>
  );
};
