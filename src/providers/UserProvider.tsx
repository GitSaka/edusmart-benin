"use client";
import { UserRole } from "@prisma/client";
import { createContext, useContext, ReactNode } from "react";

// ✅ 1. On rend les champs optionnels ou génériques pour accepter Prof ET Élève
// ✅ Dans ton fichier UserProvider.tsx
export interface UserData {
  id: string;
  name: string;
  prenom: string;
  username: string;
  role: string;
  photo: string | null;
  
  // --- CHAMPS OPTIONNELS (Élève ou Prof) ---
  classe?: string;      // Pour l'élève
  matiere?: string;     // Pour le prof
  initiales?: string;   // Pour le prof
  
  // ✅ AJOUTE CES LIGNES POUR L'ÉLÈVE
  moyenne?: string;     
  absences?: number;
  assiduite?: string;
  rang?: string;
  coursVu?: number;
}


const UserContext = createContext<UserData | null>(null);

export function UserProvider({ children, user }: { children: ReactNode; user: any }) {
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser doit être utilisé dans un UserProvider");
  return context;
};
