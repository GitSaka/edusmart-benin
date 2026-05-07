"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function logStudySessionAction(ressourceId: number, minutes: number, type: string) {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  if (!session?.user?.id || !ecoleId) return { error: "Session invalide" };

  try {
    // 🔍 RÉCUPÉRER LE PROFIL ÉLÈVE
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!student) return { error: "Profil élève introuvable" };

    // 🚀 ENREGISTREMENT DU LOG
    await prisma.activityLog.create({
      data: {
        studentId: student.id,
        userId: session.user.id,
        ecoleId: ecoleId,
        anneeId: anneeId,
        ressourceId: ressourceId,
        action: `Étude terminée : ${type}`,
        duree: Math.round(minutes), // ✅ On stocke les minutes (ex: 12)
        date: new Date()
      }
    });

    revalidatePath("/student/dashboard"); // Pour mettre à jour son radar
    return { success: true };
  } catch (error) {
    console.error("Erreur ActivityLog:", error);
    return { error: "Échec du mouchard" };
  }
}