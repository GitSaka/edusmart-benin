"use client";
import { useState } from "react";
import { MessageSquare, Send, AlertTriangle, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RemindersTab({ students }: any) {
  const [search, setSearch] = useState("");
  const [isSendingAll, setIsSendingAll] = useState(false); // 🎯 État pour le bouton de relance massive

  // 🎯 1. On ne garde que les élèves qui ont une dette
  const debtors = students
    .map((s: any) => {
      const dejaPaye = s.paiements?.reduce((acc: number, p: any) => acc + (p.montant || 0), 0) || 0;
      const reste = (s.scolariteTotale || 0) - dejaPaye;
      return { ...s, reste };
    })
    .filter((s: any) => s.reste > 0);

  // Filtrage pour la recherche
  const filteredDebtors = debtors.filter((s: any) => 
    s.nom.toLowerCase().includes(search.toLowerCase()) || 
    s.prenom.toLowerCase().includes(search.toLowerCase())
  );

  // 💰 Statistique rapide du manque à gagner
  const totalDette = debtors.reduce((acc: number, s: any) => acc + s.reste, 0);

  // 🚀 FONCTION DE RELANCE MASSIVE
  const handleBulkSMS = async () => {
    if (!confirm(`Voulez-vous envoyer un SMS de relance aux ${debtors.length} parents retardataires ?`)) return;
    
    setIsSendingAll(true);
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success(`${debtors.length} SMS de relance envoyés avec succès !`);
    setIsSendingAll(false);
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-6">
      
      {/* 📊 RÉCAPITULATIF DE LA DETTE + BOUTON TOUT RELANCER */}
      <div className="bg-rose-600 p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Total des impayés à recouvrer</p>
          <h2 className="text-4xl font-black mt-2 tracking-tighter">{totalDette.toLocaleString()} <span className="text-sm font-bold">FCFA</span></h2>
        </div>
        
        {/* 🔥 BOUTON DE RELANCE MASSIVE */}
        <button 
          onClick={handleBulkSMS}
          disabled={isSendingAll || debtors.length === 0}
          className="bg-gray-900 text-white px-6 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-white hover:text-gray-900 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSendingAll ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {isSendingAll ? "Envoi en cours..." : "Relancer tout le monde"}
        </button>
      </div>

      {/* 🔍 BARRE DE RECHERCHE DÉBITEURS */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text"
          placeholder="RECHERCHER UN DÉBITEUR..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 text-[10px] font-black uppercase outline-none focus:border-rose-500 transition-all shadow-sm"
        />
      </div>

      {/* 📋 LISTE DES RELANCES */}
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-[9px] font-black uppercase text-gray-400">Élève & Classe</th>
              <th className="p-4 text-[9px] font-black uppercase text-gray-400 text-center">Reste à Payer</th>
              <th className="p-4 text-[9px] font-black uppercase text-gray-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredDebtors.map((s: any) => (
              <tr key={s.id} className="hover:bg-rose-50/30 transition-colors group">
                <td className="p-4">
                  <p className="text-[10px] font-black text-gray-900 uppercase leading-none">{s.nom} {s.prenom}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase italic mt-1">{s.classe?.nom}</p>
                </td>
                <td className="p-4 text-center text-[11px] font-black text-rose-600 italic">
                  -{s.reste.toLocaleString()} F
                </td>
                <td className="p-4 text-right">
                  {/* 🎯 TON BOUTON INDIVIDUEL EST ICI, INCHANGÉ */}
                  <button 
                    onClick={() => alert(`Envoi SMS au parent de ${s.nom}`)}
                    className="bg-gray-900 text-white px-4 py-2 text-[9px] font-black uppercase flex items-center gap-2 ml-auto hover:bg-rose-600 transition-all active:scale-95"
                  >
                    <MessageSquare size={12} /> Relancer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredDebtors.length === 0 && (
            <div className="p-20 text-center text-[10px] font-black text-gray-300 uppercase italic">
                Aucun débiteur trouvé.
            </div>
        )}
      </div>
    </div>
  );
}
