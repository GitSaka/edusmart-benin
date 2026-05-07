import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import GradesClient from "@/components/student/GradesClient";

export default async function StudentGradesPage() {
  const session = await auth();
  const user = session?.user as any;

  // 🛡️ Sécurité : Mur de fer
  if (!user || user.role !== "STUDENT") redirect("/login");

  // 🔍 Récupération des données (One-shot fetch)
  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    include: {
      classe: { 
        include: { _count: { select: { eleves: true } } } 
      },
      // On récupère TOUTES les notes de l'année pour gérer l'historique T1/T2/T3
      notes: {
        where: { anneeId: user.anneeId },
        include: { cours: { include: { matiere: true } } }
      },
      bulletins: {
        where: { anneeId: user.anneeId },
        orderBy: { trimestre: 'asc' }
      }
    }
  });

  if (!student) redirect("/login");

  return (
    <GradesClient 
      student={student} 
      initialNotes={student.notes} 
      initialBulletins={student.bulletins} 
    />
  );
}
