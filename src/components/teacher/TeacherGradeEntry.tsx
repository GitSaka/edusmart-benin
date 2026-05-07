"use client";
import { useState, useMemo } from "react";
import { Save, ChevronLeft, Search, Calculator, CheckCircle2, ArrowRight } from "lucide-react";


interface Props {
  initialStudents: any[]; // Tous les élèves des classes du prof
  dbClasses: any[];       // Uniquement les classes affectées au prof
  currentMatiere: any;    // La matière du prof connecté
}

export default function TeacherGradeEntry({ initialStudents = [], dbClasses = [], currentMatiere }: Props) {
  const [isReady, setIsReady] = useState(false);
  const [selectedClasseId, setSelectedClasseId] = useState("");
  const [selectedTrimestre, setSelectedTrimestre] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  

  // 1. FILTRAGE : On ne montre que les élèves de la classe choisie + recherche
  const studentsToDisplay = useMemo(() => {
    return initialStudents.filter((s) => {
      const matchesClasse = s.classeId.toString() === selectedClasseId;
      const matchesSearch = s.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.matricule.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesClasse && matchesSearch;
    });
  }, [selectedClasseId, searchTerm, initialStudents]);

  // --- ÉCRAN A : LE VÉRIFICATEUR DE CONTEXTE (SÉCURITÉ) ---
  if (!isReady) {
    return (
      <div className="max-w-md mx-auto mt-16 p-10 bg-white rounded-[3rem] border border-gray-100 shadow-2xl text-left animate-in zoom-in duration-500">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
            <Calculator size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic">Carnet de Notes</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8 italic">Veuillez définir le contexte de saisie</p>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 italic">1. Choisir la Classe</label>
            <select 
              value={selectedClasseId} 
              onChange={(e) => setSelectedClasseId(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-black outline-none shadow-inner appearance-none cursor-pointer"
            >
              <option value="">Sélectionner une salle...</option>
              {dbClasses.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase ml-2 italic">2. Choisir le Trimestre</label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((t) => (
                <button 
                  key={t} 
                  onClick={() => setSelectedTrimestre(t.toString())}
                  className={`py-4 rounded-2xl border-2 font-black text-xs transition-all ${selectedTrimestre === t.toString() ? "bg-primary border-primary text-white shadow-lg" : "bg-white border-gray-100 text-gray-400 hover:border-primary/20"}`}
                >
                  Trimestre {t}
                </button>
              ))}
            </div>
          </div>

          <button 
            disabled={!selectedClasseId || !selectedTrimestre}
            onClick={() => setIsReady(true)}
            className="w-full mt-6 bg-gray-900 text-white py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
          >
            OUVRIR LE CARNET <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // --- ÉCRAN B : LA SAISIE MATRICIELLE (STAY STICKY) ---
  return (
    <div className="w-full max-w-6xl mx-auto pb-20 px-2 animate-in fade-in duration-700 text-left">
      
      {/* HEADER DE PAGE (Fixe en haut du contenu) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-2">
        <div>
          <button onClick={() => setIsReady(false)} className="flex items-center gap-2 text-primary font-black text-[9px] uppercase mb-2 hover:underline">
            <ChevronLeft size={14} /> Changer de contexte
          </button>
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            Classe : {dbClasses.find(c => c.id.toString() === selectedClasseId)?.nom}
          </h1>
          <p className="text-[10px] text-gray-400 font-black uppercase mt-2 italic tracking-widest">
            Discipline : <span className="text-primary">{currentMatiere?.nom}</span> • Trimestre {selectedTrimestre}
          </p>
        </div>

        <button className="bg-primary text-white px-10 py-5 rounded-[2rem] font-black text-xs shadow-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95">
          <Save size={18} /> ENREGISTRER TOUT
        </button>
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input 
            type="text" 
            placeholder="Trouver un élève dans la liste..." 
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-xs font-bold outline-none shadow-inner transition-all focus:bg-white focus:ring-2 focus:ring-primary/10"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-4 rounded-2xl">
            <CheckCircle2 size={16}/>
            <span className="text-[9px] font-black uppercase tracking-tighter">Saisie en cours...</span>
        </div>
      </div>

      {/* TABLEAU MATRICIEL AVEC STICKY HEADER & SCROLL INTERNE */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
        {/* Le secret du scroll fluide avec 72 élèves : max-h + overflow-y-auto */}
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[850px]">
            {/* STICKY THEAD : Reste collé au haut de la zone de scroll */}
            <thead className="sticky top-0 z-30 bg-gray-900 text-white shadow-xl">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest italic border-r border-white/5">Nom de l'élève ({studentsToDisplay.length})</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest italic text-center">Interro 1</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest italic text-center">Interro 2</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest italic text-center text-orange-400">Devoir / Comp</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest italic text-center bg-white/5">Moy.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {studentsToDisplay.map((student: any) => (
                <tr key={student.id} className="group hover:bg-gray-50 transition-all">
                  <td className="p-6 border-r border-gray-50 bg-white group-hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-[10px] font-black shrink-0 border border-gray-200 uppercase">
                        {student.nom[0]}{student.prenom[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-900 uppercase truncate leading-none mb-1">{student.nom} {student.prenom}</p>
                        <p className="text-[9px] font-bold text-gray-400 italic tracking-tighter">{student.matricule}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <input type="number" step="0.25" placeholder="--" className="w-20 mx-auto block bg-gray-50 border-2 border-transparent rounded-xl py-3 text-center text-sm font-black text-gray-900 focus:bg-white focus:border-primary outline-none transition-all shadow-inner" />
                  </td>
                  <td className="p-6">
                    <input type="number" step="0.25" placeholder="--" className="w-20 mx-auto block bg-gray-50 border-2 border-transparent rounded-xl py-3 text-center text-sm font-black text-gray-900 focus:bg-white focus:border-primary outline-none transition-all shadow-inner" />
                  </td>
                  <td className="p-6">
                    <input type="number" step="0.25" placeholder="--" className="w-20 mx-auto block bg-orange-50/50 border-2 border-transparent rounded-xl py-3 text-center text-sm font-black text-orange-600 focus:bg-white focus:border-orange-500 outline-none transition-all shadow-inner" />
                  </td>
                  <td className="p-6 bg-gray-50/30">
                    <div className="w-20 mx-auto h-11 bg-gray-900 rounded-xl flex items-center justify-center text-white text-xs font-black italic shadow-2xl">
                      --
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
