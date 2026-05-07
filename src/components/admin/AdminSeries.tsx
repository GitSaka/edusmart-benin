"use client";
import { useState, useTransition, useEffect } from "react";
import { Plus, Trash2, Box, ChevronRight, Loader2, CheckCircle2, Layers } from "lucide-react";
import { createSerieAction, deleteSerieAction } from "@/lib/actions/serie";
import { toast, Toaster } from "sonner";
import ConfirmModal from "@/components/shared/ConfirmModal";

export default function AdminSeries({ levels = [], initialSeries = [] }: any) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  // ✅ AUTO-REFRESH : État local pour l'affichage instantané
  const [series, setSeries] = useState(initialSeries);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Synchronisation si les données serveur changent
  useEffect(() => { setSeries(initialSeries); }, [initialSeries]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    const nom = formData.get("nom") as string;

    startTransition(async () => {
      const res = await createSerieAction(formData);
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        form.reset();
        toast.success(`Série ${nom} créée avec succès !`);
        // Le revalidatePath fera le reste, mais le state garantit la fluidité
      }
    });
  };

  const handleDelete = (id: number, nom: string) => {
    startTransition(async () => {
      const res = await deleteSerieAction(id);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Série supprimée !");
        setDeleteTarget(null);
      }
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 px-4 animate-in fade-in duration-700">
      <Toaster position="top-right" richColors />
      
      <header className="mb-10 pt-6">
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 bg-orange-500/10 rounded-xl text-orange-600"><Box size={20} /></div>
           <h1 className="text-2xl font-black text-gray-900 tracking-tighter">Gestion des Séries</h1>
        </div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic">Étape 2 : Spécialiser les niveaux (A, B, C, D...)</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORMULAIRE */}
        <div className="lg:col-span-5">
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-24">
              <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 italic">1. Choisir le Niveau</label>
                    <select name="levelId" required className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none cursor-pointer shadow-inner appearance-none">
                       <option value="">Sélectionner...</option>
                       {levels.map((l: any) => <option key={l.id} value={l.id}>{l.nom}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 italic">2. Nom de la Série</label>
                    <input name="nom" required placeholder="ex: Série D" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none shadow-inner" />
                 </div>
                 {error && <p className="text-[9px] text-red-500 font-black uppercase italic ml-2">{error}</p>}
                 <button disabled={isPending} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50">
                    {isPending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                    VALIDER LA SÉRIE
                 </button>
              </form>
           </div>
        </div>

        {/* LISTE AUTOMATIQUE */}
        <div className="lg:col-span-7 space-y-4">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2 italic">Séries configurées ({series.length})</h3>
           {series.map((s: any) => (
             <div key={s.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-orange-500/20 transition-all scale-in-center">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-orange-500 transition-colors shadow-inner"><Layers size={20} /></div>
                   <div>
                      <h4 className="text-lg font-black text-gray-900 leading-none uppercase">{s.nom}</h4>
                      <p className="text-[9px] font-black text-orange-600 uppercase mt-1 italic">{s.level?.nom || "Niveau inconnu"}</p>
                   </div>
                </div>
                <button 
                  onClick={() => setDeleteTarget(s)}
                  className="p-3 bg-gray-50 text-gray-300 rounded-xl hover:text-red-500 shadow-sm transition-all active:scale-90"
                >
                  <Trash2 size={16} />
                </button>
             </div>
           ))}

           {series.length === 0 && (
             <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/50">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Aucune série configurée</p>
             </div>
           )}
        </div>
      </div>

      {/* MODAL DE CONFIRMATION REUTILISABLE */}
      <ConfirmModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer Série"
        message={`Voulez-vous vraiment supprimer la ${deleteTarget?.nom} ?`}
        isLoading={isPending}
        onConfirm={() => handleDelete(deleteTarget.id, deleteTarget.nom)}
      />
    </div>
  );
}
