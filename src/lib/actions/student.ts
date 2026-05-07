"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";


export async function createStudentAction(formData: FormData) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;
    const anneeId = (session?.user as any)?.anneeId;

    if (!ecoleId || !anneeId) return { error: "Session expirée ou école non reconnue." };

    // 1. EXTRACTION & VALIDATION
    const nom = (formData.get("nom") as string)?.toUpperCase().trim();
    const prenom = (formData.get("prenom") as string)?.trim();
    const sexe = formData.get("sexe") as string;
    const dateNaissanceInput = formData.get("dateNaissance") as string;
    const dateNaissance = new Date(dateNaissanceInput);
    const classeId = parseInt(formData.get("classeId") as string);
    const photoUrl = formData.get("img") as string;
    const parentPhone = (formData.get("parentPhone") as string)?.trim();
    const scolariteTotale = parseFloat(formData.get("scolariteTotale") as string) || 0;

    if (!nom || !prenom || isNaN(classeId) || !parentPhone || !dateNaissanceInput) {
      return { error: "Veuillez remplir tous les champs obligatoires." };
    }

    // 2. ANTI-DOUBLON ÉLÈVE (Même enfant dans la même école)
    const duplicateStudent = await prisma.student.findFirst({
      where: {
        nom: { equals: nom, mode: 'insensitive' },
        prenom: { equals: prenom, mode: 'insensitive' },
        dateNaissance,
        ecoleId 
      }
    });
    if (duplicateStudent) return { error: "Cet élève est déjà enregistré dans votre établissement." };

    // 3. GÉNÉRATION MATRICULE PRO (Ex: 2025-CE001-0001)
    const school = await prisma.ecole.findUnique({ where: { id: ecoleId }, select: { code: true } });
    const currentYear = new Date().getFullYear();
    const schoolCode = school?.code || "EDU";
    
    const lastStudent = await prisma.student.findFirst({
      where: { 
        ecoleId,
        matricule: { startsWith: `${currentYear}-${schoolCode}-` } 
      },
      orderBy: { matricule: 'desc' },
    });

    let nextNumber = 1;
    if (lastStudent) {
      const parts = lastStudent.matricule.split('-');
      nextNumber = parseInt(parts[parts.length - 1]) + 1;
    }
    const autoMatricule = `${currentYear}-${schoolCode}-${nextNumber.toString().padStart(4, '0')}`;

    const hashedPassword = await bcrypt.hash("123456", 10);

    // 4. TRANSACTION ATOMIQUE (Gestion Multi-Rôles)
    const finalResult = await prisma.$transaction(async (tx) => {
      
      // ✅ ÉTAPE A : GESTION INTELLIGENTE DU PARENT (Check si l'User existe déjà)
      let userAccount = await tx.user.findUnique({ where: { username: parentPhone } });
      let parentProfile;

      if (userAccount) {
        // L'utilisateur existe (Peut être un PROF ou un autre PARENT)
        parentProfile = await tx.parent.findUnique({ where: { userId: userAccount.id } });
        
        if (!parentProfile) {
          // L'user existe mais n'a pas encore de profil "Parent", on lui crée
          parentProfile = await tx.parent.create({
            data: {
              nom: (formData.get("parentNom") as string || nom).toUpperCase().trim(),
              prenom: (formData.get("parentPrenom") as string || "Parent").trim(),
              telephone: parentPhone,
              userId: userAccount.id,
              ecoleId
            }
          });
        }
      } else {
        // Nouvel utilisateur total
        const newParentUser = await tx.user.create({
          data: { username: parentPhone, password: hashedPassword, role: "PARENT", ecoleId }
        });
        parentProfile = await tx.parent.create({
          data: {
            nom: (formData.get("parentNom") as string || nom).toUpperCase().trim(),
            prenom: (formData.get("parentPrenom") as string || "Parent").trim(),
            telephone: parentPhone,
            userId: newParentUser.id,
            ecoleId
          }
        });
      }

      // ✅ ÉTAPE B : CRÉATION DU COMPTE ÉLÈVE
      const studentUser = await tx.user.create({
        data: { username: autoMatricule, password: hashedPassword, role: "STUDENT", ecoleId },
      });

      // ✅ ÉTAPE C : FICHE ÉLÈVE FINALE
      const newStudent = await tx.student.create({
        data: {
          matricule: autoMatricule,
          nom, prenom, sexe, dateNaissance,
          adresse: "Bénin",
          img: photoUrl || null,
          userId: studentUser.id,
          parentId: parentProfile.id,
          classeId: classeId,
          ecoleId: ecoleId,
          scolariteTotale,
          anneeId: anneeId // 📅 On n'oublie pas l'année d'inscription
        },
      });

      return { success: true, matricule: autoMatricule };
    });

    revalidatePath("/admin/students");
    return { 
      success: true, 
      message: `Inscription réussie ! Matricule : ${finalResult.matricule}`, 
      matricule: finalResult.matricule 
    };

  } catch (error: any) {
    console.error("❌ Erreur Critique Inscription:", error);
    if (error.code === 'P2002') return { error: "Erreur de doublon : Ce matricule ou téléphone est déjà utilisé." };
    return { error: "Une erreur technique est survenue sur le serveur Neon." };
  }
}


export async function updateStudentAction(studentId: string, formData: FormData) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;

    if (!ecoleId) return { error: "Non autorisé." };

    // 🛡️ VÉRIFICATION PROPRIÉTÉ
    const currentStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: { parent: true }
    });

    if (!currentStudent || currentStudent.ecoleId !== ecoleId) {
      return { error: "Élève introuvable dans votre école." };
    }

    const nom = (formData.get("nom") as string || "").toUpperCase().trim();
    const prenom = (formData.get("prenom") as string || "").trim();
    const scolariteTotale = parseFloat(formData.get("scolariteTotale") as string) || 0;

    await prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: studentId },
        data: {
          nom, prenom, 
          sexe: formData.get("sexe") as string,
          dateNaissance: new Date(formData.get("dateNaissance") as string),
          img: formData.get("img") as string || currentStudent.img,
          classeId: parseInt(formData.get("classeId") as string),
          scolariteTotale // 💰 Mise à jour dette
        }
      });

      await tx.parent.update({
        where: { id: currentStudent.parentId },
        data: {
          nom: (formData.get("parentNom") as string || "PARENT").toUpperCase().trim(),
          prenom: (formData.get("parentPrenom") as string || "ANONYME").trim(),
          telephone: (formData.get("parentPhone") as string).trim(),
          user: { update: { username: (formData.get("parentPhone") as string).trim() } }
        }
      });
    });

    revalidatePath("/admin/students");
    return { success: true, message: "Profil mis à jour !" };

  } catch (error: any) {
    return { error: "Erreur lors de la modification." };
  }
}



export async function updateStudentPhotoAction(imageUrl: string) {
  try {
    const session = await auth();
    const ecoleId = (session?.user as any)?.ecoleId;

    // 1. SÉCURITÉ : On vérifie que c'est bien un élève connecté
    if (!session?.user?.id || session.user.role !== "STUDENT") {
      return { error: "Non autorisé" };
    }

    // 2. MUR DE FER : On met à jour MAIS on verrouille par ecoleId
    // On s'assure que l'élève ne peut pas modifier un profil qui n'est pas le sien
    // ou qui appartient à une autre école par erreur de cache.
    await prisma.student.update({
      where: { 
        userId: session.user.id,
        ecoleId: ecoleId // 🔒 Verrouillage de sécurité SaaS
      },
      data: { img: imageUrl }
    });

    revalidatePath("/dashboard/profile");
    return { success: true };

  } catch (error) {
    console.error("Erreur Photo Student:", error);
    return { error: "Impossible de mettre à jour la photo." };
  }
}



