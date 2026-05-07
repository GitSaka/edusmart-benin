"use client";
import { useState } from "react";
import { BookOpen, Trash2, Edit3, ExternalLink, Eye, EyeOff, Loader2} from "lucide-react";
import { toast } from "sonner";
import { deleteBookAction, togglePublishAction } from "@/lib/actions/library";
import Link from "next/link"; // 👈 Pour la navigation Next.js
export default function LibraryTable({ initialDocuments }: { initialDocuments: any[] }) {
  const [docs, setDocs] = useState(initialDocuments);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // 🔄 1. CHANGER LE STATUT (MODE RÉACTIF)
  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    // Mise à jour immédiate côté client (Optimistic)
    setDocs(prev => prev.map(d => d.id === id ? { ...d, isPublished: !currentStatus } : d));
    
    const res = await togglePublishAction(id, currentStatus);
    
    if (res.success) {
      toast.success(!currentStatus ? "L'ouvrage est en ligne" : "L'ouvrage est masqué");
    } else {
      // Si erreur : on remet l'ancien statut
      setDocs(prev => prev.map(d => d.id === id ? { ...d, isPublished: currentStatus } : d));
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // 🗑️ 2. SUPPRIMER LE LIVRE (NETTOYAGE COMPLET)
  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer "${title}" ? Cette action est irréversible.`)) return;

    setProcessingId(id);
    const toastId = toast.loading(`Suppression de "${title}" en cours...`);

    const res = await deleteBookAction(id);

    if (res.success) {
      setDocs(prev => prev.filter(d => d.id !== id));
      toast.success("Ouvrage et fichiers supprimés avec succès", { id: toastId });
    } else {
      toast.error(res.error || "Échec de la suppression", { id: toastId });
    }
    setProcessingId(null);
  };

  return (
    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest">Ouvrage</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest">Classification</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest">Type</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {docs.map((doc) => (
              <tr key={doc.id} className={`hover:bg-gray-50/40 transition-colors group ${processingId === doc.id ? 'opacity-50 pointer-events-none' : ''}`}>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-16 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 relative">
                      {doc.couverture ? (
                        <img src={doc.couverture} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <BookOpen className="m-auto text-gray-300 absolute inset-0 m-auto" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-black text-sm text-gray-900 uppercase leading-tight">{doc.titre}</p>
                      <p className="text-[9px] text-gray-400 font-bold italic uppercase">{doc.auteur || "EduSmart HQ"}</p>
                    </div>
                  </div>
                </td>

                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-primary uppercase tracking-tighter">{doc.matiere}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase italic tracking-tighter">{doc.level?.nom}</span>
                  </div>
                </td>

                <td className="px-8 py-6">
                  <button 
                    onClick={() => handleToggleStatus(doc.id, doc.isPublished)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[9px] font-black uppercase transition-all shadow-sm ${
                      doc.isPublished 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" 
                      : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
                    }`}
                  >
                    {doc.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                    {doc.isPublished ? "En ligne" : "Masqué"}
                  </button>
                </td>

                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-primary uppercase tracking-tighter">{doc.type}</span>

                  </div>
                </td>

                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* 📖 LIRE (Redirection vers ton Reader Universel) */}


                    <Link 
                    href={`/super-admin/library/${doc.id}`} 
                    className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-primary hover:bg-primary/5 transition-all shadow-sm flex items-center justify-center"
                    >
                    <ExternalLink size={18} /> 
                    </Link>

                   
                    <button 
                      className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-amber-600 hover:bg-amber-50 transition-all shadow-sm"
                      title="Modifier"
                    >
                      <Edit3 size={18} />
                    </button>

                    <button 
                      onClick={() => handleDelete(doc.id, doc.titre)}
                      className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm"
                      title="Supprimer"
                    >
                      {processingId === doc.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
