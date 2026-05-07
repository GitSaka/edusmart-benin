import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import LibraryTable from "@/components/super-admin/LibraryTable"; // On va créer ce composant

export default async function LibraryListPage() {
  const documents = await prisma.library.findMany({
    include: { level: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 italic tracking-tighter">
            Gestion <span className="text-primary text-2xl not-italic ml-1 font-bold">Bibliothèque</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">
            Inventaire National • {documents.length} ouvrages en ligne
          </p>
        </div>

        <Link 
          href="/super-admin/library/new" 
          className="flex items-center gap-3 bg-gray-900 text-white px-8 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-xl active:scale-95"
        >
          <Plus size={18} /> Ajouter un ouvrage
        </Link>
      </div>

      {/* On passe les données au composant Client */}
      <LibraryTable initialDocuments={documents} />
    </div>
  );
}
