import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldCheck, BookOpen, Tablet, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import MobileNav from "@/components/super-admin/MobileNav"; // L'import du client
import LogoutButton from "@/components/auth/LogoutButton";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/login");

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F8FAFC]">
      {/* NAVIGATION MOBILE */}
      <MobileNav />

      {/* SIDEBAR DESKTOP (Visible uniquement sur PC) */}
      <aside className="hidden lg:flex w-72 bg-gray-900 text-white p-8 flex-col shadow-2xl">
        <div className="mb-12 flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl"><ShieldCheck size={24} /></div>
          <h2 className="font-black italic text-xl tracking-tighter text-white">EDUSMART <span className="text-primary text-xs not-italic font-bold ml-1">HQ</span></h2>
        </div>

        <nav className="flex-1 space-y-2">
          <MenuLink href="/super-admin" icon={<LayoutDashboard size={18}/>} label="Vue Globale" />
          <MenuLink href="/super-admin/library" icon={<BookOpen size={18}/>} label="Bibliothèque" />
          <MenuLink href="/super-admin/devices" icon={<Tablet size={18}/>} label="Gestion Tablettes" />
        </nav>

        <div className="pt-6 border-t border-white/10 mt-auto">
          <LogoutButton />
        </div>
      </aside>

      {/* CONTENU PRINCIPAL (S'adapte au mobile) */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        {children}
      </main>
    </div>
  );
}

// Composant interne pour la sidebar desktop
function MenuLink({ href, icon, label }: any) {
  return (
    <Link href={href} className="flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </Link>
  );
}
