import { useUser } from "@/providers/UserProvider";
import { BookOpen,FileArchive, FileText,Library, MessageSquareWarning, LayoutDashboard, Calendar, CreditCard, Trophy, Bell, User, LogOut, X } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react"; // Pour la déconnexion


interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const menuItems = [
    { icon: LayoutDashboard, label: "Accueil", href: "/dashboard" },
    { icon: BookOpen, label: "Mes Course", href: "/courses" },
    { icon: FileArchive, label: "Ancien Epreuves", href: "/dashboard/archives" },
    { icon: Library, label: "Documents", href: "/dashboard/biblio" },
    { icon: FileText, label: "Mes Notes", href: "/dashboard/grades" },
    { icon: Calendar, label: "Emploi du Temps", href: "/dashboard/schedule" },
    { icon: Trophy, label: "Classement", href: "/dashboard/leaderboard" },
    { icon: Bell, label: "Annonces", href: "/dashboard/announcements" },
    { icon: CreditCard, label: "Scolarité", href: "/dashboard/finance" },
    { icon: MessageSquareWarning, label: "Suggestions", href: "/dashboard/feedback" },
    { icon: User, label: "Mon Profil", href: "/dashboard/profile" },
  ];
  const user = useUser()

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Barre latérale corrigée */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        {/* Header Fixe */}
        <div className="p-6 flex items-center justify-between flex-shrink-0">
          <h2 className="text-2xl font-black text-primary italic">EduSmart</h2>
          <button className="lg:hidden p-2 text-gray-500" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Zone de Navigation SCROLLABLE (Le secret est ici) */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 font-semibold rounded-2xl hover:bg-blue-50 hover:text-primary transition-colors text-sm"
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
          
          {/* Bouton Déconnexion à la suite de la liste (Plus de chevauchement) */}
          <button 
           onClick={() => signOut({ callbackUrl: "/login" })} 
          className="flex items-center gap-3 w-full px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors mt-6 text-sm cursor-pointer">
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </nav>

        {/* Petit footer optionnel pour stabiliser le bas */}
        <div className="p-4 border-t border-gray-50 text-[9px] text-center text-gray-300 font-bold uppercase tracking-widest flex-shrink-0">
          EduSmart Bénin v0.1
        </div>
      </aside>
    </>
  );
}