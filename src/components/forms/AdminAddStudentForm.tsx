"use client";
import { useState, useTransition, ChangeEvent, useRef } from "react";
import { UserPlus, Image as ImageIcon, ShieldCheck, Phone, GraduationCap, Save, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { createStudentAction } from "@/lib/actions/student";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminAddStudentForm({ dbClasses = [] }: { dbClasses: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedNiveau, setSelectedNiveau] = useState("");
  const [availableSalles, setAvailableSalles] = useState<any[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ 1. CASCADE SÉCURISÉE (Plus de crash level undefined)
  const handleNiveauChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const niv = e.target.value;
    setSelectedNiveau(niv);
    // On filtre en vérifiant soit le niveau direct, soit celui de la série
    const filtered = dbClasses.filter((c) => {
      const nomNiv = c.level?.nom || c.serie?.level?.nom;
      return nomNiv === niv;
    });
    setAvailableSalles(filtered);
  };

   const handleClick = () => {
    setLoading(true);
    router.push("/admin/users/student");
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  // ✅ 2. SOUMISSION BLINDÉE
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentForm = e.currentTarget;
    const formData = new FormData(currentForm);
    const photoInput = currentForm.elements.namedItem("photo") as HTMLInputElement;
    const photoFile = photoInput.files?.[0];

   

    startTransition(async () => {
      const toastId = toast.loading("Enrôlement de l'élève...");
      
      try {
        let imageUrl = "";
        if (photoFile && photoFile.size > 0) {
          const res = await uploadToCloudinary(photoFile) || "";
           // ✅ ON EXTRAIT UNIQUEMENT L'URL (string)
            if (res && typeof res === 'object') {
              imageUrl = res.url; 
            }
        }

        // Nettoyage FormData avant envoi (Anti-Erreur 413)
        formData.set("img", imageUrl);
        formData.delete("photo");

        const res = await createStudentAction(formData);

        if (res?.success) {
          toast.success(`Élève ${res.matricule} inscrit !`, { id: toastId });
          currentForm.reset();
          setImagePreview(null);
          setSelectedNiveau("");
          setAvailableSalles([]);
        } else {
          toast.error(res?.error || "Erreur d'inscription", { id: toastId });
        }
      } catch (err) {
        toast.error("Erreur de connexion Neon/Cloudinary", { id: toastId });
      }
    });
  };

  // ✅ Liste unique des niveaux (Blindée)
  const niveauxUniques = Array.from(new Set(
    dbClasses.map(c => c.level?.nom || c.serie?.level?.nom).filter(Boolean)
  ));

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 px-2 md:px-4 animate-in fade-in duration-700">
      <Toaster position="top-right" richColors />
      
      <div className="flex items-center justify-between mb-8 px-2 text-left">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight tracking-tighter">Nouvel Élève</h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Enrôlement dans la base EduSmart</p>
        </div>
        
        <button 
            onClick={handleClick}
            disabled={loading}
            className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <X size={20} />}
            
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* BLOC 1 : IDENTITÉ */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <ShieldCheck size={14} className="text-primary"/> État Civil & Photo
            </h3>

            <label className="flex items-center gap-6 p-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 hover:border-primary/30 transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-primary shadow-sm overflow-hidden border">
                {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon size={28} />}
              </div>
              <div>
                <p className="text-xs font-black text-gray-700 italic text-left">Photo d'identité</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Cliquez pour choisir</p>
              </div>
              <input type="file" name="photo" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Nom de famille</label>
                <input name="nom" required type="text" placeholder="ex: KODJO" className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 text-sm font-bold outline-none shadow-inner" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Prénoms</label>
                <input name="prenom" required type="text" placeholder="ex: Koffi Marc" className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 text-sm font-bold outline-none shadow-inner" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Date de naissance</label>
                <input name="dateNaissance" required type="date" className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 text-sm font-bold outline-none shadow-inner" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Sexe</label>
                <select name="sexe" className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 text-sm font-bold outline-none shadow-inner">
                   <option value="M">Masculin</option>
                   <option value="F">Féminin</option>
                </select>
              </div>
            </div>
          </div>

          {/* BLOC 2 & 3 : SCOLARITÉ & PARENTS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <GraduationCap size={14} className="text-primary"/> Académique
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">1. Niveau</label>
                  <select onChange={handleNiveauChange} required className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 text-sm font-bold outline-none appearance-none shadow-inner">
                      <option value="">Sélectionner Niveau...</option>
                      {niveauxUniques.map(niv => <option key={niv as string} value={niv as string}>{niv as string}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-primary uppercase ml-2 italic">2. Salle / Classe</label>
                  <select name="classeId" disabled={!selectedNiveau} required className="w-full bg-primary/5 border-2 border-primary/10 rounded-xl px-5 py-3.5 text-sm font-black text-primary outline-none disabled:opacity-30">
                     <option value="">Choisir la salle...</option>
                     {availableSalles.map((s: any) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                </div>
            </div>

            <div className="bg-gray-900 p-6 md:p-8 rounded-[2.5rem] text-white shadow-xl space-y-6">
              <h3 className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <Phone size={14}/> Urgence Parents
              </h3>
              <div className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black opacity-40 uppercase ml-1 italic">Nom du Tuteur</label>
                  <input name="parentNom" required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] font-black opacity-40 uppercase ml-1 italic">Prenom du Tuteur</label>
                  <input name="parentPrenom" required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] font-black opacity-40 uppercase ml-1 italic text-primary">Téléphone Principal (Login)</label>
                  <input name="parentPhone" required type="tel" placeholder="+229 ..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none placeholder:opacity-20" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-2 pt-6">
          <button 
            disabled={isPending}
            type="submit"
            className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
            {isPending ? "ENRÔLEMENT EN COURS..." : "VALIDER L'INSCRIPTION"}
          </button>
        </div>
      </form>
    </div>
  );
}
