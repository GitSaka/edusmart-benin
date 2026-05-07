import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import de la session
import { redirect } from "next/navigation";
import AdminTimetableClient from "@/components/admin/AdminTimetableClient";

export default async function TimetablePage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Si pas de session, retour au login
  if (!ecoleId || !anneeId) {
    redirect("/login");
  }

  // ✅ RÉCUPÉRATION PARALLÈLE FILTRÉE (SaaS Ready)
  const [classes, allCours, fullGrid] = await Promise.all([
    // A. Classes de CETTE école pour CETTE année
    prisma.classe.findMany({
      where: { 
        ecoleId: ecoleId,
        anneeId: anneeId 
      },
      include: { serie: true },
      orderBy: { nom: "asc" }
    }),

    // B. Contrats de cours de CETTE école pour CETTE année
    prisma.cours.findMany({
      where: { 
        ecoleId: ecoleId,
        anneeId: anneeId 
      },
      include: { teacher: true, matiere: true, classe: true }
    }),

    // C. Grille complète (Emploi du temps) de CETTE année uniquement
    prisma.timetable.findMany({
      where: { 
        ecoleId: ecoleId,
        anneeId: anneeId 
      },
      include: { 
        cours: { 
          include: { teacher: true, matiere: true, classe: true } 
        } 
      }
    })
  ]);

  return (
    <AdminTimetableClient 
      dbClasses={classes} 
      dbCours={allCours} 
      fullGrid={fullGrid} 
    />
  );
}
