import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Indispensable
import { notFound, redirect } from "next/navigation";
import AdminStudentViewClient from "@/components/views/AdminStudentViewClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Pas de session = Pas d'accès
  if (!ecoleId || !anneeId) {
    redirect("/login");
  }

  const { id } = await params;

  // 2. RÉCUPÉRATION FILTRÉE (Verrou SaaS + Verrou Temporel)
  const student = await prisma.student.findUnique({
    where: { 
      id,
      ecoleId: ecoleId // 🔒 L'élève doit appartenir à CETTE école
    },
    include: {
      user: true,
      classe: true,
      parent: true,
      Device: true, // ✅ Pour voir si sa tablette est bloquée
      // 📅 On ne récupère que les notes de l'ANNÉE EN COURS
       bulletins: {
        where: { anneeId: anneeId },
        orderBy: { trimestre: 'asc' }
      },
      notes: {
        where: { anneeId: anneeId },
        include: {
          cours: { include: { matiere: true } }
        }
      },
      // 📅 On ne récupère que les présences de l'ANNÉE EN COURS
      presences: {
        where: { anneeId: anneeId }
      }
    }
  });

  // 3. MUR DE FER : Si l'élève n'existe pas ou appartient à une AUTRE école
  if (!student || student.ecoleId !== ecoleId) {
    return notFound();
  }
// 3. ✅ ON RÉCUPÈRE LA VRAIE MOYENNE OFFICIELLE


  const absences = student.presences.filter(p => !p.estPresent).length;
// 1. On récupère le bulletin du Trimestre 1 (ou le plus récent)
// On utilise .find() pour être sûr de ne pas prendre le mauvais trimestre
const bulletinT1 = student.bulletins.find(b => b.trimestre === 1);

// 2. On extrait les vraies valeurs OFFICIELLES (Snapshot)
const moyenneOfficielle = bulletinT1?.moyenne 
  ? bulletinT1.moyenne.toFixed(2) 
  : "0.00";

  const rangOfficiel = bulletinT1?.rang || "—";

// 3. ON ENVOIE TOUT AU COMPOSANT CLIENT
return (
  <AdminStudentViewClient 
    student={student} 
    moyenne={moyenneOfficielle} // ✅ Vraie moyenne du bulletin (Snapshot)
    rang={rangOfficiel}
    absences={absences}        // Gardé pour le compteur d'assiduité
    bulletins={student.bulletins} // ✅ Liste complète pour les onglets T1, T2, T3
  />
);
}
