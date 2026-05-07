"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateCoefficientAction(formData: FormData) {
  try {
    const session = await auth();
    const user = session?.user as any;
    const ecoleId = user?.ecoleId;
    const anneeId = user?.anneeId; // 📅 RÉCUPÉRATION DE L'ANNÉE ACTIVE

    if (!ecoleId || !anneeId) {
      return { error: "Session expirée ou année scolaire non définie." };
    }

    const valeur = parseInt(formData.get("valeur") as string);
    const matiereId = parseInt(formData.get("matiereId") as string);
    const serieId = parseInt(formData.get("serieId") as string);
     
    if (isNaN(valeur) || isNaN(matiereId) || isNaN(serieId)) {
      return { error: "Données invalides." };
    }

    // 1. SOUDURE TOTALE (Upsert avec les 4 clés de ton @@unique)
    // On utilise exactement la clé composite de ton schema.prisma
    await prisma.coefficient.upsert({
      where: {
        matiereId_serieId_ecoleId_anneeId: { 
          matiereId, 
          serieId, 
          ecoleId, 
          anneeId 
        }
      },
      update: { valeur },
      create: { 
        valeur, 
        matiereId, 
        serieId,
        ecoleId, // ✅ INDISPENSABLE POUR LE FILTRAGE SAAS
        anneeId  // ✅ INDISPENSABLE POUR LE CALCUL DU BULLETIN
      }
    });

    revalidatePath("/admin/bulletins"); // On rafraîchit aussi le dashboard bulletins
    return { success: true };
  } catch (error: any) {
    console.error("Erreur Coefficient:", error.message);
    return { error: "Erreur technique d'enregistrement." };
  }
}