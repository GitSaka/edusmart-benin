// 📂 app/(parent)/parent/finance/page.tsx

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ParentFinanceClient from "@/components/parent/ParentFinanceClient";

export default async function ParentFinancePage() {
  const session = await auth();
  const user = session?.user as any;

  if (!user || user.role !== "PARENT") redirect("/login");

  // 🎯 On récupère TOUS les enfants du parent d'un coup
  const parentProfile = await prisma.parent.findUnique({
    where: { userId: user.id },
    include: {
      enfants: {
        include: {
          classe: true,
          // On prend les paiements de l'année en cours pour chaque enfant
          paiements: {
            where: { anneeId: user.anneeId },
            orderBy: { date: 'desc' }
          }
        }
      }
    }
  });

  if (!parentProfile || !parentProfile.enfants) redirect("/parent");

  // On envoie la liste complète des enfants au composant client
  return <ParentFinanceClient enfants={parentProfile.enfants} />;
}
