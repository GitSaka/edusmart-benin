// src/components/admin/BulletinPDF.tsx
export default function BulletinPDF({ student, bulletin, ecole }: any) {
  return (
    <div className="print-container bg-white p-8 text-black font-serif w-[210mm] min-h-[297mm] mx-auto shadow-none border-none">
      {/* 🏛️ ENTÊTE OFFICIEL */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div className="text-left space-y-1">
          <h1 className="text-xl font-bold uppercase">{ecole.nom}</h1>
          <p className="text-[10px] italic">{ecole.adresse || "République du Bénin"}</p>
          <p className="text-[10px] font-bold">Année Scolaire : 2025-2026</p>
        </div>
        <div className="text-right">
          <div className="w-16 h-16 bg-gray-100 border border-black flex items-center justify-center mb-1">
            {ecole.logo ? <img src={ecole.logo} className="w-full h-full" /> : "LOGO"}
          </div>
          <p className="text-[9px] font-bold uppercase tracking-tighter">Discipline - Travail - Succès</p>
        </div>
      </div>

      {/* 🧑‍🎓 INFOS ÉLÈVE */}
      <div className="grid grid-cols-2 gap-4 mb-6 border p-4 rounded-lg">
        <div className="text-left space-y-1">
          <p className="text-xs">Nom : <span className="font-bold uppercase">{student.nom}</span></p>
          <p className="text-xs">Prénoms : <span className="font-bold">{student.prenom}</span></p>
          <p className="text-xs">Matricule : <span className="font-bold text-indigo-600">{student.matricule}</span></p>
        </div>
        <div className="text-right space-y-1 border-l pl-4">
          <p className="text-xs font-bold uppercase text-indigo-600">Bulletin du {bulletin.trimestre}è Trimestre</p>
          <p className="text-xs">Classe : <span className="font-bold">{student.classe?.nom}</span></p>
          <p className="text-xs">Effectif : <span className="font-bold">{student.classe?._count?.eleves}</span></p>
        </div>
      </div>

      {/* 📊 TABLEAU DES NOTES (CHIRURGIE PRÉCISE) */}
      <table className="w-full border-collapse border-2 border-black mb-6 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2">Matières</th>
            <th className="border border-black p-2">Moyenne /20</th>
            <th className="border border-black p-2">Coef</th>
            <th className="border border-black p-2">Points</th>
            <th className="border border-black p-2">Rang</th>
            <th className="border border-black p-2">Appréciation</th>
          </tr>
        </thead>
        <tbody>
           {/* On boucle sur les moyennes par matière ici */}
           <tr className="border border-black h-8">
              <td className="p-2 text-left font-bold italic">Français</td>
              <td className="p-2 font-bold">14.50</td>
              <td className="p-2">2</td>
              <td className="p-2">29.00</td>
              <td className="p-2 italic">3è</td>
              <td className="p-2 text-[9px]">Bien</td>
           </tr>
           {/* ... à répéter pour chaque matière */}
        </tbody>
      </table>

      {/* 🏆 RÉSULTAT GLOBAL */}
      <div className="grid grid-cols-3 gap-0 border-2 border-black divide-x-2 divide-black mb-10 bg-gray-50">
        <div className="p-4 flex flex-col items-center">
          <p className="text-[10px] font-bold uppercase">Moyenne Générale</p>
          <p className="text-3xl font-black">{bulletin.moyenne.toFixed(2)}</p>
        </div>
        <div className="p-4 flex flex-col items-center">
          <p className="text-[10px] font-bold uppercase">Rang</p>
          <p className="text-3xl font-black">{bulletin.rang === 1 ? "1er" : `${bulletin.rang}è`}</p>
        </div>
        <div className="p-4 flex flex-col items-center">
          <p className="text-[10px] font-bold uppercase">Observation</p>
          <p className="text-sm font-bold mt-2 uppercase">{bulletin.moyenne >= 10 ? "Tableau d'Honneur" : "Effort soutenu requis"}</p>
        </div>
      </div>

      {/* ✒️ SIGNATURES */}
      <div className="flex justify-between mt-12 px-6 italic text-[10px]">
        <p className="border-t border-black pt-2 px-4">Le Parent</p>
        <p className="border-t border-black pt-2 px-4">Le Titulaire</p>
        <div className="text-center">
          <p className="font-bold uppercase underline">Le Censeur / Proviseur</p>
          <div className="h-20"></div> {/* Espace pour le cachet physique */}
        </div>
      </div>
    </div>
  );
}
