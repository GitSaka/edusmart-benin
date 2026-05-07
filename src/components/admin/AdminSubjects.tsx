"use client";
import { useState, useTransition, useEffect, useRef } from "react";
import { Book, Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { createMatiereAction, deleteMatiereAction } from "@/lib/actions/matiere";
import { toast, Toaster } from "sonner";
import ConfirmModal from "@/components/shared/ConfirmModal";

interface AdminSubjectsProps {
  initialSubjects: any[];
}

export default function AdminSubjects({ initialSubjects = [] }: AdminSubjectsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // ✅ AUTO-REFRESH : On synchronise avec la base
  const [subjects, setSubjects] = useState(initialSubjects);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Mise à jour si les données serveur changent
  useEffect(() => {
    setSubjects(initialSubjects);
  }, [initialSubjects]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nom = formData.get("nom") as string;
    
    setError(null); // On vide l'erreur avant de commencer

    startTransition(async () => {
      try {
        const res = await createMatiereAction(formData);
        
        if (res?.error) {
          setError(res.error);
          toast.error(res.error);
        } else {
          formRef.current?.reset();
          toast.success(`Matière "${nom}" ajoutée !`);
          // Le revalidatePath fera le rafraîchissement
        }
      } catch (err) {
        setError("Erreur de connexion au serveur.");
        toast.error("Impossible de joindre la base de données.");
      }
    });
  };

  const handleDelete = (id: number) => {
    startTransition(async () => {
      try {
        const res = await deleteMatiereAction(id);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Matière supprimée !");
          setDeleteTarget(null);
        }
      } catch (err) {
        toast.error("Erreur lors de la suppression.");
      }
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 px-4 animate-in fade-in duration-700">
      <Toaster position="top-right" richColors />
      
      <header className="mb-10 pt-6">
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600"><Book size={20} /></div>
           <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Catalogue des Matières</h1>
        </div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic">Étape 3 : Lister les enseignements de l'établissement</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- FORMULAIRE --- */}
        <div className="lg:col-span-5">
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-24">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 italic">Nom de la Matière</label>
                    <input 
                      name="nom" 
                      required 
                      placeholder="ex: Mathématiques, Philo..." 
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none shadow-inner focus:ring-2 focus:ring-blue-500/10 transition-all" 
                    />
                 </div>
                 {error && <p className="text-[9px] text-red-500 font-black uppercase italic ml-2">{error}</p>}
                 <button 
                   disabled={isPending} 
                   className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50"
                 >
                    {isPending ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                    {isPending ? "EN COURS..." : "AJOUTER AU CATALOGUE"}
                 </button>
              </form>
           </div>
        </div>

        {/* --- LISTE --- */}
        <div className="lg:col-span-7 space-y-3">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2 italic underline decoration-blue-500 decoration-2 underline-offset-4">
              Base de données ({subjects.length})
           </h3>
           
           {subjects.map((sub: any) => (
             <div key={sub.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-500/20 transition-all scale-in-center">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors shadow-inner">
                      <Book size={18} />
                   </div>
                   <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">{sub.nom}</h4>
                </div>
                
                <button 
                  disabled={isPending}
                  onClick={() => setDeleteTarget(sub)}
                  className="p-2.5 bg-gray-50 text-gray-300 rounded-xl hover:text-red-500 hover:bg-red-50 transition-all shadow-sm active:scale-90 disabled:opacity-30"
                >
                  <Trash2 size={14} />
                </button>
             </div>
           ))}

           {subjects.length === 0 && (
             <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/30">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Catalogue vide</p>
             </div>
           )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer Matière"
        message={`Retirer définitivement "${deleteTarget?.nom}" ?`}
        isLoading={isPending}
        onConfirm={() => handleDelete(deleteTarget.id)}
      />
    </div>
  );
}
