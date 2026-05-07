"use client";

import { QrCode, ShieldCheck, User } from "lucide-react";


interface StudentCardProps {
  nom: string;
  prenom: string;
  matricule: string;
  classe: string;
  photo?: string;
}

export default function StudentCard({ nom, prenom, matricule, classe,photo}: StudentCardProps) {
  

  return (
    /* Structure conservée : min-h-[260px] et flex flex-col justify-between */
    <div className="relative w-full max-w-[400px] min-h-[260px] bg-gradient-to-br from-blue-700 via-blue-800 to-gray-900 rounded-[2rem] p-6 text-white shadow-2xl overflow-hidden border border-white/10 group flex flex-col justify-between">
      
      {/* Motifs de fond (Sécurité) - Conservés à 100% */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

      {/* Header Carte avec ajout de l'ANNÉE SCOLAIRE */}
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-black italic tracking-tighter leading-none">EduSmart</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[8px] font-bold opacity-60 uppercase tracking-[0.2em]">République du Bénin</p>
            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
            <p className="text-[8px] font-black text-yellow-400 uppercase tracking-widest">2025-2026</p>
          </div>
        </div>
        <ShieldCheck size={20} className="text-yellow-400 opacity-80" />
      </div>

      {/* Corps de la carte avec PHOTO DYNAMIQUE */}
      <div className="relative z-10 flex gap-4 items-center my-4">
        {/* Photo de l'élève (Remplacée par la prop photo ou les initiales) */}
        <div className="w-20 h-24 bg-white/10 rounded-xl border-2 border-white/20 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner">
      {photo ? (
        <img 
          src={photo} 
          alt={`${nom} ${prenom}`} 
          /* On change object-cover en object-cover object-top */
          className="w-full h-full object-cover object-top transition-transform group-hover:scale-110 duration-500" 
          />
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-40">
            <User size={24} className="text-white" />
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {prenom[0]}{nom[0]}
            </span>
          </div>
      )}
      </div>

        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">Identité de l'élève</p>
          <h3 className="text-lg font-black uppercase truncate leading-none mb-1">{nom}</h3>
          <p className="text-md font-bold text-white/90 truncate">{prenom}</p>
          <div className="mt-2 inline-block bg-yellow-400 text-blue-900 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-sm">
            {classe}
          </div>
        </div>
      </div>

      {/* Footer avec Matricule & QR - Conservé à 100% */}
      <div className="relative z-10 flex justify-between items-end pt-2 border-t border-white/10 mt-auto">
        <div>
          <p className="text-[8px] font-bold opacity-50 uppercase tracking-tighter">ID Matricule</p>
          <p className="text-xs font-black tracking-widest text-blue-100">{matricule}</p>
        </div>
        <div className="bg-white p-1.5 rounded-xl shadow-xl flex-shrink-0 group-hover:scale-105 transition-transform">
          <QrCode size={40} className="text-blue-900" />
        </div>
      </div>
    </div>
  );
}