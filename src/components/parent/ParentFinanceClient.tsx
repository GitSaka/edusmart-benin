"use client";
import { useState } from "react";
import { 
  Wallet, Receipt, CheckCircle2, CreditCard, 
  Download, Users,Home, ArrowRight, ShieldCheck, 
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";


export default function ParentFinanceClient({ enfants }: { enfants: any[] }) {
  // 🎯 1. Au début, on sélectionne le premier enfant par défaut
  const [selectedStudent, setSelectedStudent] = useState(enfants[0] || null);
  const router = useRouter();
  // 🧠 2. Calculs automatiques quand on change d'enfant
  const dejaPaye = selectedStudent?.paiements?.reduce((acc: number, p: any) => acc + p.montant, 0) || 0;
  const reste = (selectedStudent?.scolariteTotale || 0) - dejaPaye;

  if (!selectedStudent) return <div className="p-10 text-center uppercase font-black text-gray-400">Aucun enfant trouvé.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 px-2 md:px-4 animate-in fade-in duration-700">
      {/* 🔙 BOUTON RETOUR (Indispensable pour le parent) */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => router.push("/parent")} // 🎯 On le renvoie au Dashboard
          className="group flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-900 hover:text-white transition-all active:scale-95"
        >
          <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white/10 transition-colors text-gray-500 group-hover:text-white">
            <ArrowLeft size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Tableau de bord</span>
        </button>

        {/* Badge discret de l'école */}
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
          <Home size={14} className="text-primary" />
          <span className="text-[9px] font-black text-primary uppercase">Espace Finance</span>
        </div>
      </div>

      {/* --- HEADER : SÉLECTEUR D'ENFANT --- */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-900 text-primary rounded-2xl shadow-lg">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase italic leading-none">Vérifier les tranches</h2>
            <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Cliquez sur un enfant ci-contre</p>
          </div>
        </div>

        <div className="flex p-1.5 bg-gray-100 rounded-2xl gap-2 overflow-x-auto no-scrollbar max-w-full">
          {enfants.map((s: any) => (
            <button
              key={s.id}
              onClick={() => setSelectedStudent(s)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                selectedStudent.id === s.id 
                ? "bg-white text-gray-900 shadow-md scale-105" 
                : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {s.prenom}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- CÔTÉ GAUCHE : RÉSUMÉ & PAIEMENT --- */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8">
                 <ShieldCheck className="text-primary" size={18} />
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Solde de {selectedStudent.prenom}</p>
              </div>
              <h2 className="text-5xl font-black italic tracking-tighter text-white mb-2">
                {reste.toLocaleString()} <span className="text-sm opacity-40 font-normal">CFA</span>
              </h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase italic">Reste à payer pour l'année</p>
            </div>

            <div className="relative z-10 mt-12 space-y-4">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center text-[10px] font-black uppercase">
                  <span className="text-gray-500 italic">Scolarité Totale</span>
                  <span>{selectedStudent.scolariteTotale?.toLocaleString()} F</span>
               </div>
               <button className="w-full bg-primary text-gray-900 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3">
                 <CreditCard size={18} /> Payer par Mobile Money
               </button>
            </div>
            <Wallet className="absolute -right-10 -bottom-10 opacity-5" size={250} />
          </div>
        </div>

        {/* --- CÔTÉ DROIT : HISTORIQUE DES TRANCHES --- */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-[11px] font-black uppercase italic px-4 flex items-center gap-3 text-gray-400 tracking-widest">
            <Receipt size={16} /> Détails des paiements effectués
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto no-scrollbar pr-1">
            {selectedStudent.paiements && selectedStudent.paiements.length > 0 ? (
              selectedStudent.paiements.map((p: any) => (
                <div key={p.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 flex justify-between items-center group hover:border-emerald-200 hover:shadow-lg transition-all animate-in slide-in-from-right duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-gray-900 uppercase leading-none">{p.tranche}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase mt-1.5 italic">
                        Reçu le {new Date(p.date || p.createdAt).toLocaleDateString('fr-BJ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-md font-black text-gray-900">{p.montant.toLocaleString()} F</p>
                    <button className="text-[8px] font-black text-primary uppercase underline tracking-tighter">Voir reçu</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-12 text-center">
                 <Receipt className="mx-auto text-gray-200 mb-4" size={48} />
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aucun versement trouvé pour {selectedStudent.prenom}.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
