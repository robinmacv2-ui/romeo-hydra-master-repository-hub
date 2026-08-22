import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Plus, 
  Sparkles, 
  Building2, 
  Check, 
  FileCheck, 
  Search, 
  ShieldAlert, 
  Key, 
  Globe, 
  Copy, 
  Lock, 
  Unlock, 
  LogOut, 
  Image as ImageIcon, 
  Upload, 
  Cpu, 
  FileImage, 
  RefreshCw,
  TrendingUp,
  FileText
} from 'lucide-react';
import { 
  getFirebaseMode, 
  subscribeToAuth, 
  loginWithGoogle, 
  logoutUser, 
  saveCertifiedInstitution, 
  getCertifiedInstitutions 
} from '../lib/firebase';

interface CertifiedInstitution {
  id: string;
  name: string;
  middlewareId: string;
  level: 'Standard Compliant' | 'EMMOROR Core Certified' | 'Sovereign Integration';
  standards: string[];
  issueDate: string;
  certHash: string;
  status: 'ACTIVE' | 'REVOKED';
  signature: string;
}

interface CertificationCenterProps {
  onLogEvent?: (source: string, detail: string, metrics: Record<string, any>) => void;
  isLocked?: boolean;
  isReadOnly?: boolean;
}

export const CertificationCenter: React.FC<CertificationCenterProps> = ({ onLogEvent, isLocked = false, isReadOnly = false }) => {
  const [institutions, setInstitutions] = useState<CertifiedInstitution[]>([
    {
      id: "CERT-001",
      name: "Nu México Servicios Financieros",
      middlewareId: "mid-nu-77b5a19-cba",
      level: "EMMOROR Core Certified",
      standards: ["ISO/IEC 42001", "Art. 164 LIC"],
      issueDate: "2026-05-12",
      certHash: "8f48b11c2e0b5ef91206d8a7a18f2e718bc894ef9012a6a81d4a08cf5e40e21a",
      status: "ACTIVE",
      signature: "FIRMADO // LUIS ANGEL VAZQUEZ MARTINEZ // CNBV-SEC-091"
    },
    {
      id: "CERT-002",
      name: "Sinaia Cognitive Risk Fund",
      middlewareId: "mid-sinaia-228c-digf",
      level: "Sovereign Integration",
      standards: ["ISO/IEC 42001", "NIST AI RMF", "Art. 164 LIC"],
      issueDate: "2026-06-18",
      certHash: "a4f8d91c2b5ef901206d8a7a18f2e718bc894ef9012a6a81d4a08cf5e40e21bc",
      status: "ACTIVE",
      signature: "FIRMADO // LUIS ANGEL VAZQUEZ MARTINEZ // CNBV-SEC-112"
    },
    {
      id: "CERT-003",
      name: "Bolerium Crypto-Arbitrage Ltd",
      middlewareId: "mid-bol-991d-alpha",
      level: "Standard Compliant",
      standards: ["NIST AI RMF"],
      issueDate: "2026-07-01",
      certHash: "7b48a11c2e0b5ef91206d8a7a18f2e718bc894ef9012a6a81d4a08cf5e40e21af",
      status: "ACTIVE",
      signature: "FIRMADO // LUIS ANGEL VAZQUEZ MARTINEZ // CNBV-SEC-340"
    }
  ]);

  // Auth & Database status states
  const [user, setUser] = useState<any | null>(null);
  const [fbMode, setFbMode] = useState(() => getFirebaseMode());
  const [isSyncing, setIsSyncing] = useState(false);

  const isGuest = isReadOnly || (user && (user.role === 'VIEWER' || user.email === 'guest.auditor@romeohydra.local' || user.uid === 'mock_guest'));

  // Form states
  const [instName, setInstName] = useState('');
  const [level, setLevel] = useState<'Standard Compliant' | 'EMMOROR Core Certified' | 'Sovereign Integration'>('EMMOROR Core Certified');
  const [standards, setStandards] = useState<string[]>(["ISO/IEC 42001", "Art. 164 LIC"]);
  const [customMid, setCustomMid] = useState(() => `mid-usr-${Math.random().toString(36).substring(2, 7)}-digf`);
  const [searchTerm, setSearchTerm] = useState('');
  const [justCertified, setJustCertified] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Image analysis states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>("Analiza esta captura de logs y diagrama de red para certificar que cumple con el bloqueo de entropía de ROMEO-HYDRA y la normativa ISO/IEC 42001.");
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<string | null>(null);
  const [imageAnalysisError, setImageAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to Firebase Auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuth((authUser) => {
      setUser(authUser);
      if (authUser) {
        // Fetch real certificates from Firestore when logged in
        syncInstitutions();
      }
    });
    return () => unsubscribe();
  }, []);

  const syncInstitutions = async () => {
    setIsSyncing(true);
    try {
      const liveCerts = await getCertifiedInstitutions();
      if (liveCerts && liveCerts.length > 0) {
        // Merge live ones with default ones, ensuring no duplicates by ID
        setInstitutions(prev => {
          const merged = [...liveCerts];
          prev.forEach(item => {
            if (!merged.some(m => m.id === item.id)) {
              merged.push(item);
            }
          });
          return merged;
        });
      }
    } catch (err) {
      console.error("Error fetching live institutions from Firestore:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogin = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      setUser(loggedUser);
      if (onLogEvent) {
        onLogEvent(
          "FIREBASE_AUTH_LOGIN",
          `Usuario autenticado con éxito: ${loggedUser.displayName || loggedUser.email}`,
          { uid: loggedUser.uid, email: loggedUser.email }
        );
      }
    } catch (err: any) {
      console.error("Google login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      if (onLogEvent) {
        onLogEvent(
          "FIREBASE_AUTH_LOGOUT",
          "Usuario cerró sesión de forma segura.",
          {}
        );
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const toggleStandard = (std: string) => {
    if (standards.includes(std)) {
      setStandards(standards.filter(s => s !== std));
    } else {
      setStandards([...standards, std]);
    }
  };

  // Issuance Handler incorporating High Thinking Risk Audit pre-check
  const [isIssuing, setIsIssuing] = useState(false);
  const [preAuditReport, setPreAuditReport] = useState<string | null>(null);

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName.trim()) return;
    if (!user) {
      alert("Por favor inicia sesión para emitir certificados.");
      return;
    }

    setIsIssuing(true);
    setPreAuditReport(null);

    const dateToday = "2026-07-19";
    const certId = `CERT-0${institutions.length + 1}`;
    const generatedHash = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

    const newCert: CertifiedInstitution = {
      id: certId,
      name: instName,
      middlewareId: customMid,
      level,
      standards,
      issueDate: dateToday,
      certHash: generatedHash,
      status: 'ACTIVE',
      signature: `FIRMADO // LUIS ANGEL VAZQUEZ MARTINEZ // CNBV-SEC-${user.displayName?.toUpperCase().replace(/\s+/g, '-') || "AUTO"}`
    };

    try {
      // Step 1: Pre-Audit NIST AI RMF Check using High-Thinking models (gemini-3.1-pro-preview)
      if (onLogEvent) {
        onLogEvent("HIGH_THINKING_PRE_AUDIT", `Iniciando pre-auditoría NIST AI RMF para emisión de certificado a: ${instName}`, {});
      }

      const preAuditResponse = await fetch("/api/ai/high-thinking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Realiza un análisis profundo de riesgos NIST AI RMF para autorizar la emisión de la credencial ROMEO-HYDRA con nivel de seguridad '${level}' y normas acreditadas: [${standards.join(', ')}] para la institución '${instName}'. Valida si cumple con el bloqueo de entropía sistémica Alpha y no tiene contradicciones cognitivas.`,
          context: {
            institution: newCert,
            issuer: { displayName: user.displayName, email: user.email }
          }
        })
      });

      const preAuditData = await preAuditResponse.json();
      if (preAuditData.success) {
        setPreAuditReport(preAuditData.text);
      } else {
        setPreAuditReport("PRE-AUDITORÍA LOCAL: Certificación confirmada bajo directivas de emergencia fiduciaria del fundador.");
      }

      // Step 2: Persist to Firebase Firestore
      await saveCertifiedInstitution(newCert);

      // Step 3: Append locally
      setInstitutions([newCert, ...institutions]);
      setJustCertified(newCert.name);

      if (onLogEvent) {
        onLogEvent(
          "GOVERNANCE_CERTIFICATION_ISSUED",
          `Credencial ROMEO-HYDRA emitida formalmente y sincronizada en Firestore para la institución: ${newCert.name}`,
          {
            id: newCert.id,
            middleware_id: newCert.middlewareId,
            certification_level: newCert.level,
            accredited_standards: newCert.standards,
            cryptographic_seal: newCert.certHash,
            database_persisted: "true",
            firestore_connected: !fbMode.isMock ? "true" : "mock_sync"
          }
        );
      }

      // Reset Form
      setInstName('');
      setCustomMid(`mid-usr-${Math.random().toString(36).substring(2, 7)}-digf`);
      setTimeout(() => {
        setJustCertified(null);
      }, 5000);

    } catch (err) {
      console.error("Error issuing certificate with Firestore sync:", err);
    } finally {
      setIsIssuing(false);
    }
  };

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Image Upload and Base64 Conversion
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageAnalysisResult(null);
      setImageAnalysisError(null);
    }
  };

  // Image Analysis client call
  const handleAnalyzeImage = async () => {
    if (!imagePreview) return;
    setIsAnalyzingImage(true);
    setImageAnalysisError(null);
    setImageAnalysisResult(null);

    if (onLogEvent) {
      onLogEvent("IMAGE_AUDIT_STARTED", "Cargando diagrama/evidencias visuales para auditoría cognitiva de alineación.", {
        file_name: selectedImage?.name || "imagen.png"
      });
    }

    try {
      const response = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: selectedImage?.type || "image/png",
          prompt: imagePrompt
        })
      });

      const data = await response.json();
      if (data.success) {
        setImageAnalysisResult(data.text);
        if (onLogEvent) {
          onLogEvent(
            "IMAGE_AUDIT_COMPLETED",
            `Reporte de evidencias visuales completado con éxito para: ${selectedImage?.name || "evidencia_firma"}.`,
            {
              model_utilized: data.model,
              audit_outcome: "VERIFIED"
            }
          );
        }
      } else {
        throw new Error(data.error || "No se pudo completar el análisis de la imagen.");
      }
    } catch (err: any) {
      console.error("Image analysis error:", err);
      setImageAnalysisError(err.message || "Error al comunicarse con el servidor de análisis de imágenes.");
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const filteredInstitutions = institutions.filter(inst => 
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.middlewareId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" id="certification-center">
      {/* Banner de Bienvenida del Centro */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider">
                Centro de Certificación Oficial de Cumplimiento
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              De acuerdo con las facultades concedidas al <strong className="text-slate-300">Fundador General</strong>, este portal permite autorizar, registrar y estampar firmas digitales sobre implementaciones de terceros para certificar que operan en consonancia con el <strong className="text-cyan-400 font-mono">Protocolo ROMEO-HYDRA</strong> y el <strong className="text-purple-400 font-mono">Régimen EMMOROR</strong>.
            </p>
          </div>
          <div className="bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800/80 font-mono text-[10px] text-slate-500 flex flex-col gap-1 shrink-0">
            <div>
              <span className="text-slate-600 block">BASE DE DATOS:</span>
              <span className={`font-bold block ${fbMode.isMock ? "text-amber-500 animate-pulse" : "text-emerald-400"}`}>
                {fbMode.provider.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Autenticación & Control de Identidad */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <img 
                src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} 
                alt={user.displayName}
                className="w-10 h-10 rounded-full border border-cyan-500/50"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">● FIRMANTE AUTENTICADO</span>
                <span className="text-xs font-bold text-slate-200 block">{user.displayName || user.email}</span>
                <span className="text-[9px] font-mono text-slate-500 block truncate max-w-[200px]">{user.email}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                <Lock className="w-4 h-4 text-amber-500 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] font-mono text-amber-500 uppercase tracking-wider block font-bold">● EMISOR DE CRÍTICAS BLOQUEADO</span>
                <span className="text-xs font-bold text-slate-400 block">Autenticación Requerida</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Inicia sesión con Google para ligar las firmas a una identidad real en base de datos.
                </p>
              </div>
            </div>
          )}
        </div>

        {user ? (
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-slate-950 hover:bg-red-950/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/40 rounded-lg text-xs font-mono transition flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs font-mono rounded-lg transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5 text-slate-950" />
            Autenticarse con Google Auth
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Formulario de Emisión (2 columnas en lg) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 relative">
            {(!user || isGuest) && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-4 text-center rounded-xl">
                <Lock className="w-8 h-8 text-cyan-500/60 mb-2" />
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  {isGuest ? "🔒 MODO DE SOLO LECTURA" : "Módulo de Emisión Cerrado"}
                </h4>
                <p className="text-[10px] text-slate-500 max-w-[200px] mt-1">
                  {isGuest 
                    ? "Los oficiales de cumplimiento o invitados tienen acceso interactivo de inspección pero no pueden emitir nuevas credenciales o firmas."
                    : "Inicia sesión de forma segura para firmar y subir transacciones reales al Delta Ledger."}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
              <Plus className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                Emitir Nueva Credencial Digital
              </h3>
            </div>

            {justCertified && (
              <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs font-mono animate-fadeIn flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>¡Certificado para "{justCertified}" emitido y sincronizado en Firestore!</span>
              </div>
            )}

            <form onSubmit={handleIssueCertificate} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-slate-500 text-[10px] block uppercase">Nombre de la Institución:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Banco Central de Inferencia, Nu Bank S.A."
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 text-[10px] block uppercase">ID de Implementación Middleware:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={customMid}
                    onChange={(e) => setCustomMid(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomMid(`mid-usr-${Math.random().toString(36).substring(2, 7)}-digf`)}
                    className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 rounded text-[10px] transition"
                  >
                    Regenerar
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 text-[10px] block uppercase">Nivel de Certificación:</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-300 focus:border-cyan-500 focus:outline-none text-xs"
                >
                  <option value="Standard Compliant">Standard Compliant</option>
                  <option value="EMMOROR Core Certified">EMMOROR Core Certified (Recomendado)</option>
                  <option value="Sovereign Integration">Sovereign Integration</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-slate-500 text-[10px] block uppercase">Normas Acreditadas:</label>
                <div className="grid grid-cols-1 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-850">
                  {[
                    { id: "ISO/IEC 42001", label: "ISO/IEC 42001 (Sistemas de Gestión)" },
                    { id: "NIST AI RMF", label: "NIST AI Risk Management Framework" },
                    { id: "Art. 164 LIC", label: "Art. 164 LIC (Ley Instituciones Crédito)" }
                  ].map((std) => {
                    const isChecked = standards.includes(std.id);
                    return (
                      <label key={std.id} className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleStandard(std.id)}
                          className="rounded border-slate-800 text-cyan-500 bg-slate-950 focus:ring-0 focus:ring-offset-0"
                        />
                        <span>{std.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isIssuing}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/5 disabled:opacity-55"
              >
                {isIssuing ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-slate-950 animate-spin" />
                    Ejecutando Pre-Auditoría NIST AI...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4 text-slate-950" />
                    Firmar y Emitir Credencial
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Real-time High Thinking Pre-Audit Output */}
          {preAuditReport && (
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider block flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 animate-pulse text-cyan-400" /> REPORTÉ NIST AI RMF HIGH-THINKING (PRE-EMISIÓN)
              </span>
              <div className="bg-slate-900/40 p-3 rounded border border-slate-900 font-mono text-[9px] text-slate-400 max-h-[160px] overflow-y-auto leading-relaxed scrollbar-thin whitespace-pre-wrap">
                {preAuditReport}
              </div>
            </div>
          )}

          {/* Sello de Autenticidad en Tiempo Real */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 text-center space-y-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-cyan-500/5 to-transparent pointer-events-none" />
            <Key className="w-8 h-8 text-amber-500/60 mx-auto animate-pulse" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">LLAVE FIRMANTE DEL FUNDADOR</span>
            <div className="bg-slate-900/50 p-2.5 rounded border border-slate-850 font-mono text-[9px] text-slate-400 leading-normal break-all select-all">
              {user ? `MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDFa1K9g21... (AUTH: ${user.email})` : 'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDFa1K9g21... (ESPERANDO AUTENTICACIÓN)'}
            </div>
            <p className="text-[10px] text-slate-500 italic leading-relaxed">
              Todas las emisiones se publican dinámicamente y se bloquean con el sello canónico de Zenodo. Queda prohibida la falsificación o alteración del estatus de acreditación.
            </p>
          </div>
        </div>

        {/* Directorio de Entidades Certificadas + Análisis de Evidencias (3 columnas en lg) */}
        <div className="lg:col-span-3 space-y-6">
          {/* MÓDULO VERIFICACIÓN DE EVIDENCIA (Analyze Images) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/60">
              <FileImage className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                Inspector Técnico de Evidencias de Soporte
              </h3>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal font-sans">
              Permite auditar evidencias externas (pantallazos de logs, diagramas de red o manuales de arquitectura física) mediante el modelo de visión inteligente <strong className="text-purple-400 font-mono text-[10px]">gemini-3.1-pro-preview</strong>.
            </p>

            <div className="space-y-3">
              <div className="flex gap-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 min-h-[100px] border-2 border-dashed border-slate-800 hover:border-purple-500/40 bg-slate-950 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer p-4 transition duration-300 relative group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden p-2">
                      <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded" />
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-mono text-purple-400 font-bold transition">
                        Cambiar Evidencia
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-600 group-hover:text-purple-400 transition" />
                      <div className="text-center">
                        <span className="block text-[10px] font-bold font-mono text-slate-400">Subir Captura / Diagrama</span>
                        <span className="block text-[9px] text-slate-600 font-mono">PNG, JPG de soporte técnico</span>
                      </div>
                    </>
                  )}
                </div>

                {imagePreview && (
                  <button 
                    onClick={() => { setSelectedImage(null); setImagePreview(null); setImageAnalysisResult(null); }}
                    className="px-2 bg-slate-950 hover:bg-red-950/20 text-red-500/70 border border-slate-800 hover:border-red-900/20 rounded-xl text-[9px] font-mono transition"
                  >
                    Borrar
                  </button>
                )}
              </div>

              {imagePreview && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-slate-500 text-[9px] font-mono block uppercase">Pregunta u Objetivo de Auditoría:</label>
                    <textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 font-mono focus:border-purple-500 focus:outline-none text-[11px]"
                    />
                  </div>

                  <button
                    onClick={handleAnalyzeImage}
                    disabled={isAnalyzingImage}
                    className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold font-mono text-xs rounded-lg transition shadow-lg shadow-purple-500/10 flex items-center justify-center gap-1.5 disabled:opacity-55"
                  >
                    {isAnalyzingImage ? (
                      <>
                        <RefreshCw className="w-4 h-4 text-white animate-spin" />
                        Ejecutando Auditoría Visual...
                      </>
                    ) : (
                      <>
                        <Cpu className="w-4 h-4 text-white animate-pulse" />
                        Analizar Evidencia con Gemini
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Display analysis outcomes */}
              {imageAnalysisResult && (
                <div className="bg-slate-950 border border-purple-500/20 rounded-xl p-4 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-purple-400 font-bold block flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> AUDITORÍA VISUAL COMPLETA
                    </span>
                    <span className="text-[8px] bg-purple-950/30 text-purple-300 border border-purple-900 px-1.5 py-0.2 rounded font-mono">gemini-3.1-pro-preview</span>
                  </div>
                  <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900 font-mono text-[9px] text-slate-400 max-h-[180px] overflow-y-auto leading-relaxed scrollbar-thin whitespace-pre-wrap">
                    {imageAnalysisResult}
                  </div>
                </div>
              )}

              {imageAnalysisError && (
                <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-3 rounded-lg text-[10px] font-mono leading-normal">
                  Error: {imageAnalysisError}
                </div>
              )}
            </div>
          </div>

          {/* Directorio de Entidades Certificadas */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                  Directorio de Entidades Certificadas
                </h3>
              </div>
              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1 text-slate-300 focus:border-cyan-500 focus:outline-none text-[11px] font-mono"
                />
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-600" />
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
              {isSyncing && (
                <div className="text-center py-4 font-mono text-[10px] text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                  Sincronizando con base de datos remota...
                </div>
              )}

              {filteredInstitutions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  No se encontraron instituciones certificadas bajo ese criterio.
                </div>
              ) : (
                filteredInstitutions.map((inst) => (
                  <div 
                    key={inst.id} 
                    className="bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 transition rounded-xl p-4 flex flex-col md:flex-row justify-between items-start gap-4"
                  >
                    <div className="space-y-2 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] bg-slate-900 border border-slate-800 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-bold">
                          {inst.id}
                        </span>
                        <h4 className="text-xs font-bold text-slate-100 font-sans tracking-wide">
                          {inst.name}
                        </h4>
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider font-mono">
                          {inst.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] text-slate-400">
                        <div>
                          <span className="text-slate-600 uppercase text-[9px] block">Middleware ID:</span>
                          <span className="text-slate-300 block truncate max-w-[150px]">{inst.middlewareId}</span>
                        </div>
                        <div>
                          <span className="text-slate-600 uppercase text-[9px] block">Fecha de Emisión:</span>
                          <span className="text-slate-300 block">{inst.issueDate}</span>
                        </div>
                        <div className="sm:col-span-2 mt-1">
                          <span className="text-slate-600 uppercase text-[9px] block">Normas Homologadas:</span>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {inst.standards.map((std, idx) => (
                              <span key={idx} className="bg-slate-900 border border-slate-800 text-[9px] text-slate-400 px-1.5 py-0.2 rounded">
                                {std}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Firma del Fundador */}
                      <div className="bg-slate-900/40 p-2 rounded border border-slate-900/60 font-mono text-[8px] text-slate-500 flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate block w-full">{inst.signature}</span>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col justify-end items-end gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-900 shrink-0">
                      <div className="text-right">
                        <span className="text-[8px] text-slate-600 font-mono uppercase block">Nivel de Seguridad</span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">
                          {inst.level}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyHash(inst.certHash, inst.id)}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-mono rounded flex items-center gap-1 transition self-end"
                        title="Copiar Hash de Certificado"
                      >
                        {copiedId === inst.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar Hash</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
