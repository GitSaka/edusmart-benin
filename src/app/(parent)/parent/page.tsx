import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ParentDashboard from "@/components/parent/ParentDashboard"; // Vérifie bien ce chemin

export default async function ParentPage() {
  // 1. Récupération de la session
  const session = await auth();
  const user = session?.user as any;

  // 🛡️ Sécurité : Seul un parent peut entrer ici
  if (!user || user.role !== "PARENT") {
    redirect("/login");
  }

  // 2. Récupération du profil parent et de toute la fratrie (Multi-enfants)
  const parentProfile = await prisma.parent.findUnique({
    where: { 
      userId: user.id,
      ecoleId: user.ecoleId
    },
    include: {
      enfants: {
        include: {
          classe: true,
          // On récupère les bulletins pour les moyennes et rangs
          bulletins: {
            where: { anneeId: user.anneeId },
            orderBy: { trimestre: 'desc' }
          },
          // On récupère l'historique des paiements pour le calcul du reste
          paiements: {
            where: { anneeId: user.anneeId }
          },
          // On récupère le device pour la géolocalisation future
          Device: true 
        }
      }
    }
  });

  // 3. Gestion du cas où le profil n'existe pas encore
  if (!parentProfile) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-[2rem] shadow-xl border border-gray-100 max-w-md">
          <p className="text-sm font-black uppercase text-rose-500 mb-2 tracking-widest">Compte incomplet</p>
          <p className="text-xs font-bold text-gray-400 leading-relaxed">
            Aucun profil parent n'est rattaché à votre compte. Veuillez contacter l'administration de l'école.
          </p>
        </div>
      </div>
    );
  }

  // 4. On envoie les données au Dashboard Client
  // On s'assure de passer un objet propre même si la liste des enfants est vide
  return (
    <main className="min-h-screen bg-gray-50/50 pt-10">
      <ParentDashboard parent={parentProfile} />
    </main>
  );
}
