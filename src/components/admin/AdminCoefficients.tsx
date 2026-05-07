"use client";
import { useState, useTransition } from "react";
import { Calculator, Save, ChevronRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { updateCoefficientAction } from "@/lib/actions/coefficients";
import { toast, Toaster } from "sonner"; // ✅ Ajouté pour confirmer l'auto-save

export default function AdminCoefficients({ series = [], matieres = [] }: any) {
  const [selectedSerieId, setSelectedSerieId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleSave = async (matiereId: number, valeur: string, nomMatiere: string) => {
    if (!valeur || !selectedSerieId) return;
    
    const formData = new FormData();
    formData.append("valeur", valeur);
    formData.append("matiereId", matiereId.toString());
    formData.append("serieId", selectedSerieId);

    startTransition(async () => {
      const res = await updateCoefficientAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        // ✅ Petit toast discret pour confirmer l'auto-save
        toast.success(`${nomMatiere} : Coeff mis à jour`, { duration: 1500 });
      }
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 px-4 animate-in fade-in duration-700">
      <Toaster position="top-right" richColors />
      <header className="mb-10 pt-6">
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600"><Calculator size={20} /></div>
           <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Matrice des Coefficients</h1>
        </div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic">Étape 4 : Régler le poids des matières par série</p>
      </header>

      {/* 1. CHOIX DE LA SÉRIE */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shadow-inner"><AlertCircle size={18} /></div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase italic leading-none mb-1">Ciblage Série</p>
              <h3 className="text-sm font-black text-gray-800">Quelle série configurer ?</h3>
           </div>
        </div>
        <select 
          onChange={(e) => setSelectedSerieId(e.target.value)}
          className="bg-gray-50 border-none rounded-xl px-6 py-4 text-sm font-black text-emerald-600 outline-none cursor-pointer min-w-[250px] appearance-none"
        >
          <option value="">Sélectionner une Série...</option>
          {series.map((s: any) => (
            <option key={s.id} value={s.id}>{s.nom} ({s.level?.nom})</option>
          ))}
        </select>
      </div>

      {/* 2. TABLEAU DES COEFFICIENTS */}
      {selectedSerieId ? (
        <div className="bg-white overflow-x-auto rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                <th className="px-8 py-6">Matière</th>
                <th className="px-8 py-6 text-center">Coefficient Actuel</th>
                <th className="px-8 py-6 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {matieres.map((m: any) => {
                // ✅ On cherche si un coeff existe déjà pour cette série/matière dans les datas de la DB
                const currentCoeff = m.coefficients?.find((c: any) => c.serieId === parseInt(selectedSerieId));
                
                return (
                  <tr key={m.id} className="group hover:bg-emerald-50/20 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-emerald-500 transition-colors"><Save size={14}/></div>
                        <span className="font-black text-gray-800 text-sm uppercase italic tracking-tight">{m.nom}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <input 
                        // ✅ KEY CRITIQUE : Force React à vider/remplir l'input quand on change de série
                        key={`${selectedSerieId}-${m.id}`} 
                        type="number"
                        defaultValue={currentCoeff?.valeur || ""}
                        onBlur={(e) => handleSave(m.id, e.target.value, m.nom)}
                        placeholder="0"
                        className="w-20 bg-gray-50 border-2 border-transparent focus:border-emerald-500/20 rounded-xl px-4 py-3 text-center font-black text-lg text-emerald-600 outline-none transition-all shadow-inner"
                      />
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="inline-flex items-center gap-2 text-[9px] font-black text-gray-300 uppercase italic">
                         {isPending ? (
                            <><Loader2 size={12} className="animate-spin text-emerald-500" /> Sauvegarde...</>
                         ) : (
                            <><CheckCircle2 size={12} className="text-gray-200" /> Synchronisé</>
                         )}
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/30">
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic px-10">
             Veuillez sélectionner une série pour charger la matrice des coefficients
           </p>
        </div>
      )}
    </div>
  );
}
