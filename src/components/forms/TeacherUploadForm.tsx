"use client";
import { useState, useTransition, useRef } from "react";
import { 
  Upload, Video, FileText, Headphones, Globe, Users, PlusCircle, 
  CheckCircle2, AlignLeft, ListOrdered, FileCheck, BookOpen, 
  ChevronRight, X, Loader2, RefreshCcw, Link as LinkIcon, ShieldCheck,
  
} from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { createRessourceAction } from "@/lib/actions/ressource";
import { toast, Toaster } from "sonner";
import { deleteFileFromCloudinaryAction } from "@/lib/actions/cloudinary";
import Link from "next/link";


interface TeacherUploadProps {
  dbClasses: any[];
  dbLecons: any[];
  teacherId: string;
}

type ActionResponse = {
  success?: boolean;
  error?: string;
  id?: number;
};

export default function TeacherUploadForm({ dbClasses, dbLecons, teacherId }: TeacherUploadProps) {
  // --- ÉTATS ---
  const [mode, setMode] = useState<"COURS" | "EXERCICE">("COURS");
  const [type, setType] = useState<"VIDEO" | "PDF" | "AUDIO">("VIDEO");
  const [portee, setPortee] = useState<"CLASSE" | "NIVEAU">("CLASSE");
  const [isNewChapter, setIsNewChapter] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  
  // 🎯 CIBLAGE INDIVIDUEL (AJOUTÉ)
  const [isPrivate, setIsPrivate] = useState(false); 
  const [matriculeEleve, setMatriculeEleve] = useState(""); 

  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadResult, setUploadResult] = useState<{url: string, corrige?: string} | null>(null);

  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [enonceName, setEnonceName] = useState("");
  const [corrigeName, setCorrigeName] = useState("");

  const [urlCours, setUrlCours] = useState("");   
  const [urlEnonce, setUrlEnonce] = useState(""); 
  const [urlCorrige, setUrlCorrige] = useState(""); 
  const [isUploading, setIsUploading] = useState(false);
  const [publicIdCours, setPublicIdCours] = useState("");
  const [publicIdCorrige, setPublicIdCorrige] = useState(""); // 👈 Ajoute ce state


  console.log(publicIdCours)

  const handleAutoUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "COURS" | "ENONCE" | "CORRIGE") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentUrl = target === "COURS" ? urlCours : target === "ENONCE" ? urlEnonce : urlCorrige;
    if (currentUrl) {
      await deleteFileFromCloudinaryAction(currentUrl); 
    }

    setIsUploading(true);
    const toastId = toast.loading(`Envoi de ${file.name}...`);

    try {
      const res = await uploadToCloudinary(file);
      const url = typeof res === "string" ? res : res?.url;
      const size = typeof res === "string" ? file.size : res?.size || file.size;
       console.log(res)
      
      if (url) {
        if (target === "COURS") { 
          setUrlCours(url); 
          setFileName(file.name); 
          setPublicIdCours(res?.publicId || ""); 
          setFileSize(size); 
        }
         if (target === "ENONCE") { 
          setUrlEnonce(url); 
          setEnonceName(file.name); 
          setPublicIdCours(res?.publicId || ""); // 🎯 AJOUTE CETTE LIGNE ICI
          setFileSize(size); // Ajoute aussi la taille pour l'énoncé
        }
        if (target === "CORRIGE") { 
          setUrlCorrige(url); 
          setCorrigeName(file.name); 
          setPublicIdCorrige(res?.publicId || ""); // 🎯 ON STOCKE L'ID DU CORRIGÉ
        }
        toast.success("Fichier prêt !", { id: toastId });
      }
    } catch (err) {
      toast.error("Erreur Cloudinary", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const mainFileUrl = mode === "COURS" ? urlCours : urlEnonce;

    if (!mainFileUrl) {
      toast.error(mode === "COURS" ? "Veuillez joindre le cours." : "Veuillez joindre l'énoncé.");
      return;
    }

    startTransition(async () => {
      try {
        setUploadPercent(90);
        formData.delete("fileCours");
        formData.delete("fileEnonce");
        formData.delete("fileCorrige");

        formData.append("mode", mode);
        formData.append("type", mode === "EXERCICE" ? "PDF" : type);
        formData.append("portee", portee);
        formData.append("isNewChapter", String(isNewChapter));
        formData.append("teacherId", teacherId);

        // ✅ AJOUT DU MATRICULE SI PRIVÉ
        if (isPrivate && matriculeEleve) {
          formData.append("matriculeEleve", matriculeEleve.trim().toUpperCase());
        }
          
        
        const res = (await createRessourceAction(formData, { 
          url: mainFileUrl, 
          publicId: publicIdCours, 
          size: fileSize,
          type: mode === "EXERCICE" ? "PDF" : type,
          corrigeUrl: urlCorrige,
          corrigeId: publicIdCorrige
        })) as ActionResponse;

        if (res.error) {
          toast.error(res.error);
          setUploadPercent(0);
          return;
        }

        if (res.success) {
          setUploadPercent(100);
          setUploadResult({ url: mainFileUrl, corrige: urlCorrige });
          toast.success("Diffusion réussie ! 🚀");
          formRef.current?.reset();
          setUrlCours(""); setUrlEnonce(""); setUrlCorrige("");
          setFileName(""); setEnonceName(""); setCorrigeName("");
          setIsPrivate(false); setMatriculeEleve("");
        }
      } catch (err) {
        setUploadPercent(0);
        toast.error("Erreur critique de validation.");
      }
    });
  };

  if (uploadResult) {
    return (
      <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[3rem] border border-emerald-100 shadow-2xl text-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
        <h2 className="text-2xl font-black text-gray-900 mb-8 italic tracking-tighter uppercase">Diffusion Terminée !</h2>
        <div className="space-y-3 mb-10 text-left">
          <a href={uploadResult.url} target="_blank" className="flex justify-between p-4 bg-gray-50 rounded-2xl border items-center hover:bg-gray-100 transition-colors">
            <span className="text-[10px] font-black uppercase text-gray-500 italic">Document</span><LinkIcon size={16} className="text-primary"/>
          </a>
          {uploadResult.corrige && (
            <a href={uploadResult.corrige} target="_blank" className="flex justify-between p-4 bg-emerald-50 rounded-2xl border items-center hover:bg-emerald-100 transition-colors">
              <span className="text-[10px] font-black uppercase text-emerald-600 italic">Corrigé</span><LinkIcon size={16} className="text-emerald-500"/>
            </a>
          )}
        </div>
        <button onClick={() => setUploadResult(null)} className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-gray-200">
          <RefreshCcw size={16} /> Nouveau contenu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700 px-4">
      <Toaster position="top-right" richColors />
     
      <header className="mb-8 flex items-end justify-between w-full border-b border-gray-50 pb-6">
        {/* BLOC TITRE (Gauche) */}
        <div className="flex-1">
        <h1 className="text-2xl font-black text-gray-900 tracking-tighter">Publier un contenu</h1>
        <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1 italic">Espace Pédagogique Professionnel</p>
        </div>

        {/* BOUTON ACTION (Droite) */}
        <Link
          href="/teacher/views" 
          className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-gray-200 active:scale-95 whitespace-nowrap"
        >
          <BookOpen size={14} />
          Voir mes publications
        </Link>
      </header>

      {isPending && (
        <div className="mb-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${uploadPercent}%` }} />
        </div>
      )}

      <div className="flex bg-white p-1.5 rounded-[2rem] shadow-sm border border-gray-100 mb-8">
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
        {/* BLOC 1 : CHAPITRE */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2"><ListOrdered size={14} /> 1. Chapitre</label>
              <button type="button" onClick={() => setIsNewChapter(!isNewChapter)} className="text-[9px] font-black text-blue-500 uppercase">{isNewChapter ? "Annuler" : "Nouveau +"}</button>
            </div>
            {isNewChapter ? (
              <input name="newLecon" required type="text" placeholder="Nom du nouveau chapitre..." className="w-full bg-primary/5 border-2 border-primary/10 rounded-2xl px-5 py-4 text-sm font-black text-primary outline-none" />
            ) : (
              <select name="leconId" required className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none shadow-inner appearance-none">
                <option value="">Sélectionner un chapitre...</option>
                {dbLecons.map((l) => <option key={l.id} value={l.id}>{l.titre}</option>)}
              </select>
            )}
          </div>
          <input name="titre" required type="text" placeholder="Titre du contenu..." className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none shadow-inner" />
        </div>

        {/* BLOC 2 : UPLOAD */}
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
                <input type="file" name="fileCours" className="hidden"  onChange={(e) => handleAutoUpload(e, "COURS")}  />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="flex items-center gap-6 p-6 bg-primary/5 rounded-[2.5rem] border-2 border-dashed border-primary/20 cursor-pointer hover:bg-primary/10 transition-all">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm"><FileText size={24}/></div>
                <div className="flex-1 text-left"><p className="text-xs font-black text-primary uppercase">{enonceName || "Sujet du TD"}</p></div>
                <input type="file" name="fileEnonce" className="hidden" onChange={(e) => handleAutoUpload(e, "ENONCE")}  />
              </label>
              <label className="flex items-center gap-6 p-6 bg-emerald-50/50 rounded-[2.5rem] border-2 border-dashed border-emerald-100 cursor-pointer hover:bg-emerald-50 transition-all">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm"><FileCheck size={24}/></div>
                <div className="flex-1 text-left"><p className="text-xs font-black text-emerald-600 uppercase italic">{corrigeName || "Corrigé (Optionnel)"}</p></div>
                <input type="file" name="fileCorrige" className="hidden" onChange={(e) => handleAutoUpload(e, "CORRIGE")}  />
              </label>
            </div>
          )}
        </div>

        {/* BLOC 3 : DESTINATAIRES (MODIFIÉ AVEC MATRICULE) */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <div className="space-y-4 text-left">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Users size={14}/> 3. Ciblage</label>
            
            {/* 🔘 SWITCH MODE (Classe vs Individuel) */}
            <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 mb-4">
                <button type="button" onClick={() => { setIsPrivate(false); setMatriculeEleve(""); }} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${!isPrivate ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                    <Users size={14} /> Toute la classe
                </button>
                <button type="button" onClick={() => setIsPrivate(true)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${isPrivate ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>
                    <ShieldCheck size={14} /> Un seul élève
                </button>
            </div>

            {isPrivate ? (
                <div className="animate-in slide-in-from-top duration-500">
                    <input 
                        type="text"
                        value={matriculeEleve}
                        onChange={(e) => setMatriculeEleve(e.target.value.toUpperCase())}
                        placeholder="MATRICULE DE L'ÉLÈVE (ex: 2025-001)..."
                        className="w-full bg-gray-50 border-2 border-indigo-50 rounded-2xl px-5 py-4 text-[11px] font-black uppercase italic outline-none focus:border-indigo-500/20 transition-all shadow-inner"
                    />
                    <p className="text-[8px] font-black text-indigo-400 mt-2 ml-2 uppercase italic tracking-widest">Envoi privé par matricule.</p>
                </div>
            ) : (
                <div className="relative">
                    <select 
                        name="classeId" 
                        required={!isPrivate} 
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
            )}
            
            {!isPrivate && (
                <div className={`flex gap-3 pt-2 transition-all duration-500 ${selectedClasse ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                    <button type="button" onClick={() => setPortee("CLASSE")} className={`flex-1 p-4 rounded-2xl border-2 font-black text-[9px] uppercase transition-all flex flex-col items-center gap-2 ${portee === "CLASSE" ? "border-primary bg-primary/5 text-primary" : "border-gray-50 text-gray-300"}`}><Users size={18} />Uniquement {selectedClasse?.nom}</button>  
                    <button type="button" onClick={() => setPortee("NIVEAU")} className={`flex-1 p-4 rounded-2xl border-2 font-black text-[9px] uppercase transition-all flex flex-col items-center gap-2 ${portee === "NIVEAU" ? "border-orange-500 bg-orange-500/5 text-orange-600" : "border-gray-50 text-gray-300"}`}><Globe size={18} />Tout le Niveau {selectedClasse?.level?.nom}</button>
                </div>
            )}
          </div>
          <div className="space-y-3 pt-4 border-t border-gray-50 text-left">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><AlignLeft size={14}/> 4. Description</label>
            <textarea name="description" placeholder="Consignes aux élèves..." className="w-full bg-gray-50 rounded-2xl px-6 py-5 text-sm font-medium outline-none min-h-[100px] resize-none shadow-inner" />
          </div>
        </div>

        {/* 🚀 BOUTON DE SOUMISSION DYNAMIQUE */}
        <button disabled={isPending || isUploading} type="submit" className="w-full bg-gray-900 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-primary transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95">
           {isPending ? <Loader2 className="animate-spin" /> : (isPrivate ? <ShieldCheck size={20} className="text-indigo-400" /> : <CheckCircle2 size={20} />)} 
           {isPending ? `Diffusion ${uploadPercent}%` : (isPrivate ? "Diffuser à l'élève" : "Diffuser aux élèves")}
        </button>
      </form>
    </div>
  );
}
