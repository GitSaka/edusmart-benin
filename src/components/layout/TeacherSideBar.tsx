"use client";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookPlus, ClipboardCheck, Calendar, LogOut, X } from "lucide-react";
import { signOut } from "next-auth/react";



export default function TeacherSideBar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (o: boolean) => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de Bord", href: "/teacher" },
    { icon: Users, label: "Reporter une note", href: "/teacher/marks" },
    { icon: ClipboardCheck, label: "Appel / Présences", href: "/teacher/attendance" },
    { icon: BookPlus, label: "Publier un Cours", href: "/teacher/upload" },
    { icon: Calendar, label: "Mon Emploi du Temps", href: "/teacher/schedule" },
  ];

  const handleNav = (href: string) => {
    // La redirection déclenchera automatiquement ton loading.tsx global
    router.push(href);
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      {/* HEADER : LOGO & BOUTON FERMER MOBILE */}
      <div className="p-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-primary italic leading-none">EduSmart</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 italic">Espace Enseignant</p>
        </div>
        
        <button 
          onClick={() => setIsOpen(false)}
          className="p-2 bg-gray-50 text-gray-400 rounded-xl lg:hidden hover:text-red-500 transition-all"
        >
          <X size={22} />
        </button>
      </div>

      {/* NAVIGATION : Liens directs sans loader local */}
      <nav className="px-4 space-y-2 overflow-y-auto h-[calc(100vh-200px)] scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {menuItems.map((item) => (
          <div 
            key={item.label} 
            onClick={() => handleNav(item.href)}
            className={`flex items-center gap-4 px-6 py-4 font-bold rounded-2xl transition-all cursor-pointer group ${pathname === item.href ? "bg-primary text-white shadow-lg shadow-blue-100" : "text-gray-400 hover:bg-primary/5 hover:text-primary"}`}
          >
            <item.icon size={22} className={pathname === item.href ? "text-white" : "text-gray-400 group-hover:text-primary"} />
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
        
        {/* BOUTON DÉCONNEXION */}
      <button 
        onClick={() => signOut({ callbackUrl: "/login" })} // ✅ Redirige vers login après déconnexion
        className="flex items-center gap-4 px-6 py-4 text-red-500 font-black uppercase tracking-widest w-full mt-10 hover:bg-red-50 rounded-2xl transition-all active:scale-95 text-[10px]"
      >
        <LogOut size={22} /> 
        <span>Déconnexion</span>
      </button>

      </nav>
    </aside>
  );
}
