"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import de la session
import { revalidatePath } from "next/cache";

export async function createClasseAction(formData: FormData) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;
    const anneeId = (session?.user as any)?.anneeId;

    if (!ecoleId || !anneeId) {
      return { error: "Session invalide. Veuillez vous reconnecter." };
    }

    const suffixe = (formData.get("nom") as string)?.trim().toUpperCase();
    const serieIdRaw = formData.get("serieId");
    const capacite = parseInt(formData.get("capacite") as string) || 45;

    if (!suffixe || !serieIdRaw) {
      return { error: "Le nom (A, B, 1...) et la série sont obligatoires." };
    }

    const serieId = parseInt(serieIdRaw as string);

    // 1. RÉCUPÉRATION DES RÉFÉRENCES (Vérification d'appartenance à l'école)
    const serieRef = await prisma.serie.findFirst({
      where: { 
        id: serieId,
        ecoleId: ecoleId // 🔒 Sécurité : On vérifie que la série appartient à l'école
      },
      include: { level: true } 
    });

    if (!serieRef || !serieRef.level) return { error: "Série ou Niveau introuvable." };

    // 2. CONCATÉNATION DU NOM
    const nomComplet = `${serieRef.level.nom} ${serieRef.nom} ${suffixe}`;

    // 3. VÉRIFICATION DU DOUBLON (Unique PAR ECOLE et PAR ANNÉE)
    const existingClasse = await prisma.classe.findFirst({
      where: { 
        nom: nomComplet,
        ecoleId: ecoleId,
        anneeId: anneeId // 📅 Important : on peut avoir une "TLE D A" en 2025 et en 2026
      }
    });

    if (existingClasse) {
      return { error: `La salle "${nomComplet}" est déjà configurée pour cette année.` };
    }

    // 4. CRÉATION AVEC TOUS LES VERROUS
    await prisma.classe.create({
      data: {
        nom: nomComplet,
        capacite,
        serieId,
        levelId: serieRef.levelId,
        ecoleId: ecoleId, // 🏫 Liaison École
        anneeId: anneeId, // 📅 Liaison Année Scolaire
      }
    });

    revalidatePath("/admin/classes");
    return { success: true };

  } catch (error: any) {
    console.error("ERREUR CRITICAL CLASSE:", error);
    return { error: "Échec de l'enregistrement." };
  }
}

export async function deleteClasseAction(id: number) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;

    // 1. VÉRIFICATION D'APPARTENANCE
    const classe = await prisma.classe.findUnique({
      where: { id },
      include: {
        _count: { select: { eleves: true, cours: true } }
      }
    });

    if (!classe || classe.ecoleId !== ecoleId) {
      return { error: "Action non autorisée ou salle introuvable." };
    }

    // 2. BLOCAGE SI NON VIDE
    if (classe._count.eleves > 0 || classe._count.cours > 0) {
      return { error: "Cette salle est liée à des données actives (élèves/cours)." };
    }

    await prisma.classe.delete({ where: { id } });

    revalidatePath("/admin/classes");
    return { success: true };

  } catch (error) {
    return { error: "Erreur lors de la suppression." };
  }
}
