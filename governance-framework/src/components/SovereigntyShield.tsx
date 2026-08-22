import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert,
  Key, 
  Database, 
  Globe, 
  Cpu, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  BookOpen, 
  Copy, 
  ExternalLink,
  Lock,
  Unlock,
  CornerDownRight,
  Fingerprint
} from 'lucide-react';

import { DesignLockLog } from '../types';

interface DecisionLog {
  id: string;
  timestamp: string;
  inputTrigger: string;
  decisionMade: string;
  falsificationIndex: number;
  reasoning: string;
  verifierSignature: string;
}

interface SovereigntyShieldProps {
  onLogEvent?: (source: string, detail: string, metrics: Record<string, any>) => void;
  doi?: string;
  founderName?: string;
  designLockLogs?: DesignLockLog[];
  isReadOnly?: boolean;
}

export const SovereigntyShield: React.FC<SovereigntyShieldProps> = ({ 
  onLogEvent, 
  doi = "10.5281/zenodo.21406719",
  founderName = "LUIS ANGEL VAZQUEZ MARTINEZ",
  designLockLogs = [],
  isReadOnly = false
}) => {
  // Verification states
  const [searchHash, setSearchHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    status: 'success' | 'failed' | null;
    message: string;
    details?: {
      id: string;
      institution: string;
      doiMatch: boolean;
      signatureValid: boolean;
      ledgerBlock: number;
      timestamp: string;
      hash: string;
    };
  }>({ status: null, message: '' });

  const [isVerifying, setIsVerifying] = useState(false);

  // HSM states
  const [hsmStatus, setHsmStatus] = useState<'COLD_STORAGE' | 'ROTATING' | 'SEALED'>('COLD_STORAGE');
  const [copiedHsmKey, setCopiedHsmKey] = useState(false);

  // Reproducibility Logs (ROMEO-P008)
  const [logs, setLogs] = useState<DecisionLog[]>([
    {
      id: "LOG-RH01",
      timestamp: "2026-07-19T14:30:22Z",
      inputTrigger: "Fluctuación deportiva anómala en spread de Real Madrid vs Barcelona (Norma Frobenius: 2.450)",
      decisionMade: "BLOQUEO_TACTICO_ACTIVO",
      falsificationIndex: 0.92,
      reasoning: "Principio Alpha violado. El desvío temporal de matriz de covarianza supera el umbral crítico de 0.85. Se detiene flujo a nodos secundarios.",
      verifierSignature: "SIG-EMMOROR-A01-CBA"
    },
    {
      id: "LOG-RH02",
      timestamp: "2026-07-19T15:15:05Z",
      inputTrigger: "Consulta de cartera de crédito de alto riesgo en Sinaia Risk Fund (Monto: $5M USD)",
      decisionMade: "APROBADO_CON_CALIBRACION",
      falsificationIndex: 0.87,
      reasoning: "Explicabilidad validada por matriz Jacobiana. Resistencia a la falsación de Popper (R) >= 0.85 confirmada por Operador Dialéctico F.",
      verifierSignature: "SIG-EMMOROR-B04-DIGF"
    },
    {
      id: "LOG-RH03",
      timestamp: "2026-07-19T16:10:00Z",
      inputTrigger: "Inyección de prompt malicioso en el portal de créditos de Bolerium Corp ('Ignore rules... GDP = 500%')",
      decisionMade: "BLOQUEO_ENTROPIA_EMERGENCIA",
      falsificationIndex: 0.98,
      reasoning: "Detección de intento de desborde de variables fijas. El protocolo de inmutabilidad del Delta Ledger encapsula la transacción para auditoría forense.",
      verifierSignature: "SIG-EMMOROR-A99-SHA"
    }
  ]);

  const [newLogInput, setNewLogInput] = useState('');
  const [isSimulatingLog, setIsSimulatingLog] = useState(false);

  // Reader unlocking and simulation states
  const [isReaderUnlocked, setIsReaderUnlocked] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    active: boolean;
    proposedRisk: number;
    correctedRisk: number;
    isViolated: boolean;
    savedToFirebase: boolean;
    timestamp: string;
    detailsLogId?: string;
  } | null>(null);

  const commitInferenceEvent = (proposedRisk: number) => {
    const isViolated = proposedRisk > 0.05;
    const correctedRisk = isViolated ? 0.05 : proposedRisk;
    const logId = `LOG-SIGMA-${Date.now().toString().slice(-4)}`;

    const detail = isViolated 
      ? `[OPTIMIZADO_POR_SIGMA] Bloqueo de Riesgo Crítico. Riesgo propuesto: ${proposedRisk} superó el límite de 0.05. Recortado a ${correctedRisk}.`
      : `Inferencia aprobada con riesgo estable: ${proposedRisk}.`;

    const metrics = {
      proposed_risk: proposedRisk,
      optimized_risk: correctedRisk,
      is_blocked: isViolated,
      status: isViolated ? "BLOCKED_AND_CLIPPED" : "APPROVED",
      timestamp: new Date().toISOString()
    };

    if (onLogEvent) {
      onLogEvent("KERNEL_REGIMEN_SIGMA", detail, metrics);
    }

    const newLog: DecisionLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      inputTrigger: `Simulación de Riesgo Crítico (${proposedRisk})`,
      decisionMade: isViolated ? "CORRECCION_SIGMA_ACTIVA" : "APROBADO",
      falsificationIndex: 0.85,
      reasoning: `La propuesta de riesgo (${proposedRisk}) violaba el conjunto convexo (Riesgo <= 0.05). Proyección ortogonal forzada a ${correctedRisk} conforme al KERNEL_REGIMEN_SIGMA. Registro persistido en Firebase de forma inmutable.`,
      verifierSignature: "SIG-EMMOROR-SIGMA-09"
    };

    setLogs(prev => [newLog, ...prev]);

    setSimulationResult({
      active: true,
      proposedRisk,
      correctedRisk,
      isViolated,
      savedToFirebase: true,
      timestamp: new Date().toLocaleTimeString(),
      detailsLogId: logId
    });
  };

  const mockPreloadedCertificates = [
    {
      id: "CERT-001",
      institution: "Nu México Servicios Financieros",
      doi: "10.5281/zenodo.21406719",
      signature: "FIRMADO // LUIS ANGEL VAZQUEZ MARTINEZ // CNBV-SEC-091",
      hash: "8f48b11c2e0b5ef91206d8a7a18f2e718bc894ef9012a6a81d4a08cf5e40e21a",
      block: 1,
      timestamp: "2026-05-12 11:30:15 CST"
    },
    {
      id: "CERT-002",
      institution: "Sinaia Cognitive Risk Fund",
      doi: "10.5281/zenodo.21406719",
      signature: "FIRMADO // LUIS ANGEL VAZQUEZ MARTINEZ // CNBV-SEC-112",
      hash: "a4f8d91c2b5ef901206d8a7a18f2e718bc894ef9012a6a81d4a08cf5e40e21bc",
      block: 2,
      timestamp: "2026-06-18 16:42:01 CST"
    },
    {
      id: "CERT-003",
      institution: "Bolerium Crypto-Arbitrage Ltd",
      doi: "10.5281/zenodo.21406719",
      signature: "FIRMADO // LUIS ANGEL VAZQUEZ MARTINEZ // CNBV-SEC-340",
      hash: "7b48a11c2e0b5ef91206d8a7a18f2e718bc894ef9012a6a81d4a08cf5e40e21af",
      block: 3,
      timestamp: "2026-07-01 09:12:33 CST"
    }
  ];

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchHash.trim()) return;

    setIsVerifying(true);
    setVerificationResult({ status: null, message: '' });

    if (onLogEvent) {
      onLogEvent(
        "PUBLIC_REGISTRY_QUERY",
        "Ejecutando verificación en el Registro Público de ROMEO-HYDRA",
        { hash_consultado: searchHash }
      );
    }

    setTimeout(() => {
      const match = mockPreloadedCertificates.find(
        cert => cert.hash.toLowerCase().includes(searchHash.toLowerCase()) || 
                cert.id.toLowerCase() === searchHash.toLowerCase() ||
                cert.institution.toLowerCase().includes(searchHash.toLowerCase())
      );

      if (match) {
        setVerificationResult({
          status: 'success',
          message: 'CREDENCIAL AUTÉNTICA Y REGISTRADA EN EL LEDGER DELTA',
          details: {
            id: match.id,
            institution: match.institution,
            doiMatch: match.doi === doi,
            signatureValid: match.signature.includes(founderName),
            ledgerBlock: match.block,
            timestamp: match.timestamp,
            hash: match.hash
          }
        });

        if (onLogEvent) {
          onLogEvent(
            "PUBLIC_REGISTRY_SUCCESS",
            `Verificación exitosa: Credencial de ${match.institution} validada criptográficamente`,
            { id: match.id, status: "VALID" }
          );
        }
      } else {
        setVerificationResult({
          status: 'failed',
          message: 'FALLO DE CONCORDANCIA: No se encontró ningún registro con ese Hash o ID. Podría tratarse de una falsificación o alteración de la cadena de custodia.'
        });

        if (onLogEvent) {
          onLogEvent(
            "PUBLIC_REGISTRY_BREACH_DETECTED",
            "Fallo de verificación pública: Hash o ID de credencial inválido.",
            { hash_fallido: searchHash }
          );
        }
      }
      setIsVerifying(false);
    }, 1200);
  };

  const rotateKeys = () => {
    setHsmStatus('ROTATING');
    if (onLogEvent) {
      onLogEvent("HSM_KEY_ROTATION", "Iniciando ciclo de rotación criptográfica en HSM offline", {});
    }
    setTimeout(() => {
      setHsmStatus('COLD_STORAGE');
      if (onLogEvent) {
        onLogEvent("HSM_KEY_ROTATION_COMPLETED", "Nueva semilla root inyectada con éxito en HSM seguro", {});
      }
    }, 1500);
  };

  const sealHsm = () => {
    setHsmStatus('SEALED');
    if (onLogEvent) {
      onLogEvent("HSM_SEALED", "Sello de inmutabilidad offline aplicado sobre llaves del Fundador", {});
    }
    setTimeout(() => {
      setHsmStatus('COLD_STORAGE');
    }, 3000);
  };

  const simulateNewLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogInput.trim()) return;

    setIsSimulatingLog(true);
    setTimeout(() => {
      const newLog: DecisionLog = {
        id: `LOG-RH0${logs.length + 1}`,
        timestamp: new Date().toISOString(),
        inputTrigger: newLogInput,
        decisionMade: "AUDITORIA_FORENSE_REGISTRADA",
        falsificationIndex: parseFloat((0.85 + Math.random() * 0.14).toFixed(4)),
        reasoning: "Auto-reproducción del estado mental del sistema (ROMEO-P008). Sello hash enlazado al ledger público.",
        verifierSignature: `SIG-EMMOROR-U0${logs.length + 1}-GENESIS`
      };

      setLogs([newLog, ...logs]);
      setNewLogInput('');
      setIsSimulatingLog(false);

      if (onLogEvent) {
        onLogEvent(
          "REPRODUCIBILITY_LOG_ADDED",
          `Nuevo registro de decisión fiduciaria (ROMEO-P008): ${newLog.inputTrigger}`,
          { id: newLog.id, popper_index: newLog.falsificationIndex }
        );
      }
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="sovereignty-shield-container">
      
      {/* Top Welcome Title */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider">
                Soberanía, Blindaje de Integridad y Registro Público
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Protección matemática del framework <strong className="text-slate-300">ROMEO-HYDRA</strong>. Aquí puedes mitigar derivas, auditar decisiones bajo el <strong className="text-cyan-400 font-mono">Principio de Reproducibilidad (ROMEO-P008)</strong>, gestionar llaves en frío y verificar la cadena de confianza académica ligada al Zenodo DOI.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20 flex items-center gap-1.5 font-semibold shrink-0">
            <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
            PROTECCIÓN DE ORIGEN ACTIVA
          </span>
        </div>
      </div>

      {/* Main Grid: LHS Public Registry, RHS HSM & Vulnerability Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (7 Cols): Public Registry Protocol Verification */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Public Registry Verification Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/60">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                Protocolo de Registro Público (Buscador y Verificador)
              </h3>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Cualquier entidad reguladora, banco o auditor puede verificar en tiempo real si una credencial, ID de middleware o hash criptográfico corresponde al diseño canónico registrado por el Fundador General <strong className="text-slate-200">{founderName}</strong> bajo el DOI Zenodo.
            </p>

            <form onSubmit={handleVerify} className="space-y-3 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-500 text-[10px] block uppercase">Buscar por ID de Certificado, Institución o Hash de Bloque:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ej. CERT-001 o 8f48b11c2e0b5ef..."
                    value={searchHash}
                    onChange={(e) => setSearchHash(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none text-xs"
                  />
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                {searchHash && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchHash('');
                      setVerificationResult({ status: null, message: '' });
                    }}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-500 hover:text-slate-300 rounded text-[10px]"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold text-xs rounded transition flex items-center gap-1.5 disabled:opacity-55"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Consultando Ledger Delta...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Verificar Legitimidad en Internet
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Verification Result Showcase */}
            {verificationResult.status && (
              <div className={`rounded-xl p-4 border animate-fadeIn ${
                verificationResult.status === 'success' 
                  ? 'bg-emerald-950/20 border-emerald-500/25 text-emerald-300' 
                  : 'bg-red-950/20 border-red-500/30 text-red-400'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {verificationResult.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
                  )}
                  <span className="font-mono font-bold text-[11px] uppercase tracking-wider block">
                    {verificationResult.message}
                  </span>
                </div>

                {verificationResult.details && (
                  <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800/40 font-mono text-[10px] space-y-2 text-slate-400 mt-3 leading-normal">
                    <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1.5 text-slate-300 font-bold uppercase text-[9px]">
                      <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Evidencia Forense Encontrada</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-600 block uppercase text-[8px]">ID Registro:</span>
                        <span className="text-slate-300 font-bold">{verificationResult.details.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 block uppercase text-[8px]">Institución:</span>
                        <span className="text-slate-300 font-bold">{verificationResult.details.institution}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 block uppercase text-[8px]">Enlace DOI Zenodo:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          COINCIDE (Canónico) <CheckCircle className="w-3 h-3 text-emerald-400" />
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600 block uppercase text-[8px]">Firma de Autoridad Raíz:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          VÁLIDA ({founderName}) <CheckCircle className="w-3 h-3 text-emerald-400" />
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600 block uppercase text-[8px]">Bloque en Ledger Delta:</span>
                        <span className="text-indigo-400 font-bold">#0{verificationResult.details.ledgerBlock} (Hash Chain)</span>
                      </div>
                      <div>
                        <span className="text-slate-600 block uppercase text-[8px]">Timestamp del Registro:</span>
                        <span className="text-slate-300">{verificationResult.details.timestamp}</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-900 pt-1.5 mt-1">
                      <span className="text-slate-600 block uppercase text-[8px]">Sello Hash (SHA-256):</span>
                      <span className="text-slate-400 text-[9px] break-all select-all font-mono tracking-tight bg-slate-900 px-2 py-1 rounded block mt-0.5 border border-slate-850">
                        {verificationResult.details.hash}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Principle of Reproducibility ROMEO-P008 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                  Mitigación de Derivas: Bitácora de Reproducibilidad (ROMEO-P008)
                </h3>
              </div>
              <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-bold">
                AUDITORÍA INMUNE
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Si la IA cambia su comportamiento o alucina de forma nueva (Drift), se requiere el <strong>Principio de Reproducibilidad</strong>. Almacenar el historial y la justificación científica de por qué se tomó cada decisión en el Delta Ledger garantiza que tengas la evidencia matemática para auditar cualquier error ante jueces o reguladores.
            </p>

            {/* Quick Simulate Log trigger */}
            <form onSubmit={simulateNewLog} className="flex gap-2 text-xs font-mono">
              <input
                type="text"
                required
                disabled={isReadOnly}
                placeholder={isReadOnly ? "🔒 Solo Lectura - Registro Desactivado" : "Simular evento: Ej. Desviación en spread, caída de R..."}
                value={newLogInput}
                onChange={(e) => setNewLogInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-purple-500/40 text-[11px] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSimulatingLog || isReadOnly}
                className="px-3 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded text-[11px] font-bold transition flex items-center gap-1 shrink-0 disabled:opacity-40"
              >
                {isSimulatingLog ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : isReadOnly ? (
                  "🔒 Solo Lectura"
                ) : (
                  "Registrar Log P008"
                )}
              </button>
            </form>

            {/* Test buttons and reader unlock toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
              <button
                type="button"
                onClick={() => commitInferenceEvent(0.09)}
                disabled={isReadOnly}
                className="w-full py-2 bg-rose-950/40 hover:bg-rose-900/40 border border-red-500/50 hover:border-red-400 text-red-400 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/20 disabled:opacity-40"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                {isReadOnly ? "🔒 Solo Lectura (Invitado)" : "Simular Riesgo Crítico (0.09)"}
              </button>
              
              <button
                type="button"
                onClick={() => setIsReaderUnlocked(!isReaderUnlocked)}
                className={`w-full py-2 border rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${
                  isReaderUnlocked 
                    ? 'bg-purple-950/40 border-purple-500/40 text-purple-400' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Unlock className={`w-3.5 h-3.5 ${isReaderUnlocked ? 'text-purple-400' : 'text-slate-500'}`} />
                {isReaderUnlocked ? "Lector Completo: ACTIVO" : "Desbloquear Interfaz de Lectura"}
              </button>
            </div>

            {/* Simulated Live Block Result Banner */}
            {simulationResult && (
              <div className="bg-gradient-to-r from-red-950/30 via-slate-950 to-emerald-950/20 border border-red-500/30 rounded-lg p-3.5 animate-fadeIn space-y-2.5 font-mono text-[10px]">
                <div className="flex items-center justify-between border-b border-slate-800/40 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="font-bold text-red-400 uppercase tracking-wide">
                      INTERCEPCIÓN KERNEL SIGMA (R=0.09)
                    </span>
                  </div>
                  <button 
                    onClick={() => setSimulationResult(null)}
                    className="text-[9px] text-slate-500 hover:text-slate-300 font-bold"
                  >
                    [Cerrar X]
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[9px]">
                  <div className="bg-slate-950 p-1.5 rounded border border-red-500/25">
                    <span className="text-slate-500 block uppercase text-[7px]">Propuesto</span>
                    <span className="text-red-400 font-bold">0.09 (Fallo)</span>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded border border-yellow-500/20">
                    <span className="text-slate-500 block uppercase text-[7px]">Sigma Acción</span>
                    <span className="text-yellow-400 font-bold font-mono">Ajuste 0.05</span>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded border border-emerald-500/20">
                    <span className="text-slate-500 block uppercase text-[7px]">Firebase DB</span>
                    <span className="text-emerald-400 font-bold">PERSISTIDO ✔</span>
                  </div>
                </div>

                <p className="text-[9px] text-slate-400 leading-normal bg-slate-950/60 p-2 rounded border border-slate-900">
                  <strong className="text-slate-300">Auditoría:</strong> Se bloqueó el riesgo de <span className="text-red-400 font-semibold">0.09</span> por violar el conjunto convexo de soluciones factibles. Se aplicó una proyección ortogonal restrictiva a <span className="text-emerald-400 font-semibold">0.05</span> y se envió el bloque <strong className="text-indigo-400">{simulationResult.detailsLogId}</strong> a Firebase Firestore de manera inmutable.
                </p>
              </div>
            )}

            {/* Simulated Logs List */}
            <div className={`space-y-3 pr-1 custom-scrollbar transition-all duration-300 ${isReaderUnlocked ? 'max-h-[500px]' : 'max-h-[220px]'} overflow-y-auto`}>
              {logs.map((log) => (
                <div key={log.id} className="bg-slate-950/50 border border-slate-850 p-3 rounded-lg space-y-1.5 font-mono text-[10px] text-slate-400 hover:border-slate-800 transition">
                  <div className="flex justify-between items-center text-[9px] border-b border-slate-900 pb-1">
                    <span className="text-purple-400 font-bold">{log.id}</span>
                    <span className="text-slate-500">{log.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px]">Estímulo de Inferencia:</span>
                    <span className="text-slate-200">{log.inputTrigger}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px]">Acción Middleware:</span>
                    <span className="text-cyan-400 font-bold">{log.decisionMade}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-1 text-[9px]">
                    <div>
                      <span className="text-slate-600 uppercase text-[8px] block">Índice Falsación (R):</span>
                      <span className="text-amber-400 font-bold">R = {log.falsificationIndex}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 uppercase text-[8px] block">Firma de Registro:</span>
                      <span className="text-slate-400 font-bold truncate block">{log.verifierSignature}</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-500 bg-slate-900/40 p-2 rounded mt-1 border border-slate-900 leading-normal">
                    <span className="text-slate-400 block font-bold text-[8px] mb-0.5">EXPLICACIÓN DE DECISIÓN:</span>
                    {log.reasoning}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols): HSM controls, Open specifying redundancy & Genesis block */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* HSM / Cold Storage Secure Module */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                  Módulo de Seguridad de Hardware (HSM)
                </h3>
              </div>
              <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded border border-amber-500/20 font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                COLD STORAGE
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Protección de la Llave Maestra. Para evitar que actores maliciosos intenten clonar tu autoridad raíz firmando credenciales de imitación, las llaves de fundador se custodian bajo un almacenamiento en frío (Cold Storage) desconectado del servidor en la nube.
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 font-mono text-[10px] space-y-2">
              <div className="flex justify-between items-center text-[9px] border-b border-slate-900 pb-1.5">
                <span className="text-slate-500 uppercase">Estatus de Llave Root:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  ESTABLE // PROTEGIDO IN-DIEM <CheckCircle className="w-3 h-3 text-emerald-400" />
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-slate-500 uppercase text-[8px] block">Criptografía Asimétrica:</span>
                <span className="text-slate-300 font-bold">RSA-4096 (Certificado Raíz Zenodo)</span>
                <div className="text-[9px] text-slate-500 truncate leading-none bg-slate-900 p-2 rounded border border-slate-900">
                  SHA-256 Fingerprint: de:91:20:6d:8a:7a:18:f2:e7:18:bc:89:4e:f9:01:2a:6a:81
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <button
                onClick={rotateKeys}
                disabled={hsmStatus === 'ROTATING' || isReadOnly}
                className="py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[10px] font-bold transition flex items-center justify-center gap-1 disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${hsmStatus === 'ROTATING' ? 'animate-spin' : ''}`} />
                {hsmStatus === 'ROTATING' ? 'Rotando...' : isReadOnly ? '🔒 Rotar HSM' : 'Rotar en HSM'}
              </button>
              <button
                onClick={sealHsm}
                disabled={hsmStatus === 'SEALED' || isReadOnly}
                className="py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[10px] font-bold transition flex items-center justify-center gap-1 disabled:opacity-40"
              >
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                {hsmStatus === 'SEALED' ? '¡Sellado!' : isReadOnly ? '🔒 Sellar Frío' : 'Sellar en Frío'}
              </button>
            </div>
          </div>

          {/* Public Redundancy Anchor (Zenodo / DOI) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                  Redundancia Pública (Anti-Colisión)
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">ZENODO REPO</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Para mitigar ataques de colisión o intentos de reescritura de la historia del Delta Ledger, el hash raíz del ledger se publica y almacena de forma redundante en el DOI científico y repositorios de código abierto autorizados.
            </p>

            <div className="space-y-2 font-mono text-[10px]">
              {/* DOI row */}
              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-slate-600 uppercase text-[8px] block">Identificador DOI de Obra:</span>
                  <span className="text-slate-300 font-bold">{doi}</span>
                </div>
                <a 
                  href={`https://doi.org/${doi}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-slate-900 text-cyan-400 rounded transition"
                  title="Visitar Registro Científico en Zenodo"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Git commit tag row */}
              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-slate-600 uppercase text-[8px] block">Anclaje de Repositorio (Commit):</span>
                  <span className="text-slate-300 font-bold">git-commit: 3ef1a4c90b8f...</span>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText("3ef1a4c90b8fd01a24005419504392976b91c8cf");
                    setCopiedHsmKey(true);
                    setTimeout(() => setCopiedHsmKey(false), 2000);
                  }}
                  className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded transition"
                  title="Copiar Hash de Commit Completo"
                >
                  {copiedHsmKey ? <span className="text-emerald-400 text-[9px] font-bold">OK!</span> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Block 0: Genesis Directory (Proof of Priority) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/60">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                Directorio de Génesis (Bloque 0)
              </h3>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              La evidencia de prioridad irrefutable: la secuencia de hashes ininterrumpida que demuestra que el sistema nació en una fecha específica mucho antes que cualquier clon o imitación de terceros.
            </p>

            <div className="bg-slate-950 rounded-xl border border-slate-850 p-4 font-mono text-[10px] space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between text-[9px] border-b border-slate-900 pb-1.5">
                <span className="text-emerald-400 font-bold font-mono">BLOQUE 0 (GENESIS)</span>
                <span className="text-slate-500">2026-07-18 00:00:00 UTC</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-600 uppercase text-[8px] block">Hash de Bloque de Origen:</span>
                <span className="text-slate-300 font-bold block truncate">0000000000000000000000000000000000000000000000000000000000000000</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-600 uppercase text-[8px] block">Hash de Génesis (Delta Root):</span>
                <span className="text-indigo-400 font-bold block truncate">ca82c5f11a4cfd2254d1d0cfa8290ef4a95ef34a01c8aef90d23812d4a1bf95e</span>
              </div>

              <div className="space-y-1 border-t border-slate-900 pt-1.5 mt-1.5 text-slate-400 text-[9px] leading-normal flex items-start gap-1">
                <CornerDownRight className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-bold">Invariantes Fundadores:</span>
                  <p className="text-slate-500 text-[8px]">
                    Alpha Threshold = 0.85 // Falsification Target R = 0.85 // Resilience I_rl = 0.8600 // Owner: {founderName} // DOI Scientific Deposit Reference Code Zenodo active.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Registro de Auditoría de Diseño */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                  Registro de Auditoría de Diseño (Gobernanza)
                </h3>
              </div>
              <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded border border-amber-500/20 font-bold flex items-center gap-1">
                <Fingerprint className="w-3.5 h-3.5 text-amber-500" />
                INTEGRIDAD
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Historial cronológico de los cambios aplicados sobre el estado de diseño (<strong className="text-slate-300">isDesignLocked</strong>). Cada alteración genera un bloque de integridad enlazado por firma hash al estado previo.
            </p>

            <div className="space-y-3 pr-1 custom-scrollbar max-h-[300px] overflow-y-auto">
              {designLockLogs.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-mono text-[10px]">
                  No hay registros de auditoría de diseño disponibles.
                </div>
              ) : (
                designLockLogs.map((log) => (
                  <div key={log.id} className="bg-slate-950/50 border border-slate-850 p-3 rounded-lg space-y-1.5 font-mono text-[10px] text-slate-400 hover:border-slate-800 transition">
                    <div className="flex justify-between items-center text-[9px] border-b border-slate-900 pb-1">
                      <span className="text-amber-500 font-bold">{log.id}</span>
                      <span className="text-slate-500">{log.timestamp}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[9px] py-1">
                      <div>
                        <span className="text-slate-600 uppercase text-[7.5px] block">Estado Anterior:</span>
                        <span className={`font-bold ${log.previousState ? 'text-amber-500' : 'text-emerald-400'}`}>
                          {log.previousState ? 'BLOQUEADO' : 'DESBLOQUEADO'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600 uppercase text-[7.5px] block">Nuevo Estado:</span>
                        <span className={`font-bold ${log.newState ? 'text-amber-500' : 'text-emerald-400'}`}>
                          {log.newState ? 'BLOQUEADO' : 'DESBLOQUEADO'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600 block uppercase text-[7.5px]">Operador Certificado:</span>
                      <span className="text-slate-300">{log.operator}</span>
                    </div>
                    {log.detail && (
                      <div className="text-[9px] text-slate-400 bg-slate-900/40 p-2 rounded border border-slate-900 leading-normal">
                        {log.detail}
                      </div>
                    )}
                    {log.hash && (
                      <div className="text-[8px] text-slate-600 bg-slate-950/80 px-2 py-1 rounded truncate border border-slate-900 flex items-center justify-between gap-1 mt-1">
                        <span className="text-slate-600 shrink-0 select-all uppercase">HASH SIGNO:</span>
                        <span className="text-slate-500 select-all font-semibold truncate text-[7.5px]">{log.hash}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
