"use client";
import { useState } from "react";
import StudentCard from "@/components/shared/StudentCard";
import { User, MapPin, Eye, EyeOff, Phone, Lock, Download, Camera, ShieldCheck, ChevronRight, X, Save, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { updatePasswordAction } from "@/lib/actions/user";
import { updateStudentPhotoAction } from "@/lib/actions/student";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function ProfileClient({ student }: { student: any }) {
  // --- ÉTATS POUR LES POPUPS ---
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null); 
  const [tempFile, setTempFile] = useState<File | null>(null);     
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleLocalPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempFile(file);
      setTempImage(URL.createObjectURL(file)); 
    }
  };

    const handleFinalUpload = async () => {
    if (!tempFile) return;
    setIsPending(true);
    const toastId = toast.loading("Mise à jour de ta photo officielle...");
    try {
      // 1. On récupère l'objet complet d'upload
      const uploadRes = await uploadToCloudinary(tempFile);
      
      // 2. On vérifie qu'on a bien reçu l'URL dans l'objet
      if (uploadRes && typeof uploadRes === 'object' && uploadRes.url) {
        
        // 3. On envoie UNIQUEMENT la string 'url' à ton action serveur
        const res = await updateStudentPhotoAction(uploadRes.url);
        
        if (res.success) {
          toast.success("Photo mise à jour !", { id: toastId });
          setShowPhotoModal(false);
          setTempImage(null);
          setTempFile(null);
          // Optionnel : router.refresh() pour mettre à jour l'image partout
        }
      } else {
        toast.error("Échec de l'envoi vers le cloud", { id: toastId });
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement", { id: toastId });
    } finally {
      setIsPending(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await updatePasswordAction(formData);
    if (res.success) {
      toast.success(res.message);
      setShowPasswordModal(false);
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 px-2 lg:px-4 animate-in fade-in duration-700">
      <Toaster position="top-right" richColors />

      {/* 1. POPUP : MODIFIER LE MOT DE PASSE */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl text-gray-900">Sécurité</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 bg-gray-100 rounded-full hover:text-red-500 transition-colors">
                <X size={20}/>
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Ancien mot de passe</label>
                <div className="relative">
                  <input name="oldPassword" required type={showOld ? "text" : "password"} placeholder="••••••••" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/10 shadow-inner" />
                  <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                    {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Nouveau mot de passe</label>
                <div className="relative">
                  <input name="newPassword" required type={showNew ? "text" : "password"} placeholder="••••••••" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/10 shadow-inner" />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isPending} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isPending ? <Loader2 className="animate-spin" /> : "Mettre à jour mon accès"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. POPUP : MODIFIER LA PHOTO */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl text-gray-900 uppercase tracking-tighter">Ma Photo</h3>
              <button onClick={() => { setShowPhotoModal(false); setTempImage(null); }} className="p-2 bg-gray-100 rounded-full hover:text-red-500"><X size={20}/></button>
            </div>
            <div className="flex flex-col items-center gap-6">
              <label className="relative w-40 h-40 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/30 transition-all group">
                {tempImage ? (
                  <img src={tempImage} alt="Preview" className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-300 group-hover:text-primary">
                    <Camera size={40} />
                    <span className="text-[10px] font-black uppercase">Choisir</span>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleLocalPreview} />
              </label>
              <button onClick={handleFinalUpload} disabled={!tempFile || isPending} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] disabled:opacity-30 transition-all flex items-center justify-center gap-3">
                {isPending ? <Loader2 className="animate-spin" /> : <><Save size={18}/> Confirmer la photo</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTENU PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* COLONNE GAUCHE */}
        <div className="lg:col-span-5 space-y-8 flex flex-col items-center">
          <div className="w-full text-center lg:text-left">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Mon Identité</h1>
            <p className="text-sm text-gray-400 font-medium">Tes informations officielles et ta carte scolaire.</p>
          </div>
          
          <StudentCard 
            nom={student.nom} 
            prenom={student.prenom} 
            matricule={student.matricule} 
            classe={student.classe.nom}
            photo={student.img} 
          />

          <button onClick={() => window.open(`/api/cards/export?studentId=${student.id}`, '_blank')} className="w-full max-w-[420px] flex items-center justify-center gap-3 bg-gray-900 text-white py-5 rounded-[2.5rem] font-black text-xs hover:bg-primary transition-all shadow-xl active:scale-95 uppercase tracking-widest">
            <Download size={20} /> Télécharger ma carte PDF
          </button>
        </div>

        {/* COLONNE DROITE */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[3rem] p-8 lg:p-12 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
                <ShieldCheck className="text-primary" size={24} /> 
                Dossier Personnel
              </h2>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-100">COMPLET</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2"><User size={14}/> Nom Complet</label>
                <p className="font-bold text-gray-800 text-lg uppercase">{student.nom} {student.prenom}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2"><MapPin size={14}/> Domicile</label>
                <p className="font-bold text-gray-800 text-lg uppercase">{student.adresse || "Bénin"}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2"><Phone size={14}/> Contact d'urgence</label>
                <p className="font-bold text-gray-800 text-lg">{student.parent.telephone}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2"><Lock size={14}/> Sécurité</label>
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center gap-2 text-primary text-xs font-black hover:bg-blue-50 px-3 py-2 rounded-xl transition-all w-fit uppercase"
                >
                  Modifier le mot de passe <ChevronRight size={14}/>
                </button>
              </div>
            </div>

            <div 
              onClick={() => setShowPhotoModal(true)}
              className="mt-14 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-between group cursor-pointer hover:bg-white hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm group-hover:text-primary transition-colors border">
                  <Camera size={28} />
                </div>
                <div>
                  <p className="font-black text-sm text-gray-800">Mettre à jour ma photo</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter italic">Obligatoire pour les examens</p>
                </div>
              </div>
              <ChevronRight className="text-gray-300" size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
