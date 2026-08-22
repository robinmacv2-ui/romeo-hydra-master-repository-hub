import React from 'react';
import { Shield, Activity, RefreshCw, KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';

interface RegimeProps {
  alphaActive: boolean;
  betaNorm: number;
  gammaHSI: number;
  deltaValid: boolean;
}

export const RegimeOverview: React.FC<RegimeProps> = ({
  alphaActive,
  betaNorm,
  gammaHSI,
  deltaValid
}) => {
  const regimes = [
    {
      id: "Alpha",
      name: "Regimen Alpha",
      title: "Structural Stability",
      icon: Shield,
      formula: "S(t) \\ge S_{crit} \\implies \\Lambda(S) \\odot J",
      desc: "Guards system hard-invariants. Activates defensive circuit breakers (row-masking) when critical nodes fall below key thresholds to isolate errors.",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      status: alphaActive ? "FIREWALL_ARMED" : "PASSIVE_MONITOR",
      statusColor: alphaActive ? "text-amber-400 bg-amber-400/15" : "text-slate-400 bg-slate-800",
      metric: alphaActive ? "Threshold: 0.85 (Armed)" : "Threshold: OFF"
    },
    {
      id: "Beta",
      name: "Regimen Beta",
      title: "Adaptive Coherence",
      icon: Activity,
      formula: "||J||_F = \\sqrt{\\sum |J_{ij}|^2}",
      desc: "Measures system sensitivity via the Frobenius Norm of the Jacobian Matrix. Penalizes high volatility to avoid chaotic divergence.",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      status: betaNorm > 2.5 ? "HIGH_VOLATILITY" : "STABLE_COHERENCE",
      statusColor: betaNorm > 2.5 ? "text-red-400 bg-red-400/15" : "text-emerald-400 bg-emerald-400/15",
      metric: `||J||_F = ${betaNorm.toFixed(4)}`
    },
    {
      id: "Gamma",
      name: "Regimen Gamma",
      title: "Dynamic Entropy Governance",
      icon: RefreshCw,
      formula: "T_{recon} = -\\ln(\\epsilon) / (\\zeta \\cdot A)",
      desc: "Monitors hypothesis survival (HSI) and systemic relaxation. Restores structural equilibrium post-crisis, separating transient noise from persistent decay.",
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      status: "ACTIVE_GOVERNANCE",
      statusColor: "text-cyan-400 bg-cyan-400/15",
      metric: `HSI = ${gammaHSI.toFixed(4)}`
    },
    {
      id: "Delta",
      name: "Regimen Delta",
      title: "Integrity Traceability",
      icon: KeyRound,
      formula: "H_{block} = \\text{SHA256}(D_k \\parallel H_{k-1})",
      desc: "Maintains an unalterable blockchain-lite ledger of all logic transactions, parameter adjustments, and validation results. Instantly flags tampering.",
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      status: deltaValid ? "CHAIN_SECURED" : "CHAIN_COMPROMISED",
      statusColor: deltaValid ? "text-indigo-400 bg-indigo-400/15" : "text-red-500 bg-red-500/15 animate-pulse",
      metric: deltaValid ? "Hash Integrity: OK" : "HASH MISMATCH ERROR"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {regimes.map((reg) => {
        const Icon = reg.icon;
        return (
          <div 
            key={reg.id} 
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-slate-700 transition duration-300"
            id={`regime-card-${reg.id.toLowerCase()}`}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-medium tracking-wider text-slate-500 uppercase">
                  {reg.name}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold tracking-wide ${reg.statusColor}`}>
                  {reg.status}
                </span>
              </div>

              {/* Title & Icon */}
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${reg.color.split(' ')[1]}`}>
                  <Icon className={`w-5 h-5 ${reg.color.split(' ')[0]}`} />
                </div>
                <h3 className="text-base font-semibold text-slate-100 tracking-tight">
                  {reg.title}
                </h3>
              </div>

              {/* Formula Panel */}
              <div className="bg-slate-950/60 rounded px-2.5 py-1.5 font-mono text-[11px] text-slate-400 mb-3 border border-slate-950 flex items-center justify-between">
                <span className="text-slate-500">Model:</span>
                <span className="text-cyan-300/90">{reg.formula}</span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {reg.desc}
              </p>
            </div>

            {/* Metric Footer */}
            <div className="border-t border-slate-950 pt-3 mt-auto flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Active Metric:</span>
              <span className={`font-semibold ${reg.id === 'Delta' && !deltaValid ? 'text-red-500' : 'text-slate-300'}`}>
                {reg.metric}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
