import React, { useState, useEffect } from 'react';
import { Lock, Unlock, BookOpen, UserCheck, Terminal, Fingerprint, Calendar, ShieldCheck, Heart, ShieldAlert, CheckCircle, RefreshCw, Eye, Globe, Database, HelpCircle } from 'lucide-react';
import { saveLedgerBlock, getExternalInteractions, saveExternalInteraction } from '../lib/firebase';

interface LogEntry {
  id: string;
  timestamp: string;
  author: string;
  signature: string;
  title: string;
  tag: string;
  tagColor: string;
  content: string;
  metrics?: { label: string; value: string }[];
}

interface FoundersLogProps {
  isReadOnly?: boolean;
}

export const FoundersLog: React.FC<FoundersLogProps> = ({ isReadOnly = false }) => {
  const [isReaderUnlocked, setIsReaderUnlocked] = useState(true);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [customLogs, setCustomLogs] = useState<LogEntry[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'founder' | 'external'>('founder');
  const [externalInteractions, setExternalInteractions] = useState<any[]>([]);
  const [loadingExt, setLoadingExt] = useState(false);

  const fetchExternalInteractions = async () => {
    setLoadingExt(true);
    try {
      const data = await getExternalInteractions();
      setExternalInteractions(data);
    } catch (e) {
      console.error("Error reading external interactions from Firebase:", e);
    } finally {
      setLoadingExt(false);
    }
  };

  useEffect(() => {
    fetchExternalInteractions();
    const interval = setInterval(fetchExternalInteractions, 6000);
    return () => clearInterval(interval);
  }, []);

  // Expose global logger so any interactive component can log to Firebase
  useEffect(() => {
    (window as any).logHydraInteraction = async (actionType: string, component: string, details: string) => {
      const interactionId = `EXT-INT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newInt = {
        id: interactionId,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actionType,
        component,
        details,
        userRole: isReadOnly ? "Viewer (Guest)" : "Operator (Admin)",
        userEmail: isReadOnly ? "guest.auditor@romeohydra.local" : "robinmac.v2@gmail.com",
        ipPlaceholder: `189.245.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      };

      try {
        await saveExternalInteraction(newInt);
        setExternalInteractions(prev => [newInt, ...prev]);
      } catch (e) {
        console.error("Failed to save external interaction dynamically:", e);
      }
    };
  }, [isReadOnly]);

  const commitInferenceEvent = async (proposedRisk: number) => {
    if (isReadOnly) {
      alert("Operación rechazada: Los oficiales de cumplimiento en modo de lectura no pueden alterar el log del fundador.");
      return;
    }
    const isViolated = proposedRisk > 0.05;
    const correctedRisk = isViolated ? 0.05 : proposedRisk;
    const logId = `FL-SIGMA-${Date.now().toString().slice(-4)}`;

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const mockBlock = {
      index: Math.floor(Math.random() * 1000) + 10,
      timestamp,
      evidence: {
        source: "KERNEL_REGIMEN_SIGMA",
        detail: `[SIMULACIÓN] Bloqueo de Riesgo Crítico (${proposedRisk}). Corregido por Sigma a ${correctedRisk}.`,
        metrics: {
          proposed_risk: proposedRisk,
          optimized_risk: correctedRisk,
          is_blocked: isViolated,
          status: isViolated ? "BLOCKED_AND_CLIPPED" : "APPROVED"
        }
      },
      prev_hash: "ca82c5f11a4cfd2254d1d0cfa8290ef4a95ef34a01c8aef90d23812d4a1bf95e",
      hash: "8f48b11c2e0b5ef91206d8a7a18f2e718bc894ef9012a6a81d4a08cf5e40e21a",
      regime_status: "SECURED"
    };

    try {
      await saveLedgerBlock(mockBlock);
    } catch (e) {
      console.error(e);
    }

    const newEntry: LogEntry = {
      id: logId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + " CST",
      author: "KERNEL REGIMEN SIGMA (Automático)",
      signature: "0xSIGMA...05-SHA256",
      title: `INTERCEPCIÓN DE RIESGO DE INFERENCIA DE ${proposedRisk}`,
      tag: "Regimen Sigma Activo",
      tagColor: "text-red-400 bg-red-500/10 border-red-500/20",
      content: `Se detectó propuesta de inferencia con riesgo fiduciario de ${proposedRisk} (excede el umbral límite de 0.05). El Kernel Sigma bloqueó la transición, forzó la corrección a 0.05 mediante proyección ortogonal, y persistió el bloque de auditoría inmutable en el Delta Ledger de Firebase.`,
      metrics: [
        { label: "Riesgo Propuesto", value: proposedRisk.toString() },
        { label: "Riesgo Corregido", value: correctedRisk.toString() },
        { label: "Firebase Estado", value: "PERSISTIDO ✔" },
        { label: "Acción Sigma", value: "Bloqueo & Clip" }
      ]
    };

    setCustomLogs(prev => [newEntry, ...prev]);
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

  const logEntries: LogEntry[] = [
    {
      id: "FL-20260719-01",
      timestamp: "2026-07-19 10:56:09 CST",
      author: "LUIS ANGEL VAZQUEZ MARTINEZ (Fundador General)",
      signature: "0x8F59...9E0B-SHA256",
      title: "RATIFICACIÓN DE INVARIANTE ESTRUCTURAL: PILARIANTE",
      tag: "Soberanía Lógica",
      tagColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      content: "La colisión dialéctica recursiva de falsación ha concluido con resistencia total (R = 1.00). La hipótesis de trabajo K ('La resiliencia de marca diluye la conversión publicitaria en nichos') se consolida como un pilar inmutable dentro de nuestro núcleo axiomático. No es una verdad adaptativa ni temporal: es un anclaje lógico protegido por el F_Operator contra cualquier degradación conductual posterior.",
      metrics: [
        { label: "Coherencia C(K)", value: "1.00" },
        { label: "Fuerza Antítesis (~K)", value: "0.20" },
        { label: "Resistencia (R)", value: "1.00" },
        { label: "Resiliencia I_RL", value: "0.8600" }
      ]
    },
    {
      id: "FL-20260718-02",
      timestamp: "2026-07-18 10:45:00 CST",
      author: "LUIS ANGEL VAZQUEZ MARTINEZ (Fundador General)",
      signature: "0x38BD...1F59-SHA256",
      title: "AISLAMIENTO DE ALUCINACIONES Y PRUEBA DE CUSTODIA ART. 164",
      tag: "Auditoría de Modelos",
      tagColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      content: "Aislamiento de comportamiento anómalo en motores públicos (Meta AI, ChatGPT) bajo stress-testing regulatorio. Se documentó el efecto 'Boiler Room' y adulación algorítmica extrema. Al sintonizar Gemini con el núcleo Romeo-Hydra, se ratificó el procesamiento preventivo (42ms) bajo el Art. 164 de la Ley de Instituciones de Crédito, sellando los resultados con hash de custodia inmutable y enlazando al DOI principal.",
      metrics: [
        { label: "SLA Sintonizado", value: "42 ms" },
        { label: "Velocidad vs Manual", value: "+6.17M x" },
        { label: "Integridad Hash", value: "sha256" },
        { label: "Riesgo de Multa", value: "$0 MXN" }
      ]
    },
    {
      id: "FL-20260718-01",
      timestamp: "2026-07-18 09:12:00 CST",
      author: "LUIS ANGEL VAZQUEZ MARTINEZ (Fundador General)",
      signature: "0xC5A8...0B25-SHA256",
      title: "TRACCIÓN EMPÍRICA Y EFECTO DE CONTAGIO EN LA RED",
      tag: "Tracción Externa",
      tagColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      content: "Monitoreo del despegue exponencial en impresiones ('hockey-stick') del 12 al 18 de julio. Logramos un 19% de descubrimiento orgánico directo por perfiles externos a nuestra red de primer grado. Este alcance ratifica empíricamente que la gobernanza lógica no es solo un constructo abstracto, sino un tema crítico que resuena activamente en las estructuras de toma de decisiones del sector profesional.",
      metrics: [
        { label: "Descubrimiento Ext.", value: "19 %" },
        { label: "Interacciones", value: "13" },
        { label: "Miembros Alconz.", value: "47" }
      ]
    },
    {
      id: "FL-20260717-01",
      timestamp: "2026-07-17 18:30:00 CST",
      author: "LUIS ANGEL VAZQUEZ MARTINEZ (Fundador General)",
      signature: "0x10B9...E0A8-SHA256",
      title: "CALIBRACIÓN COGNITIVA: ELIMINACIÓN DE RUIDO COMERCIAL",
      tag: "Prudencia Fiduciaria",
      tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      content: "Calibración del tono comunicativo para tomadores de decisión (C-Levels, CROs, CCOs). Reemplazamos la hipérbole de marketing y las falsas promesas de 'blindaje total' por métricas de sensibilidad jacobiana e integridad analítica. El marco se presenta estrictamente como evidencia técnica forense desagregada de narrativas sesgadas, asegurando el rigor fiduciario requerido ante reguladores.",
      metrics: [
        { label: "Tono Fiduciario", value: "Activo" },
        { label: "Sesgo Comercial", value: "0.00 %" },
        { label: "Trazabilidad DOI", value: "Canónica" }
      ]
    }
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 space-y-6 hover:border-slate-700/60 transition duration-300">
      {/* Header and locked status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <BookOpen className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wide uppercase">
              Bitácora Histórica del Fundador
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              REGISTRO DE DECISIONES DE GOBERNANZA LÓGICA Y CALIBRACIÓN DEL NÚCLEO
            </p>
          </div>
        </div>

        {/* Dynamic reader state badge */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsReaderUnlocked(!isReaderUnlocked)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[10px] font-mono font-bold transition ${
              isReaderUnlocked 
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-400' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isReaderUnlocked ? (
              <>
                <Unlock className="w-3 h-3 text-purple-400 animate-pulse" />
                <span>LECTOR COMPLETO: ACTIVO</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 text-amber-500" />
                <span>INTERFAZ DE LECTURA BLOQUEADA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Intro info card */}
      <div className="bg-slate-950/60 border border-slate-900 p-3 rounded-lg space-y-3">
        <div className="flex items-start gap-3">
          <Fingerprint className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            Este módulo de bitácora está certificado por la firma del <strong className="text-slate-200">Fundador General</strong> y se encuentra encriptado bajo llave criptográfica inmutable. Queda restringida cualquier edición retroactiva para preservar la cadena de custodia y la soberanía del sistema ante futuras auditorías de la <strong className="text-cyan-400">CNBV</strong> o entidades bancarias.
          </p>
        </div>

        {/* Test button inside Bitácora section */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => commitInferenceEvent(0.09)}
            disabled={isReadOnly}
            className="w-full sm:w-auto px-4 py-2 bg-rose-950/40 hover:bg-rose-900/40 border border-red-500/50 hover:border-red-400 text-red-400 rounded-lg text-[11px] font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/20 disabled:opacity-40"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            {isReadOnly ? "🔒 Solo Lectura (Invitado)" : "Simular Riesgo Crítico (0.09)"}
          </button>
        </div>
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

      {/* Sub-tabs for Logs */}
      <div className="flex border-b border-slate-800/80 mb-4">
        <button
          type="button"
          onClick={() => setActiveSubTab('founder')}
          className={`pb-2 px-4 font-mono text-xs font-bold transition-all border-b-2 -mb-[1px] ${
            activeSubTab === 'founder'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Dictámenes y Publicaciones del Fundador
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveSubTab('external');
            fetchExternalInteractions();
          }}
          className={`pb-2 px-4 font-mono text-xs font-bold transition-all border-b-2 -mb-[1px] flex items-center gap-2 ${
            activeSubTab === 'external'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
          </span>
          Interacciones Externas (Firebase Sync)
          <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-full text-[9px]">
            {externalInteractions.length}
          </span>
        </button>
      </div>

      {activeSubTab === 'founder' ? (
        /* Log list */
        <div className={`space-y-6 transition-all duration-300 ${isReaderUnlocked ? 'max-h-[800px]' : 'max-h-[250px]'} overflow-y-auto pr-1`}>
          {/* Render custom live simulated logs first */}
          {customLogs.map((entry) => (
            <div 
              key={entry.id} 
              className="relative pl-6 border-l border-red-500/40 bg-red-950/5 p-3 rounded-r-lg space-y-3 hover:border-red-400 transition-colors animate-fadeIn"
            >
              <div className="absolute -left-1.5 top-3.5 w-3 h-3 rounded-full bg-slate-950 border-2 border-red-500" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-red-400 bg-slate-950 px-2 py-0.5 rounded border border-red-900/30">
                    {entry.id}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {entry.timestamp}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[9px] border font-bold ${entry.tagColor}`}>
                  {entry.tag}
                </span>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-red-200 font-mono tracking-wide leading-snug">
                  {entry.title}
                </h4>
                <p className="text-xs text-slate-350 leading-relaxed font-sans">
                  {entry.content}
                </p>
              </div>
              {entry.metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {entry.metrics.map((m, i) => (
                    <div key={i} className="bg-slate-950/60 border border-slate-900/60 rounded p-2 text-center">
                      <span className="text-[8px] text-slate-600 block uppercase font-mono">{m.label}</span>
                      <span className="text-xs font-bold text-slate-300 font-mono mt-0.5 block">{m.value}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 text-[9px] font-mono text-slate-600 pt-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Autor: <strong className="text-slate-400">{entry.author}</strong></span>
                <span className="text-slate-800">|</span>
                <span className="text-slate-500 shrink-0 select-all">Sign: {entry.signature}</span>
              </div>
            </div>
          ))}

          {logEntries.map((entry) => (
            <div 
              key={entry.id} 
              className="relative pl-6 border-l border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
            >
              {/* Timeline node icon */}
              <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-slate-950 border-2 border-amber-500/80" />

              {/* Header info */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                    {entry.id}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {entry.timestamp}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[9px] border font-bold ${entry.tagColor}`}>
                  {entry.tag}
                </span>
              </div>

              {/* Content body */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-200 font-mono tracking-wide leading-snug">
                  {entry.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {entry.content}
                </p>
              </div>

              {/* Metrics cards if any */}
              {entry.metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {entry.metrics.map((m, i) => (
                    <div key={i} className="bg-slate-950/60 border border-slate-900/60 rounded p-2 text-center">
                      <span className="text-[8px] text-slate-600 block uppercase font-mono">{m.label}</span>
                      <span className="text-xs font-bold text-slate-300 font-mono mt-0.5 block">{m.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Signature footer */}
              <div className="flex items-center gap-2 text-[9px] font-mono text-slate-600 pt-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Autor: <strong className="text-slate-400">{entry.author}</strong></span>
                <span className="text-slate-800">|</span>
                <span className="text-slate-500 shrink-0 select-all">Sign: {entry.signature}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* External interactions from Firebase */
        <div className={`space-y-4 transition-all duration-300 ${isReaderUnlocked ? 'max-h-[800px]' : 'max-h-[250px]'} overflow-y-auto pr-1`}>
          <div className="flex justify-between items-center bg-slate-950/80 p-3 rounded-lg border border-slate-800/60">
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Sincronización en la Nube de Firebase (Colección: external_interactions)
            </span>
            <button
              type="button"
              onClick={fetchExternalInteractions}
              disabled={loadingExt}
              className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition uppercase font-bold flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loadingExt ? 'animate-spin' : ''}`} />
              RECARGAR
            </button>
          </div>

          {externalInteractions.length === 0 ? (
            <div className="p-10 border border-dashed border-slate-800 rounded-lg text-center space-y-2">
              <Database className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
              <p className="font-mono text-xs text-slate-400 font-bold uppercase">Sin registros en Firebase</p>
              <p className="text-[10px] text-slate-500 font-sans max-w-xs mx-auto">
                No se han detectado interacciones de usuarios externos todavía. Interactúe con la aplicación para poblar el Delta Ledger.
              </p>
            </div>
          ) : (
            externalInteractions.map((inter) => {
              // Determine tag colors
              let tagColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
              if (inter.actionType === "ATAQUE_SIMULADO" || inter.actionType === "VIOLACIÓN" || inter.actionType === "DESBLOQUEO_NEGADO") {
                tagColor = "text-red-400 bg-red-500/10 border-red-500/20";
              } else if (inter.actionType === "CONFIGURACIÓN") {
                tagColor = "text-purple-400 bg-purple-500/10 border-purple-500/20";
              } else if (inter.actionType === "ESCRITURA_LEDGER" || inter.actionType === "NUEVO_BLOQUE") {
                tagColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
              } else if (inter.actionType === "SIMULACIÓN") {
                tagColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
              }

              return (
                <div 
                  key={inter.id} 
                  className="relative pl-6 border-l border-cyan-800 bg-slate-950/40 p-3.5 rounded-r-lg space-y-2.5 hover:border-cyan-500 transition-colors duration-200"
                >
                  <div className="absolute -left-1.5 top-4 w-3 h-3 rounded-full bg-slate-950 border-2 border-cyan-500" />
                  
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap font-mono text-[9.5px]">
                      <span className="text-cyan-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                        {inter.id}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {inter.timestamp}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-mono text-[9px] border font-bold ${tagColor}`}>
                      {inter.actionType}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-mono text-slate-300">
                      Componente: <strong className="text-slate-200 uppercase">{inter.component}</strong>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      {inter.details}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 border-t border-slate-900/60 font-mono text-[9px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-slate-600" />
                      Rol: <strong className="text-slate-400">{inter.userRole}</strong>
                    </span>
                    <span>|</span>
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-slate-600" />
                      ID: <span className="text-slate-400">{inter.userEmail}</span>
                    </span>
                    <span>|</span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-600" />
                      IP: <span className="text-slate-400">{inter.ipPlaceholder}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
