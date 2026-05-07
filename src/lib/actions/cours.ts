"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Importation de la session
import { revalidatePath } from "next/cache";

export async function createCoursAction(formData: FormData) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;
    const anneeId = (session?.user as any)?.anneeId;

    if (!ecoleId || !anneeId) return { error: "Session expirée." };

    const teacherId = formData.get("teacherId") as string;
    const matiereId = Number(formData.get("matiereId"));
    const classeId = Number(formData.get("classeId"));

    if (!teacherId || isNaN(matiereId) || isNaN(classeId)) {
      return { error: "Veuillez remplir tous les champs." };
    }

    // 1. VÉRIFICATION D'APPARTENANCE (SaaS Security)
    // On vérifie que la classe appartient bien à l'école ET à l'année en cours
    const classeValide = await prisma.classe.findFirst({
      where: { id: classeId, ecoleId, anneeId }
    });

    if (!classeValide) return { error: "Action non autorisée sur cette classe." };

    // 2. CRÉATION DU COURS AVEC TOUS LES VERROUS
    await prisma.cours.create({
      data: {
        teacherId: teacherId,
        matiereId: matiereId,
        classeId: classeId,
        ecoleId: ecoleId,   // 🔒 Verrou École
        anneeId: anneeId,   // 📅 Verrou Année (Le cours est lié à 2025-2026)
        saisieOuverte: true,
      } as any, 
    });

    revalidatePath("/admin/cours");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Ce prof enseigne déjà cette matière dans cette classe pour cette année." };
    }
    console.error("Erreur Prisma Cours:", error);
    return { error: "Erreur technique lors de la création." };
  }
}

export async function deleteCoursAction(coursId: number) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;

    // 1. VÉRIFICATION DE PROPRIÉTÉ
    const cours = await prisma.cours.findUnique({
      where: { id: coursId },
      select: { ecoleId: true, _count: { select: { notes: true } } }
    });

    if (!cours || cours.ecoleId !== ecoleId) {
      return { error: "Cours introuvable dans votre école." };
    }

    // 2. SÉCURITÉ PÉDAGOGIQUE : On ne supprime pas si des notes existent déjà
    if (cours._count.notes > 0) {
      return { error: "Impossible : Ce cours contient déjà des notes d'élèves." };
    }

    await prisma.cours.delete({ where: { id: coursId } });

    revalidatePath("/admin/cours");
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la suppression du cours." };
  }
}

export async function toggleSaisieAction(coursId: number, currentStatus: boolean) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;

    // Sécurité : Seule l'école propriétaire peut verrouiller/déverrouiller la saisie
    const cours = await prisma.cours.findUnique({
      where: { id: coursId },
      select: { ecoleId: true }
    });

    if (!cours || cours.ecoleId !== ecoleId) return { error: "Non autorisé." };

    await prisma.cours.update({
      where: { id: coursId },
      data: { saisieOuverte: !currentStatus }
    });
    
    revalidatePath("/admin/cours");
    return { success: true };
  } catch (error) {
    return { error: "Erreur de verrouillage." };
  }
}
