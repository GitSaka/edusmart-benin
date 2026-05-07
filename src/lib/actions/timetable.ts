"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import de la session
import { revalidatePath } from "next/cache";

export async function createTimetableAction(formData: FormData) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;
    const anneeId = (session?.user as any)?.anneeId;

    if (!ecoleId || !anneeId) return { error: "Session expirée." };

    const coursId = Number(formData.get("coursId"));
    const jour = formData.get("jour") as any; 
    const heureDebut = formData.get("heureDebut") as string;
    const heureFin = formData.get("heureFin") as string;

    if (isNaN(coursId) || !jour || !heureDebut || !heureFin) {
      return { error: "Données de planification incomplètes." };
    }

    // 1. RÉCUPÉRATION DU COURS (Vérification de propriété SaaS)
    const coursConcerne = await prisma.cours.findUnique({ 
      where: { id: coursId },
      select: { teacherId: true, ecoleId: true } 
    });

    if (!coursConcerne || coursConcerne.ecoleId !== ecoleId) {
      return { error: "Action non autorisée sur ce cours." };
    }

    // 2. 🕵️ RADAR ANTI-CONFLIT PROFESSEUR (Verrouillé par École et Année)
    // On vérifie si le prof est déjà pris à cette heure dans CETTE école et CETTE année
    const conflit = await prisma.timetable.findFirst({
      where: {
        jour: jour,
        heureDebut: heureDebut,
        ecoleId: ecoleId, // 🔒 Isolation SaaS
        anneeId: anneeId, // 📅 Isolation Temporelle
        cours: { teacherId: coursConcerne.teacherId }
      },
      include: { 
    // ✅ INDISPENSABLE : On demande à Prisma de ramener l'objet cours
    // pour pouvoir lire le nom de la classe et de la matière
    cours: { 
      include: { 
        classe: true, 
        matiere: true 
      } 
    } 
  }
    });

    if (conflit) {
       const c = conflit as any;
  // 🚀 Maintenant 'conflit.cours' existe et ne sera plus en rouge !
  return { 
    error: `⚠️ Conflit : Le prof est déjà en ${c.cours.classe.nom} (${c.cours.matiere.nom}) !` 
  };
}

    // 3. ENREGISTREMENT SÉCURISÉ
   await prisma.timetable.create({
  data: {
    jour: jour,
    heureDebut: heureDebut, // ✅ Simple et propre
    heureFin: heureFin,     // ✅ Simple et propre
    ecoleId: ecoleId,       // ✅ Utilise l'ID direct (grâce à ton schéma ?)
    anneeId: anneeId,       // ✅ Utilise l'ID direct
    coursId: coursId        // ✅ Utilise l'ID direct
  }
});

    revalidatePath("/admin/timetable");
    return { success: true };
  } catch (error) {
    console.error("Erreur Timetable:", error);
    return { error: "Erreur lors de la mise à jour de l'emploi du temps." };
  }
}

export async function deleteTimetableAction(id: number) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;

    // Sécurité : On ne supprime que si le créneau appartient à l'école de l'admin
    const slot = await prisma.timetable.findUnique({
      where: { id },
      select: { ecoleId: true }
    });

    if (!slot || slot.ecoleId !== ecoleId) return { error: "Non autorisé." };

    await prisma.timetable.delete({ where: { id } });

    revalidatePath("/admin/academic/timetable");
    return { success: true };
  } catch (error) {
    return { error: "Impossible de supprimer ce créneau." };
  }
}
