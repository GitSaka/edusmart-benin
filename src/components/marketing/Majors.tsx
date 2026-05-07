"use client";
import { Trophy, Star, Verified, Sparkles } from "lucide-react";

export default function Majors() {
  const champions = [
    { nom: "AGOSSOU", prenom: "Marie-Grace", moy: "18.95", classe: "Tle D", img: "/E.jpg" },
    { nom: "SOSSOU", prenom: "Jean-Eudes", moy: "17.42", classe: "3ème", img: "/E.jpg" },
    { nom: "KOFFI", prenom: "Myriam", moy: "16.85", classe: "CM2", img: "/E.jpg" },
    { nom: "TCHEOU", prenom: "Marc", moy: "16.50", classe: "1ère D", img: "/E.jpg" },
    { nom: "MENSAH", prenom: "Elie", moy: "16.20", classe: "6ème", img: "/E.jpg" },
    { nom: "DOSSOU", prenom: "Paola", moy: "16.10", classe: "4ème", img: "/E.jpg" },
  ];

  return (
    <section className="py-24 bg-white overflow-hidden w-full relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- 1. DESCRIPTION --- */}
        <div className="text-center max-w-3xl mx-auto mb-20 relative z-30">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full mb-6 border border-amber-100">
            <Trophy size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tableau d'Honneur Officiel</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-black text-gray-900 uppercase italic tracking-tighter leading-none mb-6">
            Le Cercle des <span className="text-primary">Majors</span>
          </h2>
          <p className="text-gray-500 font-medium italic text-lg leading-relaxed">
            Une constellation de talents. Nous célébrons l'effort et la discipline pour inspirer chaque élève à atteindre son propre sommet.
          </p>
        </div>

        {/* --- 2. LE GRAND CERCLE ORBITAL (Modifié pour Mobile) --- */}
        <div className="relative flex items-center justify-center w-full min-h-[500px] lg:min-h-[800px] scale-[0.45] sm:scale-75 lg:scale-100 transition-transform">
          
          {/* CENTRE DU CERCLE */}
          <div className="relative z-20 w-40 h-40 bg-gray-900 rounded-[3rem] flex flex-col items-center justify-center shadow-[0_50px_100px_rgba(0,0,0,0.15)] border-[8px] border-white rotate-6">
             <Sparkles className="text-amber-400 mb-2 animate-pulse" size={32} />
             <p className="text-[9px] font-black text-white uppercase tracking-[0.3em] italic">Elite 2026</p>
          </div>

          {/* 🎡 L'ORBITE (Ajustée pour ne pas déborder sur mobile) */}
          <div className="absolute w-[580px] h-[580px] lg:w-[650px] lg:h-[650px] border-2 border-dashed border-gray-100 rounded-full animate-[spin_60s_linear_infinite] hover:[animation-play-state:paused]">
            
            {champions.map((eleve, i) => {
              const angle = (i * 360) / champions.length;
              return (
                <div 
                  key={i}
                  className="absolute top-1/2 left-1/2"
                  style={{ 
                    /* 🎯 Translation réduite à 290px sur mobile pour correspondre au cercle de 580px */
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translate(290px) rotate(-${angle}deg)` 
                  }}
                >
                  <div className="animate-[spin_60s_linear_infinite_reverse] [animation-play-state:inherit]">
                    
                    <div className="group bg-white p-6 rounded-[3rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-2xl transition-all duration-500 w-60 text-center hover:-translate-y-4">
                      
                      <div className="absolute -top-3 -right-3 bg-amber-400 text-gray-900 w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white font-black italic text-[11px] z-20">
                          {eleve.moy}
                      </div>

                      {/* 🎯 PHOTO AGRANDIE (w-24) */}
                      <div className="relative w-24 h-24 mx-auto mb-4">
                         <div className="w-full h-full rounded-[2rem] overflow-hidden border-4 border-gray-50 shadow-inner bg-gray-100">
                            <img 
                              src={eleve.img} 
                              alt={eleve.nom} 
                              className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" 
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md border border-gray-50">
                              <Verified size={18} className="text-emerald-500 fill-emerald-50" />
                          </div>
                      </div>

                      <h3 className="text-[12px] font-black text-gray-900 uppercase italic tracking-tighter truncate">
                        {eleve.prenom} {eleve.nom}
                      </h3>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 italic">
                        {eleve.classe}
                      </p>

                      <div className="flex justify-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill="currentColor" />)}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* DÉCORATION */}
          <div className="absolute w-[400px] h-[400px] lg:w-[450px] lg:h-[450px] border border-gray-50 rounded-full" />
          <div className="absolute w-[750px] h-[750px] lg:w-[850px] lg:h-[850px] border border-gray-50/50 rounded-full" />
        </div>

      </div>
    </section>
  );
}
