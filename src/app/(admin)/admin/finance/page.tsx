import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import FinanceDashboardClient from "@/components/finance/FinanceDashboardClient";

export default async function FinancePage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.ecoleId) redirect("/login");

   // 🎯 0. RÉCUPÉRER L'ANNÉE SCOLAIRE EN COURS
  const currentAnnee = await prisma.anneeScolaire.findFirst({
    where: { 
      ecoleId: user.ecoleId,
    //   estActive: true // Ou le champ que tu utilises pour dire que c'est l'année actuelle
    },
    select: { id: true }
  });

  if (!currentAnnee) {
    return <div className="p-10 text-center font-black uppercase text-rose-500">Erreur : Aucune année scolaire active trouvée.</div>;
  }

  // 1. Récupérer tous les élèves pour calculer le "Théorique" (Ce qu'on doit encaisser)
const students = await prisma.student.findMany({
  where: { 
    ecoleId: user.ecoleId,
    anneeId: currentAnnee.id // 📅 On ne prend que les élèves de cette année
  },
  select: { 
    id: true,
    nom: true,
    prenom: true,
    matricule: true,
    scolariteTotale: true,
    classeId: true,
    classe: {
      select: {
        nom: true,   
        levelId: true 
      }
    },
    // 🎯 L'HISTORIQUE TRIÉ ET COMPLET
    paiements: {
      where: { anneeId: currentAnnee.id }, // 🛡️ Sécurité Année
      select: { 
        id: true,
        montant: true, 
        date: true,    // ✅ RÉCUPÈRE LA DATE (Finit le "Date inconnue")
        tranche: true, // ✅ RÉCUPÈRE LE LIBELLÉ
        methode: true 
      },
      orderBy: {
        date: 'desc'   // 🚀 MET LE PLUS RÉCENT EN HAUT
      }
    }
  }
});

const topDebtors = students
  .map((s) => {
    // On calcule ce que l'élève a déjà versé cette année
    const dejaPaye = s.paiements?.reduce((acc: number, p: any) => acc + (p.montant || 0), 0) || 0;
    
    // On calcule sa dette (Scolarité - Déjà payé)
    const reste = (s.scolariteTotale || 0) - dejaPaye;
    
    return { 
      ...s, 
      reste // On ajoute le montant de la dette à l'objet élève
    };
  })
  .filter((s) => s.reste > 0) // On ne garde que ceux qui doivent de l'argent
  .sort((a, b) => b.reste - a.reste) // On classe du plus gros débiteur au plus petit
  .slice(0, 5); // On ne prend que les 5 premiers pour le "Radar" du patron




   // 2. Récupérer tous les paiements (Ce qu'on a déjà en caisse)

   // 🎯 Dans ton fichier app/(admin)/admin/finance/page.tsx
const payments = await prisma.paiement.findMany({
  where: { 
    ecoleId: user.ecoleId,
    anneeId: currentAnnee.id 
  },
  select: { 
    id: true,         // 🔑 Toujours prendre l'ID pour la "key" React
    montant: true,    // 💰 Le montant
    date: true,       // 📅 La date
    tranche: true,    // 🧾 La tranche (Inscription, T1...)
    methode: true,    // 💳 Espèces/Moov
    student: {        // 👤 La relation élève (via select aussi !)
      select: { 
         id: true,
        nom: true, 
        prenom: true 
      } 
    } 
  },
  orderBy: { date: 'desc' },
  take: 10
});


 


 // 3. Récupérer les niveaux avec le compte RÉEL des classes de l'année
const levels = await prisma.level.findMany({
  where: { ecoleId: user.ecoleId },
  include: { 
    _count: { 
      select: { 
        // 🎯 On compte les classes liées à ce niveau
        classes: { 
          where: { anneeId: currentAnnee.id } // Uniquement celles de cette année !
        } 
      } 
    } 
  },
  orderBy: { 
    nom: 'asc' // 👈 Comme ça, l'ordre ne change JAMAIS, même après un clic
  }
});


 const stats = students.reduce((acc, s) => {
  const scolariteEleve = s.scolariteTotale || 0;
  const payeParEleve = s.paiements?.reduce((sum: number, p: any) => sum + (p.montant || 0), 0) || 0;
  
  return {
    totalAttendu: acc.totalAttendu + scolariteEleve,
    totalEncaisse: acc.totalEncaisse + payeParEleve,
  };
}, { totalAttendu: 0, totalEncaisse: 0 });

// 2. Le reste est la soustraction des deux totaux réels
const resteARecouvrer = stats.totalAttendu - stats.totalEncaisse;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <FinanceDashboardClient 
        stats={{ 
          totalAttendu: stats.totalAttendu, 
          totalEncaisse: stats.totalEncaisse, 
          resteARecouvrer 
        }}
        initialPayments={payments}
         levels={levels}
         ecoleId={user.ecoleId}
         anneeId={currentAnnee.id}
         students={students}
         topDebtors={topDebtors}
      />
    </div>
  );
}
