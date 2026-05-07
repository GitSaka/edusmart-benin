"use client";
import { useState, useTransition, useRef } from "react";
import { ShieldCheck, CheckSquare, Save, X, GraduationCap, Loader2 } from "lucide-react";
import Link from "next/link";
import { updateTeacherAction } from "@/lib/actions/teacher";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";

interface EditTeacherProps {
  dbMatieres: any[];
  dbClasses: any[];
  teacherData: any; // ✅ Les données du prof récupérées depuis Neon
}

export default function AdminEditTeacher({ dbMatieres = [], dbClasses = [], teacherData }: EditTeacherProps) {
  const [isPending, startTransition] = useTransition();

   const router = useRouter();
      const [loading, setLoading] = useState(false);
    
      const handleClick = () => {
        setLoading(true);
        router.push("/admin/users/teacher");
      };
  
  // ✅ INITIALISATION : On pré-coche les classes que le prof a déjà
  const [selectedClasses, setSelectedClasses] = useState<number[]>(
    teacherData.classes?.map((c: any) => c.id) || []
  );

  const toggleClass = (id: number) => {
    setSelectedClasses(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // ✅ On envoie la nouvelle liste des classes
    formData.append("selectedClasses", JSON.stringify(selectedClasses));

    startTransition(async () => {
      const toastId = toast.loading("Mise à jour du profil enseignant...");
      
      const res = await updateTeacherAction(teacherData.id, formData);
      
      if (res?.success) {
        toast.success("Le profil a été mis à jour avec succès !", { id: toastId });
      } else {
        toast.error(res?.error || "Erreur lors de la modification", { id: toastId });
      }
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 px-2 md:px-4 animate-in fade-in duration-700 text-left">
      <Toaster position="top-right" richColors />
      
      {/* HEADER : On affiche le nom du prof en titre */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight tracking-tighter uppercase">
            Modifier : {teacherData.nom} {teacherData.prenom}
          </h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1 italic">Mise à jour des accès et affectations</p>
        </div>
        <button 
            onClick={handleClick}
            disabled={loading}
            className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <X size={20} />}
            
         </button>
       
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLONNE GAUCHE : IDENTITÉ (Pré-remplie) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <ShieldCheck size={14} className="text-primary"/> État Civil & Spécialité
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Nom</label>
                <input name="nom" required defaultValue={teacherData.nom} className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 text-sm font-bold outline-none shadow-inner" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Prénoms</label>
                <input name="prenom" required defaultValue={teacherData.prenom} className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 text-sm font-bold outline-none shadow-inner" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-primary uppercase ml-2 italic">Matière</label>
                <select name="matiereId" required defaultValue={teacherData.matiereId} className="w-full bg-primary/5 border-2 border-primary/10 rounded-xl px-5 py-3.5 text-sm font-black text-primary outline-none">
                  {dbMatieres.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.nom}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Téléphone (Login)</label>
                <input name="telephone" required defaultValue={teacherData.telephone} className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 text-sm font-bold outline-none shadow-inner" />
              </div>
            </div>
          </div>

          <button disabled={isPending} className="hidden lg:flex w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-primary active:scale-95 transition-all items-center justify-center gap-3">
            {isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
            ENREGISTRER LES MODIFICATIONS
          </button>
        </div>

        {/* COLONNE DROITE : CLASSES TENUES (Pré-cochées) */}
        <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-fit">
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
             <GraduationCap size={14} className="text-primary"/> Classes Tenues
          </h3>
          
          <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {dbClasses.map((c: any) => (
              <div 
                key={c.id}
                onClick={() => toggleClass(c.id)}
                className={`p-3 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                  selectedClasses.includes(c.id) 
                  ? "border-primary bg-primary/5 text-primary shadow-sm" 
                  : "border-gray-50 text-gray-400 hover:border-gray-100"
                }`}
              >
                <span className="text-[10px] font-black">{c.nom}</span>
                {selectedClasses.includes(c.id) && <CheckSquare size={14} />}
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-50">
             <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                <span className="text-[10px] font-black text-gray-400 uppercase">Affectations</span>
                <span className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-black">{selectedClasses.length} salles</span>
             </div>
          </div>
        </div>

      </form>
    </div>
  );
}
