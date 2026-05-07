"use client";
import StudentCard from "@/components/shared/StudentCard";
import { Trophy, BookOpen, Bell, Calendar, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/providers/UserProvider";

export default function DashboardPage() {
  const user = useUser(); 
 

  if(!user) return null;
  return (
    <div className="max-w-6xl mx-auto pb-20 px-2 lg:px-4 animate-in fade-in duration-700">
      
      {/* 1. HEADER BIENVENUE */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-yellow-400" size={18} />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Tableau de bord</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
            Salut, <span className="text-primary">{user.prenom}</span> ! 👋
          </h1>
          <p className="text-gray-400 font-medium text-xs mt-1 italic">{user.classe} • Année 2025-2026</p>
        </div>
        
        {/* Widget Points (Format Compact) */}
        <div className="bg-yellow-400/10 border border-yellow-400/20 px-5 py-2 rounded-2xl flex items-center gap-3">
          <Trophy className="text-yellow-600" size={20} />
          <p className="text-lg font-black text-yellow-600">1,250 <span className="text-[10px] uppercase">pts</span></p>
        </div>
      </header>

      {/* 2. STATISTIQUES COMPACTES (Fusionnées et réduites) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-10 px-2">
        <div className="p-4 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1">Moyenne</p>
          <p className="text-xl font-black text-secondary">{user.moyenne}</p>
        </div>
        <div className="p-4 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1">Rang</p>
          <p className="text-xl font-black text-gray-800">{user.rang}<span className="text-xs uppercase">ème</span></p>
        </div>
        <div className="p-4 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1">Cours vus</p>
          <p className="text-xl font-black text-primary">12</p>
        </div>
        <div className="p-4 bg-primary text-white rounded-[1.5rem] shadow-lg shadow-blue-100 flex flex-col justify-center">
          <p className="text-blue-200 text-[9px] font-black uppercase tracking-widest mb-1">Assiduité</p>
          <p className="text-xl font-black italic">{user.assiduite}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- COLONNE GAUCHE --- */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* A. CARTE SCOLAIRE */}
          <section className="px-2">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ma Carte Officielle</h2>
               <Link href="/profile" className="text-[10px] font-black text-primary hover:underline">PROFIL</Link>
            </div>
            <div className="hover:scale-[1.01] transition-transform cursor-pointer">
              <StudentCard 
                nom={user.name}
                prenom={user.prenom} 
                matricule={user.username}
                classe={user.classe!}
                photo = {user.photo!} 
              />
            </div>
          </section>

          {/* B. PROCHAIN COURS */}
          <section className="px-2">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Planning immédiat</h2>
            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary font-black text-sm">
                  08:00
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-800">Mathématiques</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">M. Dossou • Salle 12</p>
                </div>
              </div>
              <Link href="/schedule" className="p-3 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                <Calendar size={18} />
              </Link>
            </div>
          </section>
        </div>

        {/* --- COLONNE DROITE --- */}
        <div className="lg:col-span-4 space-y-8 px-2">
          
          {/* C. DERNIÈRE INFO */}
          <section>
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Info École</h2>
            <div className="bg-red-50/50 border border-red-100 p-6 rounded-[2rem] relative overflow-hidden group cursor-pointer">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                   <span className="text-red-500 text-[9px] font-black uppercase tracking-widest">Urgent</span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-3 line-clamp-2 leading-tight">Examen Blanc : Calendrier disponible</h4>
                <Link href="/announcements" className="text-[10px] font-black text-red-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  LIRE <ChevronRight size={12} />
                </Link>
              </div>
              <Bell className="absolute -right-4 -bottom-4 text-red-500/5" size={80} />
            </div>
          </section>

          {/* D. RACCOURCI MÉDIATHÈQUE */}
          <section>
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Action rapide</h2>
            <Link href="/courses" className="bg-gray-900 p-6 rounded-[2rem] flex items-center justify-between group hover:bg-primary transition-all shadow-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl text-white">
                  <BookOpen size={18} />
                </div>
                <span className="text-white font-black text-[10px] uppercase tracking-widest">Médiathèque</span>
              </div>
              <ChevronRight className="text-white/40 group-hover:text-white transition-colors" size={18} />
            </Link>
          </section>

        </div>
      </div>
    </div>
  );
}