// src/app/(admin)/admin/results/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminResultsClient from "@/components/admin/AdminResultsClient";

export default async function AdminResultsPage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  if (!ecoleId || !anneeId) redirect("/login");

  // 1. On récupère les classes pour le filtre
  const classes = await prisma.classe.findMany({
    where: { ecoleId, anneeId },
    orderBy: { nom: "asc" }
  });

  // 2. On récupère les bulletins déjà générés (Top 50 par défaut)
  const bulletins = await prisma.bulletin.findMany({
    where: { ecoleId, anneeId },
    include: {
      student: { select: { nom: true, prenom: true, matricule: true, img: true } },
      annee: true
    },
    orderBy: [{ trimestre: "desc" }, { rang: "asc" }],
    take: 100
  });

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 text-left">
      <header className="mb-10 px-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
          Tableau d'Honneur
        </h1>
        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mt-2">
          Résultats officiels consolidés • {bulletins.length} bulletins trouvés
        </p>
      </header>

      <AdminResultsClient 
        initialBulletins={bulletins} 
        dbClasses={classes} 
      />
    </div>
  );
}
