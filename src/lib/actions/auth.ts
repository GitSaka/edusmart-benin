"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginAction(formData: FormData) {
  const identifier = formData.get("identifier");
  const password = formData.get("password");
  const role = formData.get("role") as string; // On récupère le rôle (STUDENT, ADMIN, SUPER_ADMIN...)
  
  // 🛡️ RÉCUPÉRATION DU CODE ÉCOLE
  const ecoleCode = formData.get("ecoleCode"); 

  try {
    await signIn("credentials", {
      identifier,
      password,
      role,
      // 💡 Si c'est TOI (Super-Admin), on peut passer "MASTER" ou null 
      // pour que ton provider ne cherche pas d'école
      ecoleCode: role === "SUPER_ADMIN" ? "MASTER" : ecoleCode, 
      
      // 🎯 REDIRECTION INTELLIGENTE
      redirectTo: role === "SUPER_ADMIN" ? "/super-admin" : // 👈 TA NOUVELLE DESTINATION
                  role === "ADMIN" ? "/admin" : 
                  role === "TEACHER" ? "/teacher" : 
                  role === "PARENT" ? "/parent" : "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Message plus précis pour l'utilisateur
      return { error: "Identifiants ou Code École incorrects." };
    }
    throw error;
  }
}
