import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Importation de la session
import { redirect } from "next/navigation";
import AttendanceManager from "@/components/teacher/AttendanceClient";

export default async function AttendancePage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Pas de session, pas d'école = Pas d'appel
  if (!session?.user?.id || !ecoleId || !anneeId) {
    redirect("/login");
  }

  // 2. RÉCUPÉRER LE PROF DANS SON ÉCOLE
  const teacher = await prisma.teacher.findFirst({
    where: { 
      userId: session.user.id,
      ecoleId: ecoleId // 🔒 Verrouillage SaaS
    },
    select: { id: true, matiere: { select: { nom: true } } }
  });

  if (!teacher) redirect("/login");

  // 3. LOGIQUE DU TEMPS BÉNINOIS (GMT+1)
  const now = new Date();
  const days = ["DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
  const today = days[now.getDay()];
  const currentTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });

  // 4. RÉCUPÉRATION DES DONNÉES FILTRÉES (SaaS + Année + Jour)
  const teacherData = await prisma.teacher.findFirst({
    where: { id: teacher.id, ecoleId },
    include: {
      classes: {
        where: { 
          ecoleId, 
          anneeId // 📅 On ne montre que les classes de cette année
        },
        include: {
          eleves: { 
            where: { anneeId }, // Uniquement les élèves de cette année
            orderBy: { nom: "asc" },
            include: {
              presences: {
                where: {
                  date: { gte: new Date(new Date().setHours(0,0,0,0)) }, // Depuis 00h
                  ecoleId, // 🔒 Verrouillage des absences
                  anneeId, // 📅 Verrouillage temporel
                  estPresent: false
                }
              }
            }
          },
          // On ne récupère que les cours de ce prof pour cette école/année
          cours: { 
            where: { teacherId: teacher.id, ecoleId, anneeId }, 
            include: { timetable: true } 
          }
        }
      }
    }
  });

  if (!teacherData) redirect("/login");

  // 5. DÉTECTION DU COURS ACTIF (Radar Temps Réel)
  const classesWithActiveCourse = teacherData.classes.map((cls: any) => {
    const activeSlot = cls.cours.flatMap((c: any) => c.timetable).find((t: any) => 
      t.jour === today && currentTime >= t.heureDebut && currentTime <= t.heureFin
    );

    return {
      ...cls,
      currentCoursId: activeSlot?.coursId || (cls.cours[0]?.id || 0)
    };
  });

  return (
    <AttendanceManager 
      allClasses={classesWithActiveCourse} 
      matiere={teacher.matiere?.nom || "Discipline"} 
    />
  );
}
