"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-3 text-rose-400 font-black text-[10px] uppercase tracking-widest hover:text-rose-300 transition-all active:scale-95 w-full mt-4"
    >
      <LogOut size={16} /> 
      <span>Déconnexion</span>
    </button>
  );
}
