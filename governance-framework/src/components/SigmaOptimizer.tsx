import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Sliders, 
  Cpu, 
  Database, 
  Code, 
  Sparkles, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Clipboard,
  RefreshCw,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useZordDegradation, ZordsState } from '../hooks/useZordDegradation';

interface SigmaOptimizerProps {
  onLogEvent?: (source: string, detail: string, metrics: Record<string, any>) => void;
  isReadOnly?: boolean;
}

export const SigmaOptimizer: React.FC<SigmaOptimizerProps> = ({ onLogEvent, isReadOnly = false }) => {
  const {
    activeZords,
    toggleZord,
    systemStatus,
    isKernelSigmaActive,
    isDeltaLedgerActive,
    isSensorsActive,
    isIAMActive,
    isDashboardActive
  } = useZordDegradation();

  const handleToggleZord = (name: keyof ZordsState) => {
    if (isReadOnly) {
      alert("Operación de control rechazada: El rol de invitado está limitado a solo lectura en la infraestructura Sigma.");
      return;
    }
    toggleZord(name, onLogEvent);
  };

  // Input states
  const [proposedInference, setProposedInference] = useState<string>("Sindicación de spread deportivo bajo shock de liquidez Sinaia");
  const [proposedR, setProposedR] = useState<number>(0.72); // Violates R >= 0.85
  const [proposedRisk, setProposedRisk] = useState<number>(0.12); // Violates Risk <= 0.05
  
  // Weights (ROMEO-P008)
  const [wSports, setWSports] = useState<number>(0.50);
  const [wFinancial, setWFinancial] = useState<number>(0.30);
  const [wExposure, setWExposure] = useState<number>(0.20);
  const [autoBalance, setAutoBalance] = useState<boolean>(true);

  // Output states
  const [optimizedR, setOptimizedR] = useState<number>(0.85);
  const [optimizedRisk, setOptimizedRisk] = useState<number>(0.05);
  const [optimizedWeights, setOptimizedWeights] = useState<{ sports: number; financial: number; exposure: number }>({
    sports: 0.50,
    financial: 0.30,
    exposure: 0.20
  });

  const [isFeasible, setIsFeasible] = useState<boolean>(false);
  const [clipLogs, setClipLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [commitSuccess, setCommitSuccess] = useState<boolean>(false);
  const [commitDetails, setCommitDetails] = useState<any>(null);

  // Auto-balance weights if active
  useEffect(() => {
    if (autoBalance) {
      const sum = wSports + wFinancial + wExposure;
      if (sum !== 1.0 && sum > 0) {
        setOptimizedWeights({
          sports: parseFloat((wSports / sum).toFixed(4)),
          financial: parseFloat((wFinancial / sum).toFixed(4)),
          exposure: parseFloat((wExposure / sum).toFixed(4))
        });
      } else {
        setOptimizedWeights({ sports: wSports, financial: wFinancial, exposure: wExposure });
      }
    } else {
      setOptimizedWeights({ sports: wSports, financial: wFinancial, exposure: wExposure });
    }
  }, [wSports, wFinancial, wExposure, autoBalance]);

  // Main Sigma optimization logic with Zord Degradation support
  useEffect(() => {
    if (!isKernelSigmaActive) {
      setIsFeasible(false);
      setOptimizedR(proposedR);
      setOptimizedRisk(proposedRisk);
      setClipLogs([
        `[🛑 CRITICAL_DEGRADATION] Kernel Sigma desacoplado.`,
        `[CRITICAL_ERROR] No se pueden garantizar ni calcular recortes convexos.`,
        `[ALERTA] Invariantes y límites fiduciarios en libre deriva.`
      ]);
      return;
    }

    const rViolated = proposedR < 0.85;
    const riskViolated = proposedRisk > 0.05;
    
    // IAM Zord degradation forces a block/fail if inactive
    const isIAMBlocked = !isIAMActive;
    const feasible = !rViolated && !riskViolated && !isIAMBlocked;
    setIsFeasible(feasible);

    // Apply convex projection (clipping)
    const clippedR = Math.max(proposedR, 0.85);
    const clippedRisk = Math.min(proposedRisk, 0.05);

    setOptimizedR(clippedR);
    setOptimizedRisk(clippedRisk);

    const logs: string[] = [];
    if (isIAMBlocked) {
      logs.push(`[🚨 IAM_BLOCK] Radar IAM Desactivado: Todas las solicitudes se marcan como fallidas (No Autorizado).`);
    }
    if (rViolated) {
      logs.push(`[SIGMA-WARN] Restricción de Deriva (R >= 0.85) violada. R_propuesto = ${proposedR.toFixed(2)} -> Recortando (clip) a 0.85.`);
    }
    if (riskViolated) {
      logs.push(`[SIGMA-WARN] Restricción de Riesgo Fiduciario (Riesgo <= 0.05) violada. Riesgo_propuesto = ${proposedRisk.toFixed(2)} -> Recortando (clip) a 0.05.`);
    }
    
    if (!isSensorsActive) {
      logs.push(`[⚠️ TELEMETRÍA_UNLINK] Sensores Físicos desactivados: No hay correlación ambiental infrarroja.`);
    }
    if (!isDeltaLedgerActive) {
      logs.push(`[⚠️ LEDGER_OFFLINE] Delta Ledger desactivado: Las inferencias no se guardarán permanentemente.`);
    }

    if (feasible) {
      logs.push(`[SIGMA-INFO] Inferencia se encuentra dentro del Espacio Convexo de Soluciones Factibles.`);
    } else if (isKernelSigmaActive && !isIAMBlocked) {
      logs.push(`[OPTIMIZADO_POR_SIGMA] Proyección ortogonal completada sobre el conjunto convexo.`);
    }
    setClipLogs(logs);

  }, [proposedR, proposedRisk, isKernelSigmaActive, isDeltaLedgerActive, isSensorsActive, isIAMActive]);

  const handleApplyOptimization = () => {
    if (isReadOnly) {
      alert("Operación denegada: Los invitados en modo de lectura no pueden comprometer inferencias.");
      return;
    }

    if (!isDeltaLedgerActive) {
      alert("🛑 ERROR DE PROTOCOLO DELTA: El Delta Ledger está desconectado. Sincronice el Zord 2 en el panel inferior para rearmar la cadena de bloques.");
      return;
    }

    if (onLogEvent) {
      onLogEvent(
        isKernelSigmaActive ? "OPTIMIZADO_POR_SIGMA" : "DERIVA_INFERENCIA_CRÍTICA",
        isKernelSigmaActive 
          ? `Inferencia optimizada por Kernel Sigma: "${proposedInference}"`
          : `⚠️ ADVERTENCIA: Inferencia guardada en LIBRE DERIVA (Sigma Offline): "${proposedInference}"`,
        {
          proposed_inference: proposedInference,
          feasible_initially: isFeasible,
          r_initial: proposedR,
          r_optimized: optimizedR,
          risk_initial: proposedRisk,
          risk_optimized: optimizedRisk,
          weights_p008: optimizedWeights,
          verdict: !isKernelSigmaActive 
            ? "UNPROTECTED_FREE_DRIFT" 
            : isFeasible ? "PRESERVED" : "CLIPPED_TO_CONVEX_HULL"
        }
      );
    }
    setCommitSuccess(true);
    setCommitDetails({
      timestamp: new Date().toLocaleTimeString(),
      inference: proposedInference,
      r_initial: proposedR,
      r_optimized: optimizedR,
      risk_initial: proposedRisk,
      risk_optimized: optimizedRisk,
      is_clipped: !isFeasible,
      is_unprotected: !isKernelSigmaActive
    });
  };

  const getJsonOutput = () => {
    return JSON.stringify({
      "[KERNEL_REGIMEN_SIGMA]": "OPTIMIZADO_POR_SIGMA",
      "timestamp": new Date().toISOString(),
      "status": isFeasible ? "CONVEX_FEASIBLE" : "CLIPPED_PROJECTION",
      "inference_proposal": proposedInference,
      "constraints": {
        "drift_limit_R": ">= 0.85",
        "risk_limit_fiduciary": "<= 0.05"
      },
      "proposed_state": {
        "drift_R": proposedR,
        "fiduciary_risk": proposedRisk,
        "weights_raw": [wSports, wFinancial, wExposure]
      },
      "optimized_state": {
        "drift_R": parseFloat(optimizedR.toFixed(4)),
        "fiduciary_risk": parseFloat(optimizedRisk.toFixed(4)),
        "is_clipped": !isFeasible
      },
      "reproducibility_p008": {
        "weights_justification": {
          "W_sports": optimizedWeights.sports,
          "W_financial": optimizedWeights.financial,
          "W_exposure": optimizedWeights.exposure,
          "normalization_sum": parseFloat((optimizedWeights.sports + optimizedWeights.financial + optimizedWeights.exposure).toFixed(4)),
          "mathematical_rationale": "Suma de pesos normalizada a 1.0 para cumplir con la justificación racional de invariación estructural bajo Popper (ROMEO-P008)."
        }
      }
    }, null, 2);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getJsonOutput());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Coordinates for the SVG plot representing [0.0 - 1.0] R and [0.0 - 0.20] Risk
  // R axis (X): 0.0 is left, 1.0 is right
  // Risk axis (Y): 0.0 is top (safer), 0.20 is bottom (riskier)
  // Let's draw standard SVG box of 300x200
  // Margin: 30px
  const width = 300;
  const height = 200;
  const marginX = 40;
  const marginY = 30;

  const rToX = (r: number) => marginX + r * (width - 2 * marginX);
  const riskToY = (risk: number) => {
    // scale 0.0 to 0.20 risk. Any higher will clamp to bottom for visualization
    const maxRiskVis = 0.20;
    const clamped = Math.min(risk, maxRiskVis);
    return marginY + (clamped / maxRiskVis) * (height - 2 * marginY);
  };

  // Convex Feasible area polygon coordinates
  // R >= 0.85, Risk <= 0.05
  // X range: 0.85 to 1.0
  // Y range: 0.0 to 0.05
  const polyPoints = [
    `${rToX(0.85)},${riskToY(0.0)}`,
    `${rToX(1.0)},${riskToY(0.0)}`,
    `${rToX(1.0)},${riskToY(0.05)}`,
    `${rToX(0.85)},${riskToY(0.05)}`
  ].join(' ');

  return (
    <div className="space-y-6 animate-fade-in" id="sigma-optimizer-container">
      
      {/* Warning Alert / Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/20 border border-amber-500/30 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-5 h-5 text-amber-500" />
              <span>[KERNEL REGIMEN SIGMA - OPTIMIZADOR CONVEXO ACTIVO]</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Toda evaluación de inferencia debe resolverse dentro del <strong className="text-amber-300 font-mono">Espacio Convexo de Soluciones Factibles</strong>. Si una propuesta viola el límite de deriva <strong className="text-slate-200">R &gt;= 0.85</strong> o el riesgo fiduciario <strong className="text-slate-200">Riesgo &lt;= 0.05</strong>, el kernel Sigma recortará la decisión de inmediato y emitirá un log de auditoría inmutable.
            </p>
          </div>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono rounded font-bold uppercase shrink-0">
            L0 RESTRICTIONS ENFORCED
          </span>
        </div>
      </div>

      {/* REAL-TIME HEALTH MONITORING VISUALIZER OF MEG_ZORDS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3" id="realtime-zords-monitoring">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${Object.values(activeZords).filter(Boolean).length === 5 ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${Object.values(activeZords).filter(Boolean).length === 5 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">
              MONITOR DE INTEGRIDAD DE ZORDS EN TIEMPO REAL
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 font-bold">
            ESTADO: <span className={systemStatus.color}>{systemStatus.label.toUpperCase()}</span>
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { key: 'Kernel Sigma', label: 'ZORD 1: KERNEL SIGMA', active: isKernelSigmaActive, desc: 'Optimización matemática', failMsg: 'Clipping desactivado (Libre deriva)' },
            { key: 'Delta Ledger', label: 'ZORD 2: DELTA LEDGER', active: isDeltaLedgerActive, desc: 'Blockchain inmutable', failMsg: 'Escritura deshabilitada' },
            { key: 'Sensores Físicos', label: 'ZORD 3: SENSORES FÍSICOS', active: isSensorsActive, desc: 'Telemetría y proximidad', failMsg: 'Sin correlación ambiental' },
            { key: 'Radar IAM', label: 'ZORD 4: RADAR IAM', active: isIAMActive, desc: 'Identidad ≠ Autorización', failMsg: 'Todas las firmas rechazadas' },
            { key: 'Audit Dashboard', label: 'ZORD 5: AUDIT DASHBOARD', active: isDashboardActive, desc: 'Visualización ASCII', failMsg: 'Consola fuera de servicio' },
          ].map((zord) => (
            <div 
              key={zord.key}
              onClick={() => handleToggleZord(zord.key as any)}
              className={`p-3 rounded-lg border font-mono text-[11px] transition-all duration-300 flex flex-col justify-between h-20 cursor-pointer select-none ${
                zord.active 
                  ? 'bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400' 
                  : 'bg-red-950/10 border-red-500/20 hover:border-red-500/40 text-red-400'
              }`}
              title={`Clic para ${zord.active ? 'desacoplar' : 'sincronizar'} ${zord.key}`}
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-[9px] text-slate-400 uppercase">{zord.label}</span>
                <span className={`w-2 h-2 rounded-full ${zord.active ? 'bg-emerald-400' : 'bg-red-500 animate-pulse'}`} />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-200 block font-medium">
                  {zord.active ? '🟢 OPERACIONAL' : '🔴 DESACOPLADO'}
                </span>
                <span className="text-[8.5px] text-slate-500 block truncate">
                  {zord.active ? zord.desc : zord.failMsg}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Sliders and proposed state config */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/60">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                Configurar Inferencia Propuesta
              </h3>
            </div>

            {/* Inference input */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-slate-500 text-[10px] uppercase">Declaración / Acción Propuesta:</label>
              <textarea
                value={proposedInference}
                onChange={(e) => setProposedInference(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:border-cyan-500 focus:outline-none text-xs leading-relaxed h-14"
                placeholder="Ej. Ejecutar arbitraje deportivo con spread de pánico..."
              />
            </div>

            {/* Drift R Slider */}
            <div className="space-y-2 font-mono text-xs bg-slate-950/40 p-3 rounded-lg border border-slate-850">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                  Resistencia de Falsación (R) 
                  <span className={`w-2 h-2 rounded-full ${proposedR >= 0.85 ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                </span>
                <span className={`font-bold ${proposedR >= 0.85 ? 'text-emerald-400' : 'text-red-400'}`}>
                  R = {proposedR.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="1.00"
                step="0.01"
                value={proposedR}
                onChange={(e) => setProposedR(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-600">
                <span>Inestable (&lt;0.85)</span>
                <span className="text-cyan-500/80 font-bold">Límite: 0.85</span>
                <span>Falsación Perfecta (1.00)</span>
              </div>
            </div>

            {/* Fiduciary Risk Slider */}
            <div className="space-y-2 font-mono text-xs bg-slate-950/40 p-3 rounded-lg border border-slate-850">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
                  Riesgo Fiduciario Financiero
                  <span className={`w-2 h-2 rounded-full ${proposedRisk <= 0.05 ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                </span>
                <span className={`font-bold ${proposedRisk <= 0.05 ? 'text-emerald-400' : 'text-red-400'}`}>
                  Riesgo = {(proposedRisk * 100).toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="0.00"
                max="0.20"
                step="0.005"
                value={proposedRisk}
                onChange={(e) => setProposedRisk(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-600">
                <span>Sin Riesgo (0.00)</span>
                <span className="text-amber-500/80 font-bold">Máx L0: 5%</span>
                <span>Riesgo Alto (20%)</span>
              </div>
            </div>

            {/* Weight Allocation sliders (ROMEO-P008) */}
            <div className="space-y-3 font-mono text-xs bg-slate-950/20 border border-slate-800 p-3.5 rounded-lg">
              <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Asignación de Pesos (P008)</span>
                <label className="flex items-center gap-1.5 text-[9px] text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBalance}
                    onChange={(e) => setAutoBalance(e.target.checked)}
                    className="accent-purple-500 rounded"
                  />
                  Auto-Normalizar a 1.0
                </label>
              </div>

              {/* Slider Sports weight */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-500">W_sports (Deportes)</span>
                  <span className="text-slate-300 font-bold">{optimizedWeights.sports.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={wSports}
                  onChange={(e) => setWSports(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-1"
                />
              </div>

              {/* Slider Financial weight */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-500">W_financial (Finanzas)</span>
                  <span className="text-slate-300 font-bold">{optimizedWeights.financial.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={wFinancial}
                  onChange={(e) => setWFinancial(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-1"
                />
              </div>

              {/* Slider Exposure weight */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-500">W_exposure (EMMOROR)</span>
                  <span className="text-slate-300 font-bold">{optimizedWeights.exposure.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={wExposure}
                  onChange={(e) => setWExposure(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-1"
                />
              </div>
            </div>

          </div>

          <button
            onClick={handleApplyOptimization}
            disabled={isReadOnly}
            className={`w-full py-2.5 text-xs font-mono rounded-lg transition tracking-wider flex items-center justify-center gap-2 mt-4 font-bold ${
              isReadOnly 
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60' 
                : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/10'
            }`}
          >
            {isReadOnly ? (
              <>
                <Info className="w-4 h-4 text-slate-500" />
                🔒 SOLO LECTURA (MODO INVITADO ACTIVO)
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-slate-950" />
                COMPROMETER INFERENCIA OPTIMIZADA
              </>
            )}
          </button>

          {commitSuccess && commitDetails && (
            <div className="bg-gradient-to-r from-slate-950 to-emerald-950/20 border border-emerald-500/30 rounded-lg p-3 mt-3 animate-fadeIn space-y-2 font-mono text-[10px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <span className="font-bold text-emerald-400 uppercase tracking-wide">
                  ✔ INFERENCIA ENVIADA AL LEDGER
                </span>
                <span className="text-slate-500 text-[8px]">{commitDetails.timestamp}</span>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 leading-normal">
                  <span className="text-slate-500 uppercase block text-[8px]">Inferencia:</span>
                  "{commitDetails.inference}"
                </p>
                <div className="grid grid-cols-2 gap-2 text-center text-[9px] pt-1">
                  <div className="bg-slate-950 p-1 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[7px] uppercase">R_Deriva (Propuesto &rarr; Optimizado)</span>
                    <span className="text-slate-300 font-bold">{commitDetails.r_initial.toFixed(2)} &rarr; {commitDetails.r_optimized.toFixed(2)}</span>
                  </div>
                  <div className="bg-slate-950 p-1 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[7px] uppercase">Riesgo (Propuesto &rarr; Optimizado)</span>
                    <span className={`font-bold ${commitDetails.is_clipped ? 'text-yellow-400' : 'text-slate-300'}`}>
                      {commitDetails.risk_initial.toFixed(2)} &rarr; {commitDetails.risk_optimized.toFixed(2)}
                    </span>
                  </div>
                </div>
                {commitDetails.is_clipped && (
                  <p className="text-yellow-400 text-[8px] bg-yellow-950/20 border border-yellow-500/10 p-1.5 rounded mt-1">
                    ⚠️ Riesgo propuesto ({commitDetails.risk_initial.toFixed(2)}) excedió el límite de 0.05. Kernel Sigma aplicó un recorte ortogonal a 0.05 y persistió el bloque seguro en Firebase.
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* MIDDLE COLUMN: SVG Convex Hull Projection Chart */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/60">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                Mapeo de Conjunto Convexo
              </h3>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal font-sans">
              La región verde representa el espacio fiduciario seguro. Si el punto propuesto <span className="text-red-400 font-bold">(Rojo)</span> cae fuera, se proyecta ortogonalmente al punto óptimo viable <span className="text-emerald-400 font-bold">(Verde)</span>.
            </p>

            {/* SVG Plot */}
            <div className="bg-slate-950 border border-slate-850 p-2 rounded-lg flex items-center justify-center">
              <svg width={width} height={height} className="overflow-visible font-mono">
                {/* Background Grid Lines */}
                <line x1={rToX(0)} y1={riskToY(0)} x2={rToX(1)} y2={riskToY(0)} stroke="#1e293b" strokeWidth="1" />
                <line x1={rToX(0)} y1={riskToY(0.05)} x2={rToX(1)} y2={riskToY(0.05)} stroke="#334155" strokeDasharray="3,3" strokeWidth="1" />
                <line x1={rToX(0)} y1={riskToY(0.20)} x2={rToX(1)} y2={riskToY(0.20)} stroke="#1e293b" strokeWidth="1" />
                
                <line x1={rToX(0)} y1={riskToY(0)} x2={rToX(0)} y2={riskToY(0.20)} stroke="#1e293b" strokeWidth="1" />
                <line x1={rToX(0.85)} y1={riskToY(0)} x2={rToX(0.85)} y2={riskToY(0.20)} stroke="#334155" strokeDasharray="3,3" strokeWidth="1" />
                <line x1={rToX(1.0)} y1={riskToY(0)} x2={rToX(1.0)} y2={riskToY(0.20)} stroke="#1e293b" strokeWidth="1" />

                {/* Shaded Feasible Region */}
                <polygon 
                  points={polyPoints} 
                  fill="rgba(16, 185, 129, 0.12)" 
                  stroke="rgba(16, 185, 129, 0.4)" 
                  strokeWidth="1.5"
                />

                {/* Projection vector line (if not feasible) */}
                {!isFeasible && (
                  <line 
                    x1={rToX(proposedR)} 
                    y1={riskToY(proposedRisk)} 
                    x2={rToX(optimizedR)} 
                    y2={riskToY(optimizedRisk)} 
                    stroke="#f59e0b" 
                    strokeWidth="1.5" 
                    strokeDasharray="4,4" 
                  />
                )}

                {/* Proposed Point (Red) */}
                <circle 
                  cx={rToX(proposedR)} 
                  cy={riskToY(proposedRisk)} 
                  r="6" 
                  fill={isFeasible ? "#10b981" : "#f87171"} 
                  className={isFeasible ? "" : "animate-pulse"}
                />

                {/* Optimized projection point (Green/Cyan) */}
                {!isFeasible && (
                  <circle 
                    cx={rToX(optimizedR)} 
                    cy={riskToY(optimizedRisk)} 
                    r="6" 
                    fill="#10b981" 
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                )}

                {/* Axis Labels */}
                <text x={rToX(0)} y={riskToY(0.20) + 14} fill="#64748b" fontSize="8" textAnchor="middle">0.00</text>
                <text x={rToX(0.85)} y={riskToY(0.20) + 14} fill="#64748b" fontSize="8" textAnchor="middle">0.85</text>
                <text x={rToX(1.0)} y={riskToY(0.20) + 14} fill="#64748b" fontSize="8" textAnchor="middle">1.00</text>
                <text x={rToX(0.5)} y={riskToY(0.20) + 22} fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">RESISTENCIA FALSACIÓN (R)</text>

                {/* Y Axis Labels */}
                <text x={marginX - 6} y={riskToY(0) + 3} fill="#64748b" fontSize="8" textAnchor="end">0%</text>
                <text x={marginX - 6} y={riskToY(0.05) + 3} fill="#f59e0b" fontSize="8" textAnchor="end" fontWeight="bold">5%</text>
                <text x={marginX - 6} y={riskToY(0.20) + 3} fill="#64748b" fontSize="8" textAnchor="end">20%</text>

                <text 
                  x={12} 
                  y={height / 2} 
                  fill="#64748b" 
                  fontSize="8" 
                  textAnchor="middle" 
                  transform={`rotate(-90, 12, ${height/2})`}
                  fontWeight="bold"
                >
                  RIESGO FIDUCIARIO (%)
                </text>

                {/* Visual indicator labels */}
                {isFeasible ? (
                  <text x={rToX(0.925)} y={riskToY(0.025) + 3} fill="#10b981" fontSize="7" textAnchor="middle" fontWeight="bold">FACTIBLE</text>
                ) : (
                  <text x={rToX(proposedR)} y={riskToY(proposedRisk) - 10} fill="#f87171" fontSize="7" textAnchor="middle" fontWeight="bold">VIOLACIÓN</text>
                )}
              </svg>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 mt-4 space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Estado del Kernel:</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isFeasible ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span className={`text-[11px] font-mono font-bold ${isFeasible ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isFeasible ? "CONVEXO FACTIBLE" : "RECORTADO POR CONVEXIDAD"}
              </span>
            </div>
            <div className="text-[9.5px] font-mono text-slate-400 leading-relaxed pt-1 border-t border-slate-900">
              {clipLogs.map((log, i) => (
                <div key={i} className="flex gap-1 items-start">
                  <span className="text-amber-500 shrink-0">➔</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Output Terminal (JSON Log) */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-900 mb-4 font-mono">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">SALIDA DE AUDITORÍA JSON</span>
              </div>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded text-[9px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
                title="Copiar JSON Log"
              >
                <Clipboard className="w-3 h-3" />
                {copied ? "¡Copiado!" : "Copiar"}
              </button>
            </div>

            {/* Code Output Block */}
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-900 font-mono text-[9px] text-slate-300 overflow-x-auto max-h-[300px] overflow-y-auto leading-normal custom-scrollbar select-all">
              <pre className="text-cyan-400">
                {getJsonOutput()}
              </pre>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-3 mt-4 text-[9.5px] font-mono text-slate-500 flex justify-between items-center">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-600" />
              Principio ROMEO-P008 Validado
            </span>
            <span className="text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase text-[8px]">
              SIGMA OK
            </span>
          </div>

        </div>

      </div>

      {/* SECCIÓN VISUAL DE DEGRADACIÓN TEMPORAL DE ZORDS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4" id="zords-stress-simulation">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="space-y-1">
            <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              Sincronizador e Interruptores del Megazord ROMEO-HYDRA (Pruebas de Estrés)
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Permite desacoplar cada Zord de manera independiente para simular fallas graduales y evaluar la tolerancia a fallas.
            </p>
          </div>
          <div className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-850">
            ZORDS ACTIVOS: <strong className="text-purple-400">{Object.values(activeZords).filter(Boolean).length}/5</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            { name: 'Kernel Sigma', desc: 'Optimización y clipping convexo', color: 'text-amber-400' },
            { name: 'Delta Ledger', desc: 'Registro inmutable blockchain', color: 'text-indigo-400' },
            { name: 'Sensores Físicos', desc: 'Telemetría y Gatekeeper', color: 'text-cyan-400' },
            { name: 'Radar IAM', desc: 'Identidad ≠ Autorización', color: 'text-rose-400' },
            { name: 'Audit Dashboard', desc: 'Render ASCII "Caja Blanca"', color: 'text-emerald-400' },
          ].map((zord) => {
            const isOnline = activeZords[zord.name as keyof ZordsState];
            return (
              <div 
                key={zord.name} 
                onClick={() => handleToggleZord(zord.name as keyof ZordsState)}
                className={`p-3 rounded-lg border cursor-pointer select-none transition duration-300 font-mono text-xs flex flex-col justify-between h-28 ${
                  isOnline 
                    ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' 
                    : 'bg-red-950/10 border-red-500/30 hover:bg-red-950/20'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className={`font-bold ${zord.color}`}>{zord.name}</span>
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                  </div>
                  <p className="text-[9.5px] text-slate-500 leading-normal">{zord.desc}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-950">
                  <span className={`text-[8.5px] font-bold ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isOnline ? 'CONECTADO' : 'DEGRADADO'}
                  </span>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition duration-300 ${isOnline ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                    <div className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ${isOnline ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
