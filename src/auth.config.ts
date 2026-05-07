import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as any).role;
        token.ecoleId = (user as any).ecoleId;
        token.anneeId = (user as any).anneeId;
        token.profileId = (user as any).profileId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        (session.user as any).role = token.role;
        (session.user as any).ecoleId = token.ecoleId;
        (session.user as any).anneeId = token.anneeId;
        
        if (token.role === "STUDENT") {
          (session.user as any).studentId = token.profileId;
        }
        if (token.role === "TEACHER") {
          (session.user as any).teacherId = token.profileId;
        }
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  providers: [], // On laisse vide ici, c'est la règle pour le Middleware
} satisfies NextAuthConfig;
