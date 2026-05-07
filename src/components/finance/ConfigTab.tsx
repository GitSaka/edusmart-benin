"use client";
import { useState, useMemo } from "react";
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel,
  flexRender, 
  createColumnHelper 
} from "@tanstack/react-table";
import { Search, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { updateLevelPriceAction } from "@/lib/actions/finance";
import { toast } from "sonner";

interface ConfigTabProps {
  levels: any[];
  ecoleId: number;
  anneeId: number;
}

export default function ConfigTab({ levels, ecoleId, anneeId }: ConfigTabProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [loadingId, setLoadingId] = useState<number | null>(null);
  
  const columnHelper = createColumnHelper<any>();

  // 🧠 FONCTION DE MISE À JOUR (Celle que tu as validée)
  const handleUpdatePrice = async (levelId: number, newPrice: string) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) return toast.error("Montant invalide");
    setLoadingId(levelId);
    const res = await updateLevelPriceAction(levelId, price, ecoleId, anneeId);
    if (res.success) toast.success("Tarif propagé avec succès !");
    else toast.error(res.error || "Erreur de mise à jour");
    setLoadingId(null);
  };

  // 🎯 COLONNES (SÉLECTION + TES BOUTONS)
  const columns = useMemo(() => [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="cursor-pointer accent-primary w-4 h-4"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="cursor-pointer accent-primary w-4 h-4"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    }),
    columnHelper.accessor("nom", {
      header: "Niveau Scolaire",
      cell: (info) => <span className="text-xs font-black text-gray-900 uppercase tracking-tighter">{info.getValue()}</span>,
    }),
    columnHelper.accessor("_count.classes", {
      header: "Effectif",
      cell: (info) => <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-lg italic">{info.getValue() || 0} classes</span>,
    }),
    columnHelper.accessor("scolariteBase", {
    header: "Scolarité (FCFA)",
    cell: (info) => {
        const val = info.getValue(); // 🎯 C'est ici qu'on récupère la valeur de la DB
        return (
        <div className="relative w-40 group">
            <input 
            id={`price-${info.row.original.id}`}
            key={`${info.row.original.id}-${val}`} // ✨ FORCE l'affichage de la valeur actuelle
            type="number" 
            defaultValue={val ?? 0}
            className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-xs font-black outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-gray-300">CFA</span>
        </div>
        );
    },
    }),

    columnHelper.display({
  id: "action",
  header: () => <div className="text-right uppercase text-[9px]">Action</div>,
  cell: (info) => {
    const rowId = info.row.original.id;
    const initialPrice = info.row.original.scolariteBase || 0;
    
    // 💡 État local pour ce champ spécifique (si tu veux être ultra précis)
    // Mais on peut faire plus simple en récupérant la valeur en direct :
    
    return (
      <div className="text-right">
        <button 
          id={`btn-${rowId}`}
          disabled={loadingId === rowId}
          onClick={() => {
            const input = document.getElementById(`price-${rowId}`) as HTMLInputElement;
            // 🛡️ Double vérification avant d'envoyer
            if (parseFloat(input.value) === initialPrice) {
              return toast.error("Le prix est identique à l'actuel.");
            }
            handleUpdatePrice(rowId, input.value);
          }}
          className="px-6 py-2.5 bg-gray-900 text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
        >
          {loadingId === rowId ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
          Mettre à jour
        </button>
      </div>
    );
  },
}),

  ], [loadingId]);

  const table = useReactTable({
    data: levels,
    columns,
    state: { globalFilter, rowSelection },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
        <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-relaxed">
           ⚠️ Attention : La modification impactera tous les élèves du niveau sélectionné.
        </p>
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="flex bg-white p-3 border border-gray-200 justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
          <input 
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filtrer un niveau..."
            className="w-full pl-10 pr-3 py-2 bg-gray-50 border-none text-[10px] font-black uppercase outline-none"
          />
        </div>
        
        {Object.keys(rowSelection).length > 0 && (
          <div className="text-[9px] font-black text-primary uppercase animate-pulse">
            {Object.keys(rowSelection).length} lignes sélectionnées
          </div>
        )}
      </div>

     {/* 📱 On ajoute overflow-x-auto pour permettre le scroll horizontal sur mobile */}
        <div className="bg-white border border-gray-200 overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]"> 
            {/* 👆 min-w-[800px] garantit que le bouton ne disparaît pas */}
            <thead>
            {table.getHeaderGroups().map(hg => (
                <tr key={hg.id} className="bg-gray-50 border-b border-gray-200">
                {hg.headers.map(h => (
                    <th key={h.id} className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                ))}
                </tr>
            ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.map(row => (
                <tr key={row.id} className={`hover:bg-gray-50/50 transition-colors ${row.getIsSelected() ? 'bg-primary/5' : ''}`}>
                {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-3 whitespace-nowrap"> 
                    {/* 👆 whitespace-nowrap empêche le contenu de se casser sur 2 lignes */}
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                ))}
                </tr>
            ))}
            </tbody>
        </table>
        </div>

            </div>
  );
}
