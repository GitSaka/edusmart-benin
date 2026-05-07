"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function genererBulletinsClasseAction(
  classeId: number,
  trimestre: number
) {
  const session = await auth();
  const user = session?.user as any;

  const ecoleId = user?.ecoleId;
  const anneeId = user?.anneeId;

  if (!user?.id || !ecoleId || !anneeId) {
    return { error: "Session invalide" };
  }

  if (!classeId || !trimestre) {
    return { error: "Paramètres invalides" };
  }

  try {
    // 📥 RÉCUPÉRATION
    const eleves = await prisma.student.findMany({
      where: { classeId, ecoleId },
      include: {
        notes: { where: { trimestre, anneeId } },
        classe: {
          include: {
            serie: true,
            cours: {
              where: { anneeId },
              include: {
                matiere: {
                  include: {
                    coefficients: {
                      where: { ecoleId, anneeId }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // 🧮 CALCUL
    const resultatsBulletins = eleves.map((eleve: any) => {
      let totalPoints = 0;
      let totalCoeffs = 0;

      const snapshotMatieres: any[] = [];

      // regrouper les notes par cours
      const notesParCours = eleve.notes.reduce((acc: any, note: any) => {
        if (!acc[note.coursId]) acc[note.coursId] = [];
        acc[note.coursId].push(note);
        return acc;
      }, {});

      eleve.classe.cours.forEach((c: any) => {
        const coeffObj = c.matiere.coefficients.find(
          (coef: any) => coef.serieId === eleve.classe.serieId
        );

        const coeff =
          coeffObj?.valeur ??
          c.matiere.coefficientDefaut ??
          1;

        const nms = notesParCours[c.id] || [];

        // 🔥 INTERROS (INT1, INT2...)
        const interros = nms.filter((n: any) =>
          n.type.startsWith("INT")
        );

        const moyInt =
          interros.length > 0
            ? interros.reduce((acc: number, n: any) => acc + n.valeur, 0) /
              interros.length
            : 0;

        // 🔥 DEVOIRS (DEV1, DEV2)
        const d1 =
          nms.find((n: any) => n.type === "DEV1")?.valeur || 0;

        const d2 =
          nms.find((n: any) => n.type === "DEV2")?.valeur || 0;

        // 📐 MOYENNE MATIÈRE
        const valeurs = [moyInt, d1, d2].filter(
          (v) => v !== null && v !== undefined
        );

        const moyMatiere =
          valeurs.length > 0
            ? valeurs.reduce((a, b) => a + b, 0) / valeurs.length
            : 0;

        const points = moyMatiere * coeff;

        totalPoints += points;
        totalCoeffs += coeff;

        snapshotMatieres.push({
          nom: c.matiere.nom,
          coeff,
          moyInt: Number(moyInt.toFixed(2)),
          dev1: d1,
          dev2: d2,
          moyenne: Number(moyMatiere.toFixed(2)),
          points: Number(points.toFixed(2))
        });
      });

      const moyenneGenerale =
        totalCoeffs > 0 ? totalPoints / totalCoeffs : 0;

      return {
        studentId: eleve.id,
        moyenneGenerale: Number(moyenneGenerale.toFixed(2)),
        totalPoints: Number(totalPoints.toFixed(2)),
        totalCoeff: totalCoeffs,
        matieres: snapshotMatieres
      };
    });

    // 🏆 CLASSEMENT
    const trie = [...resultatsBulletins].sort(
      (a, b) => b.moyenneGenerale - a.moyenneGenerale
    );

    let currentRank = 1;

    const avecRang = trie.map((res, index, arr) => {
      if (
        index > 0 &&
        res.moyenneGenerale < arr[index - 1].moyenneGenerale
      ) {
        currentRank = index + 1;
      }

      return {
        ...res,
        rang: currentRank
      };
    });

    // 💾 SAUVEGARDE
    await prisma.$transaction(
      avecRang.map((res) =>
        prisma.bulletin.upsert({
          where: {
            id_trimestre_studentId: {
              studentId: res.studentId,
              trimestre,
              anneeId
            }
          },
          update: {
            moyenne: res.moyenneGenerale,
            rang: res.rang,
            classeId: Number(classeId),
            details: res
          },
          create: {
            studentId: res.studentId,
            trimestre,
            moyenne: res.moyenneGenerale,
            rang: res.rang,
            ecoleId,
            anneeId,
            classeId: Number(classeId),
            details: res
          }
        })
      )
    );

    revalidatePath("/admin/bulletins");

    return {
      success: true,
      message: `${eleves.length} bulletins générés avec succès 🎉`
    };

  } catch (error: any) {
    console.error("Erreur Moulinette:", error);
    return {
      error: "Échec du calcul : " + error.message
    };
  }
}