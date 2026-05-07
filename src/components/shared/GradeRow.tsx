// import { TypeNote } from "@prisma/client";

// interface GradeRowProps {
//   matiere: string;
//   note: number;
//   type: TypeNote;
//   coeff: number;
//   date: string;
// }

// export default function GradeRow({ matiere, note, type, coeff, date }: GradeRowProps) {
//   return (
//     <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-50 hover:border-primary/20 transition-all group">
//       <div className="flex items-center gap-4">
//         <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
//           note >= 10 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
//         }`}>
//           {note}
//         </div>
//         <div>
//           <p className="font-bold text-gray-800 text-sm uppercase">{matiere}</p>
//           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Coeff : {coeff} • {date}</p>
//         </div>
//       </div>
      
//       <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest border ${
//         type === 'DS' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-primary border-blue-100'
//       }`}>
//         {type === 'DS' ? 'DEVOIR' : 'INTERRO'}
//       </span>
//     </div>
//   );
// }

import { TypeNote } from "@prisma/client";

interface GradeRowProps {
  matiere: string;
  note: number;
  type: TypeNote;
  coeff: number;
  date: string;
}

export default function GradeRow({ matiere, note, type, coeff, date }: GradeRowProps) {
  // 🎯 On normalise la vérification pour éviter l'erreur de type
  const isDevoir = (type as string) === 'DS' || (type as string) === 'DEVOIR';

  return (
    <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-50 hover:border-primary/20 transition-all group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
          note >= 10 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        }`}>
          {note}
        </div>
        <div>
          <p className="font-bold text-gray-800 text-sm uppercase">{matiere}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Coeff : {coeff} • {date}</p>
        </div>
      </div>
      
      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest border ${
        isDevoir ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-primary border-blue-100'
      }`}>
        {isDevoir ? 'DEVOIR' : 'INTERRO'}
      </span>
    </div>
  );
}
