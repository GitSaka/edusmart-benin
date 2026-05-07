"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import cloudinary from "@/lib/cloudinary-config"; // Assure-toi d'avoir ta config Cloudinary

export async function createBookAction(data: any) {
  try {
    // 1. Extraction des textes simples
    const titre = data.titre?.trim();
    const auteur = data.auteur?.trim() || null;
    const matiere = data.matiere;
    const levelId = Number(data.levelId);
    const type = data.type || "ANNALE";

    // 2. Extraction sécurisée des données Cloudinary (PDF)
    // On s'assure de récupérer l'URL et le Public ID
    const fichierUrl = data.pdfData?.url;
    const filePublicId = data.pdfData?.publicId;

    // 3. Extraction sécurisée de la couverture (Optionnelle)
    const couverture = data.coverData?.url || null;
    const coverPublicId = data.coverData?.publicId || null;

    // 4. Validations de sécurité avant d'écrire en base
    if (!titre) return { error: "Le titre est obligatoire." };
    if (!fichierUrl || !filePublicId) return { error: "Le fichier PDF n'a pas été correctement chargé." };
    if (!levelId || isNaN(levelId)) return { error: "Niveau scolaire invalide." };
    if (!matiere) return { error: "La matière est obligatoire." };

    // 5. Création dans la base Neon avec les nouveaux champs
    const book = await prisma.library.create({
      data: {
        titre,
        auteur,
        matiere,
        levelId,
        type,
        fichierUrl,
        filePublicId,    // ✅ Sauvegardé pour suppression future
        couverture,
        coverPublicId,   // ✅ Sauvegardé pour suppression future
      },
    });

    // 6. Rafraîchissement des pages pour voir le nouveau livre
    revalidatePath("/super-admin/library");
    revalidatePath("/student/library");

    return { success: true, book };

  } catch (error: any) {
    console.error("PRISMA ERROR:", error);
    // Erreur spécifique si le titre existe déjà (si tu as mis @unique)
    if (error.code === 'P2002') return { error: "Un ouvrage porte déjà ce titre." };
    return { error: "Erreur technique lors de l'enregistrement en base de données." };
  }
}



export async function deleteBookAction(id: number) {
  try {
    // 1. On récupère le livre avec ses IDs Cloudinary
    const book = await prisma.library.findUnique({
      where: { id },
      select: { 
        filePublicId: true, 
        coverPublicId: true, 
        fichierUrl: true, 
        couverture: true 
      }
    });

    if (!book) return { error: "Livre introuvable." };

    // 🗑️ FONCTION INTERNE DE NETTOYAGE (Ta logique optimisée)
    const cleanCloudinary = async (publicId: string | null, url: string | null) => {
      // Priorité à l'ID stocké en base
      let idToDelete = publicId;
      
      // Si pas d'ID, on tente ton extraction par URL (ton ancienne méthode)
      if (!idToDelete && url) {
        const match = url.match(/\/v\d+\/([^.]+)/);
        idToDelete = match ? match[1] : url.split('/').pop()?.split('.')[0] || null;
      }

      if (!idToDelete) return;

      // On teste les types pour être sûr (Surtout 'raw' pour tes PDF)
      const resourceTypes: ("image" | "raw" | "video")[] = ["image", "raw", "video"];
      for (const type of resourceTypes) {
        const res = await cloudinary.uploader.destroy(idToDelete, { resource_type: type });
        if (res.result === 'ok') break;
      }
    };

    // 2. Nettoyage des fichiers physiques
    await Promise.all([
      cleanCloudinary(book.filePublicId, book.fichierUrl), // Le PDF
      cleanCloudinary(book.coverPublicId, book.couverture) // L'image
    ]);

    // 3. Suppression de la ligne dans Neon
    await prisma.library.delete({ where: { id } });

    revalidatePath("/super-admin/library");
    return { success: true };

  } catch (error) {
    console.error("Erreur suppression:", error);
    return { error: "Échec de la suppression complète." };
  }
}


// 2. ACTION : CHANGER LE STATUT (Publier / Masquer)
export async function togglePublishAction(id: number, currentStatus: boolean) {
  try {
    await prisma.library.update({
      where: { id },
      data: { isPublished: !currentStatus }
    });

    revalidatePath("/super-admin/library");
    revalidatePath("/student/library"); // Pour que l'élève voie le changement direct
    return { success: true };
  } catch (error) {
    return { error: "Impossible de changer le statut." };
  }
}

