// "use server";

// import { prisma } from "@/lib/prisma";
// import { auth } from "@/lib/auth";
// import { revalidatePath } from "next/cache";

// export async function calculateClassGradesAction(classeId: number, trimestre: number) {
//   try {
//     const session = await auth();
//     const user = session?.user as any;
//     const ecoleId = user?.ecoleId;
//     const anneeId = user?.anneeId;

//     if (!ecoleId || !anneeId) return { error: "Session expirée." };

//     console.log(trimestre,anneeId,classeId)

//     // 🔥 1. SUPPRESSION RADICALE (Pour forcer le rafraîchissement du bouton)
//     // On cible directement par classeId pour être sûr que ça disparaisse de la base
//     await prisma.bulletin.deleteMany({
//       where: {
//         classeId: Number(classeId),
//         trimestre: trimestre,
//         anneeId: anneeId
//       }
//     });

//     // 2. RÉCUPÉRATION DES ÉLÈVES
//     const students = await prisma.student.findMany({
//       where: { classeId, ecoleId, anneeId },
//       include: {
//         notes: {
//           where: { trimestre, anneeId },
//           include: { 
//             cours: { 
//               include: { matiere: { include: { coefficients: { where: { serie: { classes: { some: { id: classeId } } } } } } } } 
//             } 
//           }
//         }
//       }
//     });

//     if (students.length === 0) return { error: "Aucun élève trouvé." };

//     // 3. CALCUL DES MOYENNES
//     const results = students.map(student => {
//       let totalPoints = 0;
//       let totalCoeffs = 0;

//       const notesGroupées: Record<number, any[]> = {};
//       student.notes.forEach(n => {
//         if (!notesGroupées[n.cours.matiereId]) notesGroupées[n.cours.matiereId] = [];
//         notesGroupées[n.cours.matiereId].push(n);
//       });

//       Object.keys(notesGroupées).forEach(matId => {
//         const notes = notesGroupées[parseInt(matId)];
//         const coeff = notes[0].cours.matiere.coefficients[0]?.valeur || 1;
//         const moyMat = notes.reduce((acc, n) => acc + n.valeur, 0) / notes.length;
        
//         totalPoints += (moyMat * coeff);
//         totalCoeffs += coeff;
//       });

//       return {
//         studentId: student.id,
//         moyenne: parseFloat((totalCoeffs > 0 ? totalPoints / totalCoeffs : 0).toFixed(2))
//       };
//     });

//     // 4. RANGS ET ENREGISTREMENT AVEC TON UPSERT D'ORIGINE
//     const sorted = [...results].sort((a, b) => b.moyenne - a.moyenne);
    
//     await prisma.$transaction(
//       sorted.map((res, index) => 
//         prisma.bulletin.upsert({
//           where: {
//             studentId_trimestre_anneeId: { // ✅ TA CLÉ UNIQUE EST DE RETOUR
//               studentId: res.studentId,
//               trimestre,
//               anneeId
//             }
//           },
//           update: { 
//             moyenne: res.moyenne, 
//             rang: index + 1,
//             classeId: Number(classeId) // On s'assure que l'ID classe est là pour le prochain delete
//           },
//           create: {
//             studentId: res.studentId,
//             trimestre,
//             anneeId,
//             moyenne: res.moyenne,
//             rang: index + 1,
//             ecoleId,
//             classeId: Number(classeId)
//           }
//         })
//       )
//     );

//     revalidatePath("/admin/bulletins");
//     return { success: true };

//   } catch (error: any) {
//     console.error("Erreur:", error);
//     return { error: "Erreur lors du calcul." };
//   }
// }

"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function calculateClassGradesAction(classeId: number, trimestre: number) {
  try {
    const session = await auth();
    const user = session?.user as any;
    const ecoleId = user?.ecoleId;
    const anneeId = user?.anneeId;

    if (!ecoleId || !anneeId) return { error: "Session expirée." };

    // 🔥 1. SUPPRESSION DES ANCIENS BULLETINS
    await prisma.bulletin.deleteMany({
      where: {
        classeId: Number(classeId),
        trimestre: Number(trimestre),
        anneeId: Number(anneeId)
      }
    });

    // 2. RÉCUPÉRATION DES ÉLÈVES ET NOTES
    const students = await prisma.student.findMany({
      where: { 
        classeId: Number(classeId), 
        ecoleId: Number(ecoleId), 
        anneeId: Number(anneeId) 
      },
      include: {
        notes: {
          where: { 
            trimestre: Number(trimestre), 
            anneeId: Number(anneeId) 
          },
          include: { 
            cours: { 
              include: { 
                matiere: { 
                  include: { 
                    coefficients: { 
                      where: { 
                        serie: { classes: { some: { id: Number(classeId) } } } 
                      } 
                    } 
                  } 
                } 
              } 
            } 
          }
        }
      }
    });

    if (students.length === 0) return { error: "Aucun élève trouvé." };

    // 3. CALCUL DES MOYENNES
    const results = students.map(student => {
      let totalPoints = 0;
      let totalCoeffs = 0;

      const notesGroupées: Record<number, any[]> = {};
      student.notes.forEach(n => {
        if (!notesGroupées[n.cours.matiereId]) notesGroupées[n.cours.matiereId] = [];
        notesGroupées[n.cours.matiereId].push(n);
      });

      Object.keys(notesGroupées).forEach(matId => {
        const notes = notesGroupées[parseInt(matId)];
        const coeff = notes[0].cours.matiere.coefficients[0]?.valeur || 1;
        const moyMat = notes.reduce((acc, n) => acc + n.valeur, 0) / notes.length;
        
        totalPoints += (moyMat * coeff);
        totalCoeffs += coeff;
      });

      return {
        studentId: student.id,
        moyenne: parseFloat((totalCoeffs > 0 ? totalPoints / totalCoeffs : 0).toFixed(2))
      };
    });

    // 4. RANGS ET ENREGISTREMENT (CORRECTION CLÉ UNIQUE ICI)
    const sorted = [...results].sort((a, b) => b.moyenne - a.moyenne);
    
    await prisma.$transaction(
      sorted.map((res, index) => 
        prisma.bulletin.upsert({
          where: {
            // 🎯 RÉGLAGE CRITIQUE : Correspondance exacte avec @@unique([studentId, trimestre, anneeId], name: "id_trimestre_studentId")
            id_trimestre_studentId: { 
              studentId: res.studentId,
              trimestre: Number(trimestre),
              anneeId: Number(anneeId)
            }
          },
          update: { 
            moyenne: res.moyenne, 
            rang: index + 1,
            classeId: Number(classeId)
          },
          create: {
            studentId: res.studentId,
            trimestre: Number(trimestre),
            anneeId: Number(anneeId),
            moyenne: res.moyenne,
            rang: index + 1,
            ecoleId: Number(ecoleId),
            classeId: Number(classeId)
          }
        })
      )
    );

    revalidatePath("/admin/bulletins");
    return { success: true };

  } catch (error: any) {
    console.error("Erreur Calcul:", error);
    return { error: "Erreur lors du calcul technique." };
  }
}
