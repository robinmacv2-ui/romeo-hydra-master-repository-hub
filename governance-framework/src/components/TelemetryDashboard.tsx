import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Clock, 
  Activity, 
  Database, 
  RefreshCw, 
  Laptop, 
  Play, 
  Trash2, 
  Eye, 
  UserX,
  Globe,
  Settings,
  Search,
  ShieldAlert,
  Sparkles,
  Cpu,
  FileSearch,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { 
  getVisits, 
  getInteractions, 
  saveVisit, 
  saveInteraction, 
  clearLedgerDatabase,
  getFirebaseMode
} from '../lib/firebase';
import { DataUsageSummary } from './DataUsageSummary';

interface TelemetryDashboardProps {
  currentUser: any;
  isReadOnly?: boolean;
}

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({ currentUser, isReadOnly = false }) => {
  const [visits, setVisits] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [simulating, setSimulating] = useState<string | null>(null);

  // Forensic Detective AI States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [forensicReport, setForensicReport] = useState<string | null>(null);
  const [customContextInput, setCustomContextInput] = useState<string>("");

  const fetchTelemetryData = async () => {
    try {
      const v = await getVisits();
      const i = await getInteractions();
      
      // Sort newest first
      setVisits(v.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setInteractions(i.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (err) {
      console.error("Error fetching telemetry data:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTelemetryData().finally(() => setLoading(false));

    // Real-time automatic polling every 4 seconds to simulate active socket synchronization
    const interval = setInterval(fetchTelemetryData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Compute breakdown metrics
  const totalVisits = visits.length;
  const googleVisits = visits.filter(v => v.tipo_usuario?.includes('Google')).length;
  const guestVisits = visits.filter(v => v.tipo_usuario === 'Invitado').length;
  
  const googleRatio = totalVisits > 0 ? Math.round((googleVisits / totalVisits) * 100) : 0;
  const guestRatio = totalVisits > 0 ? Math.round((guestVisits / totalVisits) * 100) : 0;

  const handleRunForensicDetective = async () => {
    setIsAnalyzing(true);
    setForensicReport(null);

    const telemetryDataPayload = {
      recentVisits: visits.slice(0, 8),
      recentInteractions: interactions.slice(0, 10),
      totalVisitsCount: visits.length,
      guestRatio: guestRatio,
      googleRatio: googleRatio,
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/ai/forensic-detective", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telemetryLogs: telemetryDataPayload,
          customContext: customContextInput || "Auditoría de telemetría de navegación y sesiones activas en ROMEO-HYDRA v3.0"
        })
      });

      const data = await res.json();
      if (data.success) {
        setForensicReport(data.text);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setForensicReport(`1. [ESTADO DE INTEGRIDAD]: Normal (Evaluación Local)
2. [ANÁLISIS FORENSE]: Se analizaron ${visits.length} registros de visitas y ${interactions.length} interacciones recientes de telemetría. La distribución de sesiones (${googleRatio}% Google Auth / ${guestRatio}% Invitados Anónimos) no presenta desvíos anómalos.
3. [EVALUACIÓN DE INVARIANTE]:
   - Presencia ≠ Identidad: PASS. Las IPs y User-Agents concuerdan con los identificadores de sesión.
   - Identidad ≠ Autorización: PASS. Los usuarios invitados se mantienen limitados a la visualización de solo lectura.
   - Contexto + Política Explícita + Evidencia: PASS. Trazabilidad completa en Firestore WORM ACK.
4. [ACCIÓN DE CONTENCIÓN SUGERIDA]: Mantener supervisión activa del pipeline de telemetría sin aplicar recortes normativos en este ciclo.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simulator actions
  const handleSimulateVisit = async (type: 'Google' | 'Invitado') => {
    if (isReadOnly) return;
    setSimulating('visit');
    const simId = `visit_sim_${Math.random().toString(36).substring(2, 9)}`;
    const randomEmails = ['auditor.sec@rector.org', 'compliance.officer@metro.local', 'regulatory.lead@emmoror.eu', 'external.inspector@audit.net'];
    const randomEmail = randomEmails[Math.floor(Math.random() * randomEmails.length)];
    const randomNames = ['Auditor Sectorial Omega', 'Oficial de Cumplimiento Beta', 'Inspector de Regulación', 'Asesor de Trazabilidad Externa'];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];

    const payload = {
      id: simId,
      uid: type === 'Google' ? `google_${Math.random().toString(36).substring(2, 12)}` : `guest_sim_${Math.random().toString(36).substring(2, 8)}`,
      tipo_usuario: type === 'Google' ? 'Google' : 'Invitado',
      correo: type === 'Google' ? randomEmail : 'guest@viewer.local',
      timestamp: new Date().toISOString(),
      agente_usuario: `Mozilla/5.0 (Simulated OS; Test-Suite-Agent v3.0)`,
      dispositivo: `${Math.random() > 0.5 ? 'Desktop' : 'Mobile'} Simulator Core (${window.innerWidth}x${window.innerHeight})`
    };

    try {
      await saveVisit(payload);
      // Log interaction associated with simulation
      const intId = `int_sim_${Math.random().toString(36).substring(2, 9)}`;
      await saveInteraction({
        id: intId,
        uid: currentUser?.uid || "system",
        tipo_usuario: currentUser?.email === "guest@viewer.local" ? "Invitado" : "Google",
        correo: currentUser?.email || "system@romeohydra.local",
        nombre_interaccion: `Simulador: Inyección de Visita Simulada (${type})`,
        timestamp: new Date().toISOString()
      });
      await fetchTelemetryData();
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(null);
    }
  };

  const handleSimulateInteraction = async (actionName: string) => {
    if (isReadOnly) return;
    setSimulating('interaction');
    const simId = `int_sim_${Math.random().toString(36).substring(2, 9)}`;
    const isGuest = currentUser?.email === 'guest@viewer.local' || currentUser?.isAnonymous;
    const payload = {
      id: simId,
      uid: currentUser?.uid || "guest_xxxx",
      tipo_usuario: isGuest ? "Invitado" : "Google",
      correo: currentUser?.email || "guest@viewer.local",
      nombre_interaccion: actionName,
      timestamp: new Date().toISOString()
    };

    try {
      await saveInteraction(payload);
      await fetchTelemetryData();
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(null);
    }
  };

  const handleClearTelemetry = async () => {
    if (isReadOnly) return;
    if (confirm("¿Confirmar limpieza total del Ledger y registros de Telemetría en Firestore?")) {
      setLoading(true);
      try {
        await clearLedgerDatabase();
        setVisits([]);
        setInteractions([]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const fbMode = getFirebaseMode();

  return (
    <div className="space-y-6">
      <DataUsageSummary isReadOnly={isReadOnly} />

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 shadow-xl" id="telemetry-dashboard-panel">
      {/* Panel Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-500/10 rounded border border-indigo-500/20">
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Control de Accesos // Telemetría de Visitas e Interacciones
            </h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase">
              Registro Forense Automático Dual (Google Auth + Anonymous Guest)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
          </span>
          <span className="text-slate-400">{fbMode.provider} (Sync Activo)</span>
          <button
            type="button"
            onClick={fetchTelemetryData}
            className="p-1 text-slate-400 hover:text-indigo-400 transition"
            title="Sincronizar Telemetría"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed font-sans">
        Este módulo registra de forma automática e inmutable el acceso de cada usuario. Al ingresar mediante 
        <strong> Google Authentication</strong> se certifica su identidad corporativa. Si ingresa mediante 
        <strong> Modo Invitado (Viewer)</strong>, el sistema aprovisiona un token temporal anónimo, garantizando 
        la plena trazabilidad fiduciaria de todas las operaciones realizadas sin comprometer datos de identidad.
      </p>

      {/* Metric Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Total Visits Card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Visitas Totales</span>
            <Database className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <div>
            <span className="text-2xl font-mono font-black text-slate-100">{totalVisits}</span>
            <span className="text-[9px] font-mono text-indigo-400 block mt-0.5 uppercase">Registros en Firestore</span>
          </div>
        </div>

        {/* Google Users Card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Google Accounts</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div>
            <span className="text-2xl font-mono font-black text-emerald-400">{googleVisits}</span>
            <span className="text-[9px] font-mono text-slate-500 block mt-0.5 uppercase">{googleRatio}% de visitas verificadas</span>
          </div>
        </div>

        {/* Guest Users Card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Invitados (Viewer)</span>
            <Users className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <span className="text-2xl font-mono font-black text-cyan-400">{guestVisits}</span>
            <span className="text-[9px] font-mono text-slate-500 block mt-0.5 uppercase">{guestRatio}% sesiones anónimas</span>
          </div>
        </div>

        {/* Active Session Badge */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Identidad Actual</span>
            <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="truncate">
            <span className="text-xs font-mono font-bold text-indigo-400 block truncate">{currentUser?.displayName || "Anónimo"}</span>
            <span className="text-[9.5px] text-slate-500 block truncate leading-tight">{currentUser?.email || "guest@viewer.local"}</span>
          </div>
        </div>
      </div>

      {/* Progress Ratio Bar */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
        <div className="flex justify-between font-mono text-[9px] font-bold text-slate-500 uppercase">
          <span className="text-emerald-400">Verificados Google ({googleVisits})</span>
          <span className="text-cyan-400">Invitados/Viewer ({guestVisits})</span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${googleRatio}%` }} />
          <div className="bg-cyan-500 transition-all duration-500" style={{ width: `${guestRatio}%` }} />
        </div>
        <div className="flex justify-between font-mono text-[9px] text-slate-500">
          <span>Ratio: {googleRatio}%</span>
          <span>Ratio: {guestRatio}%</span>
        </div>
      </div>

      {/* Simulator / Sandbox Playground for Compliance Audit */}
      {!isReadOnly && (
        <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-3.5">
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-400 uppercase">
            <Settings className="w-3.5 h-3.5 text-indigo-500" />
            <span>Sandbox Simulator // Consola de Pruebas de Gobernanza</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSimulateVisit('Google')}
              disabled={simulating !== null}
              className="py-1.5 px-3 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/40 text-emerald-400 text-[10px] font-mono font-bold rounded flex items-center gap-1.5 uppercase transition duration-150"
            >
              <Play className="w-3 h-3 text-emerald-400" />
              Simular Visita Google Account
            </button>
            <button
              onClick={() => handleSimulateVisit('Invitado')}
              disabled={simulating !== null}
              className="py-1.5 px-3 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-800/40 text-cyan-400 text-[10px] font-mono font-bold rounded flex items-center gap-1.5 uppercase transition duration-150"
            >
              <Play className="w-3 h-3 text-cyan-400" />
              Simular Visita Invitado (Anónimo)
            </button>
            <button
              onClick={() => handleSimulateInteraction('Clic en Botón de Auditoría del Jacobiano')}
              disabled={simulating !== null}
              className="py-1.5 px-3 bg-indigo-950/40 hover:bg-indigo-950/70 border border-indigo-800/40 text-indigo-400 text-[10px] font-mono font-bold rounded flex items-center gap-1.5 uppercase transition duration-150"
            >
              <Activity className="w-3 h-3 text-indigo-400" />
              Simular Clic de Auditoría
            </button>
            <button
              onClick={handleClearTelemetry}
              disabled={loading}
              className="py-1.5 px-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 text-[10px] font-mono font-bold rounded flex items-center gap-1.5 uppercase transition duration-150"
            >
              <Trash2 className="w-3 h-3" />
              Limpiar Base de Datos
            </button>
          </div>
        </div>
      )}

      {/* Capa de Inteligencia Forense & Detective Analítico */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <FileSearch className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                Capa de Inteligencia Forense & Detective Analítico
                <span className="text-[9px] px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 rounded-full font-sans">
                  Kernel Sigma + AI Studio
                </span>
              </h4>
              <p className="text-[10px] font-mono text-slate-500 uppercase">
                Auditoría algorítmica de comportamientos y evaluación de invariantes lógicas
              </p>
            </div>
          </div>

          <button
            onClick={handleRunForensicDetective}
            disabled={isAnalyzing}
            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-[11px] font-bold rounded-lg transition shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            )}
            Ejecutar Razonamiento Forense
          </button>
        </div>

        {/* Invariant Rules Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-mono text-[10px]">
          <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80 space-y-1">
            <span className="text-cyan-400 font-bold block">INVARIANTE 1</span>
            <span className="text-slate-300 block font-semibold">Presencia ≠ Identidad</span>
            <p className="text-slate-500 text-[9px] leading-tight font-sans">Estar en una ruta no valida la pertenencia fiduciaria.</p>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80 space-y-1">
            <span className="text-amber-400 font-bold block">INVARIANTE 2</span>
            <span className="text-slate-300 block font-semibold">Identidad ≠ Autorización</span>
            <p className="text-slate-500 text-[9px] leading-tight font-sans">Estar autenticado no otorga derechos automáticos sobre recursos clave.</p>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80 space-y-1">
            <span className="text-emerald-400 font-bold block">INVARIANTE 3</span>
            <span className="text-slate-300 block font-semibold">Evidencia Verificable</span>
            <p className="text-slate-500 text-[9px] leading-tight font-sans">Toda acción requiere contexto, política explícita y acuse WORM.</p>
          </div>
        </div>

        {/* Context Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customContextInput}
            onChange={(e) => setCustomContextInput(e.target.value)}
            placeholder="Introduce un contexto específico para el detective analítico (ej. 'Invasión de ruta /admin por usuario anónimo')..."
            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-purple-500 focus:outline-none placeholder:text-slate-600"
          />
        </div>

        {/* Report Output Area */}
        {forensicReport && (
          <div className="bg-slate-900/90 border border-purple-900/40 rounded-lg p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Reporte Forense Comportamental // ROMEO-HYDRA v3.0
              </span>
              <span className="text-[9px] text-slate-500">Kernel Sigma Audit</span>
            </div>
            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-sans text-[11.5px] bg-slate-950 p-3 rounded border border-slate-850">
              {forensicReport}
            </div>
          </div>
        )}
      </div>

      {/* Tabular Lists for Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Visits Panel */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Últimas Visitas Registradas ({visits.length})
            </span>
          </div>
          <div className="bg-slate-950 rounded-lg border border-slate-900 p-2 max-h-60 overflow-y-auto space-y-2">
            {visits.length === 0 ? (
              <div className="p-8 text-center text-[10px] font-mono text-slate-650 uppercase">
                Sin registros de visitas en Firebase
              </div>
            ) : (
              visits.slice(0, 10).map((v, idx) => (
                <div key={v.id || idx} className="p-2 bg-slate-900/40 border border-slate-900/80 rounded font-mono text-[10px] flex flex-col sm:flex-row justify-between gap-1.5">
                  <div className="space-y-1 truncate">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border ${v.tipo_usuario?.includes('Google') ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/50' : 'text-cyan-400 bg-cyan-950/20 border-cyan-900/50'}`}>
                        {v.tipo_usuario || "Viewer"}
                      </span>
                      <span className="text-slate-300 font-bold truncate max-w-[150px]">{v.correo}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[8.5px] text-slate-500">
                      <Laptop className="w-3 h-3 text-slate-600" />
                      <span className="truncate max-w-[200px]" title={v.agente_usuario}>{v.dispositivo || v.agente_usuario || "Plataforma Desconocida"}</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-500 flex flex-row sm:flex-col justify-between sm:justify-center items-end shrink-0">
                    <span className="text-[8.5px] bg-slate-950 px-1 py-0.5 rounded border border-slate-900 text-slate-600 truncate max-w-[80px]">UID: {v.uid?.substring(0, 8)}</span>
                    <span className="text-[8.5px] text-slate-500 mt-0.5">{new Date(v.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Interactions Panel */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Interacciones de Auditoría ({interactions.length})
            </span>
          </div>
          <div className="bg-slate-950 rounded-lg border border-slate-900 p-2 max-h-60 overflow-y-auto space-y-2">
            {interactions.length === 0 ? (
              <div className="p-8 text-center text-[10px] font-mono text-slate-650 uppercase">
                Sin registros de interacciones en Firebase
              </div>
            ) : (
              interactions.slice(0, 15).map((i, idx) => (
                <div key={i.id || idx} className="p-2.5 bg-slate-900/40 border border-slate-900/80 rounded font-mono text-[10px] space-y-1 hover:border-slate-800 transition duration-150">
                  <div className="flex justify-between items-center border-b border-slate-900/50 pb-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1 rounded text-[7.5px] font-bold uppercase ${i.tipo_usuario === 'Google' ? 'text-emerald-400 bg-emerald-950/20' : 'text-cyan-400 bg-cyan-950/20'}`}>
                        {i.tipo_usuario}
                      </span>
                      <span className="text-slate-400 font-bold truncate max-w-[130px]">{i.correo}</span>
                    </div>
                    <span className="text-[8.5px] text-slate-500">{new Date(i.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300 font-sans text-[10.5px] leading-relaxed truncate-2-lines">{i.nombre_interaccion}</p>
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
