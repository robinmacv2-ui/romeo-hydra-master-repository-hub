import React, { useState } from 'react';
import { HexaNode, Role, Regime } from '../types';
import { Cpu, ShieldCheck, Lock, Sparkles, Scale, GitMerge, RefreshCw, AlertTriangle, Activity, Zap, CheckCircle2, Sliders, ChevronRight } from 'lucide-react';

interface HexaNodeDashboardProps {
  nodes: HexaNode[];
  onSelectNode: (node: HexaNode) => void;
  onPerturbNode: (nodeId: string) => void;
  onForceHeartbeat: (nodeId: string) => void;
  activeRole: Role;
  activeRegime: Regime;
  jacobianThreshold: number;
}

export const HexaNodeDashboard: React.FC<HexaNodeDashboardProps> = ({
  nodes,
  onSelectNode,
  onPerturbNode,
  onForceHeartbeat,
  activeRole,
  activeRegime,
  jacobianThreshold,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const getNodeIcon = (iconName: string, provider: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-5 h-5 text-emerald-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-amber-400" />;
      case 'Lock': return <Lock className="w-5 h-5 text-blue-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-emerald-300" />;
      case 'Scale': return <Scale className="w-5 h-5 text-purple-400" />;
      case 'GitMerge': default: return <GitMerge className="w-5 h-5 text-emerald-400 animate-pulse" />;
    }
  };

  const getStatusBadge = (node: HexaNode) => {
    switch (node.status) {
      case 'OPERATIONAL':
        return (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            OPERATIVO
          </span>
        );
      case 'DAMPENED':
        return (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            DAMPENED (||J||&gt;θ)
          </span>
        );
      case 'WARNING':
        return (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            ALERTA_DERIVA
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
            BLOQUEO_CRÍTICO
          </span>
        );
      case 'OFFLINE':
      default:
        return (
          <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
            AISLADO / OFFLINE
          </span>
        );
    }
  };

  // Metrics summary
  const avgLatency = nodes.length ? Math.round(nodes.reduce((acc, n) => acc + (n?.latencyMs ?? 0), 0) / nodes.length) : 0;
  const avgCoherence = nodes.length ? (nodes.reduce((acc, n) => acc + (n?.coherenceScore ?? 0), 0) / nodes.length).toFixed(2) : '0.00';
  const maxJacobian = nodes.length ? Math.max(...nodes.map((n) => n?.jacobianNorm ?? 0)).toFixed(2) : '0.00';
  const avgHSI = nodes.length ? (nodes.reduce((acc, n) => acc + (n?.hsiIndex ?? 0), 0) / nodes.length).toFixed(2) : '0.00';

  const arbiterNode = nodes.find((n) => n.id === 'node-arbiter') || nodes[nodes.length - 1];
  const satelliteNodes = nodes.filter((n) => n.id !== 'node-arbiter');

  return (
    <div className="space-y-6">
      {/* Topology Header & Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Latencia Promedio</p>
            <p className="text-xl font-bold font-mono text-white">{avgLatency} <span className="text-xs text-slate-400">ms</span></p>
            <p className="text-[10px] text-emerald-400 font-mono">Consenso sub-100ms</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Score Coherencia Global</p>
            <p className="text-xl font-bold font-mono text-white">{(parseFloat(avgCoherence) * 100).toFixed(0)}%</p>
            <p className="text-[10px] text-blue-400 font-mono">Matriz Convexidad CLC</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Norma Jacobiana Máx ||J||</p>
            <p className="text-xl font-bold font-mono text-amber-400">{maxJacobian}</p>
            <p className="text-[10px] text-slate-400 font-mono">Umbral θ = {(jacobianThreshold ?? 0.6).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Índice Estabilidad HSI</p>
            <p className="text-xl font-bold font-mono text-purple-300">{avgHSI}</p>
            <p className="text-[10px] text-purple-400 font-mono">α·MSH + β·ES + γ·RI</p>
          </div>
        </div>
      </div>

      {/* Hexa-Node Interactive Topology Architecture Display */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-emerald-400" />
              Arquitectura de Topología Hexa-Nodo (EMMOROR-EXP)
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Visualización en tiempo real de los 5 Nodos Satélite alimentando el Núcleo Central de Arbitraje CLC
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Régimen:</span>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
              {activeRegime}
            </span>
          </div>
        </div>

        {/* Central Visual Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Satellite Nodes Column Left (ChatGPT, Grok, Meta) */}
          <div className="lg:col-span-4 space-y-3">
            {satelliteNodes.slice(0, 3).map((node) => (
              <div
                key={node.id}
                onClick={() => onSelectNode(node)}
                className={`bg-slate-950/80 border p-3.5 rounded-lg cursor-pointer transition-all hover:border-emerald-500/60 group relative overflow-hidden ${
                  node.status === 'DAMPENED'
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : node.status === 'CRITICAL'
                    ? 'border-red-500/40 bg-red-500/5'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      {getNodeIcon(node.iconName, node.provider)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white font-mono group-hover:text-emerald-400 transition-colors">
                        {node.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">{node.specialty}</p>
                    </div>
                  </div>
                  {getStatusBadge(node)}
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono mt-3 bg-slate-900/60 p-2 rounded border border-slate-800/60">
                  <div>
                    <span className="text-slate-500 block">Latencia</span>
                    <span className="text-emerald-400 font-bold">{node.latencyMs}ms</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Coherencia</span>
                    <span className="text-blue-400 font-bold">{((node?.coherenceScore ?? 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">||J|| Norma</span>
                    <span className={(node?.jacobianNorm ?? 0) > (jacobianThreshold ?? 0.6) ? 'text-amber-400 font-bold' : 'text-slate-300 font-bold'}>
                      {(node?.jacobianNorm ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Quick Action Footer */}
                <div className="flex justify-end items-center space-x-2 mt-2 pt-1 border-t border-slate-800/40 text-[10px] font-mono">
                  <button
                    onClick={(e) => { e.stopPropagation(); onForceHeartbeat(node.id); }}
                    className="text-slate-400 hover:text-emerald-400 p-1 flex items-center gap-1 transition-colors"
                    title="Realizar test de pulso / heartbeat"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Ping</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onPerturbNode(node.id); }}
                    className="text-amber-400 hover:text-amber-300 p-1 flex items-center gap-1 transition-colors"
                    title="Simular inyección de ruido para probar respuesta Jacobiana"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Inyectar Ruido</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Center Arbiter Core Highlight Box */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-emerald-950/20 border-2 border-emerald-500/40 rounded-xl relative shadow-[0_0_20px_rgba(16,185,129,0.15)] my-2 lg:my-0">
            <div className="absolute top-2 right-2 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[9px] font-mono text-emerald-400 font-bold">CORE ARBITER</span>
            </div>

            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <GitMerge className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>

            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-center">
              {arbiterNode?.name ?? 'Árbitro CLC'}
            </h3>
            <p className="text-[11px] text-emerald-400 font-mono text-center mt-1 font-semibold">
              Coherencia Lógica Convexa (CLC)
            </p>
            <p className="text-[10px] text-slate-400 font-mono text-center mt-1 px-2">
              {'Intersección convexa S_clc = ∩ S_n. Rechazo automático si S_clc = ∅.'}
            </p>

            <div className="w-full mt-4 space-y-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Veredicto Actual:</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  {arbiterNode?.activeConsensus ?? 'ACCEPT'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vector Ω (C / S / R):</span>
                <span className="text-white font-bold">
                  {(arbiterNode?.omegaVector?.C ?? 0.95).toFixed(2)} / {(arbiterNode?.omegaVector?.S ?? 0.92).toFixed(2)} / {(arbiterNode?.omegaVector?.R ?? 0.98).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Latencia Arbitraje:</span>
                <span className="text-emerald-400 font-bold">{arbiterNode?.latencyMs ?? 12} ms</span>
              </div>
            </div>

            <button
              onClick={() => onSelectNode(arbiterNode)}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs py-2 px-3 rounded font-mono uppercase transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Inspeccionar Núcleo Arbitro</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Satellite Nodes Column Right (Gemini, Claude) */}
          <div className="lg:col-span-4 space-y-3">
            {satelliteNodes.slice(3).map((node) => (
              <div
                key={node.id}
                onClick={() => onSelectNode(node)}
                className={`bg-slate-950/80 border p-3.5 rounded-lg cursor-pointer transition-all hover:border-emerald-500/60 group relative overflow-hidden ${
                  node.status === 'DAMPENED'
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : node.status === 'CRITICAL'
                    ? 'border-red-500/40 bg-red-500/5'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      {getNodeIcon(node.iconName, node.provider)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white font-mono group-hover:text-emerald-400 transition-colors">
                        {node.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">{node.specialty}</p>
                    </div>
                  </div>
                  {getStatusBadge(node)}
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono mt-3 bg-slate-900/60 p-2 rounded border border-slate-800/60">
                  <div>
                    <span className="text-slate-500 block">Latencia</span>
                    <span className="text-emerald-400 font-bold">{node.latencyMs}ms</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Coherencia</span>
                    <span className="text-blue-400 font-bold">{(node.coherenceScore * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">||J|| Norma</span>
                    <span className={node.jacobianNorm > jacobianThreshold ? 'text-amber-400 font-bold' : 'text-slate-300 font-bold'}>
                      {node.jacobianNorm.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Quick Action Footer */}
                <div className="flex justify-end items-center space-x-2 mt-2 pt-1 border-t border-slate-800/40 text-[10px] font-mono">
                  <button
                    onClick={(e) => { e.stopPropagation(); onForceHeartbeat(node.id); }}
                    className="text-slate-400 hover:text-emerald-400 p-1 flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Ping</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onPerturbNode(node.id); }}
                    className="text-amber-400 hover:text-amber-300 p-1 flex items-center gap-1 transition-colors"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Inyectar Ruido</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hexa-Node Detailed Grid Matrix */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Telemetría Matricia Completa (6 Nodos Activos)
          </h3>
          <span className="text-[10px] text-emerald-400 font-mono">
            Sincronización en tiempo real vía WebSockets / Heartbeat
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`bg-slate-900/60 border rounded-xl p-4 flex flex-col justify-between transition-all hover:bg-slate-900/90 ${
                node.id === 'node-arbiter'
                  ? 'border-emerald-500/50 bg-emerald-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      {getNodeIcon(node.iconName, node.provider)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono">{node.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{node.provider} • {node.specialty}</p>
                    </div>
                  </div>
                  {getStatusBadge(node)}
                </div>

                <p className="text-[11px] text-slate-300 font-mono mb-4 leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  {node.roleDescription}
                </p>

                {/* Metrics Breakdown Bars */}
                <div className="space-y-2.5 text-[11px] font-mono mb-4">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-400">Coherencia Lógica</span>
                      <span className="text-emerald-400 font-bold">{((node?.coherenceScore ?? 0) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(node?.coherenceScore ?? 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-400">Jacobiano ||J|| (Sensibilidad)</span>
                      <span className={(node?.jacobianNorm ?? 0) > (jacobianThreshold ?? 0.6) ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                        {(node?.jacobianNorm ?? 0).toFixed(2)} / {(jacobianThreshold ?? 0.6).toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          (node?.jacobianNorm ?? 0) > (jacobianThreshold ?? 0.6) ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, (node?.jacobianNorm ?? 0) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-400">Métrica HSI</span>
                      <span className="text-purple-300 font-bold">{(node?.hsiIndex ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${(node?.hsiIndex ?? 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-500 block">CPU</span>
                      <span className="text-slate-200 font-bold">{node.cpuUsage}%</span>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-500 block">RAM</span>
                      <span className="text-slate-200 font-bold">{node.memoryUsage}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">Heartbeat: {node.lastHeartbeat}</span>
                <button
                  onClick={() => onSelectNode(node)}
                  className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-[11px] font-bold px-2.5 py-1 rounded transition-colors"
                >
                  Inspeccionar →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
