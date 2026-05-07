import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Importation de la session
import { redirect } from "next/navigation";
import AdminAcademicCoursClient from "@/components/admin/AdminAcademicCoursClient";

export default async function AdminCoursPage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Pas de session = Pas d'accès au moteur de l'école
  if (!ecoleId || !anneeId) {
    redirect("/login");
  }

  // ✅ RÉCUPÉRATION PARALLÈLE (Tout est verrouillé par ecoleId et anneeId)
  const [teachers, matieres, classes, existingCours] = await Promise.all([
    // A. Profs de CETTE école
    prisma.teacher.findMany({
      where: { ecoleId: ecoleId },
      include: { matiere: true, classes: true },
      orderBy: { nom: "asc" }
    }),
    // B. Matières configurées par CETTE école
    prisma.matiere.findMany({
      where: { ecoleId: ecoleId },
      orderBy: { nom: "asc" }
    }),
    // C. Classes de CETTE école pour CETTE année
    prisma.classe.findMany({
      where: { 
        ecoleId: ecoleId,
        anneeId: anneeId 
      },
      include: { serie: true },
      orderBy: { nom: "asc" }
    }),
    // D. Répertoire des cours de CETTE année uniquement
    prisma.cours.findMany({
      where: { 
        ecoleId: ecoleId,
        anneeId: anneeId 
      },
      include: {
        teacher: true,
        matiere: true,
        classe: true
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <AdminAcademicCoursClient 
      dbTeachers={teachers} 
      dbMatieres={matieres} 
      dbClasses={classes} 
      dbCours={existingCours} 
    />
  );
}
