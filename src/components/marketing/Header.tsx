// components/marketing/Header.tsx
import { GraduationCap, User } from "lucide-react";
import Link from "next/link";

export default function Header({ ecole }: any) {
  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
            <GraduationCap size={22} />
          </div>
          <span className="font-black text-sm uppercase italic tracking-tighter text-gray-900">
            {ecole.nom}
          </span>
        </div>

        {/* NAV */}
        <nav className="hidden md:flex items-center gap-8">
          {["Vision", "Programmes", "Médiathèque"].map((item) => (
            <Link key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
              {item}
            </Link>
          ))}
        </nav>

        {/* ACTION */}
        <Link href="/login" className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all">
          <User size={14} /> Espace Perso
        </Link>
      </div>
    </header>
  );
}