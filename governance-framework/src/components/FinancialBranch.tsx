import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FINANCIAL_DATA } from '../data';
import { calculateTransientState, calculateFrobeniusNorm } from '../utils';
import { StateVector } from '../types';
import { Shield, ShieldAlert, Zap, TrendingDown, Check } from 'lucide-react';

interface FinancialBranchProps {
  onLogEvent: (source: string, detail: string, metrics: Record<string, any>) => void;
  onSetAlphaActive: (active: boolean) => void;
  onSetBetaNorm: (norm: number) => void;
}

export const FinancialBranch: React.FC<FinancialBranchProps> = ({
  onLogEvent,
  onSetAlphaActive,
  onSetBetaNorm
}) => {
  const [scenario, setScenario] = useState<'1987' | '2010'>('1987');
  const [firewallArmed, setFirewallArmed] = useState<boolean>(true);
  const [isBreached, setIsBreached] = useState<boolean>(false);

  const baseState = scenario === '1987' ? FINANCIAL_DATA.pre1987 : FINANCIAL_DATA.pre2010;
  const config = scenario === '1987' ? FINANCIAL_DATA.perturbation1987 : FINANCIAL_DATA.perturbation2010;
  const originalJ = FINANCIAL_DATA.jacobian.matrix;

  // Let's implement the Alpha Firewall logical row masking
  // If firewall is armed, we check if any state falls below 0.45.
  // If so, we set the rows of J for those variables to 0 (except diagonal).
  const getProtectedJacobian = (state: StateVector) => {
    if (!firewallArmed) return { matrix: originalJ, breachedStates: [] as string[] };

    const breachedStates: string[] = [];
    const mask = [1.0, 1.0, 1.0, 1.0];

    if (state.D < 0.50) { mask[0] = 0.0; breachedStates.push("Liquidez (D)"); }
    if (state.O < 0.50) { mask[1] = 0.0; breachedStates.push("Retorno (O)"); }
    if (state.A < 0.50) { mask[2] = 0.0; breachedStates.push("Adaptabilidad (A)"); }
    if (state.R < 0.50) { mask[3] = 0.0; breachedStates.push("Resiliencia (R)"); }

    // Mask Jacobian rows: J_masked_ij = J_ij * mask[i]
    const maskedJ = originalJ.map((row, rIdx) => {
      // If row is masked, decouple it completely (set coefficients to 0, except keep a small diagonal or set to 0)
      if (mask[rIdx] === 0.0) {
        return row.map((val, cIdx) => rIdx === cIdx ? 1.0 : 0.0); // Keep self-loop, kill coupling
      }
      return row;
    });

    return { matrix: maskedJ, breachedStates };
  };

  // Generate trajectory with or without firewall dynamic masking
  const generateTrajectory = () => {
    const data = [];
    let state = { ...baseState };

    for (let t = 0; t <= 40; t += 2) {
      if (t < 6) {
        // Normal state pre-shock
        data.push({
          time: t,
          Liquidez: state.D,
          Retorno: state.O,
          Adaptabilidad: state.A,
          Resiliencia: state.R,
        });
      } else {
        const timeAfterShock = t - 6;
        // Dynamically get the Jacobian (with masking if breached and firewall is armed)
        const { matrix: currentJ } = getProtectedJacobian(state);

        // Calculate next state
        const calculatedState = calculateTransientState(
          baseState,
          currentJ,
          config.delta_u0,
          timeAfterShock,
          config.tau,
          ['D', 'O', 'A', 'R']
        );

        state = calculatedState;

        data.push({
          time: t,
          Liquidez: state.D,
          Retorno: state.O,
          Adaptabilidad: state.A,
          Resiliencia: state.R,
        });
      }
    }
    return data;
  };

  const chartData = generateTrajectory();
  const finalState = {
    D: chartData[chartData.length - 1].Liquidez,
    O: chartData[chartData.length - 1].Retorno,
    A: chartData[chartData.length - 1].Adaptabilidad,
    R: chartData[chartData.length - 1].Resiliencia,
  };

  const { matrix: finalJ, breachedStates } = getProtectedJacobian(finalState);
  const fNorm = calculateFrobeniusNorm(finalJ);

  // Sync to parent dashboard status
  React.useEffect(() => {
    onSetAlphaActive(firewallArmed);
    onSetBetaNorm(fNorm);
  }, [firewallArmed, fNorm]);

  const handleTriggerCrash = () => {
    onLogEvent(
      "ALPHA_FIREWALL",
      `Estallido de Crisis Financiera - ${config.label}`,
      {
        scenario: config.label,
        firewall_armed: firewallArmed,
        frobenius_norm: fNorm,
        breached_states: breachedStates,
        residual_liquidity: finalState.D,
        residual_resilience: finalState.R,
      }
    );
  };

  const hasBreached = breachedStates.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="financial-branch-container">
      {/* Configuration Column */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">
              Análisis de Contagio Financiero
            </h3>
          </div>

          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Compara la propagación de anomalías en dos crisis históricas. Observa cómo el acoplamiento del Jacobiano multiplica la volatilidad y prueba el disyuntor (circuit breaker) Alpha.
          </p>

          {/* Scenario Select */}
          <div className="mb-5">
            <label className="text-[10px] font-mono tracking-wider text-slate-500 uppercase block mb-2">
              Seleccionar Evento de Crisis
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setScenario('1987')}
                className={`py-1.5 rounded font-mono text-xs font-semibold transition ${
                  scenario === '1987'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1987 (Lunes Negro)
              </button>
              <button
                onClick={() => setScenario('2010')}
                className={`py-1.5 rounded font-mono text-xs font-semibold transition ${
                  scenario === '2010'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2010 (Flash Crash)
              </button>
            </div>
          </div>

          {/* Alpha Firewall Toggle */}
          <div className={`p-4 rounded-xl border mb-5 transition ${
            firewallArmed 
              ? 'bg-emerald-500/5 border-emerald-500/20' 
              : 'bg-rose-500/5 border-rose-500/10'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className={`w-4 h-4 ${firewallArmed ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">
                  Cortafuegos Alpha (Invariante)
                </span>
              </div>
              <button
                onClick={() => setFirewallArmed(!firewallArmed)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  firewallArmed ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                    firewallArmed ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Mecanismo que monitorea la caída de liquidez ($D \le 0.50$). Al activarse, desacopla el Jacobiano aplanando las filas de contagio para salvar los nodos de Resiliencia ($R$) y Retorno ($O$).
            </p>
            {firewallArmed && hasBreached && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-mono animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" />
                CIRCUIT BREAKER ACTIVADO: Decoupled {breachedStates.join(", ")}
              </div>
            )}
            {!firewallArmed && (
              <div className="text-[10px] text-rose-400/90 font-mono">
                ⚠ Peligro: Sin cortafuegos, el contagio es libre y puede causar colapso a valores negativos.
              </div>
            )}
          </div>

          {/* Interactive Matrix View */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                Jacobiano de Acoplamiento J_fin (t = 40)
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                ||J||_F = {fNorm.toFixed(4)}
              </span>
            </div>
            
            <div className="font-mono text-xs flex flex-col gap-1">
              {finalJ.map((row, rIdx) => {
                const rowBreached = firewallArmed && (
                  (rIdx === 0 && finalState.D < 0.50) ||
                  (rIdx === 1 && finalState.O < 0.50) ||
                  (rIdx === 2 && finalState.A < 0.50) ||
                  (rIdx === 3 && finalState.R < 0.50)
                );
                return (
                  <div 
                    key={rIdx} 
                    className={`grid grid-cols-5 p-1.5 rounded items-center ${
                      rowBreached 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : 'bg-slate-900/40 text-slate-400 border border-slate-950'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-500 truncate">
                      {FINANCIAL_DATA.jacobian.rowNames[rIdx].split(' ')[0]}
                    </span>
                    {row.map((val, cIdx) => (
                      <span key={cIdx} className="text-center font-bold">
                        {val.toFixed(2)}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="text-[9px] text-slate-500 font-mono mt-3 leading-tight">
              * Las filas rojas indican nodos desacoplados por el Cortafuegos Alpha. Sus coeficientes de transferencia cruzados han sido forzados a 0.0 para detener el contagio.
            </div>
          </div>
        </div>

        <button
          onClick={handleTriggerCrash}
          className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono tracking-wide shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 mt-4 transition"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          INYECTAR SHOCK AL SISTEMA FINANCIERO
        </button>
      </div>

      {/* Trajectory & Comparison Column */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* State Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wide">
              Evolución de Liquidez y Resiliencia S_fin(t)
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Decaimiento: {scenario === '1987' ? 'Persistente (τ=100)' : 'Impulso (τ=0.08)'}
            </span>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} unit=" min" />
                <YAxis stroke="#64748B" fontSize={10} domain={[0, 1.2]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155' }}
                  labelStyle={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '11px' }}
                  itemStyle={{ fontFamily: 'monospace', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Line type="monotone" dataKey="Liquidez" stroke="#60A5FA" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Retorno" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Adaptabilidad" stroke="#34D399" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Resiliencia" stroke="#EC4899" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnostic Analysis Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide mb-3">
            Análisis Forense EMMOROR-EXP
          </h4>
          <div className="space-y-3 text-xs text-slate-400">
            {scenario === '1987' ? (
              <>
                <p>
                  <strong>Lunes Negro (1987):</strong> Un evento de colapso de fase estructural. La liquidez de los futuros desapareció rápidamente. Al no estar activo el Cortafuegos Alpha o fallar la velocidad de rebalanceo, el fuerte acoplamiento de <span className="text-indigo-400 font-mono">$J_{31}$ (0.60)</span> propagó el pánico y causó una caída total del rendimiento que permaneció deprimido.
                </p>
                <div className="p-3 bg-slate-950 border border-slate-900 rounded font-mono text-[11px] text-slate-300">
                  {firewallArmed ? (
                    <span className="text-emerald-400">🛡 Con Cortafuegos Alpha:</span>
                  ) : (
                    <span className="text-red-400">⚠ Sin Cortafuegos Alpha:</span>
                  )}{' '}
                  {firewallArmed 
                    ? "El desacoplamiento protegió la Resiliencia residual en 0.52, aislando el contagio del bucle de rebalanceo."
                    : "El sistema sufrió una cascada sistémica y cayó a valores negativos. Resiliencia final devastada."}
                </div>
              </>
            ) : (
              <>
                <p>
                  <strong>Flash Crash (2010):</strong> Caracterizado por una perturbación de impulso con un decaimiento ultra rápido (<span className="text-cyan-400 font-mono">τ = 0.08</span>). Los algoritmos de alta frecuencia (HFT) retiraron su cotización bruscamente, provocando un pico de caída.
                </p>
                <div className="p-3 bg-slate-950 border border-slate-900 rounded font-mono text-[11px] text-slate-300">
                  <span className="text-cyan-400">⚡ Efecto V-Shape:</span> Debido a la rápida relajación, el sistema se recupera de manera elástica a niveles normales de coherencia en menos de 20 minutos, siempre que el capital inicial (Resiliencia) amortigüe la oscilación transitoria.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
