import { auth } from "@/lib/auth";
import ArchivesPage from "@/components/teacher/ArchivesPage";

export default async function Page() {
  const session = await auth(); // ✅ On récupère l'utilisateur ici proprement
  
  // 🚀 On "injecte" l'utilisateur dans la vue client
  return <ArchivesPage user={session?.user} />;
}