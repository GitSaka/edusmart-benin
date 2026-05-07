"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; 
import { revalidatePath } from "next/cache";


export type TypeNote =
  | "INT1"
  | "INT2"
  | "INT3"
  | "INT4"
  | "DEV1"
  | "DEV2";

export async function upsertNoteAction(data: {
  studentId: string;
  coursId: number;
  type: TypeNote;
  trimestre: number;
  valeur: number;
}) {
  try {
    const session = await auth();
    const user = session?.user as any;

    const ecoleId = user?.ecoleId;
    const anneeId = user?.anneeId;

    // 🔒 AUTH CHECK
    if (!user?.id || !ecoleId || !anneeId) {
      return { error: "Session expirée ou non autorisée." };
    }

    // 🔢 VALIDATION NOTE
    if (data.valeur < 0 || data.valeur > 20) {
      return { error: "La note doit être entre 0 et 20." };
    }

    // 📘 VERIFY COURS
    const cours = await prisma.cours.findUnique({
      where: { id: data.coursId },
      select: { saisieOuverte: true, ecoleId: true },
    });

    if (!cours || cours.ecoleId !== ecoleId) {
      return { error: "Action non autorisée sur ce cours." };
    }

    // 🔒 LOCK SAISIE
    if (!cours.saisieOuverte && user.role !== "ADMIN") {
      return { error: "🔒 Saisie clôturée. Contactez l'administration." };
    }

    // 🔥 UPSERT (clé composite unique)
    await prisma.note.upsert({
      where: {
        studentId_coursId_type_trimestre: {
          studentId: data.studentId,
          coursId: data.coursId,
          type: data.type,
          trimestre: data.trimestre,
        },
      },
      update: {
        valeur: data.valeur,
      },
      create: {
        studentId: data.studentId,
        coursId: data.coursId,
        type: data.type,
        trimestre: data.trimestre,
        valeur: data.valeur,
        ecoleId,
        anneeId,
      },
    });

    revalidatePath("/teacher/marks");

    return { success: true };
  } catch (error: any) {
    console.error("Erreur Neon Grades:", error?.message || error);
    return { error: "Erreur de synchronisation." };
  }
}

export async function getNotesByTrimestreAction(
  coursId: number,
  trimestre: number
) {
  try {
    const session = await auth();
    const user = session?.user as any;

    const ecoleId = user?.ecoleId;
    const anneeId = user?.anneeId;

    const id = Number(coursId);
    const trim = Number(trimestre);

    if (isNaN(id) || !ecoleId) {
      return { success: false, notes: [] };
    }

    // 📥 FETCH NOTES (isolées SaaS)
    const notes = await prisma.note.findMany({
      where: {
        coursId: id,
        trimestre: trim,
        ecoleId: ecoleId,
        anneeId: anneeId,
      },
      orderBy: {
        type: "asc", // utile pour affichage propre
      },
    });

    return {
      success: true,
      notes,
    };
  } catch (error: any) {
    console.error("❌ ERREUR CRITIQUE NEON :", error?.message || error);
    return { success: false, notes: [] };
  }
}




export async function saveMatiereNotesAction(
  studentId: string, 
  coursId: number, 
  trimestre: number, 
  notes: Record<string, string>
) {
  try {
    const session = await auth();
    const user = session?.user as any;
    const ecoleId = user?.ecoleId;
    const anneeId = user?.anneeId;

    if (!user?.id || !ecoleId || !anneeId) {
      return { error: "Session expirée ou non autorisée." };
    }

    // 1. On va chercher à quelle classe appartient ce cours
      const coursInfo = await prisma.cours.findUnique({
        where: { id: Number(coursId) },
        select: { classeId: true, ecoleId: true } // On prend aussi l'école pour la sécurité
      });

      if (!coursInfo || coursInfo.ecoleId !== ecoleId) {
      return { error: "Cours introuvable ou accès refusé." };
    }


      await prisma.bulletin.deleteMany({
      where: {
          classeId: Number(coursInfo.classeId),
            trimestre: Number(trimestre),
            anneeId: Number(anneeId)
      }
    });

    const cours = await prisma.cours.findUnique({
      where: { id: coursId },
      select: { ecoleId: true }
    });

    if (!cours || cours.ecoleId !== ecoleId) {
      return { error: "Action non autorisée sur ce cours." };
    }

    const operations = Object.entries(notes)
      .filter(([_, valeur]) => valeur !== "" && valeur !== null)
      .map(([type, valeur]) => {
        const val = parseFloat(valeur.toString().replace(",", "."));
        
        if (isNaN(val) || val < 0 || val > 20) return null;

        return prisma.note.upsert({
          where: {
            studentId_coursId_type_trimestre: {
              studentId,
              coursId: Number(coursId),
              type: type as any,
              trimestre: Number(trimestre),
            },
          },
          // 🛡️ CORRECTION MAJEURE : On force les IDs même en UPDATE
          update: { 
            valeur: val,
            // 🛡️ On force TOUS les IDs de liaison même en mise à jour
            // Cela répare la note si elle était "orpheline" ou mal classée
            ecoleId: ecoleId, 
            anneeId: anneeId,
            coursId: Number(coursId),
            trimestre: Number(trimestre)
          },
          create: {
            studentId,
            coursId: Number(coursId),
            type: type as any,
            trimestre: Number(trimestre),
            valeur: val,
            ecoleId: ecoleId,
            anneeId: anneeId,
          },
        });
      })
      .filter(op => op !== null);

    if (operations.length === 0) return { error: "Aucune note valide." };

    await prisma.$transaction(operations as any);

    revalidatePath(`/admin/users/student/${studentId}`);
    
    return { success: true };

  } catch (error: any) {
    console.error("Erreur Sauvegarde Notes:", error);
    return { error: "Erreur de synchronisation." };
  }
}
