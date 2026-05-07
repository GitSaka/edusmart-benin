// app/(super-admin)/super-admin/library/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import EduReader from "@/components/shared/EduReader";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AdminReaderPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminReaderPage({ params }: AdminReaderPageProps) {
  const session = await auth();
   const resolvedParams = await params;
  const id = resolvedParams.id;
  // 🛡️ Double sécurité
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/login");

  // 🔍 Récupération du livre
  const book = await prisma.library.findUnique({
    where: { id: parseInt(id) },
    include: { level: true }
  });

  if (!book) notFound();

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 🛠️ Mini Header de contrôle pour l'Admin */}
      <div className="px-6 py-3 bg-gray-50 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/super-admin/library" 
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tighter text-gray-900">
              Aperçu : {book.titre}
            </h1>
            <p className="text-[9px] font-bold text-primary uppercase italic">
              Niveau : {book.level.nom} | Type : {book.type}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-lg uppercase">
             Mode Admin (Accès Total)
           </span>
        </div>
      </div>

      {/* 📖 Le Lecteur Universel */}
      <div className="flex-1">
        <EduReader 
          url={book.fichierUrl} 
          isProtected={false} // En tant qu'admin, on ne se bloque pas soi-même
          userName="ADMIN_MASTER"
        />
      </div>
    </div>
  );
}
