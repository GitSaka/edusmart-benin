import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TeacherResourceLibrary from "@/components/teacher/TeacherResourceLibrary";

export default async function TeacherResourcesPage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Pas de session ou d'école = Pas d'accès
  if (!session?.user?.id || !ecoleId || !anneeId) {
    redirect("/login");
  }

  // 2. RÉCUPÉRATION DU PROF DANS SON ÉCOLE
  const teacher = await prisma.teacher.findFirst({
    where: { 
      userId: session.user.id,
      ecoleId: ecoleId // 🔒 Verrouillage SaaS
    },
    select: { id: true }
  });

  if (!teacher) redirect("/login");

  // 3. RÉCUPÉRATION DES RESSOURCES FILTRÉES (SaaS + Temps)
  const resources = await prisma.ressource.findMany({
    where: { 
      teacherId: teacher.id,
      ecoleId: ecoleId, // 🔒 Verrouillage SaaS (Bâtiment)
      anneeId: anneeId  // 📅 Verrouillage Temporel (Année en cours)
    },
    include: {
      lecon: true,
      classe: true,
      cours: { include: { matiere: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-in fade-in duration-700">
      <TeacherResourceLibrary initialResources={resources} />
    </div>
  );
}
