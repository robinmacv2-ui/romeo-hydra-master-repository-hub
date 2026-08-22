import React, { useState } from 'react';
import { TECHNICAL_DOCUMENT_SECTIONS, TECHNICAL_DOCUMENT_TITLE, TECHNICAL_DOCUMENT_SUBTITLE, TECHNICAL_DOCUMENT_DATE, TECHNICAL_DOCUMENT_FOUNDER } from '../data/technicalDocument';
import { FileText, Download, Code, ShieldCheck, ChevronRight, Check, UserCheck } from 'lucide-react';

export const TechnicalDossier: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>(TECHNICAL_DOCUMENT_SECTIONS[0].id);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadManifest = () => {
    const textContent = `${TECHNICAL_DOCUMENT_TITLE}\n${TECHNICAL_DOCUMENT_SUBTITLE}\nFundador: ${TECHNICAL_DOCUMENT_FOUNDER}\nFecha: ${TECHNICAL_DOCUMENT_DATE}\n\n` +
      TECHNICAL_DOCUMENT_SECTIONS.map((s) => `${s.title}\n${'-'.repeat(s.title.length)}\n${s.content}\n`).join('\n\n');

    const blob = new Blob([textContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Codice_RRPH_Documento_Tecnico_Legal.md';
    link.click();
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Download Actions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 text-cyan-400 ring-1 ring-cyan-800">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-mono text-base font-bold text-slate-100">
                {TECHNICAL_DOCUMENT_TITLE}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs text-slate-400">{TECHNICAL_DOCUMENT_SUBTITLE} • {TECHNICAL_DOCUMENT_DATE}</span>
                <span className="inline-flex items-center space-x-1 rounded-full bg-cyan-950 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300 ring-1 ring-cyan-700/60">
                  <UserCheck className="h-3 w-3 text-cyan-400" />
                  <span>Fundador: {TECHNICAL_DOCUMENT_FOUNDER}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="/api/python-script"
              download="simulador_tarjeta_logica.py"
              className="flex items-center space-x-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-cyan-400 border border-slate-800 hover:bg-slate-800 hover:text-cyan-300 transition-all"
            >
              <Code className="h-4 w-4" />
              <span>Descargar simulador_tarjeta_logica.py</span>
            </a>

            <button
              onClick={handleDownloadManifest}
              className="flex items-center space-x-2 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-cyan-500 shadow-md shadow-cyan-600/20"
            >
              {downloaded ? <Check className="h-4 w-4 text-white" /> : <Download className="h-4 w-4" />}
              <span>Descargar Documento (.md)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Dossier Reader */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sidebar Sections Index (4 cols) */}
        <div className="space-y-1.5 lg:col-span-4">
          {TECHNICAL_DOCUMENT_SECTIONS.map((section) => {
            const isActive = activeSectionId === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`flex w-full items-center justify-between rounded-xl p-3.5 text-left text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-cyan-300 border border-cyan-500/40 ring-1 ring-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 border border-slate-800/80 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <span>{section.title}</span>
                <ChevronRight className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Section View Box (8 cols) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 lg:col-span-8">
          {TECHNICAL_DOCUMENT_SECTIONS.filter((s) => s.id === activeSectionId).map((section) => (
            <div key={section.id} className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed space-y-3">
              <h3 className="font-mono text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">
                {section.title}
              </h3>
              <div className="whitespace-pre-line text-slate-300">{section.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
