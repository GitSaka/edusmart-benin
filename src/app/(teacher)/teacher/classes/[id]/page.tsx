import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Pour la sécurité
import ClassDetailsClient from "@/components/teacher/ClassDetailsClient";
import { notFound, redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  // 1. Next.js 15 : On attend les params
  const { id } = await params;
  const classeId = parseInt(id);
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  // 2. RÉCUPÉRATION AVEC SÉCURITÉ "MUR DE FER"
  // On récupère la classe SEULEMENT si elle est liée à ce professeur
  const classeData = await prisma.classe.findFirst({
  where: { 
    id: classeId,
    teachers: { some: { userId: session.user.id } }
  },
  include: {
    serie: { include: { level: true } },
    eleves: { // ✅ On utilise le nom exact de ton schéma : "eleves"
      orderBy: { nom: "asc" },
    },
    _count: { 
      select: { eleves: true } // ✅ On compte "eleves"
    }
  },
});


  // 3. SÉCURITÉ : Si la classe n'existe pas OU n'appartient pas au prof
  if (!classeData) return notFound();

  return (
    <div className="py-2">
      <ClassDetailsClient 
        classe={classeData} 
       nbStudents={classeData._count.eleves}  
      />
    </div>
  );
}
