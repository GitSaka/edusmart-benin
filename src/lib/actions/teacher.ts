"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createTeacherAction(formData: FormData) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;

    if (!ecoleId) return { error: "Session expirée ou école non reconnue." };

    // 1. RÉCUPÉRATION ET NETTOYAGE
    const nom = (formData.get("nom") as string).toUpperCase().trim();
    const prenom = (formData.get("prenom") as string).trim();
    const telephone = (formData.get("telephone") as string).trim();
    const matiereId = parseInt(formData.get("matiereId") as string);
    const photoUrl = formData.get("img") as string;
    
    const selectedClassesStr = formData.get("selectedClasses") as string;
    const classesIds = selectedClassesStr ? (JSON.parse(selectedClassesStr) as number[]) : [];

    if (!nom || !prenom || !telephone || isNaN(matiereId)) {
      return { error: "Veuillez remplir tous les champs obligatoires." };
    }

    const hashedPassword = await bcrypt.hash("123456", 10);

    // 2. TRANSACTION ATOMIQUE (SaaS Ready)
    const result = await prisma.$transaction(async (tx) => {
      // A. Créer le compte User lié à l'école
      const user = await tx.user.create({
        data: {
          username: telephone,
          password: hashedPassword,
          role: "TEACHER",
          ecoleId: ecoleId, // 🔒 Verrou 1
        },
      });

      // B. Créer le profil Teacher lié à l'école
      const teacher = await tx.teacher.create({
        data: {
          nom,
          prenom,
          telephone,
          img: photoUrl || null,
          userId: user.id,
          matiereId,
          ecoleId: ecoleId, // 🔒 Verrou 2
          classes: {
            connect: classesIds.map(id => ({ id }))
          }
        },
      });

      return teacher;
    });

    revalidatePath("/admin/teachers");
    return { success: true, id: result.id };

  } catch (error: any) {
    console.error("Erreur Create Teacher:", error);
    if (error.code === 'P2002') return { error: "Ce numéro de téléphone est déjà utilisé." };
    return { error: "Erreur technique lors de la création." };
  }
}

export async function updateTeacherAction(teacherId: string, formData: FormData) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;

    if (!ecoleId) return { error: "Non autorisé." };

    const nom = (formData.get("nom") as string).toUpperCase().trim();
    const prenom = (formData.get("prenom") as string).trim();
    const telephone = (formData.get("telephone") as string).trim();
    const matiereId = parseInt(formData.get("matiereId") as string);
    
    const selectedClassesStr = formData.get("selectedClasses") as string;
    const classesIds = selectedClassesStr ? (JSON.parse(selectedClassesStr) as number[]) : [];

    // 🛡️ SÉCURITÉ : On vérifie que le prof appartient bien à l'école de l'admin
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { ecoleId: true, userId: true }
    });

    if (!teacher || teacher.ecoleId !== ecoleId) {
      return { error: "Enseignant introuvable dans votre établissement." };
    }

    // MISE À JOUR ATOMIQUE
    await prisma.$transaction([
      prisma.teacher.update({
        where: { id: teacherId },
        data: {
          nom, prenom, telephone, matiereId,
          classes: { set: classesIds.map(id => ({ id })) }
        }
      }),
      prisma.user.update({
        where: { id: teacher.userId },
        data: { username: telephone }
      })
    ]);

    revalidatePath("/admin/teachers");
    return { success: true, message: "Profil mis à jour !" };

  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Ce numéro est déjà utilisé." };
    return { error: "Une erreur technique est survenue." };
  }
}
