import React from 'react';
import { HexaNode, Role } from '../types';
import { Cpu, X, Zap, RefreshCw, ShieldCheck, Activity, Lock, Scale, Sparkles, GitMerge, AlertTriangle } from 'lucide-react';

interface NodeDetailModalProps {
  node: HexaNode | null;
  onClose: () => void;
  onPerturbNode: (nodeId: string) => void;
  onForceHeartbeat: (nodeId: string) => void;
  onToggleStatus: (nodeId: string) => void;
  activeRole: Role;
  jacobianThreshold: number;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({
  node,
  onClose,
  onPerturbNode,
  onForceHeartbeat,
  onToggleStatus,
  activeRole,
  jacobianThreshold,
}) => {
  if (!node) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-5 font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <GitMerge className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">{node.name}</h3>
              <p className="text-[10px] text-slate-400 font-mono">{node.provider} • {node.specialty}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status and Role Description */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 uppercase">Estado Operativo:</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              {node.status}
            </span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">{node.roleDescription}</p>
        </div>

        {/* Telemetry Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3 rounded border border-slate-800 text-center">
            <span className="text-slate-500 text-[10px] block uppercase">Latencia</span>
            <span className="text-emerald-400 font-bold text-sm">{node.latencyMs} ms</span>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 text-center">
            <span className="text-slate-500 text-[10px] block uppercase">Score Coherencia</span>
            <span className="text-blue-400 font-bold text-sm">{((node.coherenceScore ?? 0) * 100).toFixed(0)}%</span>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 text-center">
            <span className="text-slate-500 text-[10px] block uppercase">Norma ||J||</span>
            <span className={(node.jacobianNorm ?? 0) > (jacobianThreshold ?? 0.6) ? 'text-amber-400 font-bold text-sm' : 'text-slate-200 font-bold text-sm'}>
              {(node.jacobianNorm ?? 0).toFixed(2)}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 text-center">
            <span className="text-slate-500 text-[10px] block uppercase">Índice HSI</span>
            <span className="text-purple-300 font-bold text-sm">{(node.hsiIndex ?? 0).toFixed(2)}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 text-center">
            <span className="text-slate-500 text-[10px] block uppercase">Uso CPU</span>
            <span className="text-slate-300 font-bold text-sm">{node.cpuUsage}%</span>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 text-center">
            <span className="text-slate-500 text-[10px] block uppercase">Uso Memoria</span>
            <span className="text-slate-300 font-bold text-sm">{node.memoryUsage}%</span>
          </div>
        </div>

        {/* Vector Omega Breakdown */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">
            Vector de Resistencia Ω [C, S, R]<sup>T</sup>:
          </span>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block">C (Coherencia)</span>
              <span className="text-emerald-400 font-bold text-xs">{(node.omegaVector?.C ?? 0).toFixed(2)}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block">S (Estabilidad)</span>
              <span className="text-blue-400 font-bold text-xs">{(node.omegaVector?.S ?? 0).toFixed(2)}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block">R (Resistencia)</span>
              <span className="text-purple-300 font-bold text-xs">{(node.omegaVector?.R ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Modal Interactive Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => onForceHeartbeat(node.id)}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded font-bold uppercase flex items-center justify-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Heartbeat Ping</span>
          </button>

          <button
            onClick={() => onPerturbNode(node.id)}
            className="flex-1 bg-amber-600/80 hover:bg-amber-500 text-slate-950 p-2 rounded font-bold uppercase flex items-center justify-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Inducir Ruido</span>
          </button>

          {activeRole === 'ADMIN' && (
            <button
              onClick={() => onToggleStatus(node.id)}
              className="bg-red-600/80 hover:bg-red-500 text-white p-2 rounded font-bold uppercase flex items-center justify-center space-x-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{node.status === 'OFFLINE' ? 'Reactivar' : 'Aislar Nodo'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
