"use client";

import { useState } from "react";
import { 
  Search, ShieldAlert, TrendingDown, Users, BellRing, 
  ChevronRight, Tablet, Wallet, GraduationCap, Calendar, 
  Phone, CheckCircle2, AlertTriangle, TrendingUp 
} from "lucide-react";

export default function AdminDashboard() {
  const [niveau, setNiveau] = useState("Tle");
  const [classe, setClasse] = useState("Tle C1");

  return (
    <div className="w-full pb-20 animate-in fade-in duration-700 overflow-x-hidden bg-gray-50/30">
      
      {/* 1. RECHERCHE UNIVERSELLE */}
      <div className="px-4 mb-8 pt-4">
        <div className="relative group w-full max-w-4xl mx-auto">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={22} />
          <input 
            type="text" 
            placeholder="Matricule, nom d'élève ou prof..." 
            className="w-full pl-16 pr-6 py-5 bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border-none outline-none text-md font-bold placeholder:text-gray-300 focus:ring-4 focus:ring-primary/5 transition-all"
          />
        </div>
      </div>

      {/* 2. RÉCAPITULATIF ANNUEL (Stats Globales) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 mb-10 max-w-7xl mx-auto">
        {[
          { label: "Élèves Inscrits", val: "452", icon: Users, color: "text-primary", bg: "bg-primary/5" },
          { label: "Corps Prof.", val: "38", icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Tablettes", val: "145", icon: Tablet, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Scolarité T1", val: "82%", icon: Wallet, color: "text-orange-500", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm text-center hover:scale-105 transition-transform cursor-pointer">
            <stat.icon className={`mx-auto ${stat.color} mb-2`} size={24} />
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900 leading-none mt-1">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* 3. PANNEAU DE CONTRÔLE PRINCIPAL */}
      <div className="px-4 max-w-7xl mx-auto">
        <div className="bg-white border-2 border-gray-50 rounded-[3.5rem] p-6 lg:p-12 shadow-2xl shadow-gray-200/50">
          
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* --- CÔTÉ GAUCHE : FILTRES --- */}
            <div className="w-full lg:w-[320px] space-y-8 lg:border-r lg:border-gray-100 lg:pr-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-red-500 p-3 rounded-2xl text-white animate-bounce shadow-lg shadow-red-200">
                  <BellRing size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 uppercase italic leading-none">Focus</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Alertes & Monitoring</p>
                </div>
              </div>

              {/* Sélecteur de Date */}
              <div className="space-y-3 pb-6 border-b border-gray-50">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                  <Calendar size={14} className="text-primary"/> Date de l'Analyse
                </label>
                <div className="relative">
                  <input type="date" defaultValue="2024-10-24" className="w-full bg-gray-50 rounded-2xl px-6 py-4 text-xs font-black outline-none border-2 border-transparent focus:border-primary/20 transition-all cursor-pointer" />
                  <div className="absolute -top-2 -right-1 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-full animate-pulse shadow-md">LIVE</div>
                </div>
              </div>

              {/* Sélecteur Niveau & Classe */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic">1. Niveau</label>
                  <select value={niveau} onChange={(e)=>setNiveau(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-black outline-none shadow-inner appearance-none cursor-pointer">
                    <option value="6ème">6ème</option><option value="3ème">3ème</option><option value="Tle">Terminale</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-2 italic">2. Classe</label>
                  <select value={classe} onChange={(e)=>setClasse(e.target.value)} className="w-full bg-primary/5 border-2 border-primary/10 rounded-2xl px-6 py-5 text-sm font-black text-primary outline-none appearance-none cursor-pointer">
                    {niveau === "6ème" && <><option>6ème M1</option><option>6ème M2</option></>}
                    {niveau === "3ème" && <><option>3ème A</option><option>3ème B</option></>}
                    {niveau === "Tle" && <><option>Tle C1</option><option>Tle D2</option></>}
                  </select>
                </div>
              </div>
            </div>

            {/* --- CÔTÉ DROIT : ANALYSE DÉTAILLÉE --- */}
            <div className="flex-1 space-y-8">
              <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <div>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-1">Rapport de classe</p>
                  <h3 className="text-2xl font-black text-gray-900 italic underline decoration-primary/30 decoration-4 underline-offset-8">{classe}</h3>
                </div>
                <button className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-gray-900 transition-all flex items-center gap-2">
                  <Calendar size={14}/> Emploi du temps
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Alerte Académique */}
                <div className="bg-red-50/40 p-8 rounded-[3rem] border border-red-100 group hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                  <div className="flex items-center gap-4 mb-4 text-red-600 font-black">
                    <TrendingDown size={24} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Alerte Chute</span>
                  </div>
                  <p className="text-[15px] font-bold text-gray-800 leading-snug mb-6">
                    <span className="text-red-600 font-black">04 élèves</span> en {classe} sont passés sous la barre des 08/20 ce trimestre.
                  </p>
                  <div className="text-[10px] font-black text-red-400 flex items-center gap-2 group-hover:text-red-600 transition-colors uppercase italic">
                    Analyser les notes <ChevronRight size={14} />
                  </div>
                </div>

                {/* Alerte Assiduité */}
                <div className="bg-orange-50/40 p-8 rounded-[3rem] border border-orange-100 group hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                  <div className="flex items-center gap-4 mb-4 text-orange-600 font-black">
                    <AlertTriangle size={24} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Assiduité</span>
                  </div>
                  <p className="text-[15px] font-bold text-gray-800 leading-snug mb-6">
                    <span className="text-orange-600 font-black">92%</span> de présence aujourd'hui. 3 retards signalés ce matin.
                  </p>
                  <div className="text-[10px] font-black text-orange-400 flex items-center gap-2 group-hover:text-orange-600 transition-colors uppercase italic">
                    Relancer les parents <Phone size={14} />
                  </div>
                </div>

                {/* Excellence */}
                <div className="bg-emerald-50/40 p-8 rounded-[3rem] border border-emerald-100 group hover:bg-white hover:shadow-xl transition-all cursor-pointer md:col-span-1">
                  <div className="flex items-center gap-4 mb-4 text-emerald-600 font-black">
                    <TrendingUp size={24} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Excellence</span>
                  </div>
                  <p className="text-[15px] font-bold text-gray-800 leading-snug mb-6">
                    Major : <span className="text-emerald-600 font-black">KOFFI Amen</span> avec <span className="underline decoration-emerald-200 decoration-2">17.45/20</span>.
                  </p>
                  <div className="text-[10px] font-black text-emerald-400 flex items-center gap-2 group-hover:text-emerald-600 transition-colors uppercase italic">
                    Tableau d'honneur <ChevronRight size={14} />
                  </div>
                </div>

                {/* Statut Trésorerie Rapide */}
                <div className="bg-gray-900 rounded-[3rem] p-8 text-white flex flex-col justify-between relative overflow-hidden group shadow-xl">
                    <Wallet size={120} className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700" />
                    <div>
                      <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-2">Recouvrement {niveau}</p>
                      <h4 className="text-2xl font-black italic tracking-tighter">1.450.000 F</h4>
                    </div>
                    <button className="bg-primary text-gray-900 w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest mt-6 hover:bg-white transition-colors relative z-10">
                      Relancer Dette
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
