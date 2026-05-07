import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import de la session
import { redirect } from "next/navigation";
import AdminSubjects from "@/components/admin/AdminSubjects";

export default async function SubjectsPage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;

  // 1. SÉCURITÉ : Pas de session = Pas d'accès
  if (!ecoleId) {
    redirect("/login");
  }

  // 2. FILTRAGE : Récupération des matières de CETTE école uniquement
  const subjects = await prisma.matiere.findMany({
    where: {
      ecoleId: ecoleId // 🔒 Le verrou SaaS est ici
    },
    orderBy: { nom: "asc" }
  });

  return <AdminSubjects initialSubjects={subjects} />;
}
