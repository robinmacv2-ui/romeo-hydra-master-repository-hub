import React, { useState } from 'react';
import { EXPOSURE_DATA } from '../data';
import { calculateMSH, calculateHSI, calculateTransientState } from '../utils';
import { HydraNode, StateVector } from '../types';
import { GitBranch, User, Layers, Play, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface ExposureBranchProps {
  onLogEvent: (source: string, detail: string, metrics: Record<string, any>) => void;
  onSetGammaHSI: (hsi: number) => void;
}

export const ExposureBranch: React.FC<ExposureBranchProps> = ({
  onLogEvent,
  onSetGammaHSI
}) => {
  const [nodes, setNodes] = useState<HydraNode[]>(EXPOSURE_DATA.initialHydraTree);
  const [currentState, setCurrentState] = useState<StateVector>(EXPOSURE_DATA.s0);
  const [isAudited, setIsAudited] = useState<boolean>(false);
  const [campaignActive, setCampaignActive] = useState<boolean>(false);

  // Compute metrics based on current nodes
  const es = 0.92; // Stability under noise constant
  const ri = 0.88; // Recovery index constant
  const msh = calculateMSH(nodes);
  const hsi = calculateHSI(msh, es, ri);

  // Synchronize HSI back to top-level app state
  React.useEffect(() => {
    onSetGammaHSI(hsi);
  }, [hsi]);

  const handleRunHydraAudit = () => {
    // Audit the Hydra tree:
    // Any node that is 'Pending' gets audited.
    // Survival score = 0.6 * coherence + 0.4 * resistance
    // If score < 0.65, we prune it.
    // If score >= 0.65, we accept/fuse it.
    const auditedNodes = nodes.map(node => {
      if (node.status === 'Pending') {
        const score = 0.6 * node.coherence + 0.4 * node.resistance;
        if (score < 0.65) {
          return { ...node, status: 'Pruned' as const };
        } else if (node.id === 'H_A1_2' || node.id === 'H_A2_1') {
          return { ...node, status: 'Fused' as const }; // Fuse related hypothesis branches
        } else {
          return { ...node, status: 'Active' as const };
        }
      }
      return node;
    });

    setNodes(auditedNodes);
    setIsAudited(true);

    const auditedMSH = calculateMSH(auditedNodes);
    const auditedHSI = calculateHSI(auditedMSH, es, ri);

    onLogEvent(
      "GAMMA_ENTROPY",
      `Ejecución de Protocolo Hydra v2.7 - Auditoría y Poda de Hipótesis`,
      {
        total_nodes: auditedNodes.length,
        active_nodes: auditedNodes.filter(n => n.status === 'Active').length,
        pruned_nodes: auditedNodes.filter(n => n.status === 'Pruned').length,
        msh: auditedMSH,
        hsi: auditedHSI,
      }
    );
  };

  const handleTriggerCampaign = () => {
    if (campaignActive) {
      // Reset state
      setCurrentState(EXPOSURE_DATA.s0);
      setCampaignActive(false);
      return;
    }

    // Trigger Campaign: Apply Visibility Perturbation delta_u = [0, 0.60, 0.30, 0]^T
    // Content quality degrades slightly due to reach dilution
    const nextState = calculateTransientState(
      EXPOSURE_DATA.s0,
      EXPOSURE_DATA.jacobian.matrix,
      EXPOSURE_DATA.campaignPerturbation.delta_u0,
      10, // Simulate state at t=10
      25, // tau = 25
      ['D', 'O', 'A', 'R']
    );

    // Let's map our local display states [C, V, A, R]
    setCurrentState({
      D: nextState.D, // Content
      O: nextState.O, // Vis
      A: nextState.A, // Algo
      R: nextState.R, // Resonance
    });

    setCampaignActive(true);

    onLogEvent(
      "GAMMA_ENTROPY",
      "Lanzamiento de Campaña de Visibilidad Algorítmica (Meta Ads)",
      {
        pre_state: EXPOSURE_DATA.s0,
        post_state: {
          C: nextState.D,
          V: nextState.O,
          A: nextState.A,
          R: nextState.R
        },
        description: "Inyección de visibilidad de campaña. Analizando acoplamiento transitorio de autenticidad."
      }
    );
  };

  const handleResetTree = () => {
    setNodes(EXPOSURE_DATA.initialHydraTree);
    setIsAudited(false);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="exposure-branch-container">
      {/* Brand Telemetry Column */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        {/* Creator Info Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
            <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center border border-purple-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-mono text-slate-500 uppercase">
                Director de Arquitectura
              </h4>
              <h3 className="text-sm font-bold text-slate-100 tracking-tight font-mono">
                {EXPOSURE_DATA.author}
              </h3>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-500">Proyecto Invariante:</span>
              <span className="text-slate-300 font-semibold uppercase">{EXPOSURE_DATA.projectName}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-500">Región Operativa:</span>
              <span className="text-slate-300">Google & Meta Ads</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-500">Modo de Exposición:</span>
              <span className="text-emerald-400 font-semibold">COGNITIVO_SEGURO</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
            En el proyecto <em>Deconstruccion</em>, la autenticidad ($C$) es un invariante sagrado. El cortafuegos bloquea el presupuesto publicitario si la dilución del público disminuye la calidad de conversión por debajo del 85%.
          </p>

          {/* Campaign Action Button */}
          <button
            onClick={handleTriggerCampaign}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold font-mono tracking-wider transition flex items-center justify-center gap-2 ${
              campaignActive
                ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/15'
                : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/10'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${campaignActive ? 'animate-spin' : ''}`} />
            {campaignActive ? "DETENER CAMPAÑA PUBLICITARIA" : "INYECTAR CAMPAÑA DE VISIBILIDAD"}
          </button>
        </div>

        {/* Brand Vectors S_exp */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide mb-4">
            Vectores de Marca S_exp
          </h3>

          <div className="space-y-4">
            {[
              { label: "C (Calidad / Autenticidad)", value: currentState.D, color: "bg-emerald-500", refValue: 0.92 },
              { label: "V (Visibilidad / Alcance)", value: currentState.O, color: "bg-purple-500", refValue: 0.20 },
              { label: "A (Adaptación Algorítmica)", value: currentState.A, color: "bg-cyan-500", refValue: 0.45 },
              { label: "R (Resonancia / Conversión)", value: currentState.R, color: "bg-amber-500", refValue: 0.35 },
            ].map((bar, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">{bar.label}</span>
                  <span className="font-bold text-slate-200">
                    {bar.value.toFixed(3)}{" "}
                    <span className="text-[10px] text-slate-500">
                      (Base: {bar.refValue.toFixed(2)})
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                  <div
                    className={`${bar.color} h-full transition-all duration-700`}
                    style={{ width: `${Math.min(100, bar.value * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {campaignActive && currentState.D < 0.85 && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
              <span>⚠ ALERTA DE DILUCIÓN: Calidad de Autenticidad cayó bajo 85%. Circuit Breaker mitigando inversión.</span>
            </div>
          )}
        </div>
      </div>

      {/* Hydra Tree Mapping & Control */}
      <div className="xl:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wide">
                Protocolo Hydra v2.7: Ramificación e Inferencia
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                MSH: {msh.toFixed(3)}
              </span>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10">
                HSI: {hsi.toFixed(3)}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Árbol dialéctico de hipótesis lógicas para explicar anomalías publicitarias. Las hipótesis <em>Pending</em> son auditadas bajo el filtro falsacionista {"$\\mathcal{F}$"} en busca de resiliencia estructural.
          </p>

          {/* Interactive Tree Map (Dynamic Grid layout of nodes) */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-950 mb-6 min-h-[300px] flex flex-col justify-center">
            {/* Level 1: Root */}
            <div className="flex justify-center mb-6">
              {nodes.filter(n => n.parentId === null).map(node => (
                <HydraNodeCard key={node.id} node={node} />
              ))}
            </div>

            {/* Connection Lines simulation */}
            <div className="flex justify-center h-4 relative">
              <div className="absolute top-0 bottom-0 w-0.5 bg-slate-800" />
            </div>

            {/* Level 2: Main Branches (A1 & A2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col items-center">
                {nodes.filter(n => n.id === 'H_A1').map(node => (
                  <React.Fragment key={node.id}>
                    <HydraNodeCard node={node} />
                    <div className="w-0.5 h-4 bg-slate-800 my-1" />
                    {/* Level 3: Leaf Nodes */}
                    <div className="grid grid-cols-2 gap-2 w-full px-2">
                      {nodes.filter(n => n.parentId === 'H_A1').map(sub => (
                        <HydraNodeCard key={sub.id} node={sub} isLeaf />
                      ))}
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <div className="flex flex-col items-center">
                {nodes.filter(n => n.id === 'H_A2').map(node => (
                  <React.Fragment key={node.id}>
                    <HydraNodeCard node={node} />
                    <div className="w-0.5 h-4 bg-slate-800 my-1" />
                    {/* Level 3: Leaf Nodes */}
                    <div className="grid grid-cols-2 gap-2 w-full px-2">
                      {nodes.filter(n => n.parentId === 'H_A2').map(sub => (
                        <HydraNodeCard key={sub.id} node={sub} isLeaf />
                      ))}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons & Legend */}
        <div className="border-t border-slate-950 pt-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
          {/* Status Legend */}
          <div className="flex gap-4 text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Activo
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" /> Pendiente
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Fusionado
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-slate-700 line-through" /> Podado
            </span>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleResetTree}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 transition"
            >
              Resetear Árbol
            </button>
            <button
              onClick={handleRunHydraAudit}
              disabled={isAudited}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-bold font-mono tracking-wide transition flex items-center justify-center gap-2 ${
                isAudited
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-900'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/10'
              }`}
            >
              <Play className="w-4 h-4" />
              AUDITAR HYDRA PROTOCOL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Node Card Sub-component
const HydraNodeCard: React.FC<{ node: HydraNode; isLeaf?: boolean }> = ({ node, isLeaf }) => {
  const score = 0.6 * node.coherence + 0.4 * node.resistance;

  let statusStyles = "";
  let icon = null;

  switch (node.status) {
    case 'Active':
      statusStyles = "border-emerald-500/40 bg-emerald-950/20 text-slate-200";
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      break;
    case 'Pruned':
      statusStyles = "border-slate-800 bg-slate-950 text-slate-600 line-through opacity-50";
      icon = <XCircle className="w-3.5 h-3.5 text-slate-700" />;
      break;
    case 'Fused':
      statusStyles = "border-purple-500/40 bg-purple-950/20 text-purple-200";
      icon = <Layers className="w-3.5 h-3.5 text-purple-400" />;
      break;
    case 'Pending':
      statusStyles = "border-amber-500/40 bg-amber-950/10 text-slate-300 animate-pulse";
      icon = <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
      break;
  }

  return (
    <div
      className={`border rounded-lg p-2.5 w-full max-w-[190px] text-left transition duration-300 shadow-md ${statusStyles}`}
    >
      <div className="flex items-center justify-between mb-1.5 gap-1">
        <span className="text-[10px] font-bold font-mono tracking-tight truncate">
          {node.label}
        </span>
        {icon}
      </div>
      <p className="text-[9px] text-slate-400 leading-normal mb-2 line-clamp-2 h-[26px]">
        {node.description}
      </p>
      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 border-t border-slate-900/40 pt-1.5">
        <span>Cohere: {node.coherence.toFixed(2)}</span>
        <span className={node.status === 'Pruned' ? 'text-red-500' : 'text-emerald-400 font-bold'}>
          S: {score.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
