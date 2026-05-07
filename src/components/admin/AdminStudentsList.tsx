"use client";
import { useState, useMemo } from "react";
import { Search, UserPlus, User, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StudentCardLink from "../shared/StudentCardLink";


export default function AdminStudentsList({ initialLevels = [], initialStudents = [] }: any) {
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedClasseId, setSelectedClasseId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    router.push("/admin/users/student/add");
  };

  // 1. Filtrage des classes selon le niveau
  const availableClasses = useMemo(() => {
    const level = initialLevels.find((l: any) => l.id.toString() === selectedLevelId);
    return level ? level.classes : [];
  }, [selectedLevelId, initialLevels]);

  // 2. Récupération du nom de la classe sélectionnée pour l'affichage en haut
  const selectedClasseNom = useMemo(() => {
    const classe = availableClasses.find((c: any) => c.id.toString() === selectedClasseId);
    return classe ? classe.nom : "Toutes les classes";
  }, [selectedClasseId, availableClasses]);

   // 3. Filtrage des élèves (CORRIGÉ)
  const filteredStudents = initialStudents.filter((s: any) => {
    // A. Filtre par Niveau (si un niveau est sélectionné, on vérifie le levelId de l'élève)
    const matchesLevel = selectedLevelId 
      ? s.classe?.levelId?.toString() === selectedLevelId 
      : true;

    // B. Filtre par Classe (si une classe est sélectionnée)
    const matchesClasse = selectedClasseId 
      ? s.classeId.toString() === selectedClasseId 
      : true;

    // C. Filtre par Recherche
    const matchesSearch = s.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.matricule.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesLevel && matchesClasse && matchesSearch;
  });


  return (
    <div className="w-full max-w-6xl mx-auto pb-20 px-2 animate-in fade-in duration-700">
      
      {/* HEADER : Dynamisé avec la classe sélectionnée */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-none uppercase tracking-tighter">Répertoire : {selectedClasseNom}</h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2 italic">Effectif : {filteredStudents.length} élèves affichés</p>
        </div>
        <button 
            onClick={handleClick}
            disabled={loading}
            className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
            {loading ? "CHARGEMENT..." : "AJOUTER UN ÉLÈVE"}
         </button>
      </div>

      {/* ZONE DE FILTRAGE */}
      <div className="bg-white p-4 md:p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-8 flex flex-col lg:flex-row items-center gap-4">
        <div className="w-full lg:w-48">
          <label className="text-[9px] font-black text-gray-300 uppercase ml-3 mb-1 block tracking-tighter">Niveau</label>
          <select 
            value={selectedLevelId}
            onChange={(e) => { setSelectedLevelId(e.target.value); setSelectedClasseId(""); }}
            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-black outline-none cursor-pointer appearance-none shadow-inner"
          >
            <option value="">Tous les niveaux</option>
            {initialLevels.map((l: any) => (
              <option key={l.id} value={l.id}>{l.nom}</option>
            ))}
          </select>
        </div>

        <div className="w-full lg:w-48">
          <label className="text-[9px] font-black text-primary uppercase ml-3 mb-1 block tracking-tighter">Classe Précise</label>
          <select 
            value={selectedClasseId}
            onChange={(e) => setSelectedClasseId(e.target.value)}
            disabled={!selectedLevelId}
            className="w-full bg-primary/5 border-2 border-primary/10 rounded-xl px-4 py-3 text-xs font-black text-primary outline-none cursor-pointer appearance-none disabled:opacity-30"
          >
            <option value="">Toutes les classes</option>
            {availableClasses.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>

        <div className="w-full lg:flex-1 relative lg:mt-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nom, Prénom ou Matricule..." 
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 shadow-inner"
          />
        </div>
      </div>

      {/* GRILLE : Ajout du badge Classe/Niveau sur chaque carte */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-1">
        {filteredStudents.map((student: any) => (
          <StudentCardLink key={student.id} student={student} />
        ))}

        <Link href="/admin/users/student/add" className="border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center p-5 group hover:border-primary/30 transition-all hover:bg-primary/5">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-300 group-hover:text-primary transition-colors">
                <Plus size={20} />
            </div>
            <span className="text-[8px] font-black text-gray-300 uppercase mt-2 group-hover:text-primary tracking-widest">Nouveau</span>
        </Link>
      </div>

      {filteredStudents.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/50 mt-4">
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Aucun élève trouvé</p>
        </div>
      )}
    </div>
  );
}
