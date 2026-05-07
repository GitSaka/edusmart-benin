"use client";
import { useState } from "react";
import { Search, BookOpen, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LibraryClient({ student, initialBooks }: { student: any, initialBooks: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("TOUT");

  // 🔍 LOGIQUE DE RECHERCHE ET FILTRAGE RÉELLE
  const filteredBooks = initialBooks.filter((book) => {
    const matchesSearch = book.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         book.matiere.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "TOUT") return matchesSearch;
    // On fait correspondre tes filtres UI avec tes Enums Prisma
    if (filter === "ANNALES") return matchesSearch && book.type === "ANNALE";
    if (filter === "FASCICULES") return matchesSearch && book.type === "FASCICULE";
    if (filter === "COURS") return matchesSearch && book.type === "LIVRE_PROGRAMME";
    if (filter === "ROMANS") return matchesSearch && book.type === "ROMAN";
    
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 lg:px-6 animate-in fade-in duration-700">
      
      {/* HEADER : Infos élève et Barre de recherche */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6 border-b border-gray-100 pb-10">
        <div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 italic tracking-tight">Ma Bibliothèque</h1>
          <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] mt-2 uppercase italic">
            {student?.classe?.level?.nom} {student?.classe?.nom} • {filteredBooks.length} Ouvrages disponibles
          </p>
        </div>
        
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un titre ou une matière..."
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* ONGLETS DE CATÉGORIES (Synchronisés avec tes DocType) */}
      <div className="flex items-center gap-8 mb-12 overflow-x-auto no-scrollbar pb-4 border-b border-gray-50">
        {["TOUT", "ANNALES", "FASCICULES", "ROMANS", "COURS"].map((f) => (
          <button 
            key={f} onClick={() => setFilter(f)}
            className={`text-[10px] font-black tracking-[0.2em] transition-all whitespace-nowrap uppercase relative pb-4 ${
              filter === f ? "text-primary" : "text-gray-300 hover:text-gray-500"
            }`}
          >
            {f}
            {filter === f && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full animate-in slide-in-from-left-2" />}
          </button>
        ))}
      </div>

      {/* GRILLE DE LIVRES (Ton style 3:4.5) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-14">
        {filteredBooks.map((book) => (
          <Link 
            href={`/reader/${book.id}?source=library`} 
            key={book.id} 
            className="group cursor-pointer flex flex-col items-center text-center"
          >
            <div className="relative aspect-[3/4.5] w-full mb-5 transition-all duration-500 group-hover:-translate-y-3 group-hover:rotate-1">
              
              {/* Effet Tranche (Épaisseur du livre) */}
              <div className="absolute inset-0 bg-gray-200 rounded-sm translate-x-1.5 translate-y-1.5 shadow-sm group-hover:translate-x-2 group-hover:translate-y-2 transition-transform"></div>
              
              {/* Couverture */}
              <div className={`relative h-full w-full bg-gray-800 rounded-sm shadow-xl overflow-hidden flex flex-col border-l-[6px] border-black/30 shadow-gray-300`}>
                
                {book.couverture ? (
                  <Image 
                    src={book.couverture} 
                    alt={book.titre}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    priority
                  />
                ) : (
                  <div className="relative z-10 flex flex-col h-full justify-between items-start text-left p-4 bg-gradient-to-br from-slate-700 to-slate-900">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{book.matiere}</span>
                    <div>
                      <h3 className="text-[12px] font-bold text-white leading-tight mb-2 uppercase tracking-tighter italic">{book.titre}</h3>
                      <p className="text-[8px] text-white/60 font-medium italic">{book.auteur || "EduSmart"}</p>
                    </div>
                  </div>
                )}

                {/* Badge "Global" si le livre est national */}
                {book.level?.nom === "GLOBAL" && (
                  <div className="absolute top-2 right-2 z-20 bg-amber-400 text-black text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg">
                    Global
                  </div>
                )}

                {/* Overlay Action */}
                <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                   <div className="bg-white p-3 rounded-full text-primary shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                      <ArrowRight size={20} strokeWidth={3} />
                   </div>
                </div>
              </div>
            </div>

            {/* Infos sous le livre */}
            <div className="space-y-1 px-2">
              <h4 className="text-[11px] font-black text-gray-900 leading-tight uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                {book.titre}
              </h4>
              <p className="text-[9px] text-gray-400 font-bold italic uppercase tracking-tighter">
                {book.matiere} • {book.auteur || "EduSmart"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* État Vide */}
      {filteredBooks.length === 0 && (
        <div className="py-32 text-center flex flex-col items-center gap-4">
           <div className="p-6 bg-gray-50 rounded-full text-gray-200">
              <BookOpen size={48} />
           </div>
           <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em]">Aucun ouvrage trouvé dans cette section</p>
        </div>
      )}
    </div>
  );
}
