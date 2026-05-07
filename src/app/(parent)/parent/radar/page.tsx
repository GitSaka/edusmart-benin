import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ParentRadarClient from "@/components/parent/ParentRadarClient";

export default async function ParentRadarPage() {
  const session = await auth();
  const user = session?.user as any;

  if (!user || user.role !== "PARENT") redirect("/login");

  const parentProfile = await prisma.parent.findUnique({
    where: { userId: user.id },
    include: {
      enfants: {
        include: {
          classe: true,
          Device: true, // 🛰️ Crucial pour les coordonnées
        }
      }
    }
  });

  if (!parentProfile) redirect("/parent");

  return <ParentRadarClient enfants={parentProfile.enfants} />;
}
