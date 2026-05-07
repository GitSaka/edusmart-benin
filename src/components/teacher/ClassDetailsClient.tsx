"use client";
import { useState, useMemo } from "react";
import { ClipboardCheck, FileSpreadsheet, ChevronLeft, User, Search, MoreHorizontal, GraduationCap, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ClassDetailsClient({ classe }: any) {
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ FILTRAGE DYNAMIQUE CORRIGÉ (Utilise .eleves)
  const filteredStudents = useMemo(() => {
    const list = classe.eleves || [];
    return list.filter((s: any) => 
      s.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, classe.eleves]);

  return (
    <div className="max-w-6xl mx-auto pb-20 px-2 md:px-4 animate-in fade-in duration-700 text-left">
      
      {/* RETOUR & HEADER */}
      <div className="mb-8 mt-6">
        <Link href="/teacher" className="inline-flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase mb-6 hover:text-primary transition-colors group">
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform"/> Retour au tableau de bord
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 leading-none tracking-tighter uppercase italic">
              {classe.nom}
            </h1>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-4 flex items-center gap-2">
              <GraduationCap size={14}/> {classe.serie?.nom || "Série Générale"} • {classe.eleves?.length || 0} Élèves inscrits
            </p>
          </div>
          <div className="hidden md:block text-right bg-gray-50 p-4 rounded-3xl border border-gray-100">
             <p className="text-[9px] font-black text-gray-400 uppercase italic mb-1">Niveau Scolaire</p>
             <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">{classe.serie?.level?.nom || "N/A"}</p>
          </div>
        </div>
      </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 px-2">
  {/* APPEL */}
  <Link href={`/teacher/attendance?classeId=${classe.id}`} 
    className="bg-primary p-4 rounded-3xl text-white shadow-lg shadow-blue-100 flex items-center justify-between group active:scale-95 transition-all">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white group-hover:text-primary transition-all shrink-0">
          <ClipboardCheck size={20} />
      </div>
      <div>
          <span className="text-[8px] font-black uppercase tracking-widest opacity-70 block leading-none">Présences</span>
          <p className="text-sm font-black uppercase italic leading-tight">Faire l'appel</p>
      </div>
    </div>
    <ChevronRight size={18} className="opacity-50 group-hover:translate-x-1 transition-transform" />
  </Link>

  {/* NOTES */}
  <Link href={`/teacher/notes?classeId=${classe.id}`} 
    className="bg-gray-900 p-4 rounded-3xl text-white shadow-lg shadow-gray-200 flex items-center justify-between group active:scale-95 transition-all">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-primary transition-all shrink-0">
          <FileSpreadsheet size={20} />
      </div>
      <div>
          <span className="text-[8px] font-black uppercase tracking-widest opacity-70 block leading-none">Évaluations</span>
          <p className="text-sm font-black uppercase italic leading-tight">Saisir les Notes</p>
      </div>
    </div>
    <ChevronRight size={18} className="opacity-50 group-hover:translate-x-1 transition-transform" />
  </Link>
</div>


      {/* TABLEAU DES ÉLÈVES */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-2xl shadow-sm text-primary">
                <Users size={20} />
            </div>
            <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest leading-none">Répertoire de classe</h3>
                <p className="text-[9px] text-gray-400 font-bold mt-2 italic uppercase">{filteredStudents.length} élèves affichés</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input 
                type="text" 
                placeholder="Rechercher un élève..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl text-[11px] font-bold outline-none shadow-inner focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="px-8 py-6">Identité de l'élève</th>
                <th className="px-8 py-6 hidden md:table-cell">Numéro Matricule</th>
                <th className="px-8 py-6 text-center">Sexe</th>
                <th className="px-8 py-6 text-right italic">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.map((student: any) => (
                <tr key={student.id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-gray-50 rounded-[1.5rem] flex items-center justify-center overflow-hidden border-2 border-white shadow-md group-hover:border-primary/20 transition-all shrink-0">
                        {student.img ? (
                          <img src={student.img} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-[10px] font-black text-gray-300 uppercase italic">
                            {student.nom?.[0]}{student.prenom?.[0]}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-gray-900 text-sm uppercase leading-none truncate">{student.nom}</p>
                        <p className="text-[11px] text-gray-400 font-bold mt-2 italic truncate">{student.prenom}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 hidden md:table-cell">
                    <span className="text-[9px] font-black text-gray-500 bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-sm uppercase tracking-tighter italic">
                      {student.matricule}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`text-[9px] font-black px-4 py-2 rounded-xl border ${
                        student.sexe === 'M' 
                        ? 'text-blue-600 bg-blue-50/50 border-blue-100' 
                        : 'text-pink-600 bg-pink-50/50 border-pink-100'
                    }`}>
                      {student.sexe === 'M' ? 'MASCULIN' : 'FÉMININ'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="inline-flex p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-900 hover:text-white transition-all shadow-sm active:scale-90">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
