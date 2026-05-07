"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Search, Calendar, GraduationCap, Filter, 
  BookOpen, LayoutGrid, XCircle, Sparkles 
} from "lucide-react";
import { getEpreuvesAction } from "@/lib/actions/archives";
import ArchiveCard from "@/components/shared/ArchiveRow"; // 🎯 On importe ton nouveau composant

export default function StudentArchivesClient({ user }: { user: any }) {
  const [epreuves, setEpreuves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🎯 ÉTATS DE FILTRAGE
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMatiere, setFilterMatiere] = useState("TOUT");
  const [filterType, setFilterType] = useState("TOUT");
  const [filterClasse, setFilterClasse] = useState("TOUT");
  const [filterSession, setFilterSession] = useState("TOUT");

  // 🎯 LISTES DYNAMIQUES POUR LES SELECTS
  const [sessionsDisponibles, setSessionsDisponibles] = useState<string[]>([]);
  const [matieresDisponibles, setMatieresDisponibles] = useState<string[]>([]);

  // 📥 CHARGEMENT INITIAL
  const fetchEpreuves = async () => {
    setLoading(true);
    const res = await getEpreuvesAction();
    if (res.success) setEpreuves(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchEpreuves(); }, []);

  // 🔍 EXTRACTION DES MATIÈRES ET SESSIONS RÉELLES
  useEffect(() => {
    if (epreuves.length > 0) {
      const sessions = Array.from(new Set(epreuves.map(e => e.session?.toString())))
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a));
      setSessionsDisponibles(sessions);

      const matieres = Array.from(new Set(epreuves.map(e => e.matiere)))
        .filter(Boolean)
        .sort();
      setMatieresDisponibles(matieres);
    }
  }, [epreuves]);

  // 🔍 LOGIQUE DE FILTRAGE MULTI-CRITÈRES
  const filtered = useMemo(() => {
    return epreuves.filter(e => {
      const matchesSearch = e.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            e.matiere.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMatiere = filterMatiere === "TOUT" || e.matiere === filterMatiere;
      const matchesType = filterType === "TOUT" || e.type === filterType;
      const matchesClasse = filterClasse === "TOUT" || e.classe === filterClasse;
      const matchesSession = filterSession === "TOUT" || e.session?.toString() === filterSession;

      return matchesSearch && matchesMatiere && matchesType && matchesClasse && matchesSession;
    });
  }, [searchTerm, filterMatiere, filterType, filterClasse, filterSession, epreuves]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterMatiere("TOUT");
    setFilterType("TOUT");
    setFilterClasse("TOUT");
    setFilterSession("TOUT");
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 lg:p-10 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="text-left">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Bibliothèque d'Excellence</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">Médiathèque</h1>
          <p className="text-sm text-gray-400 font-bold italic mt-2">Accédez aux archives officielles du Bénin en un clic.</p>
        </div>
        <button 
          onClick={resetFilters} 
          className="px-6 py-3 bg-white text-gray-400 hover:text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100 shadow-sm transition-all flex items-center gap-2 active:scale-95"
        >
            <XCircle size={14} /> Effacer les filtres
        </button>
      </div>

      {/* --- BARRE DE RECHERCHE --- */}
      <div className="relative mb-10">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
        <input 
          type="text"
          value={searchTerm}
          placeholder="Rechercher un département, une ville ou un sujet..."
          className="w-full bg-white border-2 border-transparent focus:border-primary/10 rounded-[2.5rem] py-7 pl-16 pr-8 text-sm font-black shadow-2xl shadow-gray-200/50 outline-none transition-all placeholder:text-gray-200"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- GRILLE DE FILTRES --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        
        {/* 1. DISCIPLINE */}
        <div className="space-y-3 text-left">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4 italic">Discipline</label>
          <div className="relative group">
            <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={16} />
            <select 
              value={filterMatiere}
              className="w-full bg-white pl-14 pr-6 py-4 rounded-2xl text-[11px] font-black uppercase border border-gray-100 shadow-sm outline-none appearance-none hover:border-primary/20 transition-all"
              onChange={(e) => setFilterMatiere(e.target.value)}
            >
              <option value="TOUT">Toutes les matières</option>
              {matieresDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* 2. CATÉGORIE */}
        <div className="space-y-3 text-left">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4 italic">Type de Sujet</label>
          <div className="relative group">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={16} />
            <select 
              value={filterType}
              className="w-full bg-white pl-14 pr-6 py-4 rounded-2xl text-[11px] font-black uppercase border border-gray-100 shadow-sm outline-none appearance-none hover:border-primary/20 transition-all"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="TOUT">Toutes les catégories</option>
              <option value="DEVOIR">Devoirs de classe</option>
              <option value="EXAMEN_BLANC">Examens Blancs (ASSEP)</option>
              <option value="EXAMEN_NATIONAL">Annales Nationales</option>
            </select>
          </div>
        </div>

        {/* 3. CLASSE */}
        <div className="space-y-3 text-left">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4 italic">Classe / Niveau</label>
          <div className="relative group">
            <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={16} />
            <select 
              value={filterClasse}
              className="w-full bg-white pl-14 pr-6 py-4 rounded-2xl text-[11px] font-black uppercase border border-gray-100 shadow-sm outline-none appearance-none hover:border-primary/20 transition-all"
              onChange={(e) => setFilterClasse(e.target.value)}
            >
              <option value="TOUT">Tous les niveaux</option>
              <option value="6ème">6ème</option><option value="5ème">5ème</option><option value="4ème">4ème</option>
              <option value="3ème">3ème</option><option value="2nde">2nde</option><option value="1ère">1ère</option>
              <option value="Terminale">Terminale</option>
            </select>
          </div>
        </div>

        {/* 4. SESSION */}
        <div className="space-y-3 text-left">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4 italic">Année / Session</label>
          <div className="relative group">
            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={16} />
            <select 
              value={filterSession}
              className="w-full bg-white pl-14 pr-6 py-4 rounded-2xl text-[11px] font-black uppercase border border-gray-100 shadow-sm outline-none appearance-none hover:border-primary/20 transition-all"
              onChange={(e) => setFilterSession(e.target.value)}
            >
              <option value="TOUT">Toutes les sessions</option>
              {sessionsDisponibles.map(annee => (
                <option key={annee} value={annee}>Session {annee}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

   {/* --- LISTE DES RÉSULTATS (Ligne Unique) --- */}
<div className="mt-12 min-h-[500px]">
  {loading ? (
    /* Ton loader ici */
    <div className="py-40 flex flex-col items-center justify-center">
       <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
    </div>
  ) : (
    /* 🎯 ICI : On enlève le md:grid-cols-2 et xl:grid-cols-3 */
    /* On garde 'grid-cols-1' PARTOUT pour avoir une belle liste verticale */
    <div className="grid grid-cols-1 gap-6"> 
      {filtered.length > 0 ? (
        filtered.map((epreuve) => (
          <ArchiveCard key={epreuve.id} epreuve={epreuve} />
        ))
      ) : (
        /* Ton message "Aucun sujet trouvé" */
        <div className="py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
           <LayoutGrid size={40} className="text-gray-200 mx-auto mb-6" />
           <h3 className="text-sm font-black text-gray-900 uppercase">Aucun sujet trouvé</h3>
        </div>
      )}
    </div>
  )}
</div>



      {/* --- FOOTER --- */}
      <div className="mt-20 flex flex-col items-center justify-center gap-4 opacity-30 transition-all hover:opacity-100 grayscale hover:grayscale-0">
          <img src="/logo-benin.png" alt="Bénin" className="w-10 h-10 object-contain" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600">EduSmart Benin • Portail National des Archives</span>
      </div>
    </div>
  );
}
