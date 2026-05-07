import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import de la session
import { redirect } from "next/navigation";
import AdminStudentsList from "@/components/admin/AdminStudentsList";

export default async function StudentsListPage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Pas de session = Pas d'accès
  if (!ecoleId || !anneeId) {
    redirect("/login");
  }

  // 2. RÉCUPÉRATION PARALLÈLE FILTRÉE (SaaS + Temps)
  const [levels, students] = await Promise.all([
    // ✅ Uniquement les niveaux de CETTE école
    prisma.level.findMany({
      where: { ecoleId: ecoleId },
      include: { 
        classes: {
          where: { anneeId: anneeId } // Uniquement les classes de cette année
        } 
      },
      orderBy: { nom: 'asc' }
    }),

    // ✅ Uniquement les élèves inscrits dans CETTE école pour CETTE année
    prisma.student.findMany({
      where: { 
        ecoleId: ecoleId,
        anneeId: anneeId 
      },
      include: { 
        classe: true,
        parent: true // Utile pour afficher le nom du père/mère
      },
      take: 50,
      orderBy: { nom: 'asc' }
    })
  ]);

  return (
    <AdminStudentsList 
      initialLevels={levels} 
      initialStudents={students} 
    />
  );
}
