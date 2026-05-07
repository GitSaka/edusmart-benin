import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import de la session
import { redirect } from "next/navigation";
import AdminAddTeacher from "@/components/forms/AdminAddTeacher";

export default async function AddTeacherPage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Pas de session = Pas d'accès
  if (!ecoleId || !anneeId) {
    redirect("/login");
  }

  // 2. RÉCUPÉRATION PARALLÈLE (FILTRÉE)
  const [matieres, classes] = await Promise.all([
    // ✅ Uniquement les matières de CETTE école
    prisma.matiere.findMany({ 
      where: { ecoleId: ecoleId },
      orderBy: { nom: 'asc' } 
    }),
    // ✅ Uniquement les classes de CETTE école ET de CETTE année
    prisma.classe.findMany({ 
      where: { 
        ecoleId: ecoleId,
        anneeId: anneeId 
      },
      orderBy: { nom: 'asc' } 
    })
  ]);

  return (
    <AdminAddTeacher 
      dbMatieres={matieres} 
      dbClasses={classes} 
    />
  );
}
