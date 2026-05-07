"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // ✅ Import de la session
import { revalidatePath } from "next/cache";

export async function toggleAttendanceAction(studentId: string, coursId: number, willBeAbsent: boolean) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;
    const anneeId = (session?.user as any)?.anneeId;

    if (!ecoleId || !anneeId) return { error: "Session expirée." };

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Unicité du jour (minuit)

    if (willBeAbsent) {
      // 1. RECHERCHE SI UNE ABSENCE EXISTE DÉJÀ AUJOURD'HUI
      const existing = await prisma.presence.findFirst({
        where: { studentId, coursId, date: today, ecoleId }
      });

      if (existing) {
        // ✅ MISE À JOUR (Si déjà marqué absent, on confirme)
        await prisma.presence.update({
          where: { id: existing.id },
          data: { estPresent: false }
        });
      } else {
        // ✅ CRÉATION AVEC TOUS LES VERROUS
        await prisma.presence.create({
          data: {
            studentId,
            coursId,
            estPresent: false,
            date: today,
            ecoleId, // 🔒 Verrou École
            anneeId, // 📅 Verrou Année (Indispensable pour le calcul des absences par an)
          }
        });
      }
    } else {
      // 2. SUPPRESSION (L'élève est redevenu présent)
      await prisma.presence.deleteMany({
        where: { 
          studentId, 
          coursId, 
          date: today,
          ecoleId // 🛡️ Sécurité : On ne supprime que dans son école
        }
      });
    }

    revalidatePath("/teacher/attendance"); 
    return { success: true };
  } catch (error: any) {
    console.error("Erreur Neon Attendance:", error);
    return { error: "Erreur de synchronisation." };
  }
}
