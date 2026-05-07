"use client";
import { useState } from "react";
import { Clock, MapPin, Users, ChevronRight } from "lucide-react";

const days = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];

export default function TeacherSchedule() {
  const [activeDay, setActiveDay] = useState("LUNDI");
   

  return (
    /* overflow-x-hidden ici bloque définitivement la sortie de flux sur les côtés */
    <div className="w-full max-w-full overflow-x-hidden pb-20 animate-in fade-in duration-500">
      
      <header className="px-4 mb-6">
        <h1 className="text-xl font-black text-gray-900 leading-tight">Mon Emploi du Temps</h1>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 italic text-primary">Matière : Mathématiques</p>
      </header>

      {/* SÉLECTEUR DE JOURS : Scroll INTERNE uniquement */}
      <div className="w-full  mb-6">
        <div className="flex overflow-x-auto gap-2 px-4 pb-2 no-scrollbar">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-shrink-0 px-6 py-3 rounded-xl font-black text-[10px] cursor-pointer border ${
                activeDay === day 
                ? "bg-primary border-primary text-white shadow-lg" 
                : "bg-white border-gray-100 text-gray-400"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* LISTE DES COURS : Design "Zéro Débordement" */}
      <div className="px-4 space-y-4">
        {[1, 2, 3].map((i) => (
          /* On utilise flex-col pour que l'heure et le titre ne se poussent pas */
          <div key={i} className="w-full bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-4 cursor-pointer active:scale-95 transition-all">
            
            {/* Ligne 1 : Heure et Badge (Largeur 100% assurée) */}
            <div className="flex items-center justify-between w-full border-b border-gray-50 pb-3">
              <div className="flex items-center gap-2 text-gray-800">
                <Clock size={14} className="text-primary" />
                <span className="text-sm font-black tracking-tight uppercase">08h00 — 10h00</span>
              </div>
              <div className="bg-primary/5 text-primary text-[9px] font-black px-3 py-1 rounded-lg">
                Tle C1
              </div>
            </div>

            {/* Ligne 2 : Matière et Action */}
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0"> {/* min-w-0 est le secret pour que le texte ne pousse pas les murs */}
                <h3 className="text-lg font-black text-gray-900 uppercase truncate">Mathématiques</h3>
                <div className="flex items-center gap-1.5 text-gray-400 mt-1">
                  <MapPin size={12}/>
                  <span className="text-[10px] font-bold uppercase">Salle 12 • CEG Gbégamey</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 text-primary rounded-2xl flex-shrink-0">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}