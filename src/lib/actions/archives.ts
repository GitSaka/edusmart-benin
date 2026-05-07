"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { deleteFileFromCloudinaryAction } from "./cloudinary";

export async function saveEpreuveAction(data: {
  titre: string;
  type: string;
  examen?: string;
  session: number;
  trimestre?: number;
  matiere: string;
  classe: string;
  serie?: string;
  fichierUrl: string;
  // ✅ AJOUT DE LA CLÉ DE SÉCURITÉ
  fichierPublicId: string;
  corrigeUrl?: string;
  corrigePublicId?: string;
}) {
  try {
    const session = await auth();
    const user = session?.user as any;

    if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
      return { error: "Accès réservé aux administrateurs et professeurs." };
    }

    const nouvelleEpreuve = await prisma.epreuveArchive.create({
      data: {
        ...data,
        // On nettoie la donnée (Bénin Style)
        matiere: data.matiere.toUpperCase(),
        session: Number(data.session),
        auteur: user.nom ? `M. ${user.nom}` : "Anonyme",
        auteurId: user.id // 🔒 Indispensable pour que le bouton "Supprimer" sache si c'est son propre document
      },
    });

    revalidatePath("/admin/archives");
    return { 
      success: true, 
      message: `L'archive "${data.titre}" est bien enregistrée ! 🚀` 
    };

  } catch (error: any) {
    console.error("Erreur Archives:", error);
    return { error: "Problème d'enregistrement en base de données." };
  }
}


export async function deleteEpreuveAction(id: number) {
  try {
    const session = await auth();
    const user = session?.user as any;

    // 1. 🔎 RÉCUPÉRATION DU DOCUMENT
    const epreuve = await prisma.epreuveArchive.findUnique({ where: { id } });
    if (!epreuve) return { error: "Épreuve introuvable." };

    // 🔒 2. SÉCURITÉ : Seul l'auteur ou l'Admin peut supprimer
    if (user.role !== "ADMIN" && user.id !== epreuve.auteurId) {
      return { error: "Vous n'avez pas le droit de supprimer ce document." };
    }

    // 🌪️ 3. NETTOYAGE CLOUDINARY (Sujet + Corrigé)
    // On utilise ton code robuste qui extrait le PublicID de l'URL
    if (epreuve.fichierUrl) {
      await deleteFileFromCloudinaryAction(epreuve.fichierUrl);
    }
    if (epreuve.corrigeUrl) {
      await deleteFileFromCloudinaryAction(epreuve.corrigeUrl);
    }

    // 🗑️ 4. SUPPRESSION PRISMA (Seulement si Cloudinary a été traité)
    await prisma.epreuveArchive.delete({ where: { id } });

    revalidatePath("/admin/archives");
    return { success: true, message: "Archive et fichiers supprimés avec succès ! 🗑️" };

  } catch (error) {
    console.error("Erreur Suppression:", error);
    return { error: "Échec du nettoyage des fichiers." };
  }
}



export async function getEpreuvesAction() {
  try {
    // 📥 On récupère tout, trié par les plus récents en premier
    const epreuves = await prisma.epreuveArchive.findMany({
      orderBy: { 
        createdAt: 'desc' 
      },
      // 🚀 Performance : On ne prend que ce dont on a besoin pour la liste
      select: {
        id: true,
        titre: true,
        type: true,
        examen: true,
        session: true,
        matiere: true,
        classe: true,
        serie: true,
        fichierUrl: true,
        corrigeUrl: true,
        auteur: true, // Si tu as ajouté ce champ
        auteurId: true,  // Pour la sécurité du bouton supprimer
      }
    });

    return { 
      success: true, 
      data: epreuves 
    };

  } catch (error) {
    console.error("Erreur Fetch Archives:", error);
    return { 
      success: false, 
      error: "Impossible de charger la bibliothèque.",
      data: [] 
    };
  }
}