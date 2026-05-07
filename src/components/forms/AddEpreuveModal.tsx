"use client";

import { useState, useEffect } from "react";
import { X, FilePlus, FileText, CheckCircle2, Loader2, BookOpen, GraduationCap, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { saveEpreuveAction } from "@/lib/actions/archives";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { deleteFileFromCloudinaryAction } from "@/lib/actions/cloudinary";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  
}

export default function AddEpreuveModal({ isOpen, onClose, onSuccess}: ModalProps) {
  const [uploading, setUploading] = useState<"sujet" | "corrige" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    titre: "",
    type: "DEVOIR",
    examen: "AUCUN",
    session: "",
    trimestre: "1",
    matiere: "",
    classe: "",
    serie: "",
    fichierUrl: "",
    fichierPublicId: "",
    corrigeUrl: "",
    corrigePublicId: ""
  });


  // 🎯 LOGIQUE D'AUTO-CORRECTION : Force la classe si BAC ou BEPC est choisi
  useEffect(() => {
    if (formData.examen === "BAC") {
      setFormData(prev => ({ ...prev, classe: "Terminale" }));
    } else if (formData.examen === "BEPC") {
      setFormData(prev => ({ ...prev, classe: "3ème" }));
    }
  }, [formData.examen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "fichierUrl" | "corrigeUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;


      const ancienneUrl = formData[field];
        if (ancienneUrl) {
          // On lance la suppression en arrière-plan sans bloquer l'utilisateur
          deleteFileFromCloudinaryAction(ancienneUrl); 
          console.log("Ancien fichier nettoyé sur Cloudinary");
        }

    const label = field === "fichierUrl" ? "Sujet" : "Corrigé";
    setUploading(field === "fichierUrl" ? "sujet" : "corrige");
    const toastId = toast.loading(`Envoi du ${label}...`);

    try {
      const res = await uploadToCloudinary(file);
      if (res?.url && res?.publicId) {
        const publicIdField = field === "fichierUrl" ? "fichierPublicId" : "corrigePublicId";
        setFormData(prev => ({ ...prev, [field]: res.url, [publicIdField]: res.publicId }));
        toast.success(`${label} prêt !`, { id: toastId });
      } else {
        toast.error("Erreur Cloudinary", { id: toastId });
      }
    } catch (err) {
      toast.error("Connexion échouée", { id: toastId });
    } finally {
      setUploading(null);
      e.target.value = ""; 
    }
  };

  const handleSubmit = async () => {
    if (!formData.titre || !formData.matiere || !formData.fichierUrl) {
      return toast.error("Le titre, la matière et le sujet sont obligatoires !");
    }

    setSubmitting(true);
    const res = await saveEpreuveAction({
      ...formData,
      session: Number(formData.session),
      trimestre: Number(formData.trimestre)
    });
    setSubmitting(false);

    if (res.success) {
      toast.success(res.message);
      onSuccess();
      onClose();
    } else {
      toast.error(res.error);
    }
  };

  // 🎯 À AJOUTER DANS TON MODAL
useEffect(() => {
  // Cette fonction s'exécute QUAND LE MODAL SE FERME (onClose)
  return () => {
    if (formData.fichierUrl && !submitting) {
      // 🌪️ NETTOYAGE AUTOMATIQUE SI FERMETURE SANS PUBLIER
      deleteFileFromCloudinaryAction(formData.fichierUrl);
      console.log("Fichier sujet orphelin supprimé");
    }
    if (formData.corrigeUrl && !submitting) {
      deleteFileFromCloudinaryAction(formData.corrigeUrl);
      console.log("Fichier corrigé orphelin supprimé");
    }
  };
}, [isOpen]); // Il surveille l'ouverture/fermeture

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        
        {/* HEADER */}
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
              <FilePlus size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 leading-none">Publier une épreuve</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 italic text-primary/60">Médiathèque • ASSEP & Officiel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-red-500 shadow-sm border border-transparent hover:border-red-100">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar bg-white">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nom de l'épreuve</label>
              <input 
                placeholder="Ex: Devoir de Mathématiques" 
                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all"
                onChange={(e) => setFormData({...formData, titre: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Catégorie</label>
              <select 
                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                value={formData.type}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev, 
                    type: val, 
                    examen: val === "DEVOIR" ? "AUCUN" : prev.examen,
                    // Si on quitte Devoir, on peut reset le trimestre
                    trimestre: val === "DEVOIR" ? prev.trimestre : "1"
                  }));
                }}
              >
                <option value="DEVOIR">DEVOIR DE CLASSE</option>
                <option value="EXAMEN_BLANC">EXAMEN BLANC (ASSEP/DIR)</option>
                <option value="EXAMEN_NATIONAL">EXAMEN NATIONAL (BAC/BEPC)</option>
              </select>
            </div>
          </div>

          {/* FILTRES BÉNIN */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
             <div className="space-y-2 text-center">
                <span className="text-[8px] font-black text-primary/60 uppercase">Session</span>
                <input type="number" defaultValue="2025" className="w-full bg-white rounded-xl py-2 text-center font-black text-primary text-xs outline-none" 
                  onChange={(e) => setFormData({...formData, session: e.target.value})}
                />
             </div>
             <div className="space-y-2 text-center">
                <span className="text-[8px] font-black text-primary/60 uppercase italic">Examen</span>
                <select 
                    disabled={formData.type === "DEVOIR"}
                    className={`w-full bg-white rounded-xl py-2 text-center font-black text-primary text-xs outline-none ${formData.type === "DEVOIR" ? "opacity-40 cursor-not-allowed" : ""}`}
                    value={formData.examen}
                    onChange={(e) => setFormData({...formData, examen: e.target.value})}
                  >
                    <option value="AUCUN">AUCUN</option>
                    <option value="BAC">BAC</option>
                    <option value="BEPC">BEPC</option>
                    <option value="CEPE">CEPE</option>
                  </select>
             </div>
             {formData.type === "DEVOIR" && (
               <div className="space-y-2 text-center animate-in zoom-in duration-200">
                  <span className="text-[8px] font-black text-primary uppercase italic">Période</span>
                  <select 
                    className="w-full bg-primary text-white rounded-xl py-2 text-center font-black text-xs outline-none"
                    value={formData.trimestre}
                    onChange={(e) => setFormData({...formData, trimestre: e.target.value})}
                  >
                    <option value="1">T1</option><option value="2">T2</option><option value="3">T3</option>
                  </select>
               </div>
             )}
             <div className="space-y-2 text-center">
                <span className="text-[8px] font-black text-primary/60 uppercase">Série</span>
                <select 
                  className="w-full bg-white rounded-xl py-2 text-center font-black text-primary text-xs uppercase outline-none"
                  value={formData.serie}
                  onChange={(e) => setFormData({...formData, serie: e.target.value})}
                >
                  <option value="">AUCUNE</option>
                  <option value="A1">Série A1</option><option value="A2">Série A2</option>
                  <option value="B">Série B</option><option value="C">Série C</option><option value="D">Série D</option>
                  <option value="G1">G1</option><option value="G2">G2</option>
                </select>
             </div>
          </div>

          {/* MATIÈRE & CLASSE DYNAMIQUE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <select 
                className="w-full bg-gray-50 pl-14 pr-6 py-4 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-primary/10" 
                value={formData.matiere}
                onChange={(e) => setFormData({...formData, matiere: e.target.value})}
              >
                <option value="" disabled>Sélectionner la matière</option>
                <option value="Mathématiques">Mathématiques</option><option value="PCT">PCT</option>
                <option value="SVT">SVT</option><option value="Français">Français</option>
                <option value="Anglais">Anglais</option><option value="Histoire-Géo">Histoire-Géo</option>
                <option value="Philosophie">Philosophie</option>
              </select>
            </div>
            <div className="relative">
              <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <select 
                className="w-full bg-gray-50 pl-14 pr-6 py-4 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-primary/10" 
                value={formData.classe}
                onChange={(e) => setFormData({...formData, classe: e.target.value})}
              >
                <option value="" disabled>Sélectionner la classe</option>
                {formData.examen === "BAC" ? (
                   <option value="Terminale">Terminale (BAC)</option>
                ) : formData.examen === "BEPC" ? (
                   <option value="3ème">3ème (BEPC)</option>
                ) : (
                  <>
                    <option value="6ème">6ème</option><option value="5ème">5ème</option>
                    <option value="4ème">4ème</option><option value="3ème">3ème</option>
                    <option value="2nde">2nde</option><option value="1ère">1ère</option>
                    <option value="Terminale">Terminale</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* UPLOADS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`relative p-8 border-2 border-dashed rounded-[2rem] transition-all flex flex-col items-center justify-center gap-3 ${formData.fichierUrl ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
              <input type="file" accept=".pdf" disabled={!!uploading} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" onChange={(e) => handleFileUpload(e, "fichierUrl")} />
              {uploading === "sujet" ? <Loader2 className="animate-spin text-primary" /> : <div className="p-4 bg-white rounded-2xl shadow-sm"><UploadCloud size={24} className={formData.fichierUrl ? 'text-emerald-500' : 'text-primary'} /></div>}
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{formData.fichierUrl ? "Sujet chargé ✓" : "Glisser le Sujet"}</p>
            </div>
            
            <div className={`relative p-8 border-2 border-dashed rounded-[2rem] transition-all flex flex-col items-center justify-center gap-3 ${formData.corrigeUrl ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
              <input type="file" accept=".pdf" disabled={!!uploading} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" onChange={(e) => handleFileUpload(e, "corrigeUrl")} />
              {uploading === "corrige" ? <Loader2 className="animate-spin text-primary" /> : <div className="p-4 bg-white rounded-2xl shadow-sm"><CheckCircle2 size={24} className={formData.corrigeUrl ? 'text-blue-500' : 'text-primary'} /></div>}
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{formData.corrigeUrl ? "Corrigé chargé ✓" : "Glisser le Corrigé"}</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600">Annuler</button>
          <button 
            onClick={handleSubmit}
            disabled={submitting || !!uploading}
            className="flex-1 py-4 bg-gray-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-primary transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {submitting ? "Publication..." : <><CheckCircle2 size={16} /> Publier l'archive</>}
          </button>
        </div>
      </div>
    </div>
  );
}