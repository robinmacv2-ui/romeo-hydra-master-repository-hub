import React from 'react';
import { FileText, Shield, Zap, Lock, ExternalLink, BookOpen, CheckCircle2 } from 'lucide-react';

interface DoiInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DoiInfoModal: React.FC<DoiInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <BookOpen className="w-6 h-6" />
            <h3 className="font-bold text-sm text-slate-100">
              Especificación Científica & Registro DOI
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1 rounded-lg bg-slate-800">
            ✕
          </button>
        </div>

        {/* DOI Banner */}
        <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">Zenodo Identifier (DOI):</span>
            <span className="text-xs text-slate-400 font-mono">Licencia: Apache-2.0</span>
          </div>
          <p className="text-sm font-bold text-slate-100 underline decoration-emerald-500 decoration-2">
            DOI: 10.5281/zenodo.21406719
          </p>
          <p className="text-xs text-slate-300">
            <strong>Título Oficial:</strong> ROMEO-HYDRA: Cognitive Governance Core & EMMOROR-EXP Framework.
          </p>
          <p className="text-xs text-slate-400">
            <strong>Progenitor & Autor Soberano:</strong> Luis Angel Vazquez Martinez (2026).
          </p>
        </div>

        {/* Conceptual Axioms */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Axiomas Fundamentales de Gobernanza (4 Regímenes Legales):
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">Regimen Alpha</span>
              <p className="text-slate-400 text-[11px]">
                Estabilidad Estructural. Garantiza que la intersección de conjuntos convexos no sea vacía ($\cap S_n \neq \emptyset$), rechazando contradicciones lógicas.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">Regimen Beta</span>
              <p className="text-slate-400 text-[11px]">
                Coherencia Adaptativa. Jacobiano de Amortiguación $J' = A(\Omega)J$. Mitiga la volatilidad de inferencia aplicando factor $\alpha$.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">Regimen Gamma</span>
              <p className="text-slate-400 text-[11px]">
                Gobernanza de Entropía. Métrica $HSI = \alpha \cdot MSH + \beta \cdot ES + \gamma \cdot RI$. Poda y ramificación de hipótesis.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-purple-400 font-bold block mb-1">Regimen Delta</span>
              <p className="text-slate-400 text-[11px]">
                Soberanía & Trazabilidad. Ledger WORM inmutable con firmas multimodelo y sello de autoría inalterable.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
