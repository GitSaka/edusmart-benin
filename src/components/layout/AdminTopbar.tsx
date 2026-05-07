import { Menu, ShieldCheck, Bell } from "lucide-react";

export default function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 bg-gray-50 text-gray-600 rounded-xl cursor-pointer active:scale-95 transition-all"
        >
          <Menu size={20}/>
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-lg">
             <ShieldCheck className="text-primary" size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Direction Générale</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl relative cursor-pointer">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="w-10 h-10 bg-gray-900 rounded-2xl border-2 border-white shadow-sm"></div>
      </div>
    </header>
  );
}