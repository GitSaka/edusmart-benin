"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updatePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" };

  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  // 1. Récupérer l'utilisateur actuel
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Utilisateur introuvable" };

  // 2. Vérifier si l'ancien mot de passe est correct
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return { error: "L'ancien mot de passe est incorrect." };

  // 3. Hasher et sauvegarder le nouveau
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword }
  });

  return { success: true, message: "Mot de passe mis à jour !" };
}
