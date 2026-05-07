"use client";
import { useState, useTransition, useEffect } from "react";
import { DoorOpen, Plus, Trash2, Users, Loader2, CheckCircle2, LayoutGrid } from "lucide-react";
import { createClasseAction, deleteClasseAction } from "@/lib/actions/classe";
import { toast, Toaster } from "sonner";
import ConfirmModal from "@/components/shared/ConfirmModal";

export default function AdminClasses({ series = [], initialClasses = [] }: any) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  // ✅ ÉTAT POUR SUIVRE LA SÉRIE (Pour l'affichage du préfixe)
  const [selectedSerieId, setSelectedSerieId] = useState<string>("");

  const [classList, setClassList] = useState(initialClasses);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  useEffect(() => { setClassList(initialClasses); }, [initialClasses]);

  // On cherche les infos de la série choisie pour afficher le niveau en temps réel
  const selectedSerie = series.find((s: any) => s.id === parseInt(selectedSerieId));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    
    // Le nom complet sera géré "en cachette" dans l'Action serveur
    const suffixe = formData.get("nom") as string;

    startTransition(async () => {
      const res = await createClasseAction(formData);
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        form.reset();
        setSelectedSerieId(""); // On reset la sélection
        toast.success(`Salle ${selectedSerie?.level?.nom} ${suffixe} créée !`);
      }
    });
  };

  const handleDelete = (id: number) => {
    startTransition(async () => {
      const res = await deleteClasseAction(id);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Salle supprimée !");
        setDeleteTarget(null);
      }
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 px-4 animate-in fade-in duration-700">
      <Toaster position="top-right" richColors />
      
      <header className="mb-10 pt-6">
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600"><DoorOpen size={20} /></div>
           <h1 className="text-2xl font-black text-gray-900 tracking-tighter">Salles de Classe</h1>
        </div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic">Étape 5 : Créer les salles physiques</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-24 transition-all hover:shadow-md">
              <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 italic">1. Spécifier la Série</label>
                    <select 
                      name="serieId" 
                      required 
                      value={selectedSerieId}
                      onChange={(e) => setSelectedSerieId(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-black text-gray-900 outline-none cursor-pointer shadow-inner appearance-none"
                    >
                       <option value="">Sélectionner Série...</option>
                       {series.map((s: any) => (
                         <option key={s.id} value={s.id}>{s.nom} ({s.level?.nom})</option>
                       ))}
                    </select>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 italic">2. Nom de la Salle</label>
                    <div className="relative flex items-center">
                      {/* ✅ AFFICHAGE DU PRÉFIXE EN CACHETTE DANS L'INPUT */}
                      {selectedSerie && (
                        <span className="absolute left-6 text-indigo-600 font-black text-sm uppercase pointer-events-none">
                          {selectedSerie.level?.nom} —
                        </span>
                      )}
                      <input 
                        name="nom" 
                        required 
                        placeholder={selectedSerie ? "Compléter (ex: A1)" : "ex: Tle D1, 6ème M2..."}
                        className={`w-full bg-gray-50 border-none rounded-2xl py-4 text-sm font-bold outline-none shadow-inner transition-all focus:ring-2 focus:ring-indigo-500/10 ${selectedSerie ? 'pl-24' : 'px-6'}`} 
                      />
                    </div>
                 </div>

                 {error && <p className="text-[9px] text-red-500 font-black uppercase italic ml-2">{error}</p>}
                 <button disabled={isPending} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50">
                    {isPending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                    {isPending ? "CRÉATION..." : "CRÉER LA SALLE"}
                 </button>
              </form>
           </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2 italic underline decoration-indigo-500 decoration-2 underline-offset-4">
              Base de données ({classList.length})
           </h3>
           
           {classList.map((c: any) => (
             <div key={c.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-500/20 transition-all scale-in-center">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-colors shadow-inner">
                      <LayoutGrid size={20} />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-gray-900 leading-none uppercase">{c.nom}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-black text-indigo-600 uppercase italic leading-none">{c.serie?.nom}</span>
                        <span className="text-[9px] text-gray-300">•</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase italic leading-none">{c.serie?.level?.nom}</span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="hidden md:flex flex-col items-end">
                      <p className="text-[10px] font-black text-gray-900 leading-none">{c._count?.eleves || 0}</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Élèves</p>
                   </div>
                   <button 
                     disabled={isPending}
                     onClick={() => setDeleteTarget(c)}
                     className="p-3 bg-gray-50 text-gray-300 rounded-xl hover:text-red-500 hover:bg-red-50 transition-all shadow-sm active:scale-90"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
             </div>
           ))}
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer Salle"
        message={`Retirer la salle "${deleteTarget?.nom}" ?`}
        isLoading={isPending}
        onConfirm={() => handleDelete(deleteTarget.id)}
      />
    </div>
  );
}
