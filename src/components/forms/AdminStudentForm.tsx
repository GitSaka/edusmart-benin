"use client";
import { useState, useTransition, ChangeEvent, useRef, useEffect } from "react";
import { ImageIcon, ShieldCheck, GraduationCap, Save, X, Loader2, Phone, UserPlus } from "lucide-react";
import Link from "next/link";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { createStudentAction, updateStudentAction } from "@/lib/actions/student";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";

interface StudentFormProps {
  dbClasses: any[];
  studentData?: any; // Données de l'élève si on est en mode EDIT
}

export default function AdminStudentForm({ dbClasses, studentData }: StudentFormProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();
      const [loading, setLoading] = useState(false);
    const handleClick = () => {
      setLoading(true);
      router.push("/admin/users/student");
    };
  
  // États pour la preview et la cascade
  const [imagePreview, setImagePreview] = useState<string | null>(studentData?.img || null);
  const [selectedNiveau, setSelectedNiveau] = useState(studentData?.classe?.level?.nom || "");
  const [availableSalles, setAvailableSalles] = useState<any[]>(() => {
  const niveauInitial = studentData?.classe?.level?.nom || studentData?.serie?.level?.nom;
  if (niveauInitial) {
    return dbClasses.filter((c) => (c.level?.nom || c.serie?.level?.nom) === niveauInitial);
  }
  return [];
});

  // Charger les salles du niveau par défaut en mode Edit
  useEffect(() => {
    if (selectedNiveau) {
      const filtered = dbClasses.filter((c) => c.level.nom === selectedNiveau);
      setAvailableSalles(filtered);
    }
  }, [selectedNiveau, dbClasses]);

  const handleNiveauChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const niv = e.target.value;
    setSelectedNiveau(niv);
    const filtered = dbClasses.filter((c) => c.level.nom === niv);
    setAvailableSalles(filtered);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const photoFile = (e.currentTarget.elements.namedItem("photo") as HTMLInputElement).files?.[0];

    startTransition(async () => {
      const toastId = toast.loading(studentData ? "Mise à jour en cours..." : "Enregistrement...");
      
            if (photoFile && photoFile.size > 0) {
        const uploadRes = await uploadToCloudinary(photoFile);
        
        // 🎯 On vérifie si on a reçu l'objet et on extrait l'URL
        if (uploadRes && typeof uploadRes === "object") {
          formData.set("img", uploadRes.url); // On ne passe que l'URL (string)
          formData.delete("photo");
        } else if (typeof uploadRes === "string") {
          // Sécurité au cas où ta fonction renverrait encore une string
          formData.set("img", uploadRes);
          formData.delete("photo");
        }
      } else if (studentData?.img) {
        formData.set("img", studentData.img);
      }


      const res = studentData 
        ? await updateStudentAction(studentData.id, formData) 
        : await createStudentAction(formData);

      if (res?.success) {
        toast.success(res.message, { id: toastId });
         formRef.current?.reset();
        if (!studentData) {
            formRef.current?.reset();
            setImagePreview(null);
            setSelectedNiveau("");
        }
      } else {
        toast.error(res?.error || "Erreur", { id: toastId });
      }
    });
  };

  const niveauxUniques = Array.from(new Set(dbClasses.map(c => c.level.nom)));

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 px-2 md:px-4 animate-in fade-in duration-700">
      <Toaster position="top-right" richColors />
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">
            {studentData ? "Modifier la fiche" : "Nouvel Élève"}
          </h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">
            {studentData ? `MATRICULE : ${studentData.matricule}` : "Enrôlement EduSmart"}
          </p>
        </div>
        <button 
            onClick={handleClick}
            disabled={loading}
            className="bg-primary text-white px-4 py-3 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> :  <X size={20} />}
            
         </button>
        
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* BLOC 1 : IDENTITÉ & PHOTO */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
               <ShieldCheck size={14} className="text-primary"/> État Civil & Photo
            </h3>

            <label className="flex items-center gap-6 p-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 hover:border-primary/30 transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-primary shadow-sm overflow-hidden border">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={28} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-gray-700">Photo d'identité</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Cliquez pour modifier</p>
              </div>
              <input type="file" name="photo" className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setImagePreview(URL.createObjectURL(file));
              }} />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField name="nom" label="Nom" defaultValue={studentData?.nom} placeholder="KODJO" />
              <InputField name="prenom" label="Prénoms" defaultValue={studentData?.prenom} placeholder="Koffi" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField name="dateNaissance" label="Date de naissance" type="date" 
                defaultValue={studentData?.dateNaissance ? new Date(studentData.dateNaissance).toISOString().split('T')[0] : ""} />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase italic ml-2">Sexe</label>
                <select name="sexe" defaultValue={studentData?.sexe || "M"} className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 text-sm font-bold outline-none shadow-inner">
                   <option value="M">Masculin</option>
                   <option value="F">Féminin</option>
                </select>
              </div>
            </div>
          </div>

          {/* BLOC 2 : SCOLARITÉ & PARENTS (REMPLI) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
                <GraduationCap size={14} className="text-primary"/> Affectation & Parents
                </h3>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">1. Niveau d'étude</label>
                  <select value={selectedNiveau} onChange={handleNiveauChange} required className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 text-sm font-bold outline-none shadow-inner">
                      <option value="">Choisir...</option>
                      {niveauxUniques.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-primary uppercase ml-2 italic">2. Salle / Classe</label>
                  <select  key={selectedNiveau}  name="classeId" defaultValue={studentData?.classeId} disabled={!selectedNiveau} required className="w-full bg-primary/5 border-2 border-primary/10 rounded-xl px-5 py-3.5 text-sm font-black text-primary outline-none disabled:opacity-30 transition-all">
                      <option value="">Choisir la salle...</option>
                      {availableSalles.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                </div>

                {/* --- ZONE PARENTS (BLINDÉE) --- */}
                <div className="pt-4 border-t border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <Phone size={14}/>
                        <p className="text-[10px] font-black uppercase">Contact Urgence / Parent</p>
                    </div>
                    <InputField name="parentPhone" label="Téléphone Parent" defaultValue={studentData?.parent?.telephone} placeholder="97000000" />
                    <div className="grid grid-cols-2 gap-3">
                        <InputField name="parentNom" label="Nom Parent" defaultValue={studentData?.parent?.nom} placeholder="Optionnel" />
                        <InputField name="parentPrenom" label="Prénom Parent" defaultValue={studentData?.parent?.prenom} placeholder="Optionnel" />
                    </div>
                </div>
            </div>

            <button type="submit" disabled={isPending} className="w-full bg-black text-white p-6 rounded-[2.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-800 transition-all disabled:opacity-50 shadow-xl">
               {isPending ? <Loader2 className="animate-spin" /> : <><Save size={20}/> {studentData ? "Mettre à jour" : "Valider l'enrôlement"}</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Sous-composant réutilisable pour la propreté
function InputField({ name, label, type = "text", defaultValue, placeholder }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase italic ml-2 tracking-tighter">{label}</label>
            <input 
                name={name} 
                defaultValue={defaultValue} 
                type={type} 
                placeholder={placeholder} 
                className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/10 shadow-inner" 
            />
        </div>
    );
}
