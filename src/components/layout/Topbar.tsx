import { Menu, Bell, Trophy } from "lucide-react";

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* BOUTON MENU MOBILE */}
        <button 
          className="p-2 lg:hidden text-gray-600 bg-gray-100 rounded-xl" 
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
        <div className="hidden md:block">
          <h3 className="font-bold text-gray-800">Bienvenue, Koffi 👋</h3>
          <p className="text-xs text-gray-400 font-medium uppercase">Tle C1 • CEG Gbégamey</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <div className="flex items-center gap-2 bg-yellow-400/10 px-3 py-2 rounded-2xl border border-yellow-400/20">
          <Trophy size={18} className="text-yellow-600" />
          <span className="font-black text-yellow-700 text-sm md:text-base">1,250</span>
        </div>
        <button className="p-3 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 relative">
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}