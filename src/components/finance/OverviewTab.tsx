"use client";
import { Receipt, AlertCircle, Inbox } from "lucide-react";

export function OverviewTab({ initialPayments, topDebtors, onZoom,students }: any) {

  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* JOURNAL */}
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 font-black text-[10px] uppercase italic flex justify-between items-center">
          Journal des encaissements <Receipt size={14} className="text-gray-400" />
        </div>
        <div className="divide-y divide-gray-50">
          {initialPayments.slice(0, 5).map((p: any) => (
            <button key={p.id} 
            onClick={() => onZoom(p)}
            
            className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-[10px]">{p.student?.nom[0]}</div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-900 leading-none">{p.student?.nom} {p.student?.prenom}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 italic">{p.tranche} • {new Date(p.date).toLocaleDateString('fr-BJ')}</p>
                </div>
              </div>
              <span className="text-[11px] font-black text-emerald-600">+{p.montant.toLocaleString()} F</span>
            </button>
          ))}
        </div>
      </div>

      {/* RADAR DETTES */}
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-rose-50/50 border-b border-gray-100 font-black text-[10px] uppercase text-rose-600 italic flex justify-between items-center">
          Radar des impayés <AlertCircle size={14} className="text-rose-400" />
        </div>
        <div className="divide-y divide-gray-50">
          {topDebtors.map((s: any) => (
            <button key={s.id}  onClick={() => onZoom(s)} className="w-full p-4 flex justify-between items-center hover:bg-rose-50/20 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-black text-[10px]">!</div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-900 leading-none">{s.nom} {s.prenom}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 italic">{s.classe?.nom}</p>
                </div>
              </div>
              <span className="text-[11px] font-black text-rose-600">-{s.reste.toLocaleString()} F</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
