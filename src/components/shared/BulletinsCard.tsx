"use client";
import { Calculator, Lock, Unlock, Users, RotateCcw, FileText, Download, AlertCircle } from "lucide-react";

interface ClasseCardProps {
  classe: any;
  trimestre: number;
  onLock: (id: number) => void;
  onCalculate: (id: number) => void;
}

export default function ClasseBulletinCard({ classe, trimestre, onLock, onCalculate }: ClasseCardProps) {
  
  // ✅ 1. VERROUILLAGE CHIRURGICAL : On cherche le verrou du trimestre sélectionné
  const verrouTrimesrtre = classe.verrousSaisie?.find(
    (v: any) => v.trimestre === trimestre
  );
  // Si aucun verrou n'existe en base, par défaut c'est ouvert (false)
  const isLocked = verrouTrimesrtre?.estBloque === true; 

  // 2. Détection des Bulletins existants pour ce trimestre
  const bulletinsExistants = classe.bulletins?.filter((b: any) => b.trimestre === trimestre) || [];
  const hasBulletins = bulletinsExistants.length > 0;

  // 🛡️ LOGIQUE DE SÉCURITÉ :
  // On ne montre "Télécharger" que si c'est verrouillé ET déjà calculé.
  const showDownload = isLocked && hasBulletins;

  // ✅ 3. PROGRESSION RÉELLE DU TRIMESTRE :
  // On ne compte que les cours qui ont des notes pour le trimestre en cours.
  const totalCours = classe._count?.cours || 0;
  const coursAvecNotes = classe.cours?.filter((c: any) => 
    // On vérifie si dans la liste des notes du cours, il y en a pour ce trimestre
    c.notes?.some((n: any) => n.trimestre === trimestre)
  ).length || 0;
  
  const progress: number = totalCours > 0 ? Math.round((coursAvecNotes / totalCours) * 100) : 0;

  return (
    <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-indigo-50/40 transition-all group relative overflow-hidden">
      
      {/* 1. BADGES D'ÉTAT */}
      <div className="flex justify-between items-start mb-8">
        <div className={`p-3.5 rounded-2xl ${isLocked ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {isLocked ? <Lock size={22} /> : <Unlock size={22} />}
        </div>
        
        {hasBulletins && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
            isLocked ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
          }`}>
            {isLocked ? <FileText size={12} /> : <AlertCircle size={12} />}
            <span className="text-[8px] font-black uppercase tracking-widest">
              {isLocked ? 'Bulletins Prêts' : 'Recalcul nécessaire'}
            </span>
          </div>
        )}
      </div>

      {/* 2. INFOS CLASSE */}
      <div className="mb-8">
        <h3 className="text-2xl font-black text-gray-900 leading-none mb-2">{classe.nom}</h3>
        <div className="flex items-center gap-2 text-gray-400">
          <Users size={14} />
          <span className="text-[10px] font-bold uppercase tracking-tight">
            {classe._count?.eleves || 0} Élèves inscrits
          </span>
        </div>
      </div>

      {/* 3. BARRE DE PROGRESSION (Trimestrielle) */}
      <div className="bg-gray-50 p-4 rounded-2xl mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Saisie T{trimestre}</span>
          <span className={`text-[10px] font-black ${progress === 100 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {progress}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* 4. ACTIONS */}
      <div className="grid grid-cols-1 gap-3">
        
        {/* BOUTON 1 : VERROU (Trimestriel) */}
        <button 
          onClick={() => onLock(classe.id)}
          className={`flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            isLocked 
            ? 'bg-white border-2 border-gray-100 text-gray-400 hover:border-gray-900 hover:text-gray-900' 
            : 'bg-black text-white hover:bg-gray-800 shadow-xl shadow-gray-100'
          }`}
        >
          {isLocked ? <RotateCcw size={16}/> : <Lock size={16}/>}
          {isLocked ? `Réouvrir saisie T${trimestre}` : `Clôturer saisie T${trimestre}`}
        </button>

        {/* BOUTON 2 : CALCUL OU TÉLÉCHARGEMENT */}
        {showDownload ? (
          <button 
            className="flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
            onClick={() => window.open(`/api/bulletins/export?classeId=${classe.id}&trimestre=${trimestre}`, '_blank')}
          >
            <Download size={16}/>
            Télécharger bulletin T{trimestre}
          </button>
        ) : (
          <button 
            onClick={() => onCalculate(classe.id)}
            disabled={!isLocked}
            className={`flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
              isLocked 
              ? 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700' 
              : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
            }`}
          >
            <Calculator size={16}/>
            {hasBulletins ? `Recalculer Rangs T${trimestre}` : `Calculer Rangs T${trimestre}`}
          </button>
        )}
      </div>
    </div>
  );
}