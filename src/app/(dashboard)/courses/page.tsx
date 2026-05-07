import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CoursesClient from "@/components/student/CoursesClient ";
// ✅ Vérifie bien qu'il n'y a pas d'espace à la fin du nom

export default async function CoursesPage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;
 

  // 1. SÉCURITÉ : Pas de session ou d'école = Redirection
  if (!session?.user?.id || !ecoleId || !anneeId) {
    redirect("/login");
  }

  // 2. RÉCUPÉRATION DU PROFIL ÉLÈVE (Via userId de la session)
  const student = await prisma.student.findUnique({
    where: { 
      userId: session.user.id 
    },
    select: { 
       id: true,
      classeId: true, 
      classe: { select: { levelId: true } } 
    }
  });
   
  if (!student) redirect("/login");

  // 3. RÉCUPÉRATION DES RESSOURCES (Filtrage SaaS + Année + Classe)
 const ressources = await prisma.ressource.findMany({
  where: {
    ecoleId,
    anneeId,
    isPublished: true,

    
    
    // 🔒 ISOLATION : On filtre ce qui est public OU ce qui m'est adressé
    OR: [
      { 
        // 1. Les cours normaux (Publics) de ma classe
        classeId: student.classeId, 
        studentId: null // 👈 INDISPENSABLE : On exclut les cours privés des autres
      },
      { 
        // 2. Les cours normaux (Publics) de mon niveau (pour "Autres")
        levelId: student.classe.levelId,
        studentId: null // 👈 Idem ici
      },
      { 
        // 3. MES cours privés (Coaching personnel)
        studentId: student.id 
      }
    ]
  },
  include: {
    teacher: { select: { nom: true } },
    cours: { 
      include: { 
        matiere: true 
      } 
    }
  },
  orderBy: { createdAt: "desc" }
});


  // 4. PRÉPARATION DYNAMIQUE DES MATIÈRES (Pour tes boutons de filtrage)
  // On utilise l'Optional Chaining ?. pour éviter le crash si r.cours est null
  const matieresUniques = Array.from(
    new Set(
      ressources
        .map((r) => r.cours?.matiere?.nom)
        .filter((nom): nom is string => !!nom) // On ne garde que les vrais noms
    )
  );

 const ressourcesAugmentees = ressources.map(r => ({
  ...r,
  // ✅ TEST STRICT : Uniquement si studentId est une chaîne non vide (pas null, pas undefined)
  isPrivate: typeof r.studentId === 'string' && r.studentId.length > 0, 
  profNom: r.teacher.nom,
  matiereNom: r.cours?.matiere?.nom || "Général",
  date: new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).toUpperCase(),
  valeur: r.size ? `${(r.size / (1024 * 1024)).toFixed(1)} Mo` : r.type
}));


  return (
    <CoursesClient
      dbRessources={ressourcesAugmentees} 
      dbMatieres={["Toutes", ...matieresUniques]} 
      myClasseId={student.classeId}
    />
  );
}
