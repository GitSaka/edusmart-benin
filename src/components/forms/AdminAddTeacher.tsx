"use client";
import { useState, useTransition, useRef } from "react";
import { UserPlus, BookOpen, Smartphone, ShieldCheck, CheckSquare, Save, X, GraduationCap, Loader2 } from "lucide-react";
import Link from "next/link";
import { createTeacherAction } from "@/lib/actions/teacher";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminAddTeacher({ dbMatieres = [], dbClasses = [] }: any) {
  const [isPending, startTransition] = useTransition();
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]); // ✅ On stocke les IDs (numbers)
  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();
        const [loading, setLoading] = useState(false);
      
        const handleClick = () => {
          setLoading(true);
          router.push("/admin/users/teacher");
        };

  const toggleClass = (id: number) => {
    setSelectedClasses(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // ✅ On ajoute la liste des classes en JSON pour l'action
    formData.append("selectedClasses", JSON.stringify(selectedClasses));

    startTransition(async () => {
      const res = await createTeacherAction(formData);
      if (res?.success) {
        toast.success("Professeur enregistré avec succès !");
        formRef.current?.reset();
        setSelectedClasses([]);
      } else {
        toast.error(res?.error || "Erreur lors de l'enregistrement");
      }
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 px-2 md:px-4 animate-in fade-in duration-700">
      <Toaster position="top-right" richColors />
      
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">Nouveau Professeur</h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1 italic">Création du compte enseignant officiel</p>
        </div>
        <button 
            onClick={handleClick}
            disabled={loading}
            className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <X size={20} />}
            
         </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <ShieldCheck size={14} className="text-primary"/> État Civil & Spécialité
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Nom du Professeur</label>
                <input name="nom" required type="text" placeholder="ex: DOSSOU" className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Prénoms</label>
                <input name="prenom" required type="text" placeholder="ex: Jean" className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/10" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-primary uppercase ml-2 italic">Matière Enseignée</label>
                <select name="matiereId" required className="w-full bg-primary/5 border-2 border-primary/10 rounded-xl px-5 py-3.5 text-sm font-black text-primary outline-none appearance-none cursor-pointer">
                  <option value="">Choisir...</option>
                  {dbMatieres.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.nom}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">Téléphone (WhatsApp)</label>
                <input name="telephone" required type="tel" placeholder="+229 ..." className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 text-sm font-bold outline-none" />
              </div>
            </div>
          </div>

          <button disabled={isPending} className="hidden lg:flex w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-primary active:scale-95 transition-all items-center justify-center gap-3 disabled:opacity-50">
            {isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
            {isPending ? "ENREGISTREMENT..." : "Valider le profil prof"}
          </button>
        </div>

        <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-fit">
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
             <GraduationCap size={14} className="text-primary"/> Classes Tenues
          </h3>
          
          <p className="text-[9px] font-bold text-gray-400 uppercase mb-4 px-2 italic">Cochez toutes les salles concernées :</p>

          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {dbClasses.map((c: any) => (
              <div 
                key={c.id}
                onClick={() => toggleClass(c.id)}
                className={`p-3 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                  selectedClasses.includes(c.id) 
                  ? "border-primary bg-primary/5 text-primary" 
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
                <span className="text-[10px] font-black text-gray-400 uppercase">Total Classes</span>
                <span className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-black shadow-sm">{selectedClasses.length}</span>
             </div>
          </div>
        </div>

        <div className="lg:hidden px-2 pt-4 w-full">
          <button disabled={isPending} className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
            {isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />} Valider le profil prof
          </button>
        </div>

      </form>
    </div>
  );
}
