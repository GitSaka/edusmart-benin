"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";


export async function toggleSaisieClasseAction(classeId: number, trimestre: number) {
  const session = await auth();
  const user = session?.user as any;
  const ecoleId = user?.ecoleId;
  const anneeId = user?.anneeId;

  // 1. SÉCURITÉ : Vérification des paramètres essentiels
  if (!user?.id || !ecoleId || !anneeId || !trimestre) {
    return { error: "Paramètres de session ou de période (trimestre) manquants." };
  }

  try {
    // 2. RÉCUPÉRATION DE L'ÉTAT ACTUEL DU VERROU POUR CE TRIMESTRE PRÉCIS
    const verrouActuel = await prisma.verrouSaisie.findUnique({
      where: {
        classeId_trimestre_anneeId: {
          classeId: Number(classeId),
          trimestre: Number(trimestre),
          anneeId: Number(anneeId)
        }
      }
    });

    // Si le verrou n'existe pas, on considère que c'est ouvert (estBloque: false)
    // Le nouvel état sera donc l'inverse de l'état actuel
    const nouvelEtatBloque = !verrouActuel?.estBloque;

    // 3. UPSERT DU VERROU (Créer ou Mettre à jour)
    // On cible uniquement le trimestre envoyé depuis le front-end
    await prisma.verrouSaisie.upsert({
      where: {
        classeId_trimestre_anneeId: {
          classeId: Number(classeId),
          trimestre: Number(trimestre),
          anneeId: Number(anneeId)
        }
      },
      update: { estBloque: nouvelEtatBloque },
      create: {
        classeId: Number(classeId),
        trimestre: Number(trimestre),
        anneeId: Number(anneeId),
        estBloque: nouvelEtatBloque
      }
    });

    // 🚀 ÉTAPE CRUCIALE : NETTOYAGE SI RÉOUVERTURE
    // Si nouvelEtatBloque est FALSE (on vient de réouvrir la saisie), on supprime les bulletins.
    // Cela force le recalcul des rangs pour ce trimestre spécifique.
    if (nouvelEtatBloque === false) {
      await prisma.bulletin.deleteMany({
        where: {
          classeId: Number(classeId),
          trimestre: Number(trimestre),
          anneeId: Number(anneeId)
        }
      });
    }

    // 🔄 RAFRAÎCHISSEMENT DE L'INTERFACE
    revalidatePath("/admin/bulletins");
    
    return { 
      success: true, 
      isLocked: nouvelEtatBloque,
      message: nouvelEtatBloque 
        ? `Saisie clôturée pour le Trimestre ${trimestre}.` 
        : `Saisie réouverte. Les bulletins du Trimestre ${trimestre} ont été annulés pour permettre les corrections.`
    };

  } catch (error: any) {
    console.error("Erreur Verrou Trimestre:", error);
    return { error: "Échec technique de la bascule du verrou." };
  }
}

export async function publierBulletinsAction(classeId: number, trimestre: number) {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;

  if (!session?.user?.id || !ecoleId) return { error: "Non autorisé" };

  try {
    // 🚀 ON OUVRE LES VANNES POUR TOUTE LA CLASSE
    await prisma.bulletin.updateMany({
      where: { classeId, trimestre, ecoleId },
      data: { estPublie: true }
    });

    revalidatePath("/admin/bulletins");
    return { success: true, message: "Les bulletins sont maintenant visibles par les élèves !" };
  } catch (error) {
    return { error: "Erreur lors de la diffusion." };
  }
}

