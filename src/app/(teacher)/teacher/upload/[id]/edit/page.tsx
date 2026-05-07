import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import TeacherUploadFormEdit from "@/components/teacher/TeacherUploadFormEdit";

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;

  // 1. SÉCURITÉ : Vérification Session & Rôle
  if (!session?.user?.id || session.user.role !== "TEACHER" || !ecoleId) {
    redirect("/login");
  }

  // 2. RÉCUPÉRATION DE L'ID (Next.js 15 demande await)
  const { id } = await params;
  const resourceId = parseInt(id);

  // 3. RÉCUPÉRATION DE LA RESSOURCE (Verrouillée par École)
  const ressource = await prisma.ressource.findUnique({
    where: { 
      id: resourceId,
      ecoleId: ecoleId // 🔒 Mur de Fer : On vérifie que c'est BIEN son école
    },
    include: { lecon: true, classe: true }
  });

  if (!ressource) return notFound();

  // 4. RÉCUPÉRATION DU PROFIL PROF (Vérifié par école)
  const teacherProfile = await prisma.teacher.findFirst({
    where: { 
      userId: session.user.id,
      ecoleId: ecoleId 
    },
    select: { id: true, matiereId: true }
  });

  // Sécurité supplémentaire : Le prof doit être le créateur
  if (!teacherProfile || ressource.teacherId !== teacherProfile.id) {
    redirect("/login");
  }

  // 5. RÉCUPÉRATION DES CLASSES & LEÇONS (Filtrées par École)
  const [dbClasses, dbLecons] = await Promise.all([
    prisma.classe.findMany({
      where: { 
        ecoleId: ecoleId,
        cours: { some: { teacherId: teacherProfile.id } } 
      },
      include: { level: true },
      orderBy: { nom: 'asc' }
    }),
    prisma.lecon.findMany({
      where: { 
        ecoleId: ecoleId,
        matiereId: teacherProfile.matiereId,
        cours: { some: { teacherId: teacherProfile.id } } 
      },
      orderBy: { titre: 'asc' }
    })
  ]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in duration-500">
      <TeacherUploadFormEdit 
        dbClasses={dbClasses} 
        dbLecons={dbLecons} 
        teacherId={teacherProfile.id} 
        initialData={ressource} 
      />
    </div>
  );
}
