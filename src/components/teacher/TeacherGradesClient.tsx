"use client";
import { useState, useTransition, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, CheckCircle2, Search, Loader2, Lock, GraduationCap, Laptop, Smartphone, Save } from "lucide-react";
import { upsertNoteAction } from "@/lib/actions/grades";
import { toast, Toaster } from "sonner";
import { isTypeNote, TypeNote } from "@/app/types/note";
import { dbLocal } from "@/lib/offline/db.local";

export default function TeacherGradeClient({ allClasses, matiere }: any) {
  const searchParams = useSearchParams();
  const urlClasseId = searchParams.get("classeId");
  
  const [activeClasseId, setActiveClasseId] = useState<number | null>(urlClasseId ? parseInt(urlClasseId) : null);
  const [activeTrimestre, setActiveTrimestre] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"INTERRO" | "DEVOIR">("INTERRO");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [syncingField, setSyncingField] = useState<string | null>(null);
  const [offlineFields, setOfflineFields] = useState<string[]>([]);

  // ✅ ÉTAT UNIQUE DE SAISIE (Dictionnaire)
  const [values, setValues] = useState<Record<string, string>>({});

  const currentClasse = allClasses.find((c: any) => c.id === activeClasseId);

  // ✅ CHARGEMENT INITIAL & SYNCHRONISATION (Lecture depuis le "sac à notes" du serveur)
// ✅ SYNCHRONISATION BLINDÉE : On force la lecture du "sac à notes"
// useEffect(() => {
//   // 1. On prépare un dictionnaire vide
//   const newValues: Record<string, string> = {};

//   if (currentClasse && currentClasse.eleves) {
//     // 2. On parcourt les élèves de la classe sélectionnée
//     currentClasse.eleves.forEach((student: any) => {
//       // 3. On cherche les notes qui correspondent au trimestre actif
//       if (student.notes && student.notes.length > 0) {
//         student.notes.forEach((n: any) => {
//           // 🛡️ CRITIQUE : Vérification stricte du trimestre
//           if (Number(n.trimestre) === Number(activeTrimestre)) {
//             newValues[`${student.id}-${n.type}`] = n.valeur.toString();
//           }
//         });
//       }
//     });
//   }

//   // 4. On met à jour l'état d'un seul coup pour éviter les clignotements
//   setValues(newValues);
  
//   // 🚀 LOG DE DÉBOGAGE (À regarder dans F12 si ça persiste)
//   console.log(`🔄 Switch Trimestre ${activeTrimestre} | Notes trouvées:`, Object.keys(newValues).length);

// }, [activeTrimestre, activeClasseId, allClasses, currentClasse]); 

useEffect(() => {
  const loadNotes = async () => {
    const newValues: Record<string, string> = {};

    // =========================
    // 🟢 1. NOTES SERVEUR (ton code actuel)
    // =========================
    if (currentClasse && currentClasse.eleves) {
      currentClasse.eleves.forEach((student: any) => {
        if (student.notes && student.notes.length > 0) {
          student.notes.forEach((n: any) => {
            if (Number(n.trimestre) === Number(activeTrimestre)) {
              newValues[`${student.id}-${n.type}`] = n.valeur.toString();
            }
          });
        }
      });
    }

    // =========================
    // 📴 2. NOTES OFFLINE (Dexie)
    // =========================
    const offlineNotes = await dbLocal.syncQueue
      .where("type")
      .equals("CREATE_NOTE")
      .toArray();

    offlineNotes.forEach((item: any) => {
      const n = item.payload;

      if (Number(n.trimestre) === Number(activeTrimestre)) {
        newValues[`${n.studentId}-${n.type}`] = n.valeur.toString();
      }
    });

    // =========================
    // 🎯 3. UPDATE UI
    // =========================
    setValues(newValues);

    console.log(
      `🔄 T${activeTrimestre} | total notes:`,
      Object.keys(newValues).length
    );
  };

  loadNotes();
}, [activeTrimestre, activeClasseId, currentClasse]);
// 💡 On ajoute "allClasses" dans les dépendances pour réagir si le serveur renvoie des données fraîches

  // ✅ SAUVEGARDE AUTO (onBlur)
  const handleSaveNote = async ( e: React.FocusEvent<HTMLInputElement>,studentId: string, type: string, valStr: string, nom: string) => {
    if (valStr === "") return;
    const val = parseFloat(valStr.replace(',', '.'));
    if (isNaN(val)) return;

    

    // ❌ VERROU 1 : Anti-Texte (keejk)
    if (isNaN(val)) {
        toast.error(`"${valStr}" n'est pas un nombre valide !`);
        return;
    }

    if (isNaN(val) || val < 0 || val > 20) {
      toast.error(`Note "${valStr}" invalide ! (0 à 20 uniquement)`);
      e.target.value = ""; // 🧹 ON EFFACE LE CHAMP IMMÉDIATEMENT
      return;
    }

        if (!isTypeNote(type)) {
          toast.error(`Type invalide : ${type}`);
          return;
        }

    setSyncingField(`${studentId}-${type}`);

  if (!navigator.onLine) {
  const fieldKey = `${studentId}-${type}`;

  // 🧠 1. Sauvegarde dans Dexie (QUEUE)
  await dbLocal.syncQueue.add({
    type: "CREATE_NOTE",
    payload: {
      studentId,
      coursId: currentClasse?.cours?.[0]?.id || 0,
      type,
      trimestre: activeTrimestre,
      valeur: val,
    },
    createdAt: Date.now(),
  });

  // 🧠 2. MAJ UI IMMÉDIATE (important)
  setValues(prev => ({
    ...prev,
    [fieldKey]: val.toString(),
  }));

  // 🧠 3. MARQUER VISUELLEMENT OFFLINE
  setOfflineFields(prev => [...prev, fieldKey]);

  // 🧠 4. FEEDBACK USER
  toast.success(`${nom} : sauvegardé hors ligne`);

  return;
}

    startTransition(async () => {
      const res = await upsertNoteAction({
        studentId,
        // On récupère l'ID du cours lié à ce prof pour cette classe
        coursId: currentClasse?.cours?.[0]?.id || 0, 
        type,
        trimestre: activeTrimestre,
        valeur: val
      });

       if (res?.error) {
        toast.error(res.error);
        e.target.value = ""; // 🧹 On efface aussi si le serveur refuse
      } else {
        toast.success(`${nom} : ${val}/20 enregistré`);
      }
      setSyncingField(null);
    });
  };

  const filteredStudents = useMemo(() => {
    if (!currentClasse) return [];
    return (currentClasse.eleves || []).filter((s: any) =>
      s.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, currentClasse]);

  return (
    <div className="w-full max-w-full pb-10 animate-in fade-in duration-500 text-left">
      <Toaster position="top-right" richColors />

      {/* HEADER FLAT (Ton Design) */}
      <header className="mb-6 px-4 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">Saisie des Notes</h1>
          <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mt-2 italic">
             {matiere} • Auto-Sync Actif
          </p>
        </div>
        
        {activeClasseId && (
          <div className="flex bg-white p-1 rounded-lg border border-gray-100 shadow-sm self-start">
            {[1, 2, 3].map(t => (
              <button key={t} onClick={() => setActiveTrimestre(t)} className={`px-5 py-2 rounded-md text-[10px] font-black transition-all ${activeTrimestre === t ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"}`}>
                T{t}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* SÉLECTEUR DE CLASSE */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 px-4 border-b pb-6">
        {allClasses.map((cls: any) => (
          <button key={cls.id} onClick={() => setActiveClasseId(cls.id)}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-start gap-2 relative active:scale-95 ${activeClasseId === cls.id ? "bg-primary border-primary text-white shadow-lg" : "bg-white border-gray-100 text-gray-400"}`}>
            <p className={`text-xs font-black uppercase tracking-tighter leading-none ${activeClasseId === cls.id ? "text-white" : "text-gray-900"}`}>{cls.nom}</p>
            <p className="text-[8px] font-bold uppercase opacity-60">{cls.eleves?.length || 0} élèves</p>
          </button>
        ))}
      </div>

      {activeClasseId ? (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
           
           {/* COMMUTATEUR DE VUE */}
           <div className="px-4 mb-4 flex gap-2">
              <button onClick={() => setViewMode("INTERRO")} className={`flex-1 py-4 rounded-xl text-[10px] font-black border-2 transition-all flex items-center justify-center gap-2 ${viewMode === "INTERRO" ? "bg-gray-900 border-gray-900 text-white shadow-xl" : "bg-white border-gray-100 text-gray-400"}`}>
                <Laptop size={14}/> INTERROS (IE/IO)
              </button>
              <button onClick={() => setViewMode("DEVOIR")} className={`flex-1 py-4 rounded-xl text-[10px] font-black border-2 transition-all flex items-center justify-center gap-2 ${viewMode === "DEVOIR" ? "bg-orange-500 border-orange-500 text-white shadow-xl" : "bg-white border-gray-100 text-gray-400"}`}>
                <Smartphone size={14}/> DEVOIRS (DS/CP)
              </button>
           </div>

           {/* RECHERCHE */}
           <div className="px-4 mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input type="text" placeholder="Rechercher un nom..." className="w-full pl-10 pr-4 py-4 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none shadow-inner" onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
           </div>

           {/* TABLEAU MATRICIEL (Design Préservé) */}
           <div className="bg-white border-y md:border border-gray-100 overflow-hidden md:rounded-xl mx-2">
             <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-400">
                    <tr className="text-[9px] font-black uppercase tracking-widest italic">
                      <th className="p-4 min-w-[130px] border-r">Élève</th>
                      {viewMode === "INTERRO" ? (
                        <>
                          <th className="p-4 text-center">Int 1</th><th className="p-4 text-center">Int 2</th>
                          <th className="p-4 text-center">Int 3</th><th className="p-4 text-center">Int 4</th>
                        </>
                      ) : (
                        <>
                          <th className="p-4 text-center">Devoir 1</th><th className="p-4 text-center">Devoir 2</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredStudents.map((student: any) => (
                      <tr key={student.id} className="active:bg-blue-50/30 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 border-r bg-gray-50/30">
                          <p className="text-[11px] font-black text-gray-900 uppercase truncate leading-none">{student.nom}  {student.prenom}</p>
                        </td>
                        {(viewMode === "INTERRO" 
                                          ? ["INT1", "INT2", "INT3", "INT4"] 
                                          : ["DEV1", "DEV2"]
                                        ).map((type) => {
                          const fieldKey = `${student.id}-${type}`;
                          return (
                            <td key={fieldKey} className="p-2 text-center">
                              <div className="relative inline-block">
                                <input 
                                  type="text" 
                                  inputMode="decimal"
                                  placeholder="--"
                                  // ✅ LIAISON STABLE : Affiche la note de l'état
                                  value={values[fieldKey] || ""}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setValues(prev => ({ ...prev, [fieldKey]: v }));
                                  }}
                                  onBlur={(e) => handleSaveNote(e,student.id, type, e.target.value, student.nom)}
                                  // className={`w-14 h-11 rounded-md text-center text-xs font-black outline-none transition-all border-2 
                                  //   ${syncingField === fieldKey ? "border-orange-400 bg-orange-50 animate-pulse" : "border-transparent bg-gray-50 focus:bg-white focus:border-primary shadow-sm"}`}
                                  className={`w-14 h-11 rounded-md text-center text-xs font-black outline-none transition-all border-2 
                                      ${
                                        syncingField === fieldKey
                                          ? "border-orange-400 bg-orange-50 animate-pulse"
                                          : offlineFields.includes(fieldKey)
                                          ? "border-blue-400 bg-blue-50"
                                          : "border-transparent bg-gray-50 focus:bg-white focus:border-primary shadow-sm"
                                      }`}
                                />
                                {syncingField === fieldKey && (
                                  <Loader2 className="absolute -top-1 -right-1 text-orange-600 animate-spin" size={10} />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </div>
        </div>
      ) : (
        <div className="py-20 text-center px-6">
           <GraduationCap size={40} className="mx-auto text-gray-200 mb-4" />
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Veuillez sélectionner une classe</p>
        </div>
      )}
    </div>
  );
}