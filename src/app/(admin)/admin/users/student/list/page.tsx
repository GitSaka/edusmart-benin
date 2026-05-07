import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudentExcelTable from "@/components/admin/StudentExcelTable";

// ... tes imports
export default async function AllStudentsPage() {
  const session = await auth();
  const user = session?.user as any;

  // 🔍 1. On récupère TOUTES les classes de l'école (même les vides)
  const allClasses = await prisma.classe.findMany({
    where: { ecoleId: user.ecoleId },
    select: { nom: true },
    orderBy: { nom: 'asc' }
  });

  // 🔍 2. On récupère les élèves
  const students = await prisma.student.findMany({
    where: { ecoleId: user.ecoleId },
    include: { classe: { select: { nom: true } } },
    orderBy: { nom: 'asc' }
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 📊 On envoie les deux listes au tableau */}
      <StudentExcelTable data={students} allClasses={allClasses} />
    </div>
  );
}

