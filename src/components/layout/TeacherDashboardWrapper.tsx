"use client";
import { useState } from "react";
import TeacherTopBar from "@/components/layout/TeacherTopBar";
import TeacherSideBar from "@/components/layout/TeacherSideBar";

// ✅ Ajoute cette interface pour supprimer le rouge sur userData
interface TeacherDashboardProps {
  children: React.ReactNode;
  userData: {
    name: string;
    prenom: string;
    matiere: string;
    photo: string | null;
    initiales: string;
    role: string;
  };
}

export default function TeacherDashboardWrapper({ children, userData }: TeacherDashboardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {isOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      <TeacherSideBar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 lg:ml-72 flex flex-col min-w-0 transition-all duration-300 text-left">
        {/* On passe userData à la TopBar */}
        <TeacherTopBar onOpenMenu={() => setIsOpen(true)} userData={userData} />

        <main className="p-4 lg:p-10">
          <div className="max-w-7xl mx-auto italic">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
