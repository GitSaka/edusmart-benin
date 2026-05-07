import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import de la session
import { notFound, redirect } from "next/navigation";
import AdminEditTeacher from "@/components/forms/AdminEditTeacher";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTeacherPage({ params }: Props) {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Pas de session = Pas d'accès
  if (!ecoleId || !anneeId) {
    redirect("/login");
  }

  // 2. RÉCUPÉRATION DE L'ID (Next.js 15 await)
  const { id } = await params;

  // 3. RÉCUPÉRATION SIMULTANÉE FILTRÉE (SaaS Isolation)
  const [teacher, matieres, classes] = await Promise.all([
    // ✅ On récupère le prof MAIS on vérifie qu'il appartient à CETTE école
    prisma.teacher.findUnique({
      where: { id },
      include: { classes: true }
    }),
    // ✅ Uniquement les matières de CETTE école
    prisma.matiere.findMany({ 
      where: { ecoleId: ecoleId },
      orderBy: { nom: 'asc' } 
    }),
    // ✅ Uniquement les classes de CETTE école ET de CETTE année
    prisma.classe.findMany({ 
      where: { 
        ecoleId: ecoleId,
        anneeId: anneeId 
      },
      orderBy: { nom: 'asc' } 
    })
  ]);

  // 4. SÉCURITÉ "MUR DE FER" : Vérification de la propriété
  // Si le prof n'existe pas OU s'il appartient à une AUTRE école
  if (!teacher || teacher.ecoleId !== ecoleId) {
    return notFound();
  }

  return (
    <div className="py-10 animate-in fade-in duration-500">
      <AdminEditTeacher 
        dbMatieres={matieres} 
        dbClasses={classes} 
        teacherData={teacher} 
      />
    </div>
  );
}
