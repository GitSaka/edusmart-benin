"use client";
import { useState } from "react";
import { BarChart3,Lock, ArrowLeft,FileSpreadsheet, Award, Sparkles } from "lucide-react";
import SubjectGradeCard from "@/components/shared/SubjectGradeCard";
import { useRouter } from "next/navigation"; 

export default function GradesClient({ student, initialNotes, initialBulletins }: any) {
  const [trimestre, setTrimestre] = useState(1);
    const router = useRouter(); 

  // 🎯 1. FILTRAGE ET LOGIQUE DE CALCUL
  const bulletinActuel = initialBulletins.find((b: any) => b.trimestre === trimestre);
  const notesDuTrimestre = initialNotes.filter((n: any) => n.trimestre === trimestre);

  // Historique pour la barre bleue
  const bT1 = initialBulletins.find((b: any) => b.trimestre === 1);
  const bT2 = initialBulletins.find((b: any) => b.trimestre === 2);

  // 🧠 Groupement des notes par matière pour la grille
  const matieresData = notesDuTrimestre.reduce((acc: any, n: any) => {
    const nom = n.cours.matiere.nom;
    if (!acc[nom]) acc[nom] = { interros: [], devoirs: [], coeff: 2 };
    
    if (n.type.startsWith("INT")) acc[nom].interros.push(n.valeur);
    else acc[nom].devoirs.push(n.valeur);
    
    return acc;
  }, {});

// 🎯 On cherche LE bulletin qui correspond au trimestre cliqué
const bulletinDuTrimestreActive = initialBulletins.find(
  (b: any) => b.trimestre === trimestre
);

// 🛡️ La condition de téléchargement devient spécifique à CE trimestre
// 🎯 Utilise l'optionnel chaining ?. et assure-toi que la valeur est un booléen clair
const peutTelechargerCeTrimestre = !!bulletinDuTrimestreActive?.estPublie;




  return (
    <div className="max-w-6xl mx-auto pb-10 px-2 animate-in fade-in duration-700">

      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => router.back()} // 🎯 Retourne à la page précédente (Dashboard)
          className="group flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-900 hover:text-white transition-all active:scale-95"
        >
          <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Retour Accueil</span>
        </button>

        {/* Petit rappel de l'élève pour le parent */}
        <div className="text-right hidden md:block">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Consultation Notes</p>
           <p className="text-sm font-black text-gray-900 uppercase">{student.nom} {student.prenom}</p>
        </div>
      </div>

      
      {/* 1. RÉCAPITULATIF DYNAMIQUE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-primary p-7 rounded-[0rem] text-white shadow-xl relative overflow-hidden">
            <div>
                <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                    Moyenne {trimestre === 1 ? '1er' : trimestre + 'ème'} Trimestre
                </p>
                <p className="text-4xl font-black italic tracking-tighter">
                    {bulletinActuel?.moyenne?.toFixed(2) || "0.00"}
                </p>
            </div>

            {trimestre > 1 && (
                <div className="mt-4 pt-4 border-t border-blue-400/30 flex gap-4">
                    {bT1 && (
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-blue-200 uppercase">Moy. T1</span>
                            <span className="text-sm font-bold">{bT1.moyenne.toFixed(2)}</span>
                        </div>
                    )}
                    {trimestre === 3 && bT2 && (
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-blue-200 uppercase">Moy. T2</span>
                            <span className="text-sm font-bold">{bT2.moyenne.toFixed(2)}</span>
                        </div>
                    )}
                </div>
            )}
            <BarChart3 className="absolute -right-4 -bottom-4 opacity-10" size={100} />
        </div>
        
        <div className="bg-white p-7 rounded-[0rem] border border-gray-100 shadow-sm flex flex-col justify-center">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Rang T{trimestre}</p>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-gray-800">
                    {bulletinActuel?.rang || "—"}
                    <span className="text-lg">{bulletinActuel?.rang === 1 ? "er" : "ème"}</span>
                </p>
                <p className="text-xs font-bold text-gray-400 uppercase">sur {student.classe._count.eleves}</p>
            </div>
        </div>

        <div className="bg-white p-7 rounded-[0rem] border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Mention</p>
                <p className="font-black text-emerald-600 text-sm uppercase italic tracking-tight">
                    {bulletinActuel?.moyenne >= 12 ? "Tableau d'Honneur" : "Encouragements"}
                </p>
            </div>
            <Award className="text-emerald-500" size={28} />
        </div>
      </div>

      {/* 2. SÉLECTEUR DE TRIMESTRE */}
      <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar mb-12">
        {[1, 2, 3].map((t) => (
          <button
            key={t}
            onClick={() => setTrimestre(t)}
            className={`flex-shrink-0 px-8 py-4 rounded-2xl font-black text-xs transition-all border-2 ${
              trimestre === t ? "bg-primary border-primary text-white shadow-xl scale-105" : "bg-white border-gray-100 text-gray-400"
            }`}
          >
            {t === 1 ? "1er TRIMESTRE" : t + "ème TRIMESTRE"}
          </button>
        ))}
      </div>

      {/* 3. GRILLE DES MATIÈRES DYNAMIQUE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(matieresData).map(([nom, data]: any) => (
          <SubjectGradeCard 
            key={nom}
            matiere={nom} 
            coeff={data.coeff} 
            interros={data.interros} 
            devoirs={data.devoirs} 
          />
        ))}
      </div>

      {/* 4. BOUTON EXPORT SÉCURISÉ */}
      <div className="mt-12 flex flex-col items-center">
  {peutTelechargerCeTrimestre ? (
    /* ✅ CAS : LE CENSEUR A VALIDÉ CE TRIMESTRE PRÉCIS */
    <button 
      onClick={() => window.open(`/api/bulletins/export?trimestre=${trimestre}`, '_blank')}
      className="inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-2xl border-b-4 border-black/20 animate-in zoom-in duration-300"
    >
      <FileSpreadsheet size={20} className="text-blue-400" /> 
      <span>Télécharger le Bulletin Officiel T{trimestre}</span>
    </button>
  ) : (
    /* 🔒 CAS : PAS ENCORE VALIDÉ OU PAS ENCORE CALCULÉ */
    <div className="flex flex-col items-center gap-4 bg-gray-50 p-8 rounded-[3rem] border border-dashed border-gray-200 w-full max-w-md text-center opacity-80">
      <div className="p-3 bg-white rounded-2xl shadow-sm text-gray-300">
        <Lock size={24} />
      </div>
      <div>
        <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">
          Bulletin T{trimestre} Indisponible
        </h4>
        <p className="text-[11px] font-bold text-gray-400 leading-relaxed italic px-4">
          Le censeur n'a pas encore autorisé le téléchargement pour cette période. 
          Veuillez consulter vos notes ci-dessous en attendant.
        </p>
      </div>
    </div>
  )}
</div>

    </div>
  );
}
