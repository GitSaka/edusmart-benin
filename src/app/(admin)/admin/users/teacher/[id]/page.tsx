import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import de la session
import { notFound, redirect } from "next/navigation";
import AdminTeacherViewClient from "@/components/admin/AdminTeacherViewClient";

export default async function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Pas de session = Pas d'accès
  if (!ecoleId || !anneeId) {
    redirect("/login");
  }

  const { id } = await params;

  // 2. RÉCUPÉRATION FILTRÉE (SaaS Isolation)
  const teacher = await prisma.teacher.findUnique({
    where: { 
        id,
        // 🔒 On s'assure que le prof appartient bien à l'école de l'admin
        ecoleId: ecoleId 
    },
    include: {
      matiere: true,
      // ✅ On ne montre que les classes de l'ANNÉE EN COURS
      classes: { 
        where: { anneeId: anneeId },
        include: { level: true } 
      },
      _count: { select: { cours: true, ressources: true } }
    }
  });

  // 3. MUR DE FER : Si le prof n'existe pas ou appartient à une AUTRE école
  if (!teacher || teacher.ecoleId !== ecoleId) {
    return notFound();
  }

  return <AdminTeacherViewClient teacher={teacher} />;
}
