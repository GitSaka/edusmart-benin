"use client";

import { useState, useEffect } from "react";
import { Library, Plus, Trash2, FileText, CheckCircle, Search, Filter } from "lucide-react";
import { toast } from "sonner";

import { deleteEpreuveAction, getEpreuvesAction } from "@/lib/actions/archives";
import ArchiveRow from "@/components/shared/ArchiveRow";
import AddEpreuveModal from "../forms/AddEpreuveModal";

export default function ArchivesPage({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [epreuves, setEpreuves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  

  // 📥 CHARGEMENT DES DONNÉES
  const fetchEpreuves = async () => {
    setLoading(true);
    const res = await getEpreuvesAction();
    if (res.success) setEpreuves(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchEpreuves(); }, []);

  // 🗑️ SUPPRESSION SÉCURISÉE
  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette archive ?")) return;
    const res = await deleteEpreuveAction(id);
    if (res.success) {
      toast.success("Archive supprimée");
      fetchEpreuves();
    } else {
      toast.error(res.error);
    }
  };

  

  // 🔍 FILTRAGE PAR RECHERCHE
  const filtered = epreuves.filter(e => 
    e.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.matiere.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-2 lg:p-10 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="bg-primary/10 p-4 rounded-3xl text-primary shadow-inner">
            <Library size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Médiathèque</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2 italic">
              {epreuves.length} Documents partagés au total
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-primary shadow-xl shadow-gray-200 transition-all active:scale-95 border border-white/5"
        >
          <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
            <Plus size={16} className="text-yellow-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Ajouter une épreuve</span>
        </button>
      </div>

      {/* --- BARRE DE RECHERCHE --- */}
      <div className="relative mb-10">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
        <input 
          type="text"
          placeholder="Rechercher une épreuve (Maths, BAC, 2023...)"
          className="w-full bg-white border-2 border-gray-50 rounded-3xl py-5 pl-16 pr-8 text-sm font-bold shadow-sm outline-none focus:border-primary/20 transition-all"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- GRILLE DES ÉPREUVES --- */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Chargement de la bibliothèque...</div>
      ) : (
       <div className="space-y-3">
  {filtered.length > 0 ? (
    filtered.map((epreuve) => (
      <ArchiveRow
        key={epreuve.id} 
        epreuve={epreuve} 
        user={user} 
        onDelete={handleDelete} 
        isTeacher = {true}
      />
    ))
  ) : (
    <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
       <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Aucun document trouvé</p>
    </div>
  )}
</div>
      )}

      {/* --- MODAL D'AJOUT --- */}
      {/* 🎯 Dans ta page principale */}
            <AddEpreuveModal 
            isOpen={isOpen} 
            onClose={() => setIsOpen(false)} 
            onSuccess={() => {
                fetchEpreuves(); // 🔄 Pour que la nouvelle épreuve apparaisse de suite
                setIsOpen(false); // On ferme aussi le modal après le succès
            }}

      />
    </div>
  );
}