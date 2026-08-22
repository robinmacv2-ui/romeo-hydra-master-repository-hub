import React, { useState } from 'react';
import { GovernanceSettings as GovernanceSettingsType, Regime, HexaNode, TelemetryEvent } from '../types';
import { Settings, Sliders, Shield, Zap, Activity, RefreshCw, Pause, Play, Trash2, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface GovernanceSettingsProps {
  settings: GovernanceSettingsType;
  onUpdateSettings: (newSettings: GovernanceSettingsType) => void;
  nodes: HexaNode[];
  onToggleNodeActive: (nodeId: string) => void;
  telemetryEvents: TelemetryEvent[];
  onClearTelemetry: () => void;
  onInjectTestTelemetry: () => void;
}

export const GovernanceSettingsPanel: React.FC<GovernanceSettingsProps> = ({
  settings,
  onUpdateSettings,
  nodes,
  onToggleNodeActive,
  telemetryEvents,
  onClearTelemetry,
  onInjectTestTelemetry,
}) => {
  const [isFeedPaused, setIsFeedPaused] = useState<boolean>(false);
  const [telemetryFilter, setTelemetryFilter] = useState<string>('ALL');

  const handleSeverityChange = (val: number) => {
    onUpdateSettings({ ...settings, severityThreshold: val });
  };

  const handleAlphaChange = (val: number) => {
    onUpdateSettings({ ...settings, jacobianDampingFactor: val });
  };

  const handleEntropyChange = (val: number) => {
    onUpdateSettings({ ...settings, entropyTolerance: val });
  };

  const handleRegimeSelect = (regime: Regime) => {
    onUpdateSettings({ ...settings, activeRegime: regime });
  };

  const filteredTelemetry = telemetryEvents.filter((evt) => {
    if (telemetryFilter === 'ALL') return true;
    return evt.type === telemetryFilter;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Governance Threshold Sliders & Controls */}
      <div className="lg:col-span-6 space-y-5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              Panel de Parámetros de Gobernanza Cognitiva
            </h2>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">CONFIG_ACTIVA</span>
          </div>

          {/* Active Regime Selection Card */}
          <div className="space-y-2 font-mono">
            <label className="text-[10px] text-slate-400 uppercase font-bold block">
              Selección de Régimen de Gobernanza Operativo:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleRegimeSelect('ALPHA')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  settings.activeRegime === 'ALPHA'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span>α ALPHA</span>
                  {settings.activeRegime === 'ALPHA' && <span className="w-2 h-2 rounded-full bg-purple-400" />}
                </div>
                <p className="text-[10px] text-slate-400 font-normal">Estabilidad Estructural &amp; Invariantes</p>
              </button>

              <button
                onClick={() => handleRegimeSelect('BETA')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  settings.activeRegime === 'BETA'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span>β BETA</span>
                  {settings.activeRegime === 'BETA' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                </div>
                <p className="text-[10px] text-slate-400 font-normal">Coherencia Adaptativa &amp; Amortiguación</p>
              </button>

              <button
                onClick={() => handleRegimeSelect('GAMMA')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  settings.activeRegime === 'GAMMA'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span>γ GAMMA</span>
                  {settings.activeRegime === 'GAMMA' && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                </div>
                <p className="text-[10px] text-slate-400 font-normal">Gobernanza de Entropía &amp; Métrica HSI</p>
              </button>

              <button
                onClick={() => handleRegimeSelect('DELTA')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  settings.activeRegime === 'DELTA'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span>δ DELTA</span>
                  {settings.activeRegime === 'DELTA' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </div>
                <p className="text-[10px] text-slate-400 font-normal">Soberanía, Trazabilidad &amp; WORM</p>
              </button>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-4 font-mono pt-2 border-t border-slate-800">
            {/* Slider 1: Severity Threshold θ */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Umbral de Severidad θ (Jacoby Trigger):</span>
                <span className="text-amber-400 font-bold">{(settings?.severityThreshold ?? 0.6).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="1.00"
                step="0.05"
                value={settings?.severityThreshold ?? 0.6}
                onChange={(e) => handleSeverityChange(parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>0.10 (Súper Estricto)</span>
                <span>0.60 (Recomendado RC1)</span>
                <span>1.00 (Permisivo)</span>
              </div>
            </div>

            {/* Slider 2: Jacobian Damping Factor α */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Factor de Amortiguación Jacobiana α:</span>
                <span className="text-emerald-400 font-bold">{(settings?.jacobianDampingFactor ?? 0.75).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.95"
                step="0.05"
                value={settings?.jacobianDampingFactor ?? 0.75}
                onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">
                Fórmula de reajuste: C&apos; = C * {(settings?.jacobianDampingFactor ?? 0.75).toFixed(2)} cuando ||J|| &gt; {(settings?.severityThreshold ?? 0.6).toFixed(2)}
              </p>
            </div>

            {/* Slider 3: Entropy Tolerance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Tolerancia de Entropía Aislada:</span>
                <span className="text-blue-400 font-bold">{settings.entropyTolerance}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={settings.entropyTolerance}
                onChange={(e) => handleEntropyChange(parseInt(e.target.value))}
                className="w-full accent-blue-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Active Nodes Dynamic Selector */}
          <div className="pt-2 border-t border-slate-800 space-y-2 font-mono">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Nodos de la Topología Habilitados en Consenso:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {nodes.map((node) => {
                const isActive = settings.activeNodeIds.includes(node.id);
                return (
                  <div
                    key={node.id}
                    onClick={() => onToggleNodeActive(node.id)}
                    className={`p-2.5 rounded border flex items-center justify-between cursor-pointer transition-all ${
                      isActive
                        ? 'bg-slate-950 border-emerald-500/50 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500 line-through'
                    }`}
                  >
                    <span className="font-bold text-[11px] truncate">{node.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isActive ? 'ACTIVO' : 'AISLADO'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Real-Time Event Telemetry Stream */}
      <div className="lg:col-span-6 flex flex-col h-[580px] bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="bg-slate-800/40 px-4 py-3 border-b border-slate-800 flex items-center justify-between font-mono">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Bitácora de Telemetría en Tiempo Real
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFeedPaused(!isFeedPaused)}
              className="p-1 rounded text-slate-400 hover:text-white bg-slate-800"
              title={isFeedPaused ? 'Reanudar Stream' : 'Pausar Stream'}
            >
              {isFeedPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            </button>
            <button
              onClick={onInjectTestTelemetry}
              className="p-1 rounded text-slate-400 hover:text-emerald-400 bg-slate-800"
              title="Inyectar Evento de Prueba"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClearTelemetry}
              className="p-1 rounded text-slate-400 hover:text-red-400 bg-slate-800"
              title="Limpiar Bitácora"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Telemetry Filter Selector */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-500 uppercase">Filtrar Eventos:</span>
          <select
            value={telemetryFilter}
            onChange={(e) => setTelemetryFilter(e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-700 rounded px-2 py-0.5"
          >
            <option value="ALL">TODOS</option>
            <option value="INFO">INFO</option>
            <option value="JACOBIAN_DAMPING">AMORTIGUACIÓN</option>
            <option value="WARNING">ADVERTENCIA</option>
            <option value="ALERT">ALERTA</option>
            <option value="SECURITY">SEGURIDAD</option>
          </select>
        </div>

        {/* Telemetry Events Stream List */}
        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-3 bg-[#020617]/90 scrollbar-thin">
          {filteredTelemetry.length === 0 ? (
            <p className="text-slate-600 text-center py-10">Sin eventos de telemetría registrados.</p>
          ) : (
            filteredTelemetry.map((evt) => {
              let borderCol = 'border-slate-700';
              let badgeCol = 'bg-slate-800 text-slate-300';

              if (evt.type === 'JACOBIAN_DAMPING') {
                borderCol = 'border-amber-500';
                badgeCol = 'bg-amber-500/20 text-amber-400';
              } else if (evt.type === 'WARNING' || evt.type === 'ALERT') {
                borderCol = 'border-red-500';
                badgeCol = 'bg-red-500/20 text-red-400';
              } else if (evt.type === 'INFO') {
                borderCol = 'border-emerald-500';
                badgeCol = 'bg-emerald-500/20 text-emerald-400';
              }

              return (
                <div key={evt.id} className={`border-l-2 ${borderCol} pl-3 py-1 space-y-1`}>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{evt.timestamp} • <strong className="text-slate-300">{evt.sourceNode}</strong></span>
                    <span className={`px-1.5 py-0.2 rounded font-bold ${badgeCol}`}>{evt.type}</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">{evt.message}</p>
                </div>
              );
            })
          )}
        </div>

        <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex justify-between">
          <span>{isFeedPaused ? 'STREAM PAUSADO' : 'STREAM EN VIVO ACTIVE'}</span>
          <span>Total Eventos: {telemetryEvents.length}</span>
        </div>
      </div>
    </div>
  );
};
