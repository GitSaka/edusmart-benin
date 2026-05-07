"use client";
import { TrendingUp, Wallet, Users } from "lucide-react";

export function StatsCards({ stats }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-8 border border-gray-100 shadow-sm flex flex-col gap-4">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl"><TrendingUp size={20}/></div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scolarité Attendue</p>
          <h2 className="text-3xl font-black text-gray-900 mt-1">{stats.totalAttendu.toLocaleString()} <span className="text-sm font-bold text-gray-400">FCFA</span></h2>
        </div>
      </div>

      <div className="bg-white p-8 border border-gray-100 shadow-sm flex flex-col gap-4">
        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-xl"><Wallet size={20}/></div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Encaissé</p>
          <h2 className="text-3xl font-black text-emerald-600 mt-1">{stats.totalEncaisse.toLocaleString()} <span className="text-sm font-bold text-gray-400">FCFA</span></h2>
        </div>
        <div className="w-full bg-gray-100 h-1 mt-2">
           <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${(stats.totalEncaisse/stats.totalAttendu)*100}%` }}></div>
        </div>
      </div>

      <div className="bg-white p-8 border border-gray-100 shadow-sm flex flex-col gap-4">
        <div className="w-10 h-10 bg-rose-50 text-rose-600 flex items-center justify-center rounded-xl"><Users size={20}/></div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reste à Recouvrer</p>
          <h2 className="text-3xl font-black text-rose-600 mt-1">{stats.resteARecouvrer.toLocaleString()} <span className="text-sm font-bold text-gray-400">FCFA</span></h2>
        </div>
      </div>
    </div>
  );
}
