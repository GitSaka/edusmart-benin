import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TeacherDashboardWrapper from "@/components/layout/TeacherDashboardWrapper";
import { UserProvider } from "@/providers/UserProvider";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Vérification Session, Rôle et École
  if (!session?.user?.id || session.user.role !== "TEACHER" || !ecoleId) {
    redirect("/login");
  }

  // 2. REQUÊTE FILTRÉE : Profil + Matière + Classes de l'ANNÉE EN COURS
  const dbUser = await prisma.user.findUnique({
    where: { 
      id: session.user.id,
      ecoleId: ecoleId // 🔒 Verrouillage SaaS
    },
    include: {
      teacher: {
        include: {
          matiere: true,
          // 📅 IMPORTANT : On ne montre au prof que ses classes de CETTE année
          classes: { 
            where: { 
              ecoleId: ecoleId,
              anneeId: anneeId 
            },
            include: { level: true } 
          }
        }
      }
    }
  });

  if (!dbUser || !dbUser.teacher) {
    redirect("/login");
  }

  const teacher = dbUser.teacher;

  // 3. PRÉPARATION DU "SAC À DOS" (UserData)
  const userData = {
    id: dbUser.id,
    teacherId: teacher.id, // ✅ Ajouté pour faciliter les actions de notes
    name: teacher.nom || "Enseignant",
    prenom: teacher.prenom || "",
    username: dbUser.username,
    matiere: teacher.matiere?.nom || "Général",
    photo: teacher.img || null,
    initiales: `${teacher.nom?.[0] || ""}${teacher.prenom?.[0] || ""}`.toUpperCase(),
    role: dbUser.role,
    ecoleId: ecoleId, // 🏫 Pour les composants enfants
    anneeId: anneeId  // 📅 Pour les filtres de notes
  };

  return (
    <UserProvider user={userData}>
      <TeacherDashboardWrapper userData={userData}>
        {children}
      </TeacherDashboardWrapper>
    </UserProvider>
  );
}
