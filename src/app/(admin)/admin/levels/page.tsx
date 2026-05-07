import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import de la session
import { redirect } from "next/navigation";
import AdminLevels from "@/components/admin/AdminLevels";

export default async function LevelsPage() {
  const session = await auth();
  const ecoleId = session?.user?.ecoleId;

  // 1. SÉCURITÉ : Si pas de session ou pas d'école, retour au login
  if (!ecoleId) {
    redirect("/login");
  }

  // 2. FILTRAGE PRISMA : On ne récupère que les niveaux de CETTE école
  const levels = await prisma.level.findMany({
    where: {
      ecoleId: ecoleId // 🔒 Le mur de fer est ici
    },
    include: {
      _count: {
        select: { classes: true }
      }
    },
    orderBy: { nom: "asc" }
  });

  return <AdminLevels initialData={levels} />;
}
