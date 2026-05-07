// import NextAuth, { DefaultSession } from "next-auth";

// declare module "next-auth" {
//   interface User {
//     role: string;
//     ecoleId: number;   // 🏫 Ajouté pour le SaaS
//     anneeId: number;   // 📅 Ajouté pour le temps
//   }

//   interface Session {
//     user: {
//       id: string;
//       role: string;
//       ecoleId: number;
//       anneeId: number;
//     } & DefaultSession["user"];
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     role: string;
//     ecoleId: number;
//     anneeId: number;
//   }
// }


import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    role: string;
    ecoleId?: number | null;   // 🎯 Le "?" et le "| null" permettent au Super-Admin d'exister
    anneeId?: number | null;   
    profileId?: string | null; // 🔑 Ajouté pour tes IDs Student/Teacher
  }

  interface Session {
    user: {
      id: string;
      role: string;
      ecoleId?: number | null;
      anneeId?: number | null;
      studentId?: string | null; // 🏫 Ajouté pour tes redirections
      teacherId?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    role: string;
    ecoleId?: number | null;
    anneeId?: number | null;
    profileId?: string | null;
  }
}

