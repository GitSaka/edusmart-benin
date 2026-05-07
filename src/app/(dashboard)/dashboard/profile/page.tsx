import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentProfileClient from "@/components/student/StudentProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user as any;

  // 🛡️ Sécurité : Accès réservé aux élèves
  if (!user || user.role !== "STUDENT") redirect("/login");

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    include: {
      classe: true,
      parent: true,
      Device: true,
    }
  });

  if (!student) redirect("/login");

  return <StudentProfileClient student={student} />;
}
