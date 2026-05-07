"use client";
import { useState } from "react";
import { Home, CreditCard, FileText, Bell, User, Menu, X, Heart, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const parentMenu = [
    { icon: Home, label: "Tableau de Bord", href: "/parent" },
    { icon: Home, label: "Possition de mon enfant ", href: "/parent/radar" },
    // { icon: FileText, label: "Bulletins & Notes", href: "/parent/grades" },
    { icon: CreditCard, label: "Paiements Scolarité", href: "/parent/finance" },
    { icon: Bell, label: "Messages École", href: "/parent/messages" },
    { icon: User, label: "Mon Compte Tuteur", href: "/parent/profile" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex">
      {/* SIDEBAR PARENT (Plus douce, moins "militaire" que l'admin) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-8 flex flex-col items-center border-b border-gray-50">
          <h2 className="text-xl font-black text-primary italic">EduSmart</h2>
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">Espace Famille</span>
        </div>

        <nav className="p-4 space-y-1">
          {parentMenu.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 px-5 py-4 text-gray-500 font-bold rounded-2xl hover:bg-primary/5 hover:text-primary transition-all text-xs">
              <item.icon size={18} /> {item.label}
            </Link>
          ))}

           
        </nav>

                   <button 
                      onClick={() => signOut({ callbackUrl: "/login" })} 
                      className="flex items-center gap-3 w-full px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors mt-6 text-sm cursor-pointer">
                      <LogOut size={18} />
                      <span>Déconnexion</span>
                   </button>

        {/* Petit rappel de confiance en bas de sidebar */}
        <div className="absolute bottom-10 left-0 w-full px-6">
           <div className="bg-emerald-50 p-4 rounded-2xl flex items-center gap-3 border border-emerald-100/50">
              <Heart size={16} className="text-emerald-500" />
              <p className="text-[9px] font-black text-emerald-700 uppercase leading-tight">Éducation Sécurisée</p>
           </div>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-50 flex items-center justify-between px-6 sticky top-0 z-40">
          <button onClick={() => setIsOpen(true)} className="lg:hidden p-2 text-gray-400"><Menu size={24}/></button>
          
          <div className="flex items-center gap-3">
             <div className="text-right hidden md:block">
                <p className="text-xs font-black text-gray-900 leading-none">M. KODJO Jean</p>
                <p className="text-[10px] font-bold text-gray-400 mt-1">Parent d'élèves (02)</p>
             </div>
             <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-black border border-gray-200">JK</div>
          </div>
        </header>

        <main className="p-2 md:p-6 lg:p-10 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}