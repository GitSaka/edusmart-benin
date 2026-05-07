// import NextAuth from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import { prisma } from "./prisma";
// import bcrypt from "bcryptjs";

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   providers: [
//     Credentials({
//       async authorize(credentials) {
//         // 1. On vérifie les bases
//         if (!credentials?.identifier || !credentials?.password) return null;

//         const identifier = (credentials.identifier as string).trim();
//         const role = credentials.role as string;
//         const ecoleCode = (credentials.ecoleCode as string)?.trim();

//          console.log(role,identifier)

//         // 🛡️ SÉCURITÉ : Si ce n'est pas toi, le code école est OBLIGATOIRE
//         if (role !== "SUPER_ADMIN" && !ecoleCode) return null;

//         // 2. RECHERCHE ADAPTÉE
//         const user = await prisma.user.findFirst({
//           where: { 
//             username: identifier,
//             // 💡 SI SUPER_ADMIN : On ne cherche pas d'école. SINON : On filtre par le code.
//             ...(role === "SUPER_ADMIN" ? {} : { ecole: { code: ecoleCode } })
//           },
//           include: { 
//             ecole: true, // Sera null pour toi, c'est normal
//             student: { select: { id: true } },
//             teacher: { select: { id: true } }
//           } 
//         }) as any;

//         // 3. VÉRIFICATION (On adapte pour le SUPER_ADMIN qui n'a pas d'école)
//         if (!user || !user.password || (role !== "SUPER_ADMIN" && !user.ecole)) {
//           console.log("❌ Utilisateur ou École introuvable");
//           return null;
//         }

//         // ... (Ton code bcrypt reste le même)
//         const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);
//         if (!isPasswordValid) return null;

//         // 4. RETOUR DES DONNÉES (On gère les valeurs null pour toi)
//         return {
//           id: user.id,
//           name: user.username,
//           role: user.role,
//           ecoleId: user.ecoleId || null, // Null pour toi
//           anneeId: user.ecole?.anneeActiveId || null, // Null pour toi
//           profileId: user.role === "STUDENT" ? user.student?.id : (user.role === "TEACHER" ? user.teacher?.id : null),
//         };
//       }

//           }),
//         ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.sub = user.id;
//         token.role = (user as any).role;
//         token.ecoleId = (user as any).ecoleId;
//         token.anneeId = (user as any).anneeId;
//         token.profileId = (user as any).profileId; // 🔑 Injecté dans le Token
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token && session.user) {
//         session.user.id = token.sub as string;
//         (session.user as any).role = token.role;
//         (session.user as any).ecoleId = token.ecoleId;
//         (session.user as any).anneeId = token.anneeId;
        
//         // ✅ ON ATTRIBUE LES IDS SELON LE RÔLE POUR TES PAGES
//         if (token.role === "STUDENT") {
//           (session.user as any).studentId = token.profileId;
//         }
//         if (token.role === "TEACHER") {
//           (session.user as any).teacherId = token.profileId;
//         }
//       }
//       return session;
//     },
//   },
//   pages: { signIn: "/login" },
//   session: { strategy: "jwt" },
// });

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config"; // 🎯 Import de la config légère

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // 🏗️ On injecte la config de base

   // ✅ AJOUT IMPORTANT ICI
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const identifier = (credentials.identifier as string).trim();
        const role = credentials.role as string;
        const ecoleCode = (credentials.ecoleCode as string)?.trim();

        // 🛡️ SÉCURITÉ : Code école obligatoire sauf pour SUPER_ADMIN
        if (role !== "SUPER_ADMIN" && !ecoleCode) return null;

        const user = await prisma.user.findFirst({
          where: { 
            username: identifier,
            ...(role === "SUPER_ADMIN" ? {} : { ecole: { code: ecoleCode } })
          },
          include: { 
            ecole: true,
            student: { select: { id: true } },
            teacher: { select: { id: true } }
          } 
        });

        if (!user || !user.password || (role !== "SUPER_ADMIN" && !user.ecole)) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.username,
          role: user.role,
          ecoleId: user.ecoleId || null,
          anneeId: user.ecole?.anneeActiveId || null,
          profileId: user.role === "STUDENT" ? user.student?.id : (user.role === "TEACHER" ? user.teacher?.id : null),
        } as any;
      }
    }),
  ],
});

