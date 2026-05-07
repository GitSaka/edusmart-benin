import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import de la session
import { redirect } from "next/navigation";
import AdminClasses from "@/components/admin/AdminClasses";

export default async function ClassesPage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Si pas de session, retour immédiat au login
  if (!ecoleId || !anneeId) {
    redirect("/login");
  }

  // 2. RÉCUPÉRATION DES SÉRIES DE L'ÉCOLE (Pour le <select> du formulaire)
  const series = await prisma.serie.findMany({
    where: { 
      ecoleId: ecoleId // 🔒 Uniquement les séries de CETTE école
    },
    include: { level: true },
    orderBy: { level: { nom: 'asc' } }
  });

  // 3. RÉCUPÉRATION DES CLASSES (Verrou École + Verrou Année)
  const classes = await prisma.classe.findMany({
    where: { 
      ecoleId: ecoleId, // 🔒 Verrou SaaS (Bâtiment)
      anneeId: anneeId  // 📅 Verrou Temporel (Année en cours)
    },
    include: { 
      serie: { include: { level: true } },
      _count: { select: { eleves: true } } 
    },
    orderBy: { nom: 'asc' }
  });

  return <AdminClasses series={series} initialClasses={classes} />;
}
