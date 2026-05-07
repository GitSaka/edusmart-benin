"use client";
import { useState } from "react";
import { 
  LayoutDashboard, Tablet, Wallet, MessageSquareQuote, 
  Users, X, LogOut, ChevronDown, UserPlus, List, 
  GraduationCap, BookOpen, Settings2, 
  Layers,
  BarChart3,
  Scale
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AdminSidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  // État pour gérer quels menus sont ouverts
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (label: string) => {
    // Si le menu cliqué était déjà VRAI, on renvoie un objet VIDE (tout se ferme)
    // Sinon, on crée un objet avec SEULEMENT ce menu à VRAI
    setOpenMenus(prev => prev[label] ? {} : { [label]: true });
  };

  const menuGroups = [
    { icon: LayoutDashboard, label: "Tableau de bord", href: "/admin" },
    { 
      icon: Users, 
      label: "Élèves", 
      submenu: [
        { label: "List d'élèves", href: "/admin/users/student", icon: List },
        { label: "List générales d'élèves", href: "/admin/users/student/list", icon: List },
        { label: "Ajouter un élève", href: "/admin/users/student/add", icon: UserPlus },
      ] 
    },
    { 
      icon: Settings2, 
      label: "Académie", 
      submenu: [
        { label: "Niveaux(TL,2nd...)", href: "/admin/levels",icon: BarChart3},
        { label: "Séries(SERIE A,SERIE B etc...)", href: "/admin/series", icon: Layers},
        { label: "coefficients(hg:2)", href: "/admin/coefficients", icon: Scale },
        { label: "Salles de classe", href: "/admin/classes", icon: Tablet },
        { label: "Matières(Math...)", href: "/admin/subjects", icon: BookOpen },
        { label: "Emploi du temps", href: "/admin/timetable", icon: BookOpen },
      ] 
    },
    { 
      icon: GraduationCap, 
      label: "Professeurs", 
      submenu: [
        { label: "Liste des profs", href: "/admin/users/teacher", icon: List },
        { label: "Nouvel Enseignant", href: "/admin/users/teacher/add", icon: UserPlus },
        { label: "Attribué de cours", href: "/admin/cours", icon: UserPlus },
      ] 
    },
    
    { icon: Wallet, label: "Scolarité", href: "/admin/finance" },
    { icon: Tablet, label: "Gestion Flotte", href: "/admin/devices" },
    { icon: MessageSquareQuote, label: "Suggestions", href: "/admin/feedback" },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed inset-y-0 z-[100] left-0 z-50 w-64 bg-[#0F172A] text-white border-r border-white/5 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        
        <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0F172A]/50 backdrop-blur-xl">
          <h2 className="text-xl font-black italic tracking-tighter uppercase">EduSmart <span className="text-primary text-[10px] not-italic font-black block tracking-widest opacity-50">Administration</span></h2>
          <X className="lg:hidden cursor-pointer text-gray-400" onClick={() => setIsOpen(false)} />
        </div>

        <nav className="p-4 space-y-1.5 overflow-y-auto h-[calc(100vh-140px)] scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {menuGroups.map((group) => {
            const hasSubmenu = !!group.submenu;
            const isExpanded = openMenus[group.label];

            return (
              <div key={group.label} className="space-y-1">
                {hasSubmenu ? (
                  // BOUTON PARENT (Ouvre le sous-menu)
                  <button 
                    onClick={() => toggleMenu(group.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${isExpanded ? "bg-white/5 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                  >
                    <div className="flex items-center gap-3">
                      <group.icon size={18} className={isExpanded ? "text-primary" : ""} />
                      {group.label}
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  // LIEN SIMPLE (Si pas de sous-menu)
                  <Link href={group.href || "#"} onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-400 font-bold rounded-xl hover:bg-white/5 hover:text-white transition-all text-xs">
                    <group.icon size={18} /> {group.label}
                  </Link>
                )}

                {/* SOUS-MENU (L'Accordeon) */}
                {hasSubmenu && isExpanded && (
                  <div className="ml-4 pl-4 border-l border-white/5 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    {group.submenu?.map((sub) => (
                      <Link key={sub.label} href={sub.href} onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all">
                        <sub.icon size={14} /> {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <button 
            onClick={() => signOut({ callbackUrl: "/login" })} 
            className="flex items-center gap-3 w-full px-4 py-4 text-red-400 font-black uppercase tracking-widest mt-10 hover:bg-red-500/5 rounded-xl transition-all text-[10px] cursor-pointer"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </nav>
      </aside>
    </>
  );
}