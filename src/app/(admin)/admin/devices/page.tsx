"use client";
import { Tablet, Search, ShieldCheck, ShieldAlert, BatteryMedium, Wifi, Lock, Unlock, Filter } from "lucide-react";
import { useState } from "react";

export default function AdminDevices() {
  const [filter, setFilter] = useState("TOUS");

  return (
    <div className="w-full max-w-6xl mx-auto pb-20 px-0 animate-in fade-in duration-700">
      
      <header className="px-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight italic">Parc Numérique</h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Surveillance des 150 tablettes élèves</p>
        </div>

        {/* STATS RAPIDES FLOTTE */}
        <div className="flex gap-2">
           <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-700">142 EN LIGNE</span>
           </div>
           <div className="bg-red-50 px-4 py-2 rounded-xl border border-red-100 flex items-center gap-2">
              <span className="text-[10px] font-black text-red-600">08 ÉTEINTES</span>
           </div>
        </div>
      </header>

      {/* RECHERCHE & FILTRE SERRÉS POUR MOBILE */}
      <div className="flex gap-2 px-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher ID ou Élève..." 
            className="w-full pl-10 pr-4 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-xs font-bold outline-none shadow-sm focus:ring-2 focus:ring-primary/5" 
          />
        </div>
        <button className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm cursor-pointer active:scale-90 transition-all text-gray-400">
          <Filter size={20} />
        </button>
      </div>

      {/* LISTE DES DEVICES (Design "Mobile-First" Compact) */}
      <div className="px-3 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-full bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm flex items-center justify-between gap-4 group hover:border-primary/20 transition-all">
            
            <div className="flex items-center gap-4 min-w-0">
               {/* Icone Tablette Dynamique */}
               <div className={`p-4 rounded-2xl flex-shrink-0 ${i === 3 ? "bg-red-50 text-red-400" : "bg-blue-50 text-primary"}`}>
                  <Tablet size={24} />
               </div>
               
               <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-black text-gray-800 uppercase tracking-tight truncate">TAB-EDUS-0{i}2</p>
                    {i === 3 ? <ShieldAlert size={14} className="text-red-500" /> : <ShieldCheck size={14} className="text-emerald-500" />}
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold truncate italic uppercase">Attribuée à : KOFFI K. (Tle C1)</p>
               </div>
            </div>

            {/* STATUTS & ACTIONS */}
            <div className="flex items-center gap-4 lg:gap-8 flex-shrink-0">
               <div className="hidden md:flex flex-col items-end">
                  <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase">
                     <BatteryMedium size={14} className={i === 3 ? "text-red-500" : "text-emerald-500"} /> 84%
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-blue-400 mt-1">
                     <Wifi size={12} /> Connectée
                  </div>
               </div>

               {/* Bouton de Verrouillage (Action Directe Admin) */}
               <button className={`p-4 rounded-2xl transition-all cursor-pointer shadow-sm active:scale-90 ${
                 i === 3 ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-300 hover:text-red-500 hover:bg-red-50"
               }`}>
                 {i === 3 ? <Lock size={18} /> : <Unlock size={18} />}
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}