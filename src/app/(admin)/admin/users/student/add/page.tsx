import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Importation de la session
import { redirect } from "next/navigation";
import AdminAddStudentForm from "@/components/forms/AdminAddStudentForm";

export default async function AddStudentPage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Si pas de session ou d'école, retour au login
  if (!ecoleId || !anneeId) {
    redirect("/login");
  }

  // 2. RÉCUPÉRATION DES CLASSES FILTRÉES (SaaS + Temps)
  // On ne récupère que les classes de CETTE école et de CETTE année scolaire
  const classes = await prisma.classe.findMany({
    where: { 
      ecoleId: ecoleId, // 🔒 Verrou 1 : École
      anneeId: anneeId  // 📅 Verrou 2 : Année Active
    },
    include: { 
      level: true,
      serie: {
        include: { level: true }
      } 
    },
    orderBy: { nom: 'asc' }
  });

  return (
    <div className="py-10 animate-in fade-in duration-500">
      <AdminAddStudentForm dbClasses={classes} />
    </div>
  );
}
