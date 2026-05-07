import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import BulletinPDF from "@/components/admin/BulletinPDF";

export default async function ViewBulletinPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const ecoleId = (session?.user as any)?.ecoleId;
  const anneeId = (session?.user as any)?.anneeId;

  if (!ecoleId || !anneeId) redirect("/login");

  const { id } = await params;

  // 1. RÉCUPÉRATION DU BULLETIN + ÉLÈVE + ÉCOLE + NOTES
  const bulletin = await prisma.bulletin.findUnique({
    where: { 
      id: parseInt(id),
      ecoleId: ecoleId // 🔒 Sécurité SaaS
    },
    include: {
      ecole: true,
      student: {
        include: {
          classe: { include: { _count: { select: { eleves: true } } } },
          // On récupère les notes pour le tableau détaillé
          notes: {
            where: { 
              trimestre: (await prisma.bulletin.findUnique({ where: { id: parseInt(id) } }))?.trimestre,
              anneeId: anneeId 
            },
            include: {
              cours: {
                include: {
                  matiere: {
                    include: {
                      coefficients: {
                        where: {
                          serie: { classes: { some: { id: (await prisma.bulletin.findUnique({ where: { id: parseInt(id) }, select: { student: { select: { classeId: true } } } }))?.student?.classeId } } }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!bulletin) return notFound();

  // 2. LOGIQUE DE REGROUPEMENT PAR MATIÈRE (Le cerveau du tableau)
  const matieresDetails = bulletin.student.notes.reduce((acc: any, note: any) => {
    const matId = note.cours.matiereId;
    if (!acc[matId]) {
      acc[matId] = {
        nom: note.cours.matiere.nom,
        coef: note.cours.matiere.coefficients[0]?.valeur || 1,
        notes: [],
      };
    }
    acc[matId].notes.push(note.valeur);
    return acc;
  }, {});

  // On transforme l'objet en tableau pour le composant
  const tableData = Object.values(matieresDetails).map((m: any) => {
    const moyenneMatiere = m.notes.reduce((a: number, b: number) => a + b, 0) / m.notes.length;
    return {
      nom: m.nom,
      coef: m.coef,
      moyenne: moyenneMatiere,
      points: moyenneMatiere * m.coef
    };
  });

  return (
    <div className="min-h-screen bg-gray-100 py-10 no-print">
      {/* 🖨️ BARRE D'ACTION FIXE (Cachée à l'impression) */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-left">
           <p className="text-[10px] font-black text-gray-400 uppercase italic">Aperçu Officiel</p>
           <h2 className="text-lg font-black uppercase tracking-tighter">Bulletin : {bulletin.student.nom}</h2>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-gray-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
        >
          Imprimer le PDF
        </button>
      </div>

      {/* 📄 LE BULLETIN PHYSIQUE (C'est lui qui sera imprimé) */}
      <BulletinPDF
        student={bulletin.student} 
        bulletin={bulletin} 
        ecole={bulletin.ecole}
        tableData={tableData} // ✅ On passe les calculs tout faits
      />
    </div>
  );
}
