"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import cloudinary from "../cloudinary-config";


export async function createRessourceAction(
  formData: FormData,
  fileInfo: {
    url: string;
    publicId: string;
    size: number;
    type: "VIDEO" | "PDF" | "AUDIO";
    corrigeUrl?: string;
    corrigeId?: string;
  }
) {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  if (!session?.user?.id || !ecoleId || !anneeId) {
    return { error: "Session expirée" };
  }

  // 🔒 Validation fichier
 console.log(!fileInfo.url,!fileInfo.publicId)

  if (!fileInfo.url || !fileInfo.publicId) {
    return { error: "Fichier invalide" };
  }

  try {
    // 🔒 Validation titre
    const titre = (formData.get("titre") as string)?.trim();
    if (!titre) return { error: "Titre obligatoire" };

    const isNewChapter = formData.get("isNewChapter") === "true";

    // ==============================
    // 🔥 LOGIQUE CLASSE + MATRICULE
    // ==============================

    const classeIdRaw = formData.get("classeId");
    const selectedClasseId = classeIdRaw
      ? parseInt(classeIdRaw as string)
      : null;

    const matriculeSaisi = formData.get("matriculeEleve") as string;

    let targetStudentId: string | null = null;
    let finalClasseId: number | null = selectedClasseId;

    // 🎯 SI MATRICULE → on prend sa classe
    if (matriculeSaisi && matriculeSaisi.trim() !== "") {
      const student = await prisma.student.findUnique({
        where: {
          matricule_ecoleId: {
            matricule: matriculeSaisi.trim(),
            ecoleId: ecoleId,
          },
        },
        select: { id: true, classeId: true },
      });

      if (!student) {
        return {
          error: `Le matricule ${matriculeSaisi} est introuvable.`,
        };
      }

      targetStudentId = student.id;
      finalClasseId = student.classeId; // 🔥 clé du système
    }

    // ❌ Aucun des deux
    if (!finalClasseId || isNaN(finalClasseId)) {
      return {
        error: "Veuillez sélectionner une classe ou un matricule valide.",
      };
    }

    // ==============================
    // 🔒 TEACHER
    // ==============================
    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: session.user.id,
        ecoleId: ecoleId,
      },
      select: { id: true, matiereId: true },
    });

    if (!teacher) return { error: "Profil professeur introuvable" };

    // ==============================
    // 🔒 COURS (avec finalClasseId)
    // ==============================
    const cours = await prisma.cours.findFirst({
      where: {
        teacherId: teacher.id,
        matiereId: teacher.matiereId,
        classeId: finalClasseId,
        ecoleId: ecoleId,
        anneeId: anneeId,
      },
      include: {
        classe: {
          select: { levelId: true },
        },
      },
    });

    if (!cours) {
      return { error: "Aucun contrat de cours valide trouvé." };
    }

    return await prisma.$transaction(async (tx) => {
      let finalLeconId: number;

      // ==============================
      // 📚 CHAPITRE
      // ==============================
      if (isNewChapter) {
        const newLeconNom = (formData.get("newLecon") as string)?.trim();
        if (!newLeconNom) return { error: "Nom du chapitre requis" };

        const newLecon = await tx.lecon.create({
          data: {
            titre: newLeconNom,
            matiereId: teacher.matiereId,
            ecoleId: ecoleId,
            anneeId: anneeId,
            cours: { connect: { id: cours.id } },
          },
        });

        finalLeconId = newLecon.id;
      } else {
        const leconIdRaw = formData.get("leconId");
        if (!leconIdRaw) return { error: "Leçon invalide" };

        const leconId = parseInt(leconIdRaw as string);
        if (isNaN(leconId)) return { error: "Leçon invalide" };

        const lecon = await tx.lecon.findFirst({
          where: {
            id: leconId,
            ecoleId: ecoleId,
            anneeId: anneeId,
          },
          select: { id: true },
        });

        if (!lecon) {
          return { error: "Leçon introuvable ou non autorisée" };
        }

        finalLeconId = lecon.id;
      }

      // ==============================
      // 🚀 CREATE RESSOURCE
      // ==============================
      await tx.ressource.create({
        data: {
          titre,
          url: fileInfo.url,
          size: fileInfo.size,
          publicId: fileInfo.publicId,
          type: fileInfo.type,
          teacherId: teacher.id,
          coursId: cours.id,
          leconId: finalLeconId,
          levelId: cours.classe.levelId,
          classeId: finalClasseId, // 🔥 IMPORTANT (plus selectedClasseId)
          ecoleId: ecoleId,
          anneeId: anneeId,
          studentId: targetStudentId,

          transcription: fileInfo.corrigeUrl
            ? { corrigeUrl: fileInfo.corrigeUrl }
            : Prisma.JsonNull,
        },
      });

      revalidatePath("/teacher/upload");

      return { success: true };
    });
  } catch (error: any) {
    console.error("Erreur Diffusion Neon:", error);
    return { error: "Échec de l'enregistrement technique." };
  }
}




export async function deleteRessourceAction(id: number) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;

    if (!session?.user?.id || !ecoleId) return { error: "Session expirée" };

    // 1. RÉCUPÉRATION AVEC VÉRIFICATION DE PROPRIÉTÉ
    const ressource = await prisma.ressource.findUnique({
      where: { id: id },
      select: { 
        publicId: true, 
        ecoleId: true, // 🔒 Pour vérifier l'appartenance
        teacherId: true 
      }
    });

    // 🛡️ MUR DE FER : On ne supprime que si la ressource appartient à CETTE école
    if (!ressource || ressource.ecoleId !== ecoleId) {
      return { error: "Action non autorisée ou ressource introuvable." };
    }

    // 2. NETTOYAGE CLOUDINARY (Chirurgie précise)
    if (ressource.publicId) {
      console.log("🧹 Destruction Cloudinary :", ressource.publicId);
      
      const resourceTypes: ("raw" | "image" | "video")[] = ["raw", "image", "video"];
      for (const t of resourceTypes) {
        await cloudinary.uploader.destroy(ressource.publicId, { resource_type: t });
      }
    }

    // 3. SUPPRESSION NEON (Verrouillée par ID)
    await prisma.ressource.delete({
      where: { id: id }
    });

    revalidatePath("/teacher/upload");
    return { success: true };

  } catch (error: any) {
    console.error("❌ Erreur suppression :", error.message);
    return { error: "Échec de la suppression définitive." };
  }
}


export async function toggleVisibilityAction(id: number, currentStatus: boolean) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;

    // 🛡️ SÉCURITÉ : On ne met à jour que si la ressource appartient à l'école du prof
    const ressource = await prisma.ressource.findUnique({
      where: { id, ecoleId } // Le findUnique avec ecoleId garantit le verrou
    });

    if (!ressource) return { error: "Action non autorisée." };

    await prisma.ressource.update({
      where: { id },
      data: { isPublished: !currentStatus }
    });

    revalidatePath("/teacher/resources");
    return { success: true };
  } catch (error) {
    return { error: "Erreur de mise à jour de la visibilité" };
  }
}



export async function updateRessourceAction(
  id: number, 
  formData: FormData,
  fileInfo: { url: string; publicId: string; size: number; type: "VIDEO" | "PDF" | "AUDIO"; corrigeUrl?: string; }
) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;

    // 1. VÉRIFICATION DE PROPRIÉTÉ AVANT TOUT
    const oldRessource = await prisma.ressource.findUnique({
      where: { id, ecoleId }, // 🔒 Verrou SaaS
      select: { publicId: true, ecoleId: true }
    });

    if (!oldRessource) return { error: "Ressource introuvable dans votre école." };

    // 2. NETTOYAGE CLOUDINARY (Si le fichier a changé)
  
    if (fileInfo.publicId && oldRessource?.publicId && fileInfo.publicId !== oldRessource.publicId) {
      const pid = oldRessource.publicId; // 👈 On capture la valeur ici
      const resourceTypes: ("raw" | "image" | "video")[] = ["raw", "image", "video"];
      
      for (const t of resourceTypes) {
        // TypeScript sait maintenant que 'pid' est une string grâce au check du if
        await cloudinary.uploader.destroy(pid, { resource_type: t });
      }
    }


    // 3. MISE À JOUR NEON
    await prisma.ressource.update({
      where: { id },
      data: {
        titre: formData.get("titre") as string,
        url: fileInfo.url,
        size: fileInfo.size,
        publicId: fileInfo.publicId,
        type: fileInfo.type,
        classeId: parseInt(formData.get("classeId") as string),
        leconId: parseInt(formData.get("leconId") as string),
        transcription: fileInfo.corrigeUrl ? { corrigeUrl: fileInfo.corrigeUrl } : Prisma.JsonNull,
      },
    });

    revalidatePath("/teacher/resources");
    return { success: true };
  } catch (error: any) {
    return { error: "Échec de la mise à jour." };
  }
}



export async function markAsReadAction(id: string) {
  try {
    await prisma.ressource.update({
      where: { 
        // 🎯 On convertit l'id de string vers number ici
        id: Number(id) 
      },
      data: { isRead: true },
    });
    
    revalidatePath("/dashboard/archives"); 
    return { success: true };
  } catch (error) {
    console.error("Erreur Prisma:", error);
    return { success: false };
  }
}



