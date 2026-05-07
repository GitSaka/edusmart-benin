"use client";
import { Receipt, CheckCircle2, CreditCard, ChevronRight } from "lucide-react";
import { StatutPaye } from "@prisma/client";
import StudentCard from "@/components/shared/StudentCard"; // Importation du composant unique
import Link from "next/link";

const tranches = [
  { id: 1, nom: "Inscription + 1ère Tranche", montant: "75.000 FCFA", date: "15 Sept 2025", statut: "SOLDE" as StatutPaye },
  { id: 2, nom: "2ème Tranche", montant: "50.000 FCFA", date: "10 Janv 2026", statut: "AVANCE" as StatutPaye },
  { id: 3, nom: "3ème Tranche (Scolarité)", montant: "50.000 FCFA", date: "15 Mars 2026", statut: "IMPAYE" as StatutPaye },
];

export default function FinancePage() {
  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 animate-in fade-in duration-700">
      
      {/* 1. APPEL DU COMPOSANT CARTE SCOLAIRE (Liaison vers Profil) */}
      <div className="mb-14 flex flex-col items-center lg:items-start gap-6">
        <div className="flex items-center justify-between w-full max-w-[400px] px-2">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Ma Carte Officielle</p>
           <Link href="/profile" className="text-[10px] font-black text-primary hover:underline">VOIR PROFIL</Link>
        </div>
        
        {/* On utilise notre composant stable ici */}
        <StudentCard 
          nom="KODJO" 
          prenom="Koffi" 
          matricule="2024-EDUS-001" 
          classe="Terminale C1" 
        />
      </div>

      {/* 2. RÉCAPITULATIF FINANCIER (Design Épuré) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Total versé</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-gray-900">125.000</p>
            <p className="text-xs font-bold text-gray-400">FCFA</p>
          </div>
        </div>
        
        <div className="bg-red-50/50 p-8 rounded-[2.5rem] border border-red-100 shadow-sm flex flex-col justify-center">
          <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-2">Reste à solder</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-red-600">50.000</p>
            <p className="text-xs font-bold text-red-400">FCFA</p>
          </div>
        </div>
      </div>

      {/* 3. HISTORIQUE DES PAIEMENTS */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6 ml-4">
           <CreditCard size={18} className="text-primary" />
           <h3 className="font-black text-gray-900 text-[10px] uppercase tracking-[0.2em]">Suivi des règlements</h3>
        </div>
        
        <div className="space-y-3">
          {tranches.map((t) => (
            <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all cursor-pointer">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  t.statut === 'SOLDE' ? 'bg-green-50 text-green-600' : 
                  t.statut === 'AVANCE' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                }`}>
                  {t.statut === 'SOLDE' ? <CheckCircle2 size={24} /> : <Receipt size={24} />}
                </div>
                <div>
                  <p className="font-black text-gray-800 text-sm">{t.nom}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{t.date}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="font-black text-gray-900 text-sm">{t.montant}</p>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase ${
                    t.statut === 'SOLDE' ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'
                  }`}>
                    {t.statut}
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-200 group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}