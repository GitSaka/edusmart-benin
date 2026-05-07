import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import de la session
import { notFound, redirect } from "next/navigation";
import AdminEditStudentForm from "@/components/forms/AdminStudentForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditStudentPage({ params }: Props) {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Pas de session = Pas d'accès
  if (!ecoleId || !anneeId) {
    redirect("/login");
  }

  // 2. RÉCUPÉRATION DE L'ID (Next.js 15)
  const { id } = await params;

  // 3. RÉCUPÉRATION ATOMIQUE FILTRÉE (Isolation SaaS)
  const [student, classes] = await Promise.all([
    // ✅ On vérifie que l'élève appartient bien à CETTE école
    prisma.student.findUnique({
      where: { 
        id,
        ecoleId: ecoleId // 🔒 Verrouillage Propriété
      },
      include: { 
        parent: true, 
        classe: { 
          include: { 
            level: true,
            serie: { include: { level: true } }
          } 
        } 
      }
    }),
    // ✅ Uniquement les classes de CETTE école pour CETTE année
    prisma.classe.findMany({
      where: {
        ecoleId: ecoleId,
        anneeId: anneeId
      },
      include: { 
        level: true,
        serie: { include: { level: true } } 
      },
      orderBy: { nom: 'asc' }
    })
  ]);

  // 4. SÉCURITÉ MUR DE FER : Si l'ID est faux ou appartient à une autre école
  if (!student || student.ecoleId !== ecoleId) {
    return notFound();
  }

  return (
    <div className="py-10 animate-in fade-in duration-500">
      <AdminEditStudentForm 
        dbClasses={classes} 
        studentData={student} 
      />
    </div>
  );
}
