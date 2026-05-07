"use client";
import { useState, useTransition, useRef, useEffect } from "react";
import { 
  Upload, Video, FileText, Headphones, Globe, Users, PlusCircle, 
  CheckCircle2, AlignLeft, ListOrdered, FileCheck, BookOpen, 
  ChevronRight, X, Loader2, RefreshCcw, Link as LinkIcon 
} from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { createRessourceAction } from "@/lib/actions/ressource";
import { updateRessourceAction } from "@/lib/actions/ressource"; // ✅ IMPORTÉ
import { toast, Toaster } from "sonner";
import { deleteFileFromCloudinaryAction } from "@/lib/actions/cloudinary";
import Link from "next/link";
// ✅ INTERFACE ENRICHE POUR L'ÉDITION
interface TeacherUploadProps {
  dbClasses: any[];
  dbLecons: any[];
  teacherId: string;
  initialData?: any; // ✅ SI PRÉSENT = MODE ÉDITION
}

type ActionResponse = {
  success?: boolean;
  error?: string;
  id?: number;
};

export default function TeacherUploadForm({ dbClasses, dbLecons, teacherId, initialData }: TeacherUploadProps) {
  // 🛡️ DÉTECTION DU MODE
  const isEdit = !!initialData;

  // --- ÉTATS ---
  const [mode, setMode] = useState<"COURS" | "EXERCICE">(
    initialData?.type === "PDF" && initialData?.transcription ? "EXERCICE" : "COURS"
  );
  const [type, setType] = useState<"VIDEO" | "PDF" | "AUDIO">(initialData?.type || "VIDEO");
  const [portee, setPortee] = useState<"CLASSE" | "NIVEAU">(initialData?.portee || "CLASSE");
  const [isNewChapter, setIsNewChapter] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState<any>(
    initialData ? dbClasses.find(c => c.id === initialData.classeId) : null
  );
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadResult, setUploadResult] = useState<{url: string, corrige?: string} | null>(null);

  // ÉTATS FICHIERS (Initialisés avec les données Neon si Edit)
  const [fileName, setFileName] = useState(initialData?.url ? "Fichier actuel conservé" : "");
  const [fileSize, setFileSize] = useState(initialData?.size || 0);
  const [urlCours, setUrlCours] = useState(initialData?.url || "");
  const [publicIdCours, setPublicIdCours] = useState(initialData?.publicId || ""); 

  const [enonceName, setEnonceName] = useState(initialData?.url ? "Sujet actuel" : "");
  const [urlEnonce, setUrlEnonce] = useState(initialData?.url || "");
  
  const [corrigeName, setCorrigeName] = useState(initialData?.transcription?.corrigeUrl ? "Corrigé actuel" : "");
  const [urlCorrige, setUrlCorrige] = useState(initialData?.transcription?.corrigeUrl || "");

  const [isUploading, setIsUploading] = useState(false);

  // --- LOGIQUE AUTO-UPLOAD ---
  const handleAutoUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "COURS" | "ENONCE" | "CORRIGE") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🛡️ NETTOYAGE : Si on change de fichier pendant l'édit, on nettoie Cloudinary
    const currentUrl = target === "COURS" ? urlCours : target === "ENONCE" ? urlEnonce : urlCorrige;
    if (currentUrl && currentUrl !== initialData?.url) {
      await deleteFileFromCloudinaryAction(currentUrl); 
    }

    setIsUploading(true);
    const toastId = toast.loading(`Envoi de ${file.name}...`);

    try {
      const res = await uploadToCloudinary(file);
      if (res?.url) {
        if (target === "COURS") { 
            setUrlCours(res.url); 
            setPublicIdCours(res.publicId);
            setFileName(file.name); 
            setFileSize(res.size); 
        }
        if (target === "ENONCE") { setUrlEnonce(res.url); setEnonceName(file.name); }
        if (target === "CORRIGE") { setUrlCorrige(res.url); setCorrigeName(file.name); }
        toast.success("Fichier prêt !", { id: toastId });
      }
    } catch (err) {
      toast.error("Erreur Cloudinary", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  // --- SOUMISSION FINALE ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const mainFileUrl = mode === "COURS" ? urlCours : urlEnonce;

    if (!mainFileUrl) {
      toast.error("Veuillez joindre un fichier.");
      return;
    }

    startTransition(async () => {
      try {
        setUploadPercent(90);
        formData.delete("fileCours"); formData.delete("fileEnonce"); formData.delete("fileCorrige");

        formData.append("mode", mode);
        formData.append("type", mode === "EXERCICE" ? "PDF" : type);
        formData.append("portee", portee);
        formData.append("isNewChapter", String(isNewChapter));
        formData.append("teacherId", teacherId);

        let res: ActionResponse;
        
        const fileInfo = { 
            url: mainFileUrl, 
            publicId: publicIdCours,
            size: fileSize,
            type: (mode === "EXERCICE" ? "PDF" : type) as any,
            corrigeUrl: urlCorrige 
        };

        if (isEdit) {
            // 🚀 APPEL UPDATE
            res = await updateRessourceAction(initialData.id, formData, fileInfo) as ActionResponse;
        } else {
            // 🚀 APPEL CREATE
            res = await createRessourceAction(formData, fileInfo) as ActionResponse;
        }

        if (res.error) {
          toast.error(res.error);
          setUploadPercent(0);
          return;
        }

        if (res.success) {
          setUploadPercent(100);
          toast.success(isEdit ? "Mise à jour réussie ! ✨" : "Diffusion réussie ! 🚀");
          if (!isEdit) {
            formRef.current?.reset();
            setUrlCours(""); setUrlEnonce(""); setUrlCorrige("");
            setFileName(""); setEnonceName(""); setCorrigeName("");
          }
        }
      } catch (err) {
        setUploadPercent(0);
        toast.error("Erreur critique.");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700 px-4">
      <Toaster position="top-right" richColors />
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
              {isEdit ? `Modifier : ${initialData.titre}` : "Publier un contenu"}
            </h1>
            <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1 italic">
              Espace Pédagogique Professionnel
            </p>
          </div>

          {/* 🎯 BOUTON LISTE DES COURS */}
          <Link 
            href="/teacher/views" // Modifie le chemin selon ta route
            className="inline-flex items-center gap-2 bg-white border-2 border-gray-100 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:border-primary/20 hover:text-primary transition-all shadow-sm active:scale-95"
          >
            <BookOpen size={14} />
            Liste des cours
          </Link>
        </header>


      {isPending && (
        <div className="mb-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${uploadPercent}%` }} />
        </div>
      )}

      {/* SÉLECTEUR DE MODE (Désactivé en Edit pour éviter les bugs de structure) */}
      <div className={`flex bg-white p-1.5 rounded-[2rem] shadow-sm border border-gray-100 mb-8 ${isEdit ? "opacity-50 pointer-events-none" : ""}`}>
        <button type="button" onClick={() => setMode("COURS")} className={`flex-1 py-4 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all ${mode === "COURS" ? "bg-gray-900 text-white shadow-xl" : "text-gray-400"}`}>
          <BookOpen size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">Médiathèque</span>
        </button>
        <button type="button" onClick={() => setMode("EXERCICE")} className={`flex-1 py-4 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all ${mode === "EXERCICE" ? "bg-primary text-white shadow-xl" : "text-gray-400"}`}>
          <FileCheck size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">Exercices</span>
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2"><ListOrdered size={14} /> 1. Chapitre</label>
              {!isEdit && (
                <button type="button" onClick={() => setIsNewChapter(!isNewChapter)} className="text-[9px] font-black text-blue-500 uppercase">{isNewChapter ? "Annuler" : "Nouveau +"}</button>
              )}
            </div>
            {isNewChapter ? (
              <input name="newLecon" required type="text" placeholder="Nom du nouveau chapitre..." className="w-full bg-primary/5 border-2 border-primary/10 rounded-2xl px-5 py-4 text-sm font-black text-primary outline-none" />
            ) : (
              <select name="leconId" defaultValue={initialData?.leconId} required className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none shadow-inner appearance-none">
                <option value="">Sélectionner un chapitre...</option>
                {dbLecons.map((l) => <option key={l.id} value={l.id}>{l.titre}</option>)}
              </select>
            )}
          </div>
          <input name="titre" defaultValue={initialData?.titre} required type="text" placeholder="Titre du contenu..." className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none shadow-inner" />
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          {mode === "COURS" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {['VIDEO', 'PDF', 'AUDIO'].map((t) => (
                  <button key={t} type="button" onClick={() => { setType(t as any); setFileName(""); }} className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${type === t ? "border-primary bg-primary/5 text-primary" : "border-gray-50 text-gray-300"}`}>
                    {t === 'VIDEO' ? <Video size={20}/> : t === 'PDF' ? <FileText size={20}/> : <Headphones size={20}/>}
                    <span className="text-[9px] font-black uppercase">{t}</span>
                  </button>
                ))}
              </div>
              <label className="border-2 border-dashed border-gray-100 rounded-[2rem] py-12 text-center hover:bg-gray-50 cursor-pointer block group">
                <Upload className={`mx-auto mb-2 ${fileName ? "text-primary" : "text-gray-300"}`} size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest">{fileName ? `✅ ${fileName}` : `Joindre le fichier ${type}`}</p>
                <input type="file" name="fileCours" className="hidden" onChange={(e) => handleAutoUpload(e, "COURS")}  />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="flex items-center gap-6 p-6 bg-primary/5 rounded-[2.5rem] border-2 border-dashed border-primary/20 cursor-pointer hover:bg-primary/10 transition-all">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm"><FileText size={24}/></div>
                <div className="flex-1"><p className="text-xs font-black text-primary uppercase">{enonceName || "Sujet du TD"}</p></div>
                <input type="file" name="fileEnonce" className="hidden" onChange={(e) => handleAutoUpload(e, "ENONCE")}  />
              </label>
              <label className="flex items-center gap-6 p-6 bg-emerald-50/50 rounded-[2.5rem] border-2 border-dashed border-emerald-100 cursor-pointer hover:bg-emerald-50 transition-all">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm"><FileCheck size={24}/></div>
                <div className="flex-1"><p className="text-xs font-black text-emerald-600 uppercase italic">{corrigeName || "Corrigé (Optionnel)"}</p></div>
                <input type="file" name="fileCorrige" className="hidden" onChange={(e) => handleAutoUpload(e, "CORRIGE")}  />
              </label>
            </div>
          )}
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Users size={14}/> 3. Ciblage</label>
            <div className="relative">
              <select 
                name="classeId" 
                defaultValue={initialData?.classeId}
                required 
                onChange={(e) => {
                  const val = e.target.value;
                  const cls = dbClasses.find(c => c.id.toString() === val);
                  setSelectedClasse(cls || null);
                }}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-black outline-none shadow-inner appearance-none"
              >
                <option value="">Choisir votre classe...</option>
                {dbClasses.map((cls) => <option key={cls.id} value={cls.id}>{cls.nom}</option>)}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronRight size={18} className="rotate-90" /></div>
            </div>
            
            <div className={`flex gap-3 pt-2 transition-all duration-500 ${selectedClasse ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
              <button type="button" onClick={() => setPortee("CLASSE")} className={`flex-1 p-4 rounded-2xl border-2 font-black text-[9px] uppercase transition-all flex flex-col items-center gap-2 ${portee === "CLASSE" ? "border-primary bg-primary/5 text-primary" : "border-gray-50 text-gray-300"}`}><Users size={18} />Uniquement {selectedClasse?.nom}</button>  
              <button type="button" onClick={() => setPortee("NIVEAU")} className={`flex-1 p-4 rounded-2xl border-2 font-black text-[9px] uppercase transition-all flex flex-col items-center gap-2 ${portee === "NIVEAU" ? "border-orange-500 bg-orange-500/5 text-orange-600" : "border-gray-50 text-gray-300"}`}><Globe size={18} />Tout le Niveau {selectedClasse?.level?.nom}</button>
            </div>
          </div>

          <button 
            disabled={isPending || isUploading}
            type="submit" 
            className="w-full bg-gray-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-gray-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
            {isEdit ? "Enregistrer les modifications" : "Diffuser aux élèves"}
          </button>
        </div>
      </form>
    </div>
  );
}
