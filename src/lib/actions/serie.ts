"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Importation de la session
import { revalidatePath } from "next/cache";

export async function createSerieAction(formData: FormData) {
  try {
    const session = await auth();
    const ecoleId = session?.user?.ecoleId;

    if (!ecoleId) return { error: "Session expirée ou école non reconnue." };

    const nom = (formData.get("nom") as string).toUpperCase().trim();
    const levelId = parseInt(formData.get("levelId") as string);

    if (!nom || isNaN(levelId)) return { error: "Veuillez remplir tous les champs." };

    // 1. VÉRIFICATION DOUBLON (Isolée par École)
    // On vérifie que la série "A1" n'existe pas déjà POUR CE NIVEAU dans CETTE ÉCOLE
    const existing = await prisma.serie.findFirst({
      where: { 
        nom, 
        levelId,
        ecoleId // 🔒 Le verrou SaaS
      }
    });

    if (existing) return { error: "Cette série est déjà configurée pour ce niveau dans votre école." };

    // 2. CRÉATION AVEC LIAISON ÉCOLE
    await prisma.serie.create({
      data: { 
        nom, 
        levelId,
        ecoleId // 🛡️ On attache la série à la maison mère
      }
    });

    revalidatePath("/admin/configuration/series");
    return { success: true };
  } catch (error) {
    console.error("Erreur Create Serie:", error);
    return { error: "Erreur technique lors de la création de la série." };
  }
}

export async function deleteSerieAction(id: number) {
  try {
    const session = await auth();
    const ecoleId = session?.user?.ecoleId;

    if (!ecoleId) return { error: "Non autorisé." };

    // 1. VÉRIFICATION D'INTÉGRITÉ + APPARTENANCE
    const serieWithClasses = await prisma.serie.findUnique({
      where: { id },
      include: {
        _count: {
          select: { classes: true }
        }
      }
    });

    // Sécurité : On vérifie que la série appartient bien à l'école de l'admin
    if (!serieWithClasses || serieWithClasses.ecoleId !== ecoleId) {
      return { error: "Cette série n'existe pas dans votre établissement." };
    }

    if (serieWithClasses._count.classes > 0) {
      return { 
        error: `Impossible : ${serieWithClasses._count.classes} classes sont encore liées à cette série.` 
      };
    }

    // 2. SUPPRESSION DÉFINITIVE
    await prisma.serie.delete({
      where: { id }
    });

    revalidatePath("/admin/configuration/series");
    return { success: true };

  } catch (error) {
    console.error("Erreur Delete Serie:", error);
    return { error: "Une erreur technique est survenue." };
  }
}
