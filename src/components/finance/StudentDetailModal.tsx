"use client";
import { X } from "lucide-react";

export function StudentDetailModal({ student, onClose }: any) {
  if (!student) return null;

   const scolarite = Number(student.scolariteTotale || 0);
  const dejaPaye = student.paiements?.reduce((acc: number, p: any) => acc + (p.montant || 0), 0) || 0;
  const resteReel = scolarite - dejaPaye;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl border-2 border-gray-900 shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[80vh]">
        <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
          <h2 className="text-xs font-black uppercase italic">{student.nom} {student.prenom}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={24}/></button>
        </div>
        <div className="p-8 overflow-y-auto space-y-6">
          <div className="bg-rose-50 p-4 border-l-4 border-rose-600 flex justify-between items-center">
            <span className="text-[10px] font-black text-rose-400 uppercase">Reste à recouvrer</span>
            <span className="text-xl font-black text-rose-600">{resteReel.toLocaleString()} F</span>
          </div>
          <div className="space-y-2">
            {student.paiements?.map((p: any) => (
              <div key={p.id} className="flex justify-between p-4 bg-gray-50 text-[10px] font-black border border-gray-100">
                <span>{new Date(p.date || p.createdAt).toLocaleDateString('fr-BJ')} - {p.tranche}</span>
                <span>{p.montant.toLocaleString()} F</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
