// import { auth } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";
// import { redirect, notFound } from "next/navigation";
// import GradesClient from "@/components/student/GradesClient";

// export default async function ParentViewGradesPage({ params }: { params: { id: string } }) {
//   const session = await auth();
//   const user = session?.user as any;

//   if (!user || user.role !== "PARENT") redirect("/login");

//         // 🔍 1. Vérification parentale : Cet enfant appartient-il au parent connecté ?
//         const checkChild = await prisma.student.findFirst({
//         where: { 
//             id: params.id,
//             parent: {
//             userId: user.id // ✅ On passe par la relation 'parent' définie dans ton schéma
//             },
//             ecoleId: user.ecoleId 
//         }
//         });

// if (!checkChild) return notFound();


//   if (!checkChild) return notFound(); // L'enfant n'existe pas ou n'est pas le sien

//   // 🔍 2. Récupération complète des données de l'enfant (Bulletins + Notes)
//   const student = await prisma.student.findUnique({
//     where: { id: params.id },
//     include: {
//       classe: { 
//         include: { _count: { select: { eleves: true } } } 
//       },
//       notes: {
//         where: { anneeId: user.anneeId },
//         include: { cours: { include: { matiere: true } } }
//       },
//       bulletins: {
//         where: { anneeId: user.anneeId },
//         orderBy: { trimestre: 'asc' }
//       }
//     }
//   });

//   if (!student) redirect("/parent");

//   return (
//     <div className="pt-10">
//       {/* 🏷️ On réutilise ton composant existant */}
//       <GradesClient 
//         student={student} 
//         initialNotes={student.notes} 
//         initialBulletins={student.bulletins} 
//       />
//     </div>
//   );
// }

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import GradesClient from "@/components/student/GradesClient";

// 🎯 NEXT.JS 15 : Les params sont maintenant une Promise (Obligatoire pour le build)
export default async function ParentViewGradesPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 1. On attend (await) les paramètres de l'URL
  const { id } = await params; 

  const session = await auth();
  const user = session?.user as any;

  if (!user || user.role !== "PARENT") redirect("/login");

  // 🔍 2. VÉRIFICATION PARENTALE : Cet enfant appartient-il au parent connecté ?
  // On combine la vérification et la récupération pour économiser une requête DB
  const student = await prisma.student.findFirst({
    where: { 
      id: id, // Utilisation de l'id récupéré via await
      parent: {
        userId: user.id 
      },
      ecoleId: user.ecoleId 
    },
    include: {
      classe: { 
        include: { _count: { select: { eleves: true } } } 
      },
      notes: {
        where: { anneeId: user.anneeId },
        include: { cours: { include: { matiere: true } } }
      },
      bulletins: {
        where: { anneeId: user.anneeId },
        orderBy: { trimestre: 'asc' }
      }
    }
  });

  // 🛡️ SÉCURITÉ : Si l'étudiant n'est pas trouvé ou n'appartient pas au parent -> 404
  if (!student) return notFound();

  return (
    <div className="pt-10">
      {/* 🏷️ On réutilise ton composant existant */}
      <GradesClient 
        student={student} 
        initialNotes={student.notes} 
        initialBulletins={student.bulletins} 
      />
    </div>
  );
}

