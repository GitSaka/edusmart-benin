"use client";
import { Search, Calendar, BookOpen, Trophy, FileText, Verified, Book, ShieldCheck } from "lucide-react";
import { getEduSmartThumbnail } from "@/lib/cloudinary-utils";
import Link from "next/link";

export default function ArchiveCard({ epreuve }: any) {
  console.log(epreuve)

  const thumbnail = getEduSmartThumbnail(epreuve.fichierUrl, "PDF");

  // 🎨 CONFIGURATION DES COULEURS PAR TYPE
  const typeStyles: Record<string, string> = {
    EXAMEN_NATIONAL: "bg-amber-100 text-amber-700 border-amber-200",
    EXAMEN_BLANC: "bg-indigo-100 text-indigo-700 border-indigo-200",
    DEVOIR: "bg-gray-100 text-gray-600 border-gray-200",
  };
  
  return (
    <div className="group bg-white rounded-[1rem] p-4 border-2 border-transparent hover:border-primary/10 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col md:flex-row gap-6 relative overflow-hidden text-left items-center">
      
      {/* 🖼️ GAUCHE : APERÇU MINIATURE */}
<div className="relative w-full md:w-48 h-44 shrink-0 overflow-hidden bg-gray-200/50 flex items-center justify-center border-r border-gray-100">
  {thumbnail ? (
    <img 
      src={thumbnail} 
      alt={epreuve.titre} 
      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-700" 
      /* 🎯 object-contain = On voit TOUT le PDF sans coupure */
    />
  ) : (
    <div className="flex flex-col items-center gap-2 opacity-20 text-gray-400">
       <FileText size={32} />
       <span className="text-[7px] font-black uppercase tracking-widest">Archive PDF</span>
    </div>
  )}
  
  {/* Badge de session repositionné pour ne pas cacher le texte du sujet */}
  <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-md px-2 py-1 rounded-md shadow-sm border border-white/20">
     <p className="text-[7px] font-black text-white uppercase italic leading-none">Sess. {epreuve.session}</p>
  </div>
</div>


      {/* 📝 DROITE : INFOS */}
      <div className="flex-1 w-full flex flex-col justify-between py-1">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase px-2.5 py-1 rounded-md border border-emerald-100">
                {epreuve.matiere}
              </span>
              <span className="text-gray-300 text-[8px] font-black uppercase tracking-widest italic leading-none">
                • {epreuve.classe}
              </span>
              <span className="text-gray-300 text-[8px] font-black uppercase tracking-widest italic leading-none">
                • {epreuve.session}
              </span>
            </div>

             <div className="flex items-center gap-2">

              {/* 🎨 Badge du TYPE (Examen, Devoir, etc.) */}
              <div className={`px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest flex items-center gap-1.5 border ${typeStyles[epreuve.type] || typeStyles.DEVOIR}`}>
                {epreuve.type === "EXAMEN_NATIONAL" && <Trophy size={10} />}
                {epreuve.type.replace('_', ' ')}
              </div>
              {/* ✅ Badge "Corrigé" Vert (S'affiche uniquement si epreuve.corrigeUrl existe) */}
              {epreuve.corrigeUrl && (
                <div className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm border border-emerald-400 animate-pulse">
                  <ShieldCheck size={10} /> Avec Corrigé
                </div>
              )}

              
            </div>
          </div>

          <h3 className="text-[17px] font-black text-gray-900 leading-tight mb-2 group-hover:text-primary transition-colors uppercase italic tracking-tighter flex items-center gap-2">
            {epreuve.titre}
            <div className="bg-emerald-50 p-0.5 rounded-full border border-emerald-100">
                <Verified size={10} className="text-emerald-600 fill-emerald-50" />
            </div>
          </h3>

          <p className="text-[10px] text-gray-400 font-bold italic uppercase tracking-widest flex items-center gap-2">
            <BookOpen size={10} /> {epreuve.matiere} • Archives Nationales
          </p>
        </div>

        {/* 🏁 FOOTER AVEC BOUTON READER */}
        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
           <div className="flex items-center gap-4 text-gray-300 font-bold text-[9px] uppercase italic">
              <span className="flex items-center gap-1.5"><Calendar size={12} /> {epreuve.session}</span>
           </div>
           
           <div className="flex items-center gap-2">
             {/* 🚀 LE BOUTON READER (Lien interne) */}
             <Link 
               href={`/reader/${epreuve.id}`}
               className="flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-90"
             >
               <Book size={14} /> Lire en ligne
             </Link>

             {/* BOUTON RECHERCHE / EXTERNE */}
             <a 
               href={epreuve.url} 
               target="_blank" 
               className="bg-gray-900 text-white p-2.5 rounded-xl hover:bg-gray-700 transition-all shadow-lg shadow-gray-200"
             >
               <Search size={16} />
             </a>
           </div>
        </div>
      </div>
    </div>
  );
}
