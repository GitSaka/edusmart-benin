"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import pour le verrou SaaS
import { revalidatePath } from "next/cache";

export async function createMatiereAction(formData: FormData) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;

    if (!ecoleId) return { error: "Session expirée." };

    const nom = (formData.get("nom") as string)?.trim();
    if (!nom || nom.length < 2) return { error: "Le nom de la matière est trop court." };

    // 1. VÉRIFICATION D'UNICITÉ PAR ÉCOLE
    const existing = await prisma.matiere.findFirst({
      where: { 
        nom: { equals: nom, mode: 'insensitive' }, // ✅ Évite "Maths" et "maths"
        ecoleId: ecoleId 
      }
    });

    if (existing) return { error: "Cette matière existe déjà dans votre établissement." };

    // 2. CRÉATION AVEC LIAISON ÉCOLE
    await prisma.matiere.create({
      data: { 
        nom,
        ecoleId: ecoleId // 🔒 Verrou SaaS
      }
    });

    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (error) {
    console.error("Erreur Create Matiere:", error);
    return { error: "Erreur lors de l'enregistrement." };
  }
}

export async function deleteMatiereAction(id: number) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;

    if (!ecoleId) return { error: "Non autorisé." };

    // 1. RÉCUPÉRATION ET VÉRIFICATION D'APPARTENANCE
    const matiere = await prisma.matiere.findUnique({
      where: { id },
      include: {
        _count: {
          select: { cours: true, coefficients: true }
        }
      }
    });

    if (!matiere || matiere.ecoleId !== ecoleId) {
      return { error: "Matière introuvable dans votre école." };
    }

    // 2. BLOCAGE SI UTILISÉE (COEFS OU COURS)
    if (matiere._count.cours > 0 || matiere._count.coefficients > 0) {
      return { error: "Impossible : Cette matière est déjà liée à des cours ou des coefficients." };
    }

    await prisma.matiere.delete({ where: { id } });
    
    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (error) {
    return { error: "Échec de la suppression technique." };
  }
}
