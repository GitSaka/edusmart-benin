// app/(super-admin)/super-admin/library/page.tsx
import { prisma } from "@/lib/prisma";
import LibraryUploadForm from "@/components/super-admin/LibraryUploadForm";

export default async function LibraryAdminPage() {
  // 1. On récupère les niveaux (3ème, Tle...) depuis la base Neon
  // pour que ton formulaire puisse les lister dans le menu déroulant
  const levels = await prisma.level.findMany({
    orderBy: { nom: 'asc' }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 italic tracking-tighter">
          Gestion de la <span className="text-primary">Bibliothèque</span>
        </h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">
          Ajouter des annales et fascicules pour tout le Bénin
        </p>
      </div>

      {/* 🎯 ON APPELLE TON COMPOSANT ICI */}
      <LibraryUploadForm levels={levels} />
    </div>
  );
}
