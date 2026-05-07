"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StatutPaye } from "@prisma/client";

export async function updateLevelPriceAction(
  levelId: number, 
  newPrice: number,
  ecoleId: number,
  anneeId: number
) {
  try {
    await prisma.$transaction(async (tx) => {
      
      // 1. ✅ Table LEVEL : On met à jour le tarif de référence
      await tx.level.update({
        where: { id: levelId, ecoleId: ecoleId },
        data: { scolariteBase: newPrice }, // Vérifie que c'est bien 'scolariteBase' dans Level
      });

      // 2. ✅ Table CLASSE : On propage aux classes de l'année
      await tx.classe.updateMany({
        where: { 
          levelId: levelId, 
          ecoleId: ecoleId,
          anneeId: anneeId 
        },
        data: { scolariteBase: newPrice }, // Vérifie que c'est bien 'scolariteBase' dans Classe
      });

      // 3. ✅ Table STUDENT : ATTENTION AU NOM DU CHAMP ICI
      await tx.student.updateMany({
        where: {
          ecoleId: ecoleId,
          anneeId: anneeId,
          classe: { levelId: levelId }
        },
        // 🎯 Si dans ton schéma Student c'est 'scolariteTotale', on garde 'scolariteTotale'
        data: { scolariteTotale: newPrice }, 
      });
    });

    revalidatePath("/admin/finance");
    return { success: true };
  } catch (error: any) {
    // 🕵️‍♂️ On affiche l'erreur RÉELLE dans ton terminal pour être sûr
    console.error("❌ ERREUR PRISMA :", error.message);
    return { success: false, error: "Erreur de mise à jour des tarifs." };
  }
}


export async function createPaymentAction(formData: {
  amount: number;
  tranche: string;
  studentId: string;
  ecoleId: number;
  anneeId: number;
}) {
  try {
    // 1. Enregistrement du paiement dans la DB
    const paiement = await prisma.paiement.create({
      data: {
        montant: formData.amount,
        tranche: formData.tranche,
        studentId: formData.studentId,
        ecoleId: formData.ecoleId,
        anneeId: formData.anneeId,
        statut: StatutPaye.AVANCE,  // Tu peux ajuster selon ta logique
        methode: "ESPECES",
      },
      include: { student: true }
    });

    // 2. 📲 ICI : Logique d'envoi du SMS (on le fera juste après)
    console.log(`SMS à envoyer au parent de ${paiement.student.nom}`);

    revalidatePath("/admin/finance");
    return { success: true, data: paiement };
  } catch (error: any) {
    console.error("ERREUR_PAIEMENT:", error.message);
    return { success: false, error: "Impossible d'enregistrer le paiement." };
  }
}

export async function updatePaymentAction(paymentId: number, newAmount: number) {
  try {
    const updated = await prisma.paiement.update({
      where: { id: paymentId },
      data: { montant: newAmount }
    });
    revalidatePath("/admin/finance");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Erreur de mise à jour" };
  }
}

