import React, { useState } from 'react';
import { 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  Copy, 
  Check, 
  Search, 
  Sparkles,
  Award,
  Lock
} from 'lucide-react';
import { ZENODO_DOIS } from '../data/masterRepoData';
import { ZenodoDoi } from '../types';

export const ZenodoDoiMatrix: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedDoi, setCopiedDoi] = useState<string | null>(null);

  const handleCopyCitation = (doiItem: ZenodoDoi) => {
    const citation = `@article{vazquez2026romeo,
  author = {Vázquez Martínez, Luis Ángel},
  title = {${doiItem.title}},
  year = {2026},
  publisher = {Zenodo},
  doi = {${doiItem.doi}},
  url = {${doiItem.url}}
}`;
    navigator.clipboard.writeText(citation);
    setCopiedDoi(doiItem.doi);
    setTimeout(() => setCopiedDoi(null), 2000);
  };

  const filteredDois = ZENODO_DOIS.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.doi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.isoStandard.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded text-xs font-mono font-semibold">
              MATRIZ DE TRAZABILIDAD CRUZADA
            </span>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-xs font-mono">
              ISO/IEC 42001 COMPLIANT
            </span>
          </div>
          <h2 className="text-slate-100 font-bold text-lg">
            7 DOIs Oficiales Zenodo · Ecosistema ROMEO-HYDRA v3.0
          </h2>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl">
            Sello institucional de invarianza y trazabilidad pública respaldado por el Fundador LUIS ANGEL VAZQUEZ MARTINEZ. Cada DOI representa un pilar ontológico, algorítmico, ciberfísico o experimental.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Filtrar DOIs, ISO estándar..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* DOI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDois.map((doiItem) => (
          <div 
            key={doiItem.id} 
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-xl transition flex flex-col justify-between"
          >
            <div>
              {/* Header DOI & Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-mono text-xs font-bold">
                    DOI #{doiItem.id}
                  </span>
                  <span className="text-slate-400 font-mono text-xs text-slate-300">
                    {doiItem.doi}
                  </span>
                </div>

                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                  {doiItem.status}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-slate-100 font-bold text-sm mb-2 leading-snug">
                {doiItem.title}
              </h3>

              {/* Description */}
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                {doiItem.description}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
              {/* ISO Standard Compliance */}
              <div className="flex items-center justify-between text-slate-300 bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-500 text-[11px] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  Estándar ISO/IEEE:
                </span>
                <span className="text-cyan-300 font-semibold">{doiItem.isoStandard}</span>
              </div>

              {/* SHA-256 Hash */}
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span>Sello SHA-256:</span>
                <code className="text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  {doiItem.sha256Hash.substring(0, 20)}...
                </code>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => handleCopyCitation(doiItem)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1 rounded text-xs transition flex items-center gap-1.5"
                >
                  {copiedDoi === doiItem.doi ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  {copiedDoi === doiItem.doi ? 'Cita Copiada!' : 'Copiar BibTeX'}
                </button>

                <a
                  href={doiItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 px-3 py-1 rounded text-xs transition flex items-center gap-1.5"
                >
                  Zenodo <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
