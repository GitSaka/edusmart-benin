"use client";
import { useState, useMemo } from "react";
import { Search, Download, Filter, UserCheck, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";


export default function StudentExcelTable({ data, allClasses }: { data: any[], allClasses: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClasse, setFilterClasse] = useState("TOUT");

  // Filtrage
  const filteredData = useMemo(() => {
    return data.filter((s) => {
      const matchesSearch = s.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.prenom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClasse = filterClasse === "TOUT" || s.classe.nom === filterClasse;
      return matchesSearch && matchesClasse;
    });
  }, [data, searchTerm, filterClasse]);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      
      {/* 🛠️ BARRE D'OUTILS COMPACTE */}
      <div className="bg-gray-900 text-white p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input 
            type="text"
            placeholder="Rechercher..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-3 py-1.5 bg-white/10 border border-white/20 text-xs outline-none focus:bg-white focus:text-black"
          />
          {/* 🎯 ICI : On utilise allClasses pour voir TOUTES les classes */}
          <select 
            onChange={(e) => setFilterClasse(e.target.value)}
            className="px-3 py-1.5 bg-white/10 border border-white/20 text-[10px] font-bold uppercase outline-none cursor-pointer"
          >
            <option value="TOUT">Toutes les classes</option>
            {allClasses.map(c => <option key={c.nom} value={c.nom} className="text-black">{c.nom}</option>)}
          </select>
        </div>

        <button className="bg-emerald-600 px-4 py-1.5 text-[10px] font-black uppercase flex items-center gap-2">
          <Download size={14} /> Exporter EduMaster
        </button>
      </div>

      {/* 📊 TABLEAU SERRÉ */}
      <div className="flex-1 overflow-auto border-t border-gray-300">
        <table className="w-full text-left border-collapse table-fixed min-w-[1100px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-100 text-gray-600">
              <th className="w-10 p-1 text-[9px] font-black border border-gray-300 uppercase">N°</th>
              <th className="w-24 p-1 text-[9px] font-black border border-gray-300 uppercase">Matricule</th>
              
              {/* 🎯 LARGEUR CONTRÔLÉE : On réduit ici */}
              <th className="w-64 p-1 text-[9px] font-black border border-gray-300 uppercase">Nom & Prénoms</th>
              
              <th className="w-12 p-1 text-[9px] font-black border border-gray-300 uppercase text-center">Sexe</th>
              <th className="w-20 p-1 text-[9px] font-black border border-gray-300 uppercase text-center">Né le</th>
              <th className="w-32 p-1 text-[9px] font-black border border-gray-300 uppercase">Lieu Naiss.</th>
              <th className="w-24 p-1 text-[9px] font-black border border-gray-300 uppercase text-center">Statut</th>
              <th className="w-24 p-1 text-[9px] font-black border border-gray-300 uppercase text-right">Classe</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((student, index) => (
              <tr key={student.id} className="hover:bg-blue-50 even:bg-gray-50/30">
                <td className="p-1 text-[10px] border border-gray-200 text-center">{index + 1}</td>
                <td className="p-1 text-[10px] border border-gray-200 font-bold text-blue-700">{student.matricule}</td>
                <td className="p-1 text-[10px] border border-gray-200 truncate uppercase">
                  <span className="font-black">{student.nom}</span> {student.prenom}
                </td>
                <td className="p-1 text-[10px] border border-gray-200 text-center font-black">{student.sexe}</td>
                <td className="p-1 text-[10px] border border-gray-200 text-center">
                   {format(new Date(student.dateNaissance), "dd/MM/yy")}
                </td>
                <td className="p-1 text-[10px] border border-gray-200 uppercase truncate">
                  {student.lieuNaissance || "???"}
                </td>
                <td className="p-1 text-center border border-gray-200">
                  <span className={`text-[8px] font-black px-1 border ${student.redoublant ? 'border-amber-500 text-amber-600' : 'border-emerald-500 text-emerald-600'}`}>
                    {student.redoublant ? "RED" : "NOUV"}
                  </span>
                </td>
                <td className="p-1 text-right text-[10px] border border-gray-200 font-bold italic text-gray-400">
                  {student.classe.nom}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

