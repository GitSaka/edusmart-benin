import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import PremiumReader from "@/components/student/PremiumReader";

interface ReaderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string }>; 
}

export default async function ReaderPage({ params, searchParams }: ReaderPageProps) {
  const session = await auth();
  const user = session?.user as any;
  const ecoleId = user?.ecoleId;

  if (!user?.id) redirect("/login");

  const { id } = await params;
  const { source } = await searchParams; 
  const numericId = parseInt(id);

  // --- 🏛️ CAS 1 : ARCHIVE (Épreuves passées) ---
  if (source === "archive") {
    const archive = await prisma.epreuveArchive.findUnique({
      where: { id: numericId }
    });
    if (!archive) return notFound();
    return <PremiumReader ressource={archive} userName={user.name} />;
  }

  // --- 📚 CAS 2 : BIBLIOTHÈQUE NATIONALE (Annales, Romans, GLOBAL) ---
  if (source === "library") {
    const book = await prisma.library.findUnique({
      where: { id: numericId },
      include: { level: true }
    });

    if (!book || !book.isPublished) return notFound();

    // 🔒 Sécurité : Vérifier si c'est son niveau OU si c'est GLOBAL
    const hasAccess = book.levelId === user.levelId || book.level.nom === "GLOBAL";
    if (!hasAccess) redirect("/dashboard/library");

    return <PremiumReader ressource={book} userName={user.name} />;
  }

  // --- 🏫 CAS 3 : RESSOURCE (Cours spécifiques de l'école) ---
  const ressource = await prisma.ressource.findFirst({
    where: { 
      id: numericId,
      ecoleId: ecoleId, 
      type: "PDF"
    },
    include: {
      teacher: { select: { nom: true } },
      cours: { include: { matiere: { select: { nom: true } } } },
      ecole: { select: { nom: true } }
    }
  });

  if (!ressource) return notFound();

  return <PremiumReader ressource={ressource} userName={user.name} />;
}
