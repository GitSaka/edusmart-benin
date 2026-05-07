"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Loader2 } from "lucide-react";

export default function StudentCardLink({ student }: { student: any }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleNavigate = () => {
    setIsNavigating(true);
    // On lance la navigation vers la fiche
    router.push(`/admin/users/student/${student.id}`);
  };

  return (
    <div 
      onClick={handleNavigate}
      className={`group bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:border-primary hover:shadow-xl transition-all flex flex-col items-center text-center relative overflow-hidden active:scale-95 cursor-pointer ${isNavigating ? 'opacity-70 pointer-events-none' : ''}`}
    >
      {/* CERCLE PHOTO / LOADER */}
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-all mb-4 shadow-inner overflow-hidden border border-gray-100 relative">
        {isNavigating ? (
          <Loader2 className="animate-spin text-primary" size={22} />
        ) : student.img ? (
          <img src={student.img} alt={student.nom} className="w-full h-full object-cover" />
        ) : (
          <User size={22} />
        )}
      </div>

      <div className="space-y-0.5 w-full">
          <h3 className="text-[11px] font-black text-gray-900 uppercase leading-tight truncate">
              {isNavigating ? "CHARGEMENT..." : student.nom}
          </h3>
          <p className="text-[9px] font-bold text-gray-400 truncate px-1">
              {student.prenom}
          </p>
          <p className="text-[8px] font-black text-primary uppercase bg-primary/5 rounded-md py-0.5 mt-1">
            {student.classe?.nom || "N/A"}
          </p>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-50 w-full">
          <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter group-hover:text-primary transition-colors italic">
              {student.matricule}
          </span>
      </div>
    </div>
  );
}
