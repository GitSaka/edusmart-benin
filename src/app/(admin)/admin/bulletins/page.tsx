import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BulletinsClient from "@/components/admin/BulletinControlClient";

export default async function AdminBulletinsPage() {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/login");

 const classes = await prisma.classe.findMany({
  where: { 
    ecoleId: ecoleId,
    anneeId: anneeId 
  },
  include: {
    level: true,
    _count: { select: { cours: true, eleves: true } }, 
    // ✅ AJOUT 1 : On récupère les verrous pour savoir quel trimestre est clos
    verrousSaisie: {
      where: { anneeId: anneeId }
    },
    // ✅ AJOUT 2 : On récupère les bulletins (déjà présent mais on garde)
    bulletins: {
      where: { anneeId: anneeId },
      select: { id: true, trimestre: true, studentId: true }
    },
    cours: {
      where: { anneeId: anneeId },
      include: {
        matiere: { select: { nom: true } },
        // On garde le count des notes pour la barre de progression (%)
        _count: { select: { notes: { where: { anneeId: anneeId } } } }
      }
    }
  },
  orderBy: { level: { nom: 'asc' } }
});
  

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BulletinsClient 
        initialClasses={classes} 
        currentAnneeId={anneeId} 
      />
    </div>
  );
}