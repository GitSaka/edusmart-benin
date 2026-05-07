"use client";
import { Menu, Bell } from "lucide-react";

// ✅ 1. On définit l'interface pour accepter les deux Props
interface TopBarProps {
  onOpenMenu: () => void;
  userData: {
    name: string;
    prenom: string;
    matiere: string;
    photo: string | null;
    initiales: string;
  };
}

export default function TeacherTopBar({ onOpenMenu, userData }: TopBarProps) {
  return (
    <header className="h-20 bg-white/90 backdrop-blur-lg border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40 w-full shrink-0 shadow-sm">
      <button onClick={onOpenMenu} className="lg:hidden p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-primary transition-all">
        <Menu size={24}/>
      </button>

      {/* ✅ 2. ON UTILISE LES VRAIES DONNÉES DU PROF */}
      <div className="hidden md:block text-left">
        <h3 className="font-black text-gray-800 text-lg leading-none uppercase">
          M. {userData.prenom} {userData.name}
        </h3>
        <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 italic">
          {userData.matiere} • Professeur
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl relative hover:bg-primary/5 hover:text-primary transition-all">
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        {/* ✅ 3. PHOTO OU INITIALES DYNAMIQUES */}
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100 border-2 border-white overflow-hidden">
          {userData.photo ? (
            <img src={userData.photo} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            userData.initiales
          )}
        </div>
      </div>
    </header>
  );
}
