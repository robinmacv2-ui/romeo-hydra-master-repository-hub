import React, { useState } from 'react';
import { 
  Folder, 
  FileText, 
  Code, 
  FileJson, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Download, 
  Edit3, 
  Save, 
  ShieldCheck, 
  Search,
  ExternalLink,
  Info,
  Cpu
} from 'lucide-react';
import { MASTER_REPO_FILES } from '../data/masterRepoData';
import { RepoFile } from '../types';
import { exportMasterRepoZip } from '../lib/zipExporter';

export const RepoExplorer: React.FC = () => {
  const [files, setFiles] = useState<RepoFile[]>(MASTER_REPO_FILES);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('README.md');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const selectedFile = files.find(f => f.path === selectedFilePath) || files[0];

  const handleSelectFile = (file: RepoFile) => {
    setSelectedFilePath(file.path);
    setIsEditing(false);
    setEditedContent(file.content);
  };

  const handleSaveEdit = () => {
    setFiles(prev => prev.map(f => f.path === selectedFilePath ? { ...f, content: editedContent } : f));
    setIsEditing(false);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (type: RepoFile['type']) => {
    switch (type) {
      case 'markdown': return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'python': return <Code className="w-4 h-4 text-emerald-400" />;
      case 'json': return <FileJson className="w-4 h-4 text-amber-400" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-purple-400" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Folder & File Directory Tree */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-cyan-400" />
              <h2 className="text-slate-100 font-bold text-sm">romeo-hydra-master/</h2>
            </div>
            <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded font-mono">
              7 DOIs
            </span>
          </div>

          {/* Search Box */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar archivo o DOI..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Directory Tree */}
          <div className="space-y-1 overflow-y-auto max-h-[500px] pr-1">
            {/* Root Files */}
            <div className="text-xs font-semibold text-slate-500 px-2 py-1 uppercase tracking-wider">
              Raíz Repositorio
            </div>
            {filteredFiles.filter(f => f.folder === 'root').map(file => (
              <button
                key={file.path}
                onClick={() => handleSelectFile(file)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                  selectedFilePath === file.path
                    ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/40 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {getFileIcon(file.type)}
                  <span className="truncate">{file.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0 font-sans">{file.size}</span>
              </button>
            ))}

            {/* docs/ folder */}
            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-500 px-2 py-1 uppercase tracking-wider flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-cyan-500" /> docs/
              </div>
              {filteredFiles.filter(f => f.folder === 'docs').map(file => (
                <button
                  key={file.path}
                  onClick={() => handleSelectFile(file)}
                  className={`w-full text-left pl-6 pr-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                    selectedFilePath === file.path
                      ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/40 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getFileIcon(file.type)}
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-sans">{file.size}</span>
                </button>
              ))}
            </div>

            {/* src/ folder */}
            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-500 px-2 py-1 uppercase tracking-wider flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-emerald-500" /> src/
              </div>
              {filteredFiles.filter(f => f.folder === 'src').map(file => (
                <button
                  key={file.path}
                  onClick={() => handleSelectFile(file)}
                  className={`w-full text-left pl-6 pr-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                    selectedFilePath === file.path
                      ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/40 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getFileIcon(file.type)}
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-sans">{file.size}</span>
                </button>
              ))}
            </div>

            {/* ledger/ folder */}
            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-500 px-2 py-1 uppercase tracking-wider flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-amber-500" /> ledger/
              </div>
              {filteredFiles.filter(f => f.folder === 'ledger').map(file => (
                <button
                  key={file.path}
                  onClick={() => handleSelectFile(file)}
                  className={`w-full text-left pl-6 pr-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                    selectedFilePath === file.path
                      ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/40 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getFileIcon(file.type)}
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-sans">{file.size}</span>
                </button>
              ))}
            </div>

            {/* assets/ folder */}
            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-500 px-2 py-1 uppercase tracking-wider flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-purple-500" /> assets/
              </div>
              {filteredFiles.filter(f => f.folder === 'assets').map(file => (
                <button
                  key={file.path}
                  onClick={() => handleSelectFile(file)}
                  className={`w-full text-left pl-6 pr-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                    selectedFilePath === file.path
                      ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/40 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getFileIcon(file.type)}
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-sans">{file.size}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick ZIP Export Box */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => exportMasterRepoZip()}
              className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg py-2 px-3 text-xs font-medium transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              Descargar Repositorio Completo (.ZIP)
            </button>
          </div>
        </div>

        {/* Right Code Viewer / Editor Area */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex flex-col overflow-hidden">
          
          {/* File Header Bar */}
          <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {getFileIcon(selectedFile.type)}
              <div>
                <h3 className="text-slate-100 font-bold text-sm font-mono flex items-center gap-2">
                  romeo-hydra-master/{selectedFile.path}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-2">
                  <span>{selectedFile.description}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <button
                  onClick={handleSaveEdit}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar Cambios
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditedContent(selectedFile.content);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  Editar
                </button>
              )}

              <button
                onClick={handleCopyContent}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>

              <button
                onClick={handleDownloadFile}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar
              </button>
            </div>
          </div>

          {/* Metadata DOI Reference Bar */}
          <div className="bg-slate-900/90 px-5 py-2 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-300">Trazabilidad:</span>
              <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono text-[11px] border border-slate-700">
                {selectedFile.doiReference}
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-500 flex items-center gap-1">
              <span>SHA-256:</span>
              <code className="text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                {selectedFile.sha256.substring(0, 16)}...
              </code>
            </div>
          </div>

          {/* Code Content Container */}
          <div className="p-5 overflow-x-auto min-h-[450px] bg-slate-950 font-mono text-xs">
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
                className="w-full h-[500px] bg-slate-900 text-slate-200 border border-cyan-500/40 rounded-lg p-4 font-mono text-xs focus:outline-none leading-relaxed"
              />
            ) : selectedFile.type === 'image' ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900/60 rounded-xl border border-slate-800/80 p-8 text-center">
                <div className="w-24 h-24 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-950">
                  <Cpu className="w-12 h-12 animate-pulse" />
                </div>
                <h4 className="text-slate-200 font-bold text-base mb-1">
                  Renderización de la Tarjeta Lógica Fotónica ROMEO-HYDRA
                </h4>
                <p className="text-slate-400 text-xs max-w-md mb-4">
                  Evidencia visual de las maquetas, renders fotónicos y topología de semiconductores SOI para el Chip PPRH [DOI 2].
                </p>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-left w-full max-w-lg font-mono text-[11px] text-slate-300">
                  <div className="text-cyan-400 font-semibold mb-1">Especificación Fotónica:</div>
                  • Módulo de interferometría Mach-Zehnder (MZI)<br/>
                  • Anillo resonador con Factor Q &gt; 10^5<br/>
                  • Sello Invariante: 0xLAVM_PPRH_HYDRA_V3_CRISTALIZADO<br/>
                  • Dimensiones: Standard PCIe x16 Ciberfísico
                </div>
              </div>
            ) : (
              <pre className="text-slate-200 leading-relaxed overflow-x-auto select-text whitespace-pre-wrap">
                <code>{selectedFile.content}</code>
              </pre>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
