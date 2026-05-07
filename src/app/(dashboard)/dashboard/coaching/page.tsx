// src/app/(dashboard)/dashboard/coaching/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CoachingClient from "@/components/student/CoachingClient";


export default async function CoachingPage() {
  const session = await auth();
  const userId = session?.user?.id; // 🔑 "09c7..." (ID de connexion)
  const ecoleId = (session?.user as any)?.ecoleId;

 if (!userId || !ecoleId) redirect("/login");

  // 1. LA PASSERELLE : On transforme l'ID User en ID Student ("abe4...")
  const studentProfile = await prisma.student.findUnique({
    where: { userId: userId }, // 🔍 On cherche l'élève lié à cet utilisateur
    select: { id: true }       // 🎯 On récupère son ID élève ("abe4...")
  });

   // Sécurité : Si l'utilisateur n'a pas de profil élève
  if (!studentProfile) {
    console.error("❌ Aucun profil élève trouvé pour cet ID User");
    redirect("/dashboard");
  }


   // 2. LA REQUÊTE RÉELLE : On utilise l'ID du dossier scolaire ("abe4...")
  const ressourcesPrivees = await prisma.ressource.findMany({
    where: {
      ecoleId,
      studentId: studentProfile.id, // ✅ On utilise enfin le bon ID cible
      isPublished: true
    },
    include: {
      teacher: { select: { nom: true } },
      cours: { include: { matiere: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <header className="mb-10 text-left">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
          Mon Espace Privé
        </h1>
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-2 italic">
          Contenus personnalisés et coaching individuel
        </p>
      </header>

      {/* On réutilise ton design de cartes, mais filtré pour le privé */}
      <CoachingClient dbRessources={ressourcesPrivees} />
    </div>
  );
}
