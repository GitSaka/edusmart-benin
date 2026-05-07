import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LibraryClient from "@/components/student/LibraryClient";

export default async function LibraryPage() {
  const session = await auth();
  const user = session?.user as any;

  // 🛡️ 1. Vérification de sécurité
  if (!user || user.role !== "STUDENT") redirect("/login");

  // 🔍 2. On récupère les infos de l'élève (Classe et Niveau)
  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    include: { 
      classe: { 
        include: { level: true } 
      } 
    }
  });

  if (!student || !student.classe) redirect("/login");

  // 📚 3. LA REQUÊTE MAÎTRESSE : Ses livres + les livres GLOBAUX
  const books = await prisma.library.findMany({
    where: {
      OR: [
        { levelId: student.classe.levelId }, // Livres de sa classe
        { level: { nom: "GLOBAL" } }         // Livres pour tout le pays
      ],
      isPublished: true // 🛡️ Uniquement ce que le Patron a validé
    },
    include: { level: true },
    orderBy: { createdAt: 'desc' }
  });

  // 🚀 4. On envoie tout au composant Client (Le Rayonnage)
  return <LibraryClient student={student} initialBooks={books} />;
}
