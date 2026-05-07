"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import de la session
import { revalidatePath } from "next/cache";

export async function createLevelAction(formData: FormData) {
  try {
    const session = await auth();
    const ecoleId = session?.user?.ecoleId;

    if (!ecoleId) return { error: "Session expirée ou école non reconnue." };

    const nom = (formData.get("nom") as string)?.trim();

    if (!nom || nom.length < 2) {
      return { error: "Le nom du niveau est trop court." };
    }

    // 1. VÉRIFICATION D'UNICITÉ (Seulement au sein de CETTE école)
    // On ne veut pas bloquer l'Admin si le nom existe dans une AUTRE école
    const existing = await prisma.level.findFirst({
      where: { 
        nom,
        ecoleId // 🔒 Le verrou est ici
      }
    });

    if (existing) {
      return { error: "Ce niveau existe déjà dans votre établissement." };
    }

    // 2. CRÉATION AVEC LIAISON ÉCOLE
    await prisma.level.create({
      data: { 
        nom,
        ecoleId // 🛡️ On l'attache à la maison mère
      }
    });

    revalidatePath("/admin/levels");
    return { success: true };
  } catch (error) {
    console.error("Erreur Create Level:", error);
    return { error: "Erreur lors de la création du niveau." };
  }
}

export async function deleteLevelAction(id: number) {
  try {
    const session = await auth();
    const ecoleId = session?.user?.ecoleId;

    if (!ecoleId) return { error: "Non autorisé." };

    // 1. VÉRIFICATION + SÉCURITÉ (On vérifie qu'il appartient bien à l'école)
    const level = await prisma.level.findUnique({
      where: { id },
      include: { 
        _count: { select: { classes: true } } 
      }
    });

    if (!level || level.ecoleId !== ecoleId) {
      return { error: "Niveau introuvable dans votre école." };
    }

    if (level._count.classes > 0) {
      return { error: "Impossible : ce niveau contient des classes actives." };
    }

    // 2. SUPPRESSION
    await prisma.level.delete({
      where: { id }
    });

    revalidatePath("/admin/levels");
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la suppression." };
  }
}
