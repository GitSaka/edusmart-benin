"use client";
import { useState, useTransition, useMemo } from "react";
import { BookOpen, Plus, Trash2, Sparkles, Loader2, ShieldCheck, Layers, LockOpen, Lock } from "lucide-react";
import { createCoursAction, toggleSaisieAction } from "@/lib/actions/cours";
import { toast, Toaster } from "sonner";
import { deleteCoursAction } from "@/lib/actions/cours";
import ConfirmModal from "../shared/ConfirmModal";

export default function AdminAcademicCoursClient({ dbTeachers, dbMatieres, dbClasses, dbCours }: any) {
  const [isPending, startTransition] = useTransition();
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
const [idToDelete, setIdToDelete] = useState<number | null>(null);

const [syncingId, setSyncingId] = useState<number | null>(null); // Pour cibler quel bouton charge
const [optimisticStatus, setOptimisticStatus] = useState<Record<number, boolean>>({});




  // 2. Dans ton composant, crée la fonction de gestion
    // 1. Déclenchement au clic sur l'icône poubelle
    const handleDelete = (id: number) => {
      setIdToDelete(id);
      setIsModalOpen(true);
    };

    // 2. Exécution réelle quand l'Admin confirme dans le Modal
    const confirmDelete = async () => {
      if (!idToDelete) return;

        // 🚀 C'est ICI que la magie opère
      startTransition(async () => {
        const res = await deleteCoursAction(idToDelete);
      
      if (res.success) {
        toast.success("Le lien a été supprimé.");
        setIsModalOpen(false); // Ferme le modal
      } else {
        toast.error(res.error);
      }
    })

    };

  const handleToggleSaisie = (coursId: number, currentStatus: boolean) => {
    // 1. Changement visuel immédiat (Zéro latence)
    const nextStatus = !currentStatus;
    setOptimisticStatus(prev => ({ ...prev, [coursId]: nextStatus }));
    setSyncingId(coursId);

    // 2. Lancement de la synchronisation réelle
    startTransition(async () => {
      const res = await toggleSaisieAction(coursId, currentStatus);

      if (res?.success) {
        toast.success(nextStatus ? "Saisie Ouverte 🔓" : "Saisie Verrouillée 🔒");
      } else {
        // ❌ En cas d'échec, on remet l'ancienne couleur
        setOptimisticStatus(prev => ({ ...prev, [coursId]: currentStatus }));
        toast.error(res?.error || "Erreur de synchronisation");
      }
      setSyncingId(null);
    });
  };



  // ✅ INTELLIGENCE : Trouver la matière du prof sélectionné
  const autoMatiere = useMemo(() => {
    const prof = dbTeachers.find((t: any) => t.id === selectedTeacherId);
    return prof ? prof.matiere : null;
  }, [selectedTeacherId, dbTeachers]);

  // ✅ FILTRAGE : Ne proposer que les classes affectées à ce prof
  const allowedClasses = useMemo(() => {
    const prof = dbTeachers.find((t: any) => t.id === selectedTeacherId);
    return prof ? prof.classes : [];
  }, [selectedTeacherId, dbTeachers]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // On force l'ID de la matière du prof pour éviter toute erreur
    if (autoMatiere) formData.set("matiereId", autoMatiere.id.toString());

    startTransition(async () => {
      const res = await createCoursAction(formData);
      if (res?.success) {
        toast.success("Le contrat de cours est validé !");
        (e.target as HTMLFormElement).reset();
        setSelectedTeacherId("");
      } else {
        toast.error(res?.error || "Erreur");
      }
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 px-0 md:px-4 animate-in fade-in duration-700 text-left">
      <Toaster position="top-right" richColors />
      
      <header className="mb-8 px-4 pt-6">
        <div className="flex items-center gap-3 mb-1">
           <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600"><Sparkles size={18} /></div>
           <h1 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">Attribution des Cours</h1>
        </div>
        <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">Étape 1 : Créer les contrats (Quoi / Qui / Où)</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-8">
        
        {/* FORMULAIRE INTELLIGENT */}
        <div className="lg:col-span-4 px-4 md:px-0 mb-8 lg:mb-0">
           <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-24">
              <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 italic">1. Sélectionner Professeur</label>
                    <select 
                      name="teacherId" 
                      required 
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-4 text-xs font-black outline-none cursor-pointer shadow-inner appearance-none"
                    >
                       <option value="">Choisir...</option>
                       {dbTeachers.map((t: any) => <option key={t.id} value={t.id}>{t.nom} {t.prenom}</option>)}
                    </select>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-indigo-400 uppercase ml-2 italic">2. Matière Détectée</label>
                    <div className="w-full bg-indigo-50/50 border-2 border-indigo-100 rounded-xl px-4 py-4 text-xs font-black text-indigo-600 flex items-center justify-between">
                       {autoMatiere ? autoMatiere.nom.toUpperCase() : "En attente du prof..."}
                       <ShieldCheck size={14} className={autoMatiere ? "opacity-100" : "opacity-20"} />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 italic">3. Salle de Classe</label>
                    <select 
                      name="classeId" 
                      required 
                      disabled={!selectedTeacherId}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-4 text-xs font-black outline-none cursor-pointer shadow-inner appearance-none disabled:opacity-20"
                    >
                       <option value="">Affecter à...</option>
                       {allowedClasses.map((c: any) => <option key={c.id} value={c.id}>{c.nom} ({c.serie?.nom})</option>)}
                    </select>
                 </div>

                 <button disabled={isPending || !selectedTeacherId} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-30">
                    {isPending ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                    LIER LE CONTRAT
                 </button>
              </form>
           </div>
        </div>

        {/* RÉPERTOIRE DES COURS (Zéro padding mobile) */}
        <div className="lg:col-span-8 space-y-3">
           <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 px-4 italic underline underline-offset-8 decoration-indigo-200">Unités d'Enseignement ({dbCours.length})</h3>
           
           <div className="space-y-1">
              {dbCours.map((cours: any) => (
                <div key={cours.id} className="bg-white p-5 md:rounded-[2.5rem] border-y md:border border-gray-100 flex items-center justify-between group hover:border-indigo-500/20 transition-all">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-50 transition-colors">
                         <BookOpen size={20} />
                      </div>
                  <button 
                    disabled={isPending && syncingId === cours.id}
                    onClick={() => handleToggleSaisie(cours.id, cours.saisieOuverte)}
                    className={`p-2.5 rounded-xl transition-all border flex items-center gap-2 relative active:scale-95 ${
                      (optimisticStatus[cours.id] ?? cours.saisieOuverte) 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                      : "bg-red-50 text-red-600 border-red-100 shadow-inner"
                    }`}
                  >
                    {isPending && syncingId === cours.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (optimisticStatus[cours.id] ?? cours.saisieOuverte) ? (
                      <LockOpen size={14} />
                    ) : (
                      <Lock size={14} />
                    )}

                    <span className="text-[8px] font-black uppercase tracking-tighter">
                      {(optimisticStatus[cours.id] ?? cours.saisieOuverte) ? "Ouvert" : "Fermé"}
                    </span>
                  </button>


                      <div>
                         <p className="text-sm font-black text-gray-900 uppercase leading-none tracking-tight">{cours.matiere.nom}</p>
                         <div className="flex items-center gap-2 mt-2">
                            <span className="text-[9px] font-black text-gray-400 uppercase italic">{cours.teacher.nom}</span>
                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter bg-indigo-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                               <Layers size={10}/> {cours.classe.nom}
                            </span>
                         </div>
                      </div>
                   </div>
                   <button
                   onClick={() => handleDelete(cours.id)} 
                    className="p-3 text-gray-200 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={18} /></button>
                </div>
              ))}
           </div>

           <ConfirmModal
                isOpen={isModalOpen}
                isLoading={isPending}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete} // Appelle la suppression réelle
                title="Supprimer le contrat de cours ?"
                message="Cette action est irréversible et supprimera l'emploi du temps lié."
                />
           

           {dbCours.length === 0 && (
             <div className="py-20 text-center px-4 bg-gray-50/30 md:rounded-[3rem] border-2 border-dashed border-gray-100 mt-4">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Aucune liaison académique active</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
