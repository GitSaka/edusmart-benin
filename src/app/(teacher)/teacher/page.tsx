import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TeacherDashboardClient from "@/components/teacher/TeacherDashboardClient";

export default async function TeacherDashboardPage() {
  const session = await auth();

  // 1. SÉCURITÉ : Si pas de session, on dégage
  if (!session?.user?.id) redirect("/login");

  // 2. REQUÊTE UNIQUE : Profil + Matière + Classes + Somme des élèves
  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    include: {
      matiere: true,
      classes: {
        include: { 
          level: true, // ✅ Pour afficher "6ème", "3ème"
          _count: { select: { eleves: true } } // ✅ Récupère le nombre d'élèves par classe directement
        }
      },
      _count: { select: { cours: true, ressources: true } } // ✅ Stats rapides
    }
  });
  console.log(teacher)

  // 3. SÉCURITÉ : Si l'ID existe mais n'est pas un Teacher
  if (!teacher) redirect("/login");

  // 4. CALCULS RAPIDES (Côté Serveur)
  const totalStudents = teacher.classes.reduce((acc, c) => acc + c._count.eleves, 0);

  return (
    <TeacherDashboardClient 
      teacherData={teacher} 
      stats={{ 
        totalStudents,
        nbClasses: teacher.classes.length,
        nbRessources: teacher._count.ressources
      }} 
    />
  );
}
