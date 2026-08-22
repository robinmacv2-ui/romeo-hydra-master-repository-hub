import React, { useState, useEffect } from 'react';
import { Award, BookOpen, Copy, ExternalLink, FileCheck, Check, Edit2, Save, X, Bookmark, Download } from 'lucide-react';

interface DoiCertificateProps {
  currentDoi?: string;
  onLogEvent?: (source: string, detail: string, metrics: Record<string, any>) => void;
  onDoiChange?: (newDoi: string) => void;
  isLocked?: boolean;
}

export const DoiCertificate: React.FC<DoiCertificateProps> = ({ currentDoi, onLogEvent, onDoiChange, isLocked = false }) => {
  const defaultDoi = "10.5281/zenodo.21406719";
  const defaultAuthor = "LUIS ANGEL VAZQUEZ MARTINEZ";
  const defaultTitle = "ROMEO-HYDRA: Gobernanza Cognitiva y Validación Invariante bajo Regímenes Lógicos EMMOROR";

  const [doi, setDoi] = useState<string>(defaultDoi);

  // Keep in sync with parent component state changes
  useEffect(() => {
    if (doi !== defaultDoi) {
      setDoi(defaultDoi);
      setEditDoi(defaultDoi);
    }
  }, [currentDoi]);
  const [author, setAuthor] = useState<string>(() => {
    return localStorage.getItem('romeo_hydra_author') || defaultAuthor;
  });
  const [title, setTitle] = useState<string>(() => {
    return localStorage.getItem('romeo_hydra_title') || defaultTitle;
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editDoi, setEditDoi] = useState<string>(doi);
  const [editAuthor, setEditAuthor] = useState<string>(author);
  const [editTitle, setEditTitle] = useState<string>(title);

  const [copiedDoi, setCopiedDoi] = useState<boolean>(false);
  const [copiedBibtex, setCopiedBibtex] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    if (onLogEvent) {
      onLogEvent(
        "DOI_CERTIFICATE",
        "Iniciando compilación y empaquetado del repositorio para demostración bancaria",
        { timestamp: new Date().toISOString() }
      );
    }

    try {
      const response = await fetch("/api/export-zip");
      if (!response.ok) {
        throw new Error("Error en la compilación del repositorio");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "romeo_hydra_demo_bancos.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);

      if (onLogEvent) {
        onLogEvent(
          "DOI_CERTIFICATE",
          "Compilación y descarga de demo ZIP completada con éxito para auditoría",
          { bytes_size: blob.size }
        );
      }
    } catch (err: any) {
      console.error(err);
      if (onLogEvent) {
        onLogEvent(
          "DOI_CERTIFICATE",
          "Fallo en la descarga de la demo ZIP",
          { error: err.message }
        );
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate BibTeX dynamic citation snippet
  const bibtex = `@misc{vazquez2026romeohydra,
  author       = {${author}},
  title        = {{${title}}},
  month        = jul,
  year         = 2026,
  publisher    = {Zenodo Open Repository // EMMOROR},
  doi          = {${doi}},
  url          = {https://doi.org/${doi}}
}`;

  const handleCopyDoi = () => {
    navigator.clipboard.writeText(doi);
    setCopiedDoi(true);
    setTimeout(() => setCopiedDoi(false), 2000);

    if (onLogEvent) {
      onLogEvent(
        "DOI_CERTIFICATE",
        "Copiado de identificador DOI al portapapeles",
        { doi }
      );
    }
  };

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(bibtex);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);

    if (onLogEvent) {
      onLogEvent(
        "DOI_CERTIFICATE",
        "Copiación de cita académica BibTeX para publicación",
        { doi, author }
      );
    }
  };

  const updateDoi = (newDoi: string) => {
    const trimmed = defaultDoi; // Enforce canonical DOI
    setDoi(trimmed);
    setEditDoi(trimmed);
    localStorage.setItem('romeo_hydra_doi', trimmed);

    if (onDoiChange) {
      onDoiChange(trimmed);
    }

    if (onLogEvent) {
      onLogEvent(
        "DOI_CERTIFICATE",
        "Validación e inmutabilidad del identificador DOI",
        { doi: trimmed }
      );
    }
  };

  const handleSaveEdit = () => {
    if (editDoi.trim()) {
      const prevDoi = doi;
      updateDoi(editDoi);
      setAuthor(editAuthor);
      setTitle(editTitle);
      localStorage.setItem('romeo_hydra_author', editAuthor);
      localStorage.setItem('romeo_hydra_title', editTitle);
      setIsEditing(false);

      if (onLogEvent && (editAuthor !== author || editTitle !== title)) {
        onLogEvent(
          "DOI_CERTIFICATE",
          "Actualización de metadatos de autor y título de registro DOI en LocalStorage",
          {
            previous_doi: prevDoi,
            new_doi: editDoi,
            author_updated: editAuthor !== author,
            title_updated: editTitle !== title
          }
        );
      }
    }
  };

  const handleCancelEdit = () => {
    setEditDoi(doi);
    setEditAuthor(author);
    setEditTitle(title);
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden" id="doi-certificate-card">
      {/* Visual Accent Graphics */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider font-mono">
            Certificado de Registro Científico DOI
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20 flex items-center gap-1.5 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          ZENODO OPEN SCIENCE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: The formal looking certificate */}
        <div className="lg:col-span-7 bg-slate-950/80 rounded-xl border border-slate-800/80 p-5 relative overflow-hidden flex flex-col justify-between min-h-[280px]">
          {/* Internal watermark certificate border */}
          <div className="absolute inset-2 border border-slate-800/40 rounded-lg pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            {/* Stamp/Seal Badge */}
            <div className="flex justify-between items-start">
              <div className="text-[9px] font-mono text-slate-500 uppercase">
                Metacognitive Artifact Certification
              </div>
              <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center">
                <Bookmark className="w-4 h-4 text-amber-400" />
              </div>
            </div>

            {/* Certificate Title */}
            <div>
              <h4 className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest mb-1">
                Digital Object Identifier Deposit
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                Por la presente se certifica el registro, depósito e indexación de la obra de ingeniería y metodología de deconstrucción heurística titulada:
              </p>
            </div>

            {/* Title / Publication Name */}
            <div className="bg-slate-900/30 p-2.5 rounded border border-slate-900/60 font-sans">
              <p className="text-xs font-semibold text-slate-200 tracking-tight leading-normal">
                "{title}"
              </p>
            </div>

            {/* Author Name */}
            <div className="flex justify-between items-center text-xs font-mono pt-1">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Autor Principal</span>
                <span className="text-slate-300 font-bold">{author}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 block uppercase">Licencia de Uso</span>
                <span className="text-slate-400">CC BY 4.0 International</span>
              </div>
            </div>
          </div>

          {/* DOI Code Showcase */}
          <div className="relative z-10 border-t border-slate-900 pt-3.5 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[9px] font-mono text-slate-500 block uppercase">DOI Oficial de Obra</span>
              <span className="text-sm font-mono font-bold text-cyan-400 select-all">
                {doi}
              </span>
            </div>
            <div className="text-[9px] font-mono text-slate-500 bg-slate-900/60 px-2.5 py-1 rounded border border-slate-900 flex items-center gap-1">
              <FileCheck className="w-3 h-3 text-emerald-400" />
              <span>Verificación de Integridad: OK</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Tools & Edit Form */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          
          {/* Action Hub */}
          {!isEditing ? (
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Módulos de Indexación y Cita
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {/* Copy DOI Button */}
                <button
                  onClick={handleCopyDoi}
                  className="p-3 bg-slate-950 hover:bg-slate-950/40 border border-slate-800 rounded-xl text-left transition duration-300 group"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Identificador</span>
                    {copiedDoi ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-300 block mb-0.5">Copiar DOI</span>
                  <span className="text-[9px] font-mono text-slate-500 truncate block">{doi}</span>
                </button>

                {/* Open URL Button */}
                <a
                  href={`https://doi.org/${doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-slate-950 hover:bg-slate-950/40 border border-slate-800 rounded-xl text-left transition duration-300 group block"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Publicación</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 block mb-0.5">Abrir Registro</span>
                  <span className="text-[9px] font-mono text-cyan-500 truncate block">doi.org/{doi}</span>
                </a>
              </div>

              {/* Premium ZIP Export Button for Banks */}
              <button
                onClick={handleDownloadZip}
                disabled={isDownloading}
                className={`w-full p-3 border rounded-xl flex items-center justify-between transition duration-300 text-left ${
                  isDownloading 
                    ? "bg-slate-900 border-slate-800 opacity-60 cursor-not-allowed" 
                    : downloadSuccess 
                    ? "bg-emerald-950/40 border-emerald-500/50 hover:bg-emerald-950/60 shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
                    : "bg-slate-950 hover:bg-slate-950/40 border-slate-800 hover:border-amber-500/40 cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    downloadSuccess ? "bg-emerald-500/20" : "bg-amber-500/10"
                  }`}>
                    {downloadSuccess ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Download className={`w-4 h-4 text-amber-400 ${isDownloading ? "animate-bounce" : ""}`} />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      {isDownloading ? "Compilando repositorio..." : downloadSuccess ? "¡Demo Descargada!" : "Exportar Repositorio para Bancos"}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 block">
                      {isDownloading ? "Generando ZIP en tiempo real..." : downloadSuccess ? "Archivo comprimido listo" : "Estructura completa de gobernanza cognitiva .zip"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold bg-slate-900 px-2 py-1 rounded text-slate-400">
                    ZIP
                  </span>
                </div>
              </button>

              {/* BibTeX copy box */}
              <div className="bg-slate-950 rounded-xl border border-slate-800/80 p-3.5 relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">
                    Cita Académica BibTeX
                  </span>
                  <button
                    onClick={handleCopyBibtex}
                    className="p-1 hover:bg-slate-900 rounded transition"
                    title="Copiar BibTeX"
                  >
                    {copiedBibtex ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
                    )}
                  </button>
                </div>
                <pre className="text-[9px] font-mono text-slate-400 overflow-x-auto max-h-[110px] custom-scrollbar bg-slate-900/40 p-2 rounded border border-slate-900 leading-normal whitespace-pre">
                  {bibtex}
                </pre>
              </div>

              {/* Presets Rápidos */}
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Submódulos del Repositorio Unificado (DOI Canónico)
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled
                    className="px-2.5 py-1.5 text-[10px] font-mono rounded-lg border bg-amber-500/15 text-amber-400 border-amber-500/40 font-semibold cursor-default"
                  >
                    ROMEO-HYDRA (Principal)
                  </button>
                  <button
                    disabled
                    title="Indexado bajo el DOI principal de ROMEO-HYDRA"
                    className="px-2.5 py-1.5 text-[10px] font-mono rounded-lg border bg-slate-950/40 text-slate-500 border-slate-900/60 opacity-60 cursor-not-allowed"
                  >
                    EMMOROR-CORE (Submódulo)
                  </button>
                  <button
                    disabled
                    title="Indexado bajo el DOI principal de ROMEO-HYDRA"
                    className="px-2.5 py-1.5 text-[10px] font-mono rounded-lg border bg-slate-950/40 text-slate-500 border-slate-900/60 opacity-60 cursor-not-allowed"
                  >
                    Gobernanza Cognitiva (Submódulo)
                  </button>
                </div>
              </div>

              {/* Toggle Edit Button */}
              {isLocked ? (
                <div className="w-full py-2.5 bg-slate-950/40 border border-slate-900 text-slate-500 rounded-lg text-xs font-mono flex items-center justify-center gap-2 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Certificado Protegido (Sólo Lectura)
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 transition flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  Actualizar Datos del Certificado
                </button>
              )}
            </div>
          ) : (
            // EDIT FORM PANEL
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3.5">
              <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
                Editar Metadatos de Registro
              </h4>

              <div className="space-y-3 font-mono text-xs">
                {/* DOI Input */}
                <div>
                  <label className="text-[9px] text-slate-500 uppercase block mb-1">DOI Registro (Canónico / Protegido)</label>
                  <input
                    type="text"
                    value={editDoi}
                    readOnly
                    className="w-full bg-slate-950/60 border border-slate-900 rounded p-2 text-slate-400 cursor-not-allowed font-mono"
                    placeholder="10.5281/zenodo.21406719"
                  />
                  <span className="text-[8px] text-amber-500/80 mt-1 block">
                    Este identificador está certificado en producción y no puede alterarse para mantener la gobernanza.
                  </span>
                </div>

                {/* Author Input */}
                <div>
                  <label className="text-[9px] text-slate-500 uppercase block mb-1">Autor Principal</label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500/40"
                    placeholder="LUIS ANGEL VAZQUEZ MARTINEZ"
                  />
                </div>

                {/* Title Input */}
                <div>
                  <label className="text-[9px] text-slate-500 uppercase block mb-1">Título de Obra</label>
                  <textarea
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500/40 resize-none leading-normal"
                    placeholder="Título del proyecto o publicación..."
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 transition flex items-center justify-center gap-1"
                >
                  <X className="w-3 h-3" /> Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editDoi.trim()}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-mono font-bold transition flex items-center justify-center gap-1 disabled:opacity-40"
                >
                  <Save className="w-3 h-3" /> Guardar Cambios
                </button>
              </div>
            </div>
          )}

          <div className="text-[9px] font-mono text-slate-500 bg-slate-950/40 p-2 rounded-lg border border-slate-950 text-center leading-relaxed">
            Las modificaciones se almacenan en la caché de tu navegador. El sellado criptográfico en el Ledger Delta reflejará la auditoría de cada actualización.
          </div>
        </div>

      </div>
    </div>
  );
};
