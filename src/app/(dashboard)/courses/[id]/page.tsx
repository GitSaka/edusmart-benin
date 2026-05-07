import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import CoursePlayerClient from "@/components/student/CoursePlayerClient";
// ✅ Vérifie le chemin

// ... tes imports

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;
  const userId = session?.user?.id;

  if (!userId || !ecoleId || !anneeId) redirect("/login");

  const { id } = await params;
  const ressourceId = parseInt(id);

  // 1. RÉCUPÉRATION DU PROFIL ÉLÈVE
  const student = await prisma.student.findUnique({
    where: { userId: userId },
    select: { id: true, classeId: true } // On prend aussi sa classeId
  });

  if (!student) redirect("/login");

  // 2. RÉCUPÉRATION SÉCURISÉE (Isolation Totale)
  const ressource = await prisma.ressource.findFirst({
    where: { 
      id: ressourceId, 
      ecoleId,
      isPublished: true,
      // 🔒 LE VERROU : On vérifie que l'élève a le droit de voir CE cours précis
      OR: [
        { classeId: student.classeId, studentId: null }, // Cours de sa classe
        { studentId: student.id }                        // Son cours privé
      ]
    },
    include: {
      teacher: { select: { nom: true, prenom: true } },
      cours: { include: { matiere: true } },
      lecon: { 
        include: { 
          ressources: { 
            // 🔒 Sommaire aussi filtré : il ne voit pas les cours privés des autres dans la liste
            where: { 
              isPublished: true, 
              anneeId,
              OR: [
                { studentId: null },
                { studentId: student.id }
              ]
            },
            orderBy: { createdAt: "asc" },
            select: { id: true, titre: true, type: true }
          } 
        } 
      }
    }
  });

  if (!ressource) return notFound(); // 🛡️ Si c'est le cours privé d'un autre, il reçoit un 404.

  // 3. LOGIQUE D'AUDIT (Identique à ton code)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentLog = await prisma.activityLog.findFirst({
    where: { userId, ressourceId, date: { gte: oneHourAgo } }
  });

  if (!recentLog) {
    await prisma.activityLog.create({
      data: {
        studentId: student.id,
        userId,
        ecoleId,
        anneeId,
        ressourceId,
        action: `LECTURE : ${ressource.titre}`,
        duree: 0, 
      }
    });
  }

  return <CoursePlayerClient ressource={ressource} />;
}
