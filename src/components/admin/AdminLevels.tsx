"use client";
import { useState, useTransition, useEffect } from "react";
import { GraduationCap, Plus, Trash2, Layers, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { createLevelAction, deleteLevelAction } from "@/lib/actions/levels"; 
import { toast, Toaster } from "sonner";
import ConfirmModal from "../shared/ConfirmModal";

export default function AdminLevels({ initialData = [] }: { initialData?: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{id: number, nom: string} | null>(null);


  // ✅ AUTO-REFRESH : On synchronise le state local avec les données de la base
  const [levels, setLevels] = useState(initialData);

  // Synchronisation si initialData change (via revalidatePath)
  useEffect(() => {
    setLevels(initialData);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const nom = formData.get("nom") as string;
    const form = e.currentTarget;

    startTransition(async () => {
      const res = await createLevelAction(formData);
      
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        form.reset();
        toast.success(`Niveau "${nom}" créé avec succès !`);
        // Note: Le revalidatePath mettra à jour initialData, 
        // mais le state local garantit une réactivité sans faille.
      }
    });
  };

  

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 px-4 animate-in fade-in duration-700">
      <Toaster position="top-right" richColors />
      
      <header className="mb-10 pt-6">
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Layers size={20} />
           </div>
           <h1 className="text-2xl font-black text-gray-900 tracking-tighter">Configuration des Niveaux</h1>
        </div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic">Étape 1 : Définir le socle pédagogique</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-5">
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-24">
              <h3 className="text-sm font-black text-gray-800 mb-6 flex items-center gap-2">
                 <Plus size={16} className="text-primary" /> Nouveau Niveau
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 italic">Nom du niveau</label>
                    <input 
                      name="nom"
                      required
                      type="text" 
                      placeholder="ex: 3ème ou Terminale" 
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-inner"
                    />
                 </div>

                 {error && <p className="text-[10px] text-red-500 font-black uppercase ml-2 italic">{error}</p>}

                 <button 
                   disabled={isPending}
                   type="submit"
                   className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-primary transition-all flex items-center justify-center gap-3 active:scale-95 cursor-pointer disabled:opacity-50"
                 >
                    {isPending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                    {isPending ? "ENREGISTREMENT..." : "VALIDER LE NIVEAU"}
                 </button>
              </form>
           </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2 italic">Base de données ({levels.length})</h3>
           
           {levels.map((level: any) => (
             <div key={level.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all scale-in-center">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shadow-inner">
                      <GraduationCap size={24} />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-gray-900 leading-none uppercase">{level.nom}</h4>
                      <div className="flex items-center gap-3 mt-2 text-[9px] font-bold text-gray-400 uppercase italic">
                         <span>{level._count?.classes || 0} Salles configurées</span>
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <button 
                     disabled={isPending}
                    onClick={() => setDeleteTarget({ id: level.id, nom: level.nom })} 
                     className="p-3 bg-gray-50 text-gray-300 rounded-xl hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer shadow-sm disabled:opacity-30"
                   >
                      {isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                   </button>
                   <div className="p-2 text-gray-200 group-hover:text-primary transition-colors">
                      <ChevronRight size={20} />
                   </div>
                </div>
             </div>
           ))}

           {levels.length === 0 && (
             <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/50">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Aucun niveau configuré dans Neon</p>
             </div>
           )}
        </div>

        <ConfirmModal 
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                isLoading={isPending}
                title="Suppression"
                message={`Voulez-vous vraiment retirer le niveau "${deleteTarget?.nom}" ? Cette action est irréversible.`}
                onConfirm={() => {
                    if (deleteTarget) {
                        startTransition(async () => {
                        const res = await deleteLevelAction(deleteTarget.id);
                            if (res?.error) {
                                toast.error(res.error);
                                } else {
                                toast.success("Niveau supprimé !");
                                setDeleteTarget(null); // On ferme le modal seulement si ça marche
                            }
                        });
                    }
                }}
                />
      </div>
    </div>
  );
}
