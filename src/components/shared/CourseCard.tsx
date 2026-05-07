"use client";

import {
  Play,
  FileText,
  Headphones,
  Clock,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calculator,
  Atom,
  Globe,
  BookOpen,
  Video,
  BadgeCheck,
  Verified
} from "lucide-react";

import { RessourceType, Portee } from "@prisma/client";
import { getEduSmartThumbnail } from "@/lib/cloudinary-utils";
import { markAsReadAction } from "@/lib/actions/ressource";



interface CourseCardProps {
  titre: string;
  type: RessourceType;
  portee: Portee;
  matiereNom: string;
  profNom: string;
  date: string;
  valeur: string;
  createdAt?: Date;
  hasCorrige?: boolean;
  isPrivate?: boolean;
  url: string;
  isRead: boolean;
  id: string;
  isOffline?: boolean;
}

export default function CourseCard({
  titre,
  type,
  portee,
  matiereNom,
  profNom,
  date,
  valeur,
  createdAt,
  hasCorrige,
  isPrivate,
  url,
  isRead,
  id,
  isOffline
}: CourseCardProps) {
  
  const isExclusif = portee === "CLASSE";
  const miniature = getEduSmartThumbnail(url, type);



  const isNew = createdAt
    ? new Date().getTime() - new Date(createdAt).getTime() <=
      72 * 60 * 60 * 1000
    : false;

  // 🎨 COULEUR (adoucie seulement)
  const theme = hasCorrige
    ? { bg: "bg-indigo-600/90", light: "bg-indigo-50", text: "text-indigo-600", shadow: "shadow-indigo-100" }
    : type === "VIDEO"
    ? { bg: "bg-blue-600/90", light: "bg-blue-50", text: "text-blue-600", shadow: "shadow-blue-100" }
    : { bg: "bg-rose-600/90", light: "bg-rose-50", text: "text-rose-600", shadow: "shadow-rose-100" };

    const matiereIcons: Record<string, JSX.Element> = {
      math: <Calculator size={32} />,
      physique: <Atom size={32} />,
      anglais: <Globe size={32} />,
      français: <BookOpen size={32} />
    };

    {isOffline && (
      <span className="absolute top-2 left-2 text-[9px] bg-green-600 text-white px-2 py-1 rounded">
        Offline
      </span>
    )}

   const handleOpen = async () => {

  if (!isRead) {
    try {
      await markAsReadAction(id);
      // Pas besoin de faire plus, revalidatePath dans l'action fera le reste
    } catch (error) {
      console.error("Erreur de marquage :", error);
    }
  }
};



     return (
    <a 
    
     target="_blank" 
     onClick={handleOpen}

    className={`group cursor-pointer bg-white rounded-[1rem] p-5 transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] border-2 flex flex-col h-full relative overflow-hidden ${
      hasCorrige ? "border-indigo-100" : "border-transparent hover:border-gray-100"
    }`}>
      
      {/* 🖼️ BANNIÈRE (Version Claire et Épurée) */}
      <div className={`relative w-full h-44 mb-3 overflow-hidden flex flex-col items-center justify-center transition-all duration-500 group-hover:scale-[1.02]  ${theme.bg}`}>
        
        {/* 📸 MINIATURE RÉELLE (Cloudinary) - Sans bordures et sans overlay noir */}
        {miniature ? (
          <img 
            src={miniature} 
            alt={titre} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')]"></div>
        )}

        {/* 🎭 FILIGRANE MATIÈRE (Plus visible car plus d'overlay) */}
        <span className="absolute text-[80px] font-black text-white/20 select-none tracking-tighter -rotate-12 italic uppercase">
          {matiereNom.slice(0, 4)}
        </span>

        {/* 🎯 ICÔNE CENTRALE FLOTTANTE (Design Verre) */}
       <div className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-lg">
          {hasCorrige ? (
            <ShieldCheck size={16} className="text-yellow-400" />
          ) : type === "VIDEO" ? (
            <Video size={16} />
          ) : (
            <FileText size={16} />
          )}
        </div>

        {/* 🏷️ BADGES SUPÉRIEURS (Plus contrastés sur l'image) */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isNew && (
            <div className="bg-red-500 text-white text-[7px] font-black px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1 animate-pulse border border-white/20">
              <Sparkles size={8} /> NOUVEAU
            </div>
          )}

          <div className="bg-black/40 backdrop-blur-md text-white text-[8px] font-black px-3 py-1 rounded-lg border border-white/10 uppercase tracking-widest">
            {matiereNom}
          </div>
        </div>



      </div>
                      {/* 🎯 BADGE CORRIGÉ (Positionnement chirurgical en haut à droite) */}
        {hasCorrige && (
          <div className="absolute top-4 right-4 z-30 bg-yellow-400 text-gray-900 text-[7px] font-black px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1 border border-white/20 uppercase tracking-widest animate-in fade-in zoom-in duration-300">
            <CheckCircle2 size={10} /> Corrigé Inclus
          </div>
        )}

      {/* 📖 CONTENU (Infos Cours) */}
      <div className="flex-1 px-2 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${theme.light} ${theme.text}`}>
            {isExclusif ? "Ma Classe" : "Niveau"}
          </span>

          {isPrivate && (
            <span className="bg-gray-900 text-white text-[7px] font-black px-2 py-1 rounded-md shadow-sm">
              PERSONNEL
            </span>
          )}
          {/* 🏷️ BADGES SUPÉRIEURS */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            
            {/* 🎯 LE INDICATEUR DE LECTURE (Nouveau !) */}
            {isRead ? (
              <div className="bg-emerald-500 text-white text-[7px] font-black px-2 py-1 rounded-md shadow-lg flex items-center gap-1 border border-white/20">
                <BadgeCheck size={8} /> DÉJÀ LU
              </div>
            ) : (
              <div className="bg-red-600 text-white text-[7px] font-black px-2 py-1 rounded-md shadow-lg flex items-center gap-1 animate-pulse border border-white/20">
                <div className="w-1.5 h-1.5 bg-white rounded-full" /> NON LU
              </div>
            )}

            {isNew && !isRead && (
              <div className="bg-black/40 backdrop-blur-md text-white text-[8px] font-black px-3 py-1 rounded-lg border border-white/10 uppercase tracking-widest">
                NOUVEAU
              </div>
            )}
          </div>
        </div>

        <h3 className="text-[17px] font-black text-gray-900 leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2 uppercase italic tracking-tighter">
          {titre}
        </h3>
       <h3 className="text-[14px] font-medium text-gray-600 leading-tight mb-2 group-hover:text-primary transition-all duration-300 line-clamp-2 italic tracking-tighter flex items-center gap-1.5">
          <span>
            Cours détaillé sur <span className="text-[13px] font-black text-gray-900 group-hover:text-primary">{titre}</span>
          </span>
          
          {/* L'icône de vérification personnalisée en Vert Émeraude */}
          <div className="flex-shrink-0 bg-emerald-100 p-0.5 rounded-full shadow-sm border border-emerald-200">
            <Verified 
              size={13} 
              className="text-emerald-600 fill-emerald-50" 
              strokeWidth={3}
            />
          </div>
        </h3>


        <p className="text-[12px] text-gray-400 font-bold italic">
          Par {profNom}
        </p>
      </div>

      {/* 🏁 FOOTER (Date & Taille) */}
      <div className="pt-4 border-t border-gray-50 flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-tighter">
          <Clock size={12} className="text-gray-300" />
          {date}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-gray-500 italic">
            {valeur}
          </span>

          <div className={`p-2.5 rounded-2xl text-white transition-all group-hover:translate-x-1 shadow-xl ${theme.bg} ${theme.shadow}`}>
            <ChevronRight size={18} />
          </div>
        </div>
      </div>
    </a>
  );


}