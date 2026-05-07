"use client";
import { useState } from "react";
import { Menu, X, ShieldCheck, LayoutDashboard, BookOpen, Tablet, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menu = [
    { href: "/super-admin", icon: LayoutDashboard, label: "Vue Globale" },
    { href: "/super-admin/library", icon: BookOpen, label: "Bibliothèque" },
    { href: "/super-admin/devices", icon: Tablet, label: "Tablettes" },
  ];

  return (
    <>
      {/* TOPBAR MOBILE & TABLETTE */}
      <div className="lg:hidden flex items-center justify-between bg-gray-900 text-white p-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary" size={24} />
          <span className="font-black italic tracking-tighter">EDUSMART HQ</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 bg-white/10 rounded-xl">
          <Menu size={24} />
        </button>
      </div>

      {/* OVERLAY & SIDEBAR MOBILE */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-gray-900 p-8 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex justify-between items-center mb-10">
              <ShieldCheck className="text-primary" size={32} />
              <button onClick={() => setIsOpen(false)} className="text-white/50"><X size={24} /></button>
            </div>
            <nav className="flex-1 space-y-4">
              {menu.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest ${pathname === item.href ? 'bg-primary text-white' : 'text-gray-400'}`}
                >
                  <item.icon size={18} /> {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
