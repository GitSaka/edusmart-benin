"use client";
import { useState, useMemo, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { UserCheck, UserX, Search, LayoutGrid, CheckCircle2, Users, Loader2, CloudUpload } from "lucide-react";
import { Toaster, toast } from "sonner";
import { toggleAttendanceAction } from "@/lib/actions/attendance";

export default function AttendanceManager({ allClasses, matiere }: any) {
  const searchParams = useSearchParams();
  const urlClasseId = searchParams.get("classeId");

  const [activeClasseId, setActiveClasseId] = useState<number | null>(urlClasseId ? parseInt(urlClasseId) : null);
  const [absentIds, setAbsentIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const currentClasse = allClasses.find((c: any) => c.id === activeClasseId);
  const currentCoursId = currentClasse?.currentCoursId || 0;

  // ✅ INITIALISATION DES ABSENCES DÉJÀ EN BASE
 // ✅ SYNC INITIALE : On lit les absences de la DB au chargement
useEffect(() => {
  if (currentClasse && currentClasse.eleves) {
    // On cherche tous les élèves qui ont une ligne "estPresent: false" aujourd'hui
    const initialAbsents = currentClasse.eleves
      .filter((student: any) => 
        student.presences?.some((p: any) => p.estPresent === false)
      )
      .map((s: any) => s.id);

    setAbsentIds(initialAbsents);
  }
}, [activeClasseId, currentClasse]);

  // ✅ AUTO-SYNC AU CLIC
  const handleToggle = async (studentId: string, nomEleve: string) => {
    if (!currentCoursId || currentCoursId === 0) {
      toast.error("Aucun cours actif détecté pour cette classe.");
      return;
    }

    const isCurrentlyAbsent = absentIds.includes(studentId);
    setSyncingId(studentId);

    // UI Optimiste
    setAbsentIds(prev => isCurrentlyAbsent ? prev.filter(id => id !== studentId) : [...prev, studentId]);

    startTransition(async () => {
      const res = await toggleAttendanceAction(studentId, currentCoursId, !isCurrentlyAbsent);
      if (res?.success) {
        toast.success(`${nomEleve} : ${!isCurrentlyAbsent ? "Absent 🔴" : "Présent 🟢"}`, { duration: 1500 });
      } else {
        toast.error("Erreur de synchronisation");
        // Rollback en cas d'erreur
        setAbsentIds(prev => isCurrentlyAbsent ? [...prev, studentId] : prev.filter(id => id !== studentId));
      }
      setSyncingId(null);
    });
  };

  const filteredStudents = useMemo(() => {
    if (!currentClasse) return [];
    return (currentClasse.eleves || []).filter((s: any) =>
      s.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.prenom.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, currentClasse]);

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700 text-left px-2">
      <Toaster position="top-right" richColors />

      {/* HEADER */}
      <header className="mb-8 px-2 mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic leading-none text-left">Registre d'Appel</h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-3 flex items-center gap-2 italic leading-none">
             {matiere} • <CloudUpload size={14} className="animate-pulse text-emerald-500"/> Synchronisation Auto-Sync active
          </p>
        </div>
      </header>

      {/* SÉLECTEUR DE CLASSE */}
      <div className="flex flex-wrap gap-2 mb-6 px-2 overflow-x-auto no-scrollbar pb-2">
        {allClasses.map((cls: any) => (
          <button 
            key={cls.id}
            onClick={() => setActiveClasseId(cls.id)}
            className={`px-5 py-4 rounded-[1.8rem] border-2 transition-all flex items-center gap-4 active:scale-95 shrink-0 ${
              activeClasseId === cls.id 
                ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" 
                : "bg-white border-gray-100 text-gray-400 hover:border-primary/20"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              activeClasseId === cls.id ? "bg-white/20 text-white" : "bg-gray-50 text-gray-400"
            }`}>
              <LayoutGrid size={18} />
            </div>
            <div className="text-left">
              <p className={`text-xs font-black uppercase tracking-tighter leading-none ${activeClasseId === cls.id ? "text-white" : "text-gray-900"}`}>{cls.nom}</p>
              <p className={`text-[8px] font-black mt-1.5 uppercase tracking-widest ${activeClasseId === cls.id ? "text-white/60" : "text-gray-400"}`}>{cls.eleves?.length || 0} Élèves</p>
            </div>
            {activeClasseId === cls.id && <CheckCircle2 size={16} className="text-white animate-in zoom-in" />}
          </button>
        ))}
      </div>

      {activeClasseId ? (
        <div className="animate-in slide-in-from-bottom-6 duration-700">
           {/* RECHERCHE & STATS */}
           <div className="flex flex-col md:flex-row gap-4 mb-8 px-2">
              <div className="flex-1 relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input type="text" placeholder="Trouver un élève..." className="w-full pl-14 pr-6 py-5 bg-white border-none rounded-[2rem] text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-primary/20 text-left" onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="bg-white px-8 py-5 rounded-[2.2rem] border border-gray-100 flex items-center gap-8 shadow-sm">
                 <div className="text-center"><p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Présents</p><p className="text-2xl font-black tracking-tighter">{currentClasse.eleves.length - absentIds.length}</p></div>
                 <div className="w-[1px] h-10 bg-gray-100"></div>
                 <div className="text-center"><p className="text-[8px] font-black text-red-600 uppercase tracking-widest mb-1">Absents</p><p className="text-2xl font-black text-red-600 tracking-tighter">{absentIds.length}</p></div>
              </div>
           </div>

           {/* GRILLE ÉLÈVES */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-1">
              {filteredStudents.map((student: any) => {
                const isAbsent = absentIds.includes(student.id);
                const isSyncing = syncingId === student.id;
                return (
                  <div key={student.id} onClick={() => handleToggle(student.id, student.nom)}
                    className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between group active:scale-95 ${isAbsent ? "bg-red-50 border-red-200 shadow-inner" : "bg-white border-white shadow-md hover:border-emerald-100"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs shadow-lg border-2 border-white transition-all overflow-hidden ${isSyncing ? "animate-pulse bg-orange-100" : isAbsent ? "bg-red-500 text-white rotate-3" : "bg-gray-900 text-white"}`}>
                        {isSyncing ? <Loader2 size={20} className="animate-spin text-orange-500" /> : student.img ? <img src={student.img} className="w-full h-full object-cover" /> : (student.nom[0] + student.prenom[0])}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className={`font-black text-xs uppercase truncate leading-none ${isAbsent ? "text-red-700" : "text-gray-900"}`}>{student.nom}</p>
                        <p className="text-[10px] text-gray-400 font-bold italic truncate mt-2 leading-none uppercase">{student.prenom}</p>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isAbsent ? "bg-white text-red-500 shadow-xl scale-110" : "bg-gray-50 text-gray-200 group-hover:bg-emerald-50 group-hover:text-emerald-500"}`}>
                      {isAbsent ? <UserX size={24} /> : <UserCheck size={24} />}
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      ) : (
        <div className="py-24 text-center bg-gray-50/30 rounded-[3.5rem] border-2 border-dashed border-gray-100 mx-2 animate-pulse flex flex-col items-center justify-center">
           <div className="p-6 bg-white rounded-3xl shadow-xl mb-6 text-gray-200">
              <Users size={48} />
           </div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic px-6 leading-loose">Sélectionnez une classe pour charger le registre</p>
        </div>
      )}
    </div>
  );
}