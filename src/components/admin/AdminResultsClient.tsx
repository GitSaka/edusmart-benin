"use client";
import { useState, useMemo } from "react";
import { Trophy, Medal, Star, Search, Filter, Printer, Download, User, ArrowRight } from "lucide-react";

export default function AdminResultsClient({ initialBulletins = [], dbClasses = [] }: any) {
  const [selectedClasseId, setSelectedClasseId] = useState("");
  const [selectedTrimestre, setSelectedTrimestre] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ FILTRAGE DYNAMIQUE (Zéro latence)
  const filtered = useMemo(() => {
    return initialBulletins.filter((b: any) => {
      const matchClasse = selectedClasseId ? b.student.classeId === parseInt(selectedClasseId) : true;
      const matchTrim = b.trimestre === selectedTrimestre;
      const matchSearch = b.student.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.student.matricule.toLowerCase().includes(searchTerm.toLowerCase());
      return matchClasse && matchTrim && matchSearch;
    });
  }, [selectedClasseId, selectedTrimestre, searchTerm, initialBulletins]);

  // ✅ FONCTION POUR LES BADGES DE RANG
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <div className="bg-amber-100 text-amber-600 p-2 rounded-xl border border-amber-200"><Trophy size={18}/></div>;
    if (rank === 2) return <div className="bg-slate-100 text-slate-500 p-2 rounded-xl border border-slate-200"><Medal size={18}/></div>;
    if (rank === 3) return <div className="bg-orange-100 text-orange-600 p-2 rounded-xl border border-orange-200"><Star size={18}/></div>;
    return <div className="bg-gray-50 text-gray-400 p-2 rounded-xl border border-gray-100 font-black text-[10px]">{rank}è</div>;
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-6">
      
      {/* 1. BARRE DE FILTRES (Design Premium) */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="w-full lg:w-48">
          <label className="text-[9px] font-black text-gray-300 uppercase ml-3 mb-1 block">Classe</label>
          <select 
            onChange={(e) => setSelectedClasseId(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-black outline-none cursor-pointer appearance-none shadow-inner"
          >
            <option value="">Toutes les classes</option>
            {dbClasses.map((c: any) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </div>

        <div className="w-full lg:w-40">
          <label className="text-[9px] font-black text-gray-300 uppercase ml-3 mb-1 block">Trimestre</label>
          <select 
            onChange={(e) => setSelectedTrimestre(parseInt(e.target.value))}
            className="w-full bg-indigo-50 border-none rounded-xl px-4 py-3 text-xs font-black text-indigo-600 outline-none cursor-pointer appearance-none shadow-inner"
          >
            <option value="1">1er Trimestre</option>
            <option value="2">2ème Trimestre</option>
            <option value="3">3ème Trimestre</option>
          </select>
        </div>

        <div className="w-full lg:flex-1 relative lg:mt-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher un élève..." 
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none shadow-inner"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="lg:mt-5 bg-gray-900 text-white p-4 rounded-xl shadow-lg hover:bg-indigo-600 transition-all active:scale-95">
           <Printer size={18}/>
        </button>
      </div>

      {/* 2. LISTE DES LAURÉATS */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((b: any) => (
          <div key={b.id} className="bg-white p-4 rounded-[2rem] border border-gray-100 flex items-center justify-between group hover:border-indigo-500/20 transition-all shadow-sm">
            <div className="flex items-center gap-5">
              {/* Rang avec Badge */}
              {getRankBadge(b.rang)}

              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 overflow-hidden border">
                    {b.student.img ? <img src={b.student.img} className="w-full h-full object-cover"/> : <User size={20}/>}
                 </div>
                 <div className="text-left">
                    <h4 className="text-sm font-black text-gray-900 uppercase leading-none mb-1">{b.student.nom} {b.student.prenom}</h4>
                    <p className="text-[9px] font-bold text-gray-400 uppercase italic tracking-widest">{b.student.matricule}</p>
                 </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
               <div className="text-right">
                  <p className="text-[9px] font-black text-gray-300 uppercase italic mb-1">Moyenne</p>
                  <p className={`text-xl font-black tracking-tighter ${b.moyenne >= 10 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {b.moyenne.toFixed(2)}
                  </p>
               </div>
               <div className="p-3 bg-gray-50 rounded-xl text-gray-300 group-hover:text-indigo-600 transition-colors">
                  <ArrowRight size={18}/>
               </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/50">
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic tracking-[0.3em]">Aucun bulletin généré pour ces critères</p>
          </div>
        )}
      </div>
    </div>
  );
}
