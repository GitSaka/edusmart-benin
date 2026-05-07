"use client";
import { useState, useTransition } from "react";
import { Calendar, Clock, User, AlertCircle, Save, Plus, X, Loader2, ShieldAlert, CheckCircle2, Trash2 } from "lucide-react";
import { createTimetableAction, deleteTimetableAction } from "@/lib/actions/timetable";
import { toast, Toaster } from "sonner";

const SLOTS = [
  { id: "07:00-09:00", label: "07h - 09h" },
  { id: "09:00-10:00", label: "09h - 10h" },
  { id: "10:00-12:00", label: "10h - 12h" },
  { id: "13:00-15:00", label: "13h - 15h" },
  { id: "15:00-17:00", label: "15h - 17h" }
];

const DAYS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];

export default function AdminTimetableClient({ dbClasses, dbCours, fullGrid }: any) {
  const [selectedClassId, setSelectedClassId] = useState(dbClasses[0]?.id);
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState<{ day: string, slot: string } | null>(null);
const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // 1. Filtrer les cours de la classe sélectionnée
  const classCours = dbCours.filter((c: any) => c.classeId === Number(selectedClassId));

  const handleAddSlot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (showModal) {
      formData.append("jour", showModal.day);
      const [debut, fin] = showModal.slot.split("-");
      formData.append("heureDebut", debut);
      formData.append("heureFin", fin);
    }

    startTransition(async () => {
      const res = await createTimetableAction(formData);
      if (res?.success) {
        toast.success("Horaire fixé !");
        setShowModal(null);
      } else toast.error(res?.error);
    });
  };

const handleDeleteSlot = (id: number) => {
  // Si c'est le DEUXIÈME clic sur le même bouton
  if (pendingDeleteId === id) {
    startTransition(async () => {
      await deleteTimetableAction(id);
      toast.success("Créneau libéré !");
      setPendingDeleteId(null);
    });
  } else {
    // Si c'est le PREMIER clic, on demande confirmation "dans" le bouton
    setPendingDeleteId(id);
    // On annule automatiquement après 3 secondes si pas de 2ème clic
    setTimeout(() => setPendingDeleteId(null), 3000);
  }
};

  return (
    <div className="w-full max-w-full pb-20 px-0 md:px-4 animate-in fade-in duration-700 overflow-x-hidden text-left">
      <Toaster position="top-right" richColors />
      
      {/* HEADER */}
      <header className="mb-8 px-4 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight uppercase italic tracking-tighter">Gestionnaire de Vacations</h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1 italic">Conception des emplois du temps</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-full md:w-auto">
          <select 
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(Number(e.target.value))}
            className="bg-transparent border-none px-4 py-2 text-xs font-black uppercase outline-none cursor-pointer"
          >
            {dbClasses.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>
      </header>

      {/* GRILLE INTELLIGENTE */}
      <div className="px-2 overflow-x-auto no-scrollbar">
        <div className="min-w-[900px] bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="p-5 text-[10px] font-black uppercase tracking-widest border-r border-white/10 italic">Heures</th>
                {DAYS.map(day => (
                  <th key={day} className="p-5 text-[10px] font-black uppercase tracking-widest text-center italic">{day.slice(0, 3)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-left">
              {SLOTS.map((slot) => (
                <tr key={slot.id} className="group">
                  <td className="p-5 bg-gray-50/50 border-r border-gray-50 text-center">
                    <p className="text-[10px] font-black text-gray-400 leading-none">{slot.label}</p>
                  </td>
                  
                  {DAYS.map((day) => {
                    const cellData = fullGrid.find((t: any) => 
                      t.jour === day && t.heureDebut === slot.id.split("-")[0] && t.cours.classeId === Number(selectedClassId)
                    );

                    return (
                      <td key={day} className="p-2 border-r border-gray-50 last:border-0 h-32 align-top">
                        {cellData ? (
                          <div className="bg-primary/5 border-2 border-primary/20 p-3 rounded-2xl h-full flex flex-col justify-between group/item relative cursor-default">
                             <button 
  onClick={(e) => {
    e.stopPropagation(); // Évite de cliquer sur la cellule derrière
    handleDeleteSlot(cellData.id);
  }}
  className={`absolute -top-2 -right-2 rounded-lg p-1 shadow-md transition-all cursor-pointer border-2
    ${pendingDeleteId === cellData.id 
      ? "bg-red-500 text-white border-red-500 scale-110 opacity-100" // État de confirmation
      : "bg-white text-red-500 border-transparent opacity-0 group-hover/item:opacity-100" // État normal
    }`}
>
  {pendingDeleteId === cellData.id ? (
    <Trash2 size={20} className="animate-pulse" /> // Icône de validation
  ) : (
    <X size={12} /> // Ton icône d'origine
  )}
</button>

                             <div>
                               <p className="text-[10px] font-black text-primary leading-none mb-1 uppercase italic">{cellData.cours.matiere.nom}</p>
                               <p className="text-[9px] font-bold text-gray-500 italic uppercase opacity-70">{cellData.cours.teacher.nom}</p>
                             </div>
                             <span className="text-[8px] font-black bg-white px-2 py-1 rounded-md w-fit self-end shadow-sm border border-gray-100">{cellData.salle || "S. --"}</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setShowModal({ day, slot: slot.id })}
                            className="w-full h-full border-2 border-dashed border-gray-50 rounded-2xl flex items-center justify-center text-gray-100 hover:border-primary/20 hover:text-primary transition-all cursor-pointer"
                          >
                            <Plus size={20} />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      

      {/* MODAL D'AJOUT (Popup élégant) */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900 uppercase italic">Fixer un cours</h2>
              <button onClick={() => setShowModal(null)} className="p-2 bg-gray-50 rounded-xl text-gray-400"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-4">
                <p className="text-[10px] font-black text-primary uppercase">{showModal.day} • {showModal.slot}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2 italic">Sélectionner le Contrat</label>
                <select name="coursId" required className="w-full bg-gray-50 border-none rounded-xl px-4 py-4 text-xs font-black outline-none shadow-inner appearance-none cursor-pointer">
                   <option value="">Choisir un cours...</option>
                   {classCours.map((c: any) => (
                     <option key={c.id} value={c.id}>{c.matiere.nom} - {c.teacher.nom}</option>
                   ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2 italic">Salle (Optionnel)</label>
                <input name="salle" placeholder="ex: Salle 12" className="w-full bg-gray-50 border-none rounded-xl px-4 py-4 text-xs font-bold outline-none shadow-inner" />
              </div>

              <button disabled={isPending} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-primary transition-all">
                {isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                VALIDER LE CRÉNEAU
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}