import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import de la session
import { redirect } from "next/navigation";
import AdminSeries from "@/components/admin/AdminSeries";

export default async function SeriesPage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;

  // 1. SÉCURITÉ : Pas de session = Pas d'accès
  if (!ecoleId) {
    redirect("/login");
  }

  // 2. RÉCUPÉRATION DES LEVELS DE L'ÉCOLE (Pour le <select>)
  const levels = await prisma.level.findMany({
    where: { 
      ecoleId: ecoleId // 🔒 Verrou : Uniquement les niveaux de l'école
    },
    orderBy: { nom: "asc" }
  });

  // 3. RÉCUPÉRATION DES SÉRIES DE L'ÉCOLE (Pour la liste)
  const series = await prisma.serie.findMany({
    where: { 
      ecoleId: ecoleId // 🔒 Verrou : Uniquement les séries de l'école
    },
    include: { level: true },
    orderBy: { createdAt: "desc" }
  });

  return <AdminSeries levels={levels} initialSeries={series} />;
}
