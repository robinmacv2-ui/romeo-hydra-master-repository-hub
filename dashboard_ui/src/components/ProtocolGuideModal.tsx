import React from 'react';
import { X, BookOpen, ShieldCheck, Cpu } from 'lucide-react';

interface ProtocolGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProtocolGuideModal: React.FC<ProtocolGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full p-6 shadow-2xl space-y-5 font-mono text-xs max-h-[88vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                ROMEO-HYDRA: Cognitive Governance Core (DOI Specification)
              </h3>
              <p className="text-[10px] text-emerald-400">
                DOI: 10.5281/zenodo.21406719 • EMMOROR-EXP Framework v3.0-RC1
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abstract & Authorship */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 leading-relaxed">
          <div className="flex justify-between text-[10px] text-slate-500 uppercase">
            <span>Autoridad Soberana: Luis Angel Vazquez Martinez</span>
            <span>Release: v3.0-RC1</span>
          </div>
          <h4 className="text-xs font-bold text-white uppercase">Resumen del Framework</h4>
          <p className="text-slate-300 text-[11px]">
            ROMEO-HYDRA es un framework de gobernanza de inferencias diseñado para dotar a arquitecturas multimodelo de estabilidad lógica estricta (Coherencia Lógica Convexa - CLC) frente a la entropía y la deriva de respuestas. Opera mediante 4 regímenes operativos entrelazados con amortiguación Jacobiana y un registro inmutable WORM.
          </p>
        </div>

        {/* 4 Operating Regimes */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-amber-400 uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Taxonomía de los 4 Regímenes Operativos
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
            <div className="bg-slate-950 p-3 rounded border border-purple-500/30 space-y-1">
              <span className="text-purple-300 font-bold block uppercase">Régimen ALPHA — Estabilidad Estructural</span>
              <p className="text-slate-400 text-[10px]">
                Validación de invariantes lógicas y rechazo estricto de contradicciones lógicas. Mantiene el espacio convexo S libre de bifurcaciones.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-amber-500/30 space-y-1">
              <span className="text-amber-300 font-bold block uppercase">Régimen BETA — Coherencia Adaptativa</span>
              <p className="text-slate-400 text-[10px]">
                {'Implementa la Amortiguación Jacobiana J = ∂F(S)/∂S. Si ||J|| > θ, la confianza de inferencia se recalcula: C\' = C * α.'}
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-blue-500/30 space-y-1">
              <span className="text-blue-300 font-bold block uppercase">Régimen GAMMA — Gobernanza de Entropía</span>
              <p className="text-slate-400 text-[10px]">
                Mide el Índice de Estabilidad Hydra HSI = α·MSH + β·ES + γ·RI. Controla el crecimiento y la poda del árbol de hipótesis.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-emerald-500/30 space-y-1">
              <span className="text-emerald-300 font-bold block uppercase">Régimen DELTA — Soberanía & Registro WORM</span>
              <p className="text-slate-400 text-[10px]">
                Garantiza la trazabilidad post-operativa inmutable registrando firmas criptográficas multimodelo en un libro contable WORM.
              </p>
            </div>
          </div>
        </div>

        {/* Mathematical Foundations */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Fundamentación Matemática & Amortiguación Jacobiana
          </h4>
          <div className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
            <p>
              • <strong>Potencial de Coherencia:</strong> Σ(x) = -Σ w_i ln(x_i) + (1/2) x^T A x
            </p>
            <p>
              • <strong>Norma de Frobenius Jacobiana:</strong> ||J||_F = sqrt(Σ |J_ij|^2)
            </p>
            <p>
              • <strong>Condición de Regreso:</strong> {'Cuando ||J|| <= θ, el sistema opera en modo estacional NORMAL. Cuando ||J|| > θ, se aplica el factor de penalización α = 0.70.'}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs px-5 py-2 rounded uppercase"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
