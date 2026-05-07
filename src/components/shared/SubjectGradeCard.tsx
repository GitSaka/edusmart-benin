import { ClipboardCheck, Target } from "lucide-react";

interface SubjectGradeCardProps {
  matiere: string;
  coeff: number;
  interros: number[]; // Tableau de 4 notes max
  devoirs: number[];  // Tableau de 2 notes max
}

export default function SubjectGradeCard({ matiere, coeff, interros, devoirs }: SubjectGradeCardProps) {
  // Calcul de la moyenne simplifiée pour l'affichage
  const avg = [...interros, ...devoirs].reduce((a, b) => a + b, 0) / (interros.length + devoirs.length);

  return (
    <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-black text-gray-900 uppercase">{matiere}</h3>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Coefficient : {coeff}</span>
        </div>
        <div className={`px-4 py-2 rounded-2xl font-black text-sm ${avg >= 10 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {avg.toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* BLOC GAUCHE : INTERROGATIONS (4 Bulles) */}
        <div className="space-y-3 bg-gray-50/50 p-4 rounded-3xl border border-gray-50">
          <p className="text-[9px] font-black text-primary uppercase flex items-center gap-2">
            <ClipboardCheck size={12} /> Interrogations
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className={`h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${
                interros[idx] !== undefined 
                ? (interros[idx] >= 10 ? 'bg-white text-green-600 border-green-100' : 'bg-white text-red-600 border-red-100')
                : 'bg-transparent border-dashed border-gray-200 text-gray-300'
              }`}>
                {interros[idx] !== undefined ? interros[idx] : '-'}
              </div>
            ))}
          </div>
        </div>

        {/* BLOC DROITE : DEVOIRS (2 Blocs) */}
        <div className="space-y-3 bg-primary/5 p-4 rounded-3xl border border-primary/10">
          <p className="text-[9px] font-black text-primary uppercase flex items-center gap-2">
            <Target size={12} /> Devoirs
          </p>
          <div className="space-y-2">
            {[0, 1].map((idx) => (
              <div key={idx} className={`h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${
                devoirs[idx] !== undefined 
                ? (devoirs[idx] >= 10 ? 'bg-white text-green-600 border-green-100' : 'bg-white text-red-600 border-red-100')
                : 'bg-transparent border-dashed border-primary/10 text-primary/30'
              }`}>
                {devoirs[idx] !== undefined ? `DS ${idx+1}: ${devoirs[idx]}` : `DS ${idx+1}: -`}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}