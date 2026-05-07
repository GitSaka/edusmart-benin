import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import PremiumReader from "@/components/student/PremiumReader"; // ✅ On utilise le composant partagé

export default async function TeacherReaderPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const session = await auth();
  const user = session?.user as any;

  // 🔒 SÉCURITÉ : Session et Rôle Professeur
  if (!user?.id || user.role !== "TEACHER") redirect("/login");

  const { id } = await params;

  // 🔍 RÉCUPÉRATION DE L'ARCHIVE (Indépendante)
  const archive = await prisma.epreuveArchive.findUnique({
    where: { 
      id: parseInt(id) 
    },
    // On n'a plus besoin d'include complexes car la table est indépendante
  });

  // 🛡️ VÉRIFICATION DE PROPRIÉTÉ 
  // Un prof ne doit pas pouvoir "espionner" les brouillons d'un autre
  if (!archive || (archive.auteurId !== user.id && user.role !== "ADMIN")) {
    return notFound();
  }

  // 🎯 On envoie l'archive à ton composant PremiumReader
  // Note : Assure-ce que ton PremiumReader accepte l'objet "archive" 
  // avec les champs fichierUrl et corrigeUrl.
  return <PremiumReader ressource={archive} />;
}