import React, { useState } from 'react';
import { AlertTriangle, Zap, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

interface StressTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunStressTest: (intensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME') => void;
}

export const StressTestModal: React.FC<StressTestModalProps> = ({
  isOpen,
  onClose,
  onRunStressTest,
}) => {
  const [intensity, setIntensity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'>('MEDIUM');
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const handleRun = () => {
    setIsSimulating(true);
    setTimeout(() => {
      onRunStressTest(intensity);
      setIsSimulating(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-mono animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
            <h3 className="font-bold text-sm text-slate-100">
              Prueba de Estrés de Entropía & Ruido (Incertidumbre)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1 rounded-lg bg-slate-800">
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
          Inyecta perturbaciones vectoriales $\varepsilon$ sobre la red Hexa-Nodo para evaluar la respuesta
          del Jacobiano de Amortiguación $J' = A(\Omega)J$, forzando la transición al Régimen BETA y
          registrando el veredicto en el Ledger WORM.
        </p>

        {/* Intensity Radio Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">
            Seleccionar Intensidad de Perturbación de Entropía:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { level: 'LOW', label: 'Baja (ε = 0.15)', desc: 'Fluctuación normal' },
              { level: 'MEDIUM', label: 'Media (ε = 0.35)', desc: 'Incertidumbre de red' },
              { level: 'HIGH', label: 'Alta (ε = 0.65)', desc: 'Simetría Crítica (REVIEW)' },
              { level: 'EXTREME', label: 'Extrema (ε = 0.95)', desc: 'Forzar Amortiguación (β)' },
            ].map((item) => (
              <button
                key={item.level}
                type="button"
                onClick={() => setIntensity(item.level as any)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  intensity === item.level
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-bold shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-xs block">{item.label}</span>
                <span className="text-[10px] text-slate-500 block font-normal mt-0.5">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancelar
          </button>

          <button
            onClick={handleRun}
            disabled={isSimulating}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Disparando Ruido...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                Ejecutar Inyección de Estrés
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
