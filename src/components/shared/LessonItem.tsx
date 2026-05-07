"use client";
import { Play, FileText, Headphones, Clock } from "lucide-react";
import Link from "next/link";

interface LessonItemProps {
  id: number;        // ✅ Obligatoire pour la navigation
  title: string;
  type: string;      // ✅ Pour adapter l'icône (VIDEO, PDF, AUDIO)
  duration?: string; // Optionnel (peut être la taille du PDF)
  prof?: string;
  active?: boolean;
}

export default function LessonItem({ id, title, type, duration, prof, active }: LessonItemProps) {
  return (
    <Link 
      href={`/courses/${id}`} 
      className={`flex gap-3 p-3 rounded-[1.5rem] cursor-pointer transition-all border-2 group ${
        active 
          ? "bg-primary/5 border-primary/10 shadow-sm" 
          : "bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-100"
      }`}
    >
      {/* 🖼️ MINIATURE ADAPTATIVE (Design Netflix) */}
      <div className={`w-28 h-16 rounded-xl flex-shrink-0 relative overflow-hidden flex items-center justify-center transition-colors ${
        active ? "bg-gray-900" : "bg-gray-100 group-hover:bg-gray-200"
      }`}>
        
        {/* LOGIQUE D'ICÔNE (Mur de Fer) */}
        {type === "VIDEO" && (
            <Play 
                size={18} 
                className={`${active ? "text-primary" : "text-gray-400"} group-hover:scale-110 transition-transform`} 
                fill={active ? "currentColor" : "none"} 
            />
        )}
        {type === "PDF" && (
            <FileText 
                size={18} 
                className={`${active ? "text-red-500" : "text-gray-400"}`} 
            />
        )}
        {type === "AUDIO" && (
            <Headphones 
                size={18} 
                className={`${active ? "text-emerald-500" : "text-gray-400"}`} 
            />
        )}

        {/* Badge Durée/Taille */}
        {duration && (
            <span className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-sm text-[8px] text-white px-1.5 py-0.5 rounded-md font-black uppercase italic">
                {duration}
            </span>
        )}
      </div>

      {/* 📝 INFOS TEXTUELLES */}
      <div className="flex-1 min-w-0 py-1 text-left">
        <h4 className={`text-[11px] font-black leading-tight line-clamp-2 uppercase italic tracking-tighter ${
          active ? "text-primary" : "text-gray-800"
        }`}>
          {title}
        </h4>
        <div className="flex items-center gap-2 mt-2">
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest truncate max-w-[80px]">
                {prof || "Professeur"}
            </p>
            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
            <p className={`text-[8px] font-black uppercase italic ${active ? "text-primary/60" : "text-gray-300"}`}>
                {type === "VIDEO" ? "Vidéo" : type === "PDF" ? "Document" : "Audio"}
            </p>
        </div>
      </div>
    </Link>
  );
}
