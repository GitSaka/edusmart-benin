import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserProvider } from "@/providers/UserProvider";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  // 1. SÉCURITÉ : Vérification Session & École
  if (!session?.user?.id || !ecoleId || !anneeId) redirect("/login");

  // 2. REQUÊTE PROFONDE : On récupère tout le nécessaire pour le calcul des moyennes
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      student: {
        include: {
          classe: true,
          // 📐 ON RÉCUPÈRE LES NOTES AVEC LEURS COEFFICIENTS VIA LE COURS
          notes: {
            where: { anneeId: anneeId }, // Uniquement l'année en cours
            include: {
              cours: {
                include: {
                  matiere: {
                    include: {
                      coefficients: {
                        // On filtre le coefficient qui correspond à la série de la classe de l'élève
                        where: { 
                          serie: { classes: { some: { id: (await prisma.student.findFirst({ where: { userId: session.user.id }, select: { classeId: true } }))?.classeId } } } 
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          presences: { where: { anneeId: anneeId } },
          logsActivite: true
        }
      }
    }
  });

  if (!dbUser || !dbUser.student) redirect("/login");

  const student = dbUser.student;

  // --- 🧠 LE CERVEAU MATHÉMATIQUE (T1) ---
  const t1Notes = student.notes.filter(n => n.trimestre === 1);
  
  let totalPointsPonderes = 0;
  let totalCoeffs = 0;

  t1Notes.forEach(n => {
    // On récupère la valeur du premier coefficient trouvé (clé composite unique par série)
    const coeff = (n.cours as any)?.matiere?.coefficients?.[0]?.valeur || 1;
    totalPointsPonderes += (n.valeur * coeff);
    totalCoeffs += coeff;
  });

  const moyenneG = totalCoeffs > 0 ? (totalPointsPonderes / totalCoeffs).toFixed(2) : "0.00";

  // --- 📊 ASSIDUITÉ ---
  const totalAppels = student.presences.length;
  const presents = student.presences.filter(p => p.estPresent).length;
  const absences = totalAppels - presents;
  const assiduiteScore = totalAppels > 0 ? Math.round((presents / totalAppels) * 100) : 100;

  // 3. PRÉPARATION DU SAC À DOS (UserData)
  const userData = {
    id: dbUser.id,
    name: student.nom,
    prenom: student.prenom,
    username: dbUser.username, // Matricule
    classe: student.classe?.nom || "N/A",
    photo: student.img || null,
    role: dbUser.role,
    // Statistiques dynamiques
    moyenne: moyenneG,
    absences: absences,
    assiduite: `${assiduiteScore}%`,
    rang: "1", // Le rang sera dynamisé plus tard avec la table Bulletin
    coursVu: student.logsActivite.length,
    matiere: "", 
    initiales: `${student.nom[0] || ""}${student.prenom[0] || ""}`.toUpperCase()
  };

  return (
    <UserProvider user={userData}>
      <DashboardWrapper userData={userData}>
        {children}
      </DashboardWrapper>
    </UserProvider>
  );
}
