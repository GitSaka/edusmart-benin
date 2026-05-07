import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // ✅ Importation de la session
import TeacherGradeClient from "@/components/teacher/TeacherGradesClient";

export default async function TeacherNotesPage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Pas de session, pas d'école = Pas d'accès aux notes
  if (!session?.user?.id || !ecoleId || !anneeId) {
    redirect("/login");
  }

  // 2. RÉCUPÉRATION DU PROF DANS SON ÉCOLE
  const teacher = await prisma.teacher.findFirst({
    where: { 
      userId: session.user.id,
      ecoleId: ecoleId // 🔒 Verrouillage SaaS
    },
    select: { id: true, matiere: { select: { nom: true } } }
  });

  if (!teacher) redirect("/login");

  // 3. RÉCUPÉRATION GLOBALE FILTRÉE (SaaS + Temps)
  const teacherData = await prisma.teacher.findUnique({
    where: { id: teacher.id },
    include: {
      matiere: true,
      classes: {
        where: { 
          ecoleId: ecoleId,
          anneeId: anneeId // 📅 Uniquement les classes de cette année
        },
        include: {
          eleves: { 
            where: { anneeId: anneeId }, // 📅 Uniquement les élèves de cette année
            orderBy: { nom: "asc" },
            include: {
              notes: {
                where: { 
                  cours: { teacherId: teacher.id },
                  anneeId: anneeId // 🔒 On ne lit que les notes de l'année active
                }
              }
            }
          },
          cours: {
            where: { 
              teacherId: teacher.id, 
              ecoleId: ecoleId,
              anneeId: anneeId 
            },
            include: { notes: true }
          }
        }
      }
    }
  });

  if (!teacherData) redirect("/login");

  const classes = (teacherData as any).classes;
  const matiereNom = teacher.matiere?.nom || "Discipline";

  return (
    <TeacherGradeClient 
      allClasses={classes} 
      matiere={matiereNom} 
      teacherId={teacher.id}
    />
  );
}
