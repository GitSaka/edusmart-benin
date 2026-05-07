import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config"; 

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isPrivateArea = 
    nextUrl.pathname.startsWith("/admin") || 
    nextUrl.pathname.startsWith("/teacher") || 
    nextUrl.pathname.startsWith("/parent") || 
    nextUrl.pathname.startsWith("/super-admin") || 
    nextUrl.pathname.startsWith("/dashboard");

  const isAuthRoute = nextUrl.pathname.startsWith("/login");

  // 1. ZONE PUBLIQUE : On laisse passer
  if (!isPrivateArea && !isAuthRoute) {
    return NextResponse.next();
  }

  // 2. SÉCURITÉ : REDIRECTION FORCEE SI NON CONNECTÉ (La faille était ici)
  if (!isLoggedIn && isPrivateArea) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 3. REDIRECTION APRÈS CONNEXION : Empêcher l'accès au login si déjà connecté
  if (isLoggedIn && isAuthRoute) {
    let target = "/dashboard"; 
    if (role === "SUPER_ADMIN") target = "/super-admin";
    if (role === "ADMIN") target = "/admin";
    if (role === "TEACHER") target = "/teacher";
    if (role === "PARENT") target = "/parent";
    
    return NextResponse.redirect(new URL(target, nextUrl));
  }

  // 4. PROTECTIONS DES RÔLES (Anti-Intrusion)
  if (isLoggedIn && isPrivateArea) {
    
    // Le Super-Admin est "Dieu", il passe partout
    if (role === "SUPER_ADMIN") return NextResponse.next();

    // Protection par dossier
    if (nextUrl.pathname.startsWith("/super-admin") && role !== "SUPER_ADMIN") {
       return NextResponse.redirect(new URL("/login", nextUrl));
    }
    
    if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    if (nextUrl.pathname.startsWith("/teacher") && role !== "TEACHER") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    if (nextUrl.pathname.startsWith("/dashboard") && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    
    if (nextUrl.pathname.startsWith("/parent") && role !== "PARENT") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
