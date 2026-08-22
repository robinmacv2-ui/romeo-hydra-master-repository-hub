import React, { useState, useEffect } from 'react';
import { CardState, FileHashResult } from '../types';
import { generateCardFingerprint, calculateSHA256Buffer } from '../utils/quantumLogic';
import { ShieldCheck, Hash, Upload, FileCheck, Copy, Check, Lock, Calendar, Layers } from 'lucide-react';

interface DigitalSealToolProps {
  cardState: CardState;
  fingerprint: string;
}

export const DigitalSealTool: React.FC<DigitalSealToolProps> = ({ cardState, fingerprint }) => {
  const [copied, setCopied] = useState(false);
  const [uploadedFileHash, setUploadedFileHash] = useState<FileHashResult | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsHashing(true);
    try {
      const buffer = await file.arrayBuffer();
      const hash = await calculateSHA256Buffer(buffer);

      setUploadedFileHash({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'Fichero Binario',
        sha256: hash,
        timestamp: new Date().toLocaleString(),
      });
    } catch (err) {
      console.error('Error calculating hash:', err);
    } finally {
      setIsHashing(false);
    }
  };

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 ring-1 ring-emerald-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-mono text-base font-bold text-slate-100">
                SELLO DE CERA DIGITAL & AUTORÍA CRIPTOGRÁFICA (SHA-256)
              </h2>
              <p className="text-xs text-slate-400">
                Verificación de integridad de archivos y fingerprinting para registro legal de propiedad intelectual • <span className="text-emerald-400 font-medium">Fundador: Luis Angel Vazquez Martinez</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
            <Calendar className="h-4 w-4" />
            <span>Referencia: 28 de julio de 2026</span>
          </div>
        </div>
      </div>

      {/* Real-time Card Fingerprint Badge */}
      <div className="rounded-2xl border border-emerald-500/30 bg-slate-950 p-6 ring-1 ring-emerald-500/20">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-emerald-400" />
            <h3 className="font-mono text-xs font-bold text-slate-100">
              HUELLA DIGITAL DEL ESTADO ACTUAL DE LA TARJETA
            </h3>
          </div>
          <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800">
            PPRH-SEAL-OK
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-900 p-4 border border-slate-800 font-mono text-xs">
          <div className="flex items-center space-x-2 text-emerald-300 break-all">
            <Hash className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{fingerprint}</span>
          </div>
          <button
            onClick={() => handleCopyHash(fingerprint)}
            className="ml-3 shrink-0 rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
            title="Copiar Hash SHA-256"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Archive File Hasher Tool */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <h3 className="mb-2 font-mono text-xs font-bold text-slate-200">
          CALCULADORA SHA-256 DE ARCHIVO PAQUETE (Codice_RRPH_Luis_Angel_Vazquez_Martinez_20260728.zip)
        </h3>
        <p className="mb-4 text-xs text-slate-400">
          Selecciona o arrastra cualquier archivo (.zip, .docx, .py, fotos de libretas) para calcular su sello criptográfico en tiempo real sin subir nada a ningún servidor externo.
        </p>

        <label
          htmlFor="file-seal-upload"
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/50 p-8 transition-all hover:border-cyan-500/50 hover:bg-slate-900"
        >
          <Upload className="mb-2 h-8 w-8 text-cyan-400 animate-bounce" />
          <span className="font-mono text-xs font-bold text-slate-200">
            Haz clic o arrastra un archivo aquí
          </span>
          <span className="mt-1 text-[11px] text-slate-500">
            Procesamiento 100% cliente WebCrypto seguro API
          </span>
          <input
            id="file-seal-upload"
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {isHashing && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-xs font-mono text-cyan-400">
            <span className="h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
            <span>Calculando SHA-256 hash de alta precisión...</span>
          </div>
        )}

        {uploadedFileHash && (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-400 flex items-center space-x-1.5">
                <FileCheck className="h-4 w-4" />
                <span>{uploadedFileHash.fileName}</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {(uploadedFileHash.fileSize / 1024).toFixed(1)} KB
              </span>
            </div>

            <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-200 border border-slate-800 break-all">
              <span className="text-slate-500 mr-2">SHA-256:</span>
              <strong className="text-emerald-400">{uploadedFileHash.sha256}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
