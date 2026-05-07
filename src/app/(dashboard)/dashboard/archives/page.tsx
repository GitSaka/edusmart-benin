import { auth } from "@/lib/auth";
import { getEpreuvesAction } from "@/lib/actions/archives";
import StudentArchivesClient from "@/components/student/StudentArchivesClient";

export default async function Page() {
  const session = await auth();
  if (!session) return null;

  return <StudentArchivesClient user={session.user} />;
}
