import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import de la session
import { redirect } from "next/navigation";
import AdminTeachersList from "@/components/admin/AdminTeachersList";

export default async function TeachersPage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Pas de session = Pas d'accès
  if (!ecoleId) {
    redirect("/login");
  }

  // ✅ LANCEMENT SIMULTANÉ FILTRÉ (SaaS Ready)
  const [teachers, matieres] = await Promise.all([
    // 2. Uniquement les profs de CETTE école
    prisma.teacher.findMany({
      where: {
        ecoleId: ecoleId // 🔒 Le verrou SaaS est ici
      },
      include: { 
        matiere: true,
        // On ne compte que les classes de l'ANNÉE EN COURS pour ce prof
        classes: {
          where: { anneeId: anneeId }
        }
      },
      orderBy: { nom: 'asc' }
    }),
    
    // 3. Uniquement les matières configurées par CETTE école
    prisma.matiere.findMany({
      where: {
        ecoleId: ecoleId // 🔒 Isolation pédagogique
      },
      orderBy: { nom: 'asc' }
    })
  ]);

  return (
    <AdminTeachersList 
      initialTeachers={teachers} 
      initialMatieres={matieres} 
    />
  );
}
