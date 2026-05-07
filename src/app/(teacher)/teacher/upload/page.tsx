import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TeacherUploadForm from "@/components/forms/TeacherUploadForm";

export default async function PublishPage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Vérification Session, Rôle et École
  if (!session?.user?.id || session.user.role !== "TEACHER" || !ecoleId || !anneeId) {
    redirect("/login");
  }

  // 2. RÉCUPÉRER LE PROFIL DU PROF (Verrouillé par École)
  const teacherProfile = await prisma.teacher.findFirst({
    where: { 
      userId: session.user.id,
      ecoleId: ecoleId // 🔒 Mur de fer : On reste dans son bâtiment
    },
    select: { id: true, matiereId: true }
  });

  if (!teacherProfile) redirect("/login");

  // 3. CLASSES : Uniquement celles du contrat (Cours) pour CETTE ANNÉE
  const dbClasses = await prisma.classe.findMany({
    where: {
      ecoleId: ecoleId, // 🔒 Verrou SaaS
      anneeId: anneeId, // 📅 Verrou Temporel
      cours: { some: { teacherId: teacherProfile.id } }
    },
    include: { level: true },
    orderBy: { nom: 'asc' }
  });

  // 4. LEÇONS : Uniquement les chapitres de SA matière dans CETTE école
  const dbLecons = await prisma.lecon.findMany({
    where: { 
        ecoleId: ecoleId, // 🔒 Verrou SaaS
        matiereId: teacherProfile.matiereId,
        cours: { some: { teacherId: teacherProfile.id } } 
    },
    orderBy: { titre: 'asc' }
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in duration-700">
      <TeacherUploadForm 
        dbClasses={dbClasses} 
        dbLecons={dbLecons} 
        teacherId={teacherProfile.id} 
      />
    </div>
  );
}
