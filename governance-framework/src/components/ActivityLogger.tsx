import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Calendar, 
  UserCheck, 
  RefreshCw, 
  Database, 
  Settings, 
  Navigation, 
  Activity, 
  ShieldAlert, 
  Trash2,
  Lock,
  Unlock,
  Eye
} from 'lucide-react';
import { getExternalInteractions, clearLedgerDatabase, saveExternalInteraction } from '../lib/firebase';
import { ExternalInteraction } from '../types';

interface ActivityLoggerProps {
  isReadOnly?: boolean;
}

export const ActivityLogger: React.FC<ActivityLoggerProps> = ({ isReadOnly = false }) => {
  const [activities, setActivities] = useState<ExternalInteraction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await getExternalInteractions();
      setActivities(data);
    } catch (err) {
      console.error("Error loading activities in ActivityLogger:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // Auto-refresh every 7 seconds to keep the founder's session trail completely in sync
    const interval = setInterval(fetchActivities, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleClearAll = async () => {
    if (isReadOnly) return;
    if (confirm("¿Confirmar eliminación permanente del historial de actividades en Firebase? This will clear all external interactions.")) {
      try {
        setLoading(true);
        await clearLedgerDatabase(); // This will clear all ledger and interactions
        setActivities([]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddManualInteraction = async () => {
    if (isReadOnly) return;
    const actionType = "MODIFICACIÓN_CONFIGURACIÓN";
    const component = "Ajustes de Gobernanza";
    const details = "El Auditor modificó el umbral de tolerancia para el desvío temporal a ±400ms.";
    const interactionId = `EXT-INT-MANUAL-${Date.now()}`;
    const manualEvent: ExternalInteraction = {
      id: interactionId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actionType,
      component,
      details,
      userRole: "Operator (Admin)",
      userEmail: "robinmac.v2@gmail.com",
      ipPlaceholder: `189.245.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    };

    try {
      setLoading(true);
      await saveExternalInteraction(manualEvent);
      await fetchActivities();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter activities
  const filteredActivities = activities.filter(act => {
    const matchesFilter = filter === 'ALL' || act.actionType === filter;
    const matchesSearch = searchTerm === '' || 
      act.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.actionType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActionBadgeColor = (actionType: string) => {
    switch (actionType) {
      case 'ATAQUE_SIMULADO':
      case 'VIOLACIÓN':
      case 'DESBLOQUEO_NEGADO':
        return 'text-red-400 bg-red-950/40 border-red-800/60';
      case 'CONFIGURACIÓN':
      case 'MODIFICACIÓN_CONFIGURACIÓN':
        return 'text-purple-400 bg-purple-950/40 border-purple-800/60';
      case 'ESCRITURA_LEDGER':
      case 'NUEVO_BLOQUE':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
      case 'NAVEGACIÓN':
        return 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60';
      case 'SIMULACIÓN':
        return 'text-yellow-400 bg-yellow-950/40 border-yellow-800/60';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  const uniqueActionTypes = Array.from(new Set(activities.map(a => a.actionType)));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-lg" id="activity-logger-panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/10 rounded border border-cyan-500/20">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              ActivityLogger // Trazabilidad de Sesiones
            </h3>
            <p className="text-[10px] font-mono text-slate-500">
              PERSISTENCIA COMPLETA DE EVENTOS NO-LEDGER EN FIREBASE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400">Firebase Realtime Sync</span>
          <button
            type="button"
            onClick={fetchActivities}
            className="p-1 text-slate-400 hover:text-cyan-400 transition"
            title="Recargar Actividades"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed font-sans">
        Esta consola de auditoría recopila cada interacción táctica (ej. cambios de pestañas del panel, simulaciones, reconfiguraciones de parámetros, mitigaciones) y las inyecta en el almacenamiento inmutable de Firebase. Esto garantiza que el fundador mantenga control fiduciario completo incluso sobre la navegación del auditor externo.
      </p>

      {/* Interactive Controls & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">Filtrar Acción</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">TODAS LAS ACCIONES</option>
            {uniqueActionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-1">
          <label className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">Buscador Contextual</label>
          <input
            type="text"
            placeholder="Buscar en logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="sm:col-span-1 flex items-end justify-end gap-2">
          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={handleAddManualInteraction}
                disabled={loading}
                className="w-1/2 sm:w-auto px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-mono font-bold rounded uppercase tracking-wide flex items-center justify-center gap-1.5"
                title="Simular cambio de ajustes fiduciarios"
              >
                <Settings className="w-3.5 h-3.5 text-cyan-400" />
                + Config
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                disabled={loading}
                className="w-1/2 sm:w-auto px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/40 text-[10px] font-mono font-bold rounded uppercase tracking-wide flex items-center justify-center gap-1.5"
                title="Limpiar todas las actividades"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Borrar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Activities Feed */}
      <div className="bg-slate-950 rounded-lg border border-slate-850 p-2 max-h-72 overflow-y-auto pr-1">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Database className="w-6 h-6 text-slate-700 mx-auto animate-pulse" />
            <p className="text-[10px] font-mono text-slate-500 uppercase font-bold">Sin actividades registradas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredActivities.map((act) => (
              <div 
                key={act.id} 
                className="p-2.5 rounded border border-slate-900 bg-slate-950 hover:border-slate-800 transition-colors duration-150 font-mono text-[10.5px] space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded text-[9px] border border-slate-850 truncate max-w-[140px]">
                      {act.id}
                    </span>
                    <span className="text-slate-600 text-[9px]">
                      {act.timestamp}
                    </span>
                  </div>
                  <span className={`px-1.5 py-0.2 rounded text-[8.5px] border font-bold ${getActionBadgeColor(act.actionType)}`}>
                    {act.actionType}
                  </span>
                </div>

                <div className="space-y-0.5 text-slate-300">
                  <span className="text-[9.5px] text-slate-500 block">COMPONENTE: <strong className="text-slate-400 uppercase">{act.component}</strong></span>
                  <p className="text-slate-300 font-sans leading-relaxed text-[11px]">{act.details}</p>
                </div>

                <div className="flex flex-wrap gap-x-3 text-[8.5px] text-slate-600 pt-1 border-t border-slate-900/30">
                  <span>Rol: <strong className="text-slate-500">{act.userRole}</strong></span>
                  <span>|</span>
                  <span>ID: <strong className="text-slate-500">{act.userEmail}</strong></span>
                  <span>|</span>
                  <span>IP: <strong className="text-slate-500">{act.ipPlaceholder}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-950 p-2.5 rounded border border-slate-850/50">
        <Globe className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span>
          Alineado con el protocolo de <strong>Caja Blanca de la IA</strong> del fundador Luis Angel Vazquez Martinez. Certificado Zenodo DOI: <span className="text-cyan-500 select-all font-bold">10.5281/zenodo.21406719</span>
        </span>
      </div>
    </div>
  );
};
