import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import de la session
import { redirect } from "next/navigation";
import AdminCoefficients from "@/components/admin/AdminCoefficients";

export default async function CoefficientsPage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;

  // 1. SÉCURITÉ : Si pas de session, retour immédiat
  if (!ecoleId) {
    redirect("/login");
  }

  // 2. RÉCUPÉRATION DES SÉRIES DE L'ÉCOLE
  const series = await prisma.serie.findMany({
    where: { 
      ecoleId: ecoleId // 🔒 Verrou : Uniquement les séries de CETTE école
    },
    include: { level: true },
    orderBy: { level: { nom: 'asc' } }
  });

  // 3. RÉCUPÉRATION DES MATIÈRES ET LEURS COEFS (Filtrés par École)
  const matieres = await prisma.matiere.findMany({
    where: { 
      ecoleId: ecoleId // 🔒 Verrou : Uniquement les matières de CETTE école
    },
    include: { 
      coefficients: {
        where: {
          serie: { ecoleId: ecoleId } // ✅ Double sécurité sur les coefs
        }
      }
    },
    orderBy: { nom: 'asc' }
  });

  return <AdminCoefficients series={series} matieres={matieres} />;
}
