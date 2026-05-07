"use client";
import { useState, useMemo } from "react";
import { Search, ShieldCheck, Clock, Inbox, BookOpen } from "lucide-react";
import CourseCard from "@/components/shared/CourseCard";
import Link from "next/link";

export default function CoachingClient({ dbRessources }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMatiere, setSelectedMatiere] = useState("TOUTES");

  // 🎯 EXTRACTION DYNAMIQUE DES MATIÈRES (Uniquement celles reçues en privé)
  const MATIERES = useMemo(() => {
    const unique = new Set(dbRessources.map((r: any) => r.cours?.matiere?.nom).filter(Boolean));
    return ["TOUTES", ...Array.from(unique)];
  }, [dbRessources]);

  // ✅ FILTRAGE DOUBLE (Matière + Recherche)
  const filtered = useMemo(() => {
    return dbRessources.filter((res: any) => {
      const matchMatiere = selectedMatiere === "TOUTES" || res.cours?.matiere?.nom === selectedMatiere;
      const matchSearch = res.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          res.teacher?.nom.toLowerCase().includes(searchTerm.toLowerCase());
      return matchMatiere && matchSearch;
    });
  }, [searchTerm, selectedMatiere, dbRessources]);

  // ✅ FORMATAGE TAILLE
  const formatSize = (bytes: number) => {
    if (!bytes) return "---";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + ['Ko', 'Mo', 'Go'][i];
  };

  return (
    <div className="animate-in fade-in duration-700">
      
      {/* 1. BARRE DE RECHERCHE PRIVÉE */}
      <div className="relative w-full max-w-2xl mx-auto mb-8">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />
        <input 
          type="text" 
          placeholder="Rechercher dans mes cours privés..." 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-16 pr-6 py-5 bg-white rounded-[2rem] border-2 border-indigo-50 outline-none text-[14px] font-black placeholder:text-gray-300 focus:border-indigo-500/20 transition-all shadow-xl shadow-indigo-100/20 uppercase italic" 
        />
      </div>

      {/* 🔘 2. BOUTONS DE FILTRAGE (SCROLL X DYNAMIQUE) */}
      <div className="mb-12 px-4">
        <div className="flex overflow-x-auto md:justify-center gap-3 py-3 scrollbar-hide snap-x">
          {MATIERES.map((m: any) => (
            <button 
              key={m} 
              onClick={() => setSelectedMatiere(m)}
              className={`snap-center px-6 py-3.5 rounded-full text-[9px] font-black transition-all border-2 whitespace-nowrap uppercase tracking-widest ${
                selectedMatiere === m 
                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 scale-105" 
                : "bg-white text-indigo-300 border-indigo-50 hover:border-indigo-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 3. GRILLE DE CARTES (Style Coaching) */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {filtered.map((item: any) => (
            <Link key={item.id} href={`/courses/${item.id}`} className="group">
              <div className="transform transition-transform duration-500 group-hover:scale-[1.02]">
                <CourseCard 
                  id={item.id}
                  url={item.url} 
                  isRead={item.isRead}
                  titre={item.titre}
                  type={item.type}
                  profNom={item.teacher?.nom || "Professeur"}
                  matiereNom={item.cours?.matiere?.nom || "Coaching"}
                  portee="CLASSE" // Design badge privé
                  hasCorrige={!!item.transcription}
                  createdAt={item.createdAt}
                  valeur={item.type === "PDF" ? formatSize(item.size) : "Voir Coaching"}
                  date={new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).toUpperCase()}
                />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* 📭 VUE VIDE */
        <div className="py-32 flex flex-col items-center justify-center opacity-30">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-500">
            <Inbox size={40} strokeWidth={1} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-900">
            {selectedMatiere !== "TOUTES" ? `Aucun contenu en ${selectedMatiere}` : "Aucun contenu privé reçu"}
          </p>
        </div>
      )}

      {/* 💡 BADGE DE SÉCURITÉ */}
      <div className="mt-20 flex items-center justify-center gap-3 py-6 border-t border-gray-100 opacity-40">
        <ShieldCheck size={16} className="text-indigo-500" />
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 italic">
          Espace de Coaching Sécurisé par Matricule
        </span>
      </div>
    </div>
  );
}
