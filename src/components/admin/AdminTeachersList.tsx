"use client";
import { useState, useMemo } from "react";
import { Search, UserPlus, ChevronRight, Phone, ShieldCheck, BookOpen, Layers, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { Toaster } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminTeachersList({ initialTeachers = [], initialMatieres = [] }: any) {
  const [selectedMatiereId, setSelectedMatiereId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();
    const [loading, setLoading] = useState(false);
    // On stocke l'ID du prof cliqué (string) au lieu de true/false
const [loadingId, setLoadingId] = useState<string | null>(null);

  
    const handleClick = () => {
      setLoading(true);
      router.push("/admin/users/teacher/add");
    };

  

   const handleClickr = (profId: string) => {
  setLoadingId(profId); // On mémorise quel prof est cliqué
  router.push(`/admin/users/teacher/${profId}`);
};

  // ✅ 1. FILTRAGE MULTI-CRITÈRES (Nom, Prénom, Téléphone)
  const filteredTeachers = useMemo(() => {
    return initialTeachers.filter((t: any) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        t.nom.toLowerCase().includes(search) || 
        t.prenom.toLowerCase().includes(search) || 
        t.telephone.includes(search);

      const matchesMatiere = selectedMatiereId ? t.matiereId.toString() === selectedMatiereId : true;
      return matchesSearch && matchesMatiere;
    });
  }, [selectedMatiereId, searchTerm, initialTeachers]);

  return (
    <div className="w-full max-w-6xl mx-auto pb-20 px-2 animate-in fade-in duration-700 text-left">
      <Toaster position="top-right" richColors />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-none uppercase tracking-tighter italic">Corps Enseignant</h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2 italic">Gestion des professeurs par spécialité</p>
        </div>

                <button 
                    onClick={handleClick}
                    disabled={loading}
                    className="bg-gray-900 text-white px-6 py-4 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                    {loading ? "CHARGEMENT..." : "AJOUTER UN PROFESSEUR"}
                 </button>
    </div>

      {/* ZONE DE FILTRAGE INTELLIGENTE */}
      <div className="bg-white p-4 md:p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-8 flex flex-col lg:flex-row items-center gap-4">
        <div className="w-full lg:w-64">
          <label className="text-[9px] font-black text-gray-300 uppercase ml-4 mb-1 block tracking-tighter italic">Spécialité / Matière</label>
          <select 
            value={selectedMatiereId}
            onChange={(e) => setSelectedMatiereId(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-xs font-black outline-none cursor-pointer appearance-none shadow-inner"
          >
            <option value="">Toutes les matières</option>
            {initialMatieres.map((m: any) => (
              <option key={m.id} value={m.id}>{m.nom}</option>
            ))}
          </select>
        </div>

        <div className="w-full lg:flex-1 relative flex flex-col justify-end">
          <label className="text-[9px] font-black text-gray-300 uppercase ml-4 mb-1 block tracking-tighter italic">Recherche libre</label>
          <div className="relative group">
            <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-primary' : 'text-gray-300'}`} size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom ou numéro de téléphone..." 
              className="w-full pl-14 pr-12 py-4 bg-gray-50 border-none rounded-2xl text-xs font-bold outline-none shadow-inner transition-all focus:ring-2 focus:ring-primary/10"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-gray-200 text-gray-500 rounded-lg hover:bg-red-100 hover:text-red-500 transition-all">
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

          {/* LISTE DES PROFS - CORRIGÉE POUR MOBILE */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden mx-1">
        <div className="divide-y divide-gray-50">
          {filteredTeachers.map((prof: any) => (
            <div key={prof.id} className="p-4 md:p-6 flex items-center justify-between hover:bg-gray-50 transition-all group gap-2">
              <div className="flex items-center gap-3 md:gap-5 min-w-0 flex-1">
                {/* AVATAR - Taille adaptée mobile */}
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-900 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center text-white font-black text-xs md:text-lg shadow-xl overflow-hidden shrink-0 border-2 md:border-4 border-white">
                  {prof.img ? (
                    <img src={prof.img} alt={prof.nom} className="w-full h-full object-cover" />
                  ) : (
                    <span>{prof.nom[0]}{prof.prenom[0]}</span>
                  )}
                </div>

                {/* TEXTES - flex-1 et min-w-0 pour forcer le truncate */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                    <p className="font-black text-gray-900 text-sm md:text-lg uppercase leading-none truncate tracking-tighter">
                      {prof.nom} {prof.prenom}
                    </p>
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 md:gap-3">
                    <span className="text-[8px] md:text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 md:px-3 md:py-1 rounded-lg uppercase italic flex items-center gap-1 shrink-0">
                      <BookOpen size={10}/> {prof.matiere?.nom}
                    </span>
                    <span className="text-[8px] md:text-[9px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 md:px-3 md:py-1 rounded-lg uppercase italic flex items-center gap-1 shrink-0">
                      <Layers size={10}/> {prof.classes?.length || 0} Cls
                    </span>
                  </div>
                </div>
              </div>
              
              {/* BOUTONS - shrink-0 pour ne jamais être écrasés */}
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <div className="relative group/phone">
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-gray-900 text-white text-[10px] font-black rounded-xl opacity-0 group-hover/phone:opacity-100 transition-all pointer-events-none shadow-2xl whitespace-nowrap z-50 scale-90 group-hover/phone:scale-100">
                        {prof.telephone}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                    </div>
                    <div className="p-3 md:p-4 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90 cursor-pointer">
                        <Phone size={16} className="md:w-5 md:h-5" />
                    </div>
                </div>

              <button 
                  key={prof.id}
                  // On passe l'ID à la fonction
                  onClick={() => handleClickr(prof.id)} 
                  // On vérifie si l'ID de ce bouton est celui qui charge
                  disabled={loadingId === prof.id}
                  className="p-3 font-black md:p-4 bg-gray-900 text-white rounded-xl md:rounded-2xl hover:bg-gray-900 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  {/* On affiche le spinner uniquement sur LE bouton cliqué */}
                  {loadingId === prof.id ? <Loader2 className="animate-spin" size={18} /> : <ChevronRight size={16} />}
              </button>

                {/* <Link href={`/admin/users/teacher/${prof.id}`} className="p-3 md:p-4 bg-gray-50 text-gray-400 rounded-xl md:rounded-2xl hover:bg-gray-900 hover:text-white transition-all shadow-sm active:scale-95">
                  <ChevronRight size={16} className="md:w-5 md:h-5" />
                </Link> */}
              </div>
            </div>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="py-24 text-center">
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] italic">Aucun professeur trouvé</p>
          </div>
        )}
      </div>

    </div>
  );
}
