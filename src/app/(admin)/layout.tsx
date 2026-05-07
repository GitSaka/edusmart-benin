"use client";
import { useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopbar from "@/components/layout/AdminTopbar";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    /* h-screen + overflow-hidden empêche la page entière de scroller mal */
    <div className="relative h-screen flex bg-gray-50 overflow-hidden font-sans">
      
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* On force cette div à prendre toute la hauteur et à scroller en interne */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 h-full overflow-y-auto custom-scrollbar">
        
        {/* TOPBAR : On ajoute "sticky top-0 z-50" et un fond opaque */}
        <AdminTopbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        {/* MAIN : C'est ici que le contenu défile en dessous de la topbar */}
        <main className="p-4 md:p-6 lg:p-10 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}