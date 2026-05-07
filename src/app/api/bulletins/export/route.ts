import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// 🏆 Fonction pour les mentions automatiques (Bénin)
const getMention = (moy: number) => {
  if (moy >= 16) return "TRÈS BIEN";
  if (moy >= 14) return "BIEN";
  if (moy >= 12) return "ASSEZ BIEN";
  if (moy >= 10) return "PASSABLE";
  return "INSUFFISANT";
};

export async function GET(req: Request) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  // const classeId = parseInt(searchParams.get("classeId") || "0");
  // const trimestre = parseInt(searchParams.get("trimestre") || "1");

  const user = session?.user as any;
  if (!user) return new NextResponse("Non autorisé", { status: 401 });
  // if (!user || user.role !== "ADMIN") return new NextResponse("Non autorisé", { status: 401 });

   let targetClasseId: number = 0;
  let targetStudentId: string | null = null;
  const trimestre = parseInt(searchParams.get("trimestre") || "1");

  // 🛡️ 2. LOGIQUE DE SÉCURITÉ PAR RÔLE
  if (user.role === "ADMIN") {
    targetClasseId = parseInt(searchParams.get("classeId") || "0");
    targetStudentId = searchParams.get("studentId"); // Optionnel pour l'admin
  } else if (user.role === "STUDENT") {
    // L'élève ne peut voir que SON bulletin
    // On récupère ses infos réelles en base pour être sûr
    const studentProfile = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true, classeId: true }
    });
    
    if (!studentProfile) return new NextResponse("Profil élève introuvable", { status: 404 });
    
    targetClasseId = studentProfile.classeId;
    targetStudentId = studentProfile.id; // ON FORCE son ID (Sécurité maximale)
  } else if (user.role === "PARENT") {
    const idEnfant = searchParams.get("studentId");
    // 🔒 VERIFICATION PARENTALE : Cet enfant appartient-il à ce parent ?
    const checkEnfant = await prisma.student.findFirst({
      where: { 
        id: idEnfant || "", 
        parentId: user.id, // On vérifie le lien parentId en base
        ecoleId: user.ecoleId 
      }
    });
    if (!checkEnfant) return new NextResponse("Accès refusé à cet élève", { status: 403 });
    targetStudentId = idEnfant;
  }
  
  else {
    return new NextResponse("Rôle non autorisé", { status: 403 });
  }


// const classe = await prisma.classe.findUnique({
//   where: { id: classeId },
//   include: {
//     ecole: true,
//     annee: true,
//     serie: true,
//   }
// });

// if (!classe) return new NextResponse("Classe introuvable", { status: 404 });


//  const classeData = await prisma.classe.findUnique({
//   where: { id: classeId },
//   include: {
//     ecole: true,
//     annee: true,
//     serie: true,
//     eleves: {
//       include: {
//         notes: { where: { trimestre, anneeId: user.anneeId } },
//         bulletins: { where: { trimestre, anneeId: user.anneeId } }
//       }
//     },
//     cours: {
//       where: { anneeId: user.anneeId },
//       include: {
//         matiere: {
//           include: {
//             coefficients: {
//               where: {
//                 serieId: classe.serie?.id ?? undefined, // ✅ MAINTENANT OK
//                 ecoleId: user.ecoleId,
//                 anneeId: user.anneeId
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// });

 // 🎯 3. RÉCUPÉRATION DES DONNÉES (Ton code optimisé)
  const classeData = await prisma.classe.findUnique({
    where: { id: targetClasseId },
    include: {
      ecole: true,
      annee: true,
      serie: true,
      eleves: {
        where: targetStudentId ? { id: targetStudentId } : undefined, // Filtre ici pour la perf
        include: {
          notes: { where: { trimestre, anneeId: user.anneeId } },
          bulletins: { where: { trimestre, anneeId: user.anneeId } }
        }
      },
      cours: {
        where: { anneeId: user.anneeId },
        include: {
          matiere: {
            include: {
              coefficients: {
                where: {
                  serieId: { not: undefined }, // On filtrera plus bas par sécurité
                  ecoleId: user.ecoleId,
                  anneeId: user.anneeId
                }
              }
            }
          }
        }
      }
    }
  });

  if (!classeData || classeData.eleves.length === 0) {
    return new NextResponse("Données non trouvées ou non publiées", { status: 404 });
  }

   if (user.role === "STUDENT") {
     const isPublished = classeData.eleves[0].bulletins[0]?.estPublie;
     // if (!isPublished) return new NextResponse("Bulletin non encore disponible", { status: 403 });
  }

  // if (!classeData) return new NextResponse("Classe introuvable", { status: 404 });

  // 🎯 1. ON RÉCUPÈRE LE STUDENTID DEPUIS L'URL (S'IL EXISTE)
// const studentId = searchParams.get("studentId");

// 🎯 2. ON FILTRE LES ÉLÈVES
// Si studentId est là, on ne garde que lui. Sinon, on garde tout le monde.
const elevesAAfficher = targetStudentId 
  ? classeData.eleves.filter(e => e.id === targetStudentId) 
  : classeData.eleves;

  // 🛡️ SÉCURITÉ : Si l'élève demandé n'est pas dans cette classe
if (elevesAAfficher.length === 0) {
  return new NextResponse("Élève non trouvé dans cette classe", { status: 404 });
}

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  for (const [index, eleve] of elevesAAfficher.entries()) {
    if (index > 0) doc.addPage();

    const bulletin = eleve.bulletins[0];
    const ecole = classeData.ecole;

    // =========================
    // 🏫 HEADER TRI-PARTITE
    // =========================
    
    // 1. GAUCHE : LOGO (Correction : On utilise ecole.img s'il existe)
    if (ecole?.nom) {
        try { doc.addImage(ecole.nom, "PNG", 14, 10, 25, 25); } catch(e) { doc.rect(14, 10, 25, 25); }
    } else {
        doc.setDrawColor(200); doc.rect(14, 10, 25, 25);
        doc.setFontSize(7); doc.setTextColor(150); doc.text("LOGO", 22, 23);
    }

    // 2. CENTRE : NOM ÉCOLE
    doc.setTextColor(0); doc.setFont("helvetica", "bold"); doc.setFontSize(14);
    doc.text(ecole?.nom || "ÉCOLE", 45, 18);
    doc.setFontSize(10);
    doc.text((ecole?.adresse || "BÉNIN") + " - BÉNIN", 45, 24);

    // 3. DROITE : RÉPUBLIQUE & DRAPEAU
    const flagX = 140; const flagY = 8; const flagW = 8; const flagH = 5;
    doc.setDrawColor(0); doc.rect(flagX, flagY, flagW, flagH);
    doc.setFillColor(0, 135, 81); doc.rect(flagX, flagY, flagW * 0.4, flagH, 'F');
    doc.setFillColor(252, 209, 22); doc.rect(flagX + (flagW * 0.4), flagY, flagW * 0.6, flagH / 2, 'F');
    doc.setFillColor(232, 17, 45); doc.rect(flagX + (flagW * 0.4), flagY + (flagH / 2), flagW * 0.6, flagH / 2, 'F');

    doc.setTextColor(0); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text("RÉPUBLIQUE DU BÉNIN", 150, 11.5);
    doc.setFont("helvetica", "normal");
    // ✅ Correction des contacts
    doc.text("Tél: " + (ecole?.nom || "N/A"), 150, 18);
    doc.text("Web: " + (ecole?.nom || "N/A"), 150, 23);
    doc.text("Année: " + (classeData.annee?.libelle || "N/A"), 150, 28);
    doc.text("Trimestre: " + trimestre, 150, 33);

    doc.setDrawColor(0); doc.line(14, 38, 196, 38);

    // =========================
    // 👤 INFOS ÉLÈVE & PHOTO
    // =========================
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text(`ÉLÈVE : ${eleve.nom} ${eleve.prenom}`, 14, 48);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text(`Matricule : ${eleve.matricule}`, 14, 55);
    doc.text(`Classe : ${classeData.nom}`, 14, 60);

    // ✅ PHOTO RÉELLE (Utilisation de eleve.img depuis le modèle Student)
    const getBase64FromUrl = async (url: string) => {
      const res = await fetch(url);

      if (!res.ok) throw new Error("Image fetch failed");

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const base64 = buffer.toString("base64");

      // Détection format
      const contentType = res.headers.get("content-type") || "image/jpeg";
      const format = contentType.includes("png") ? "PNG" : "JPEG";

      return {
        data: `data:${contentType};base64,${base64}`,
        format,
      };
    };
        if (eleve.img) {
      try {
        const { data, format } = await getBase64FromUrl(eleve.img);

        doc.addImage(data, format, 166, 42, 30, 32, undefined, "FAST");

      } catch (e) {
        console.error("Erreur image:", e);

        doc.rect(166, 42, 30, 32);
        doc.setFontSize(8);
        doc.text("IMAGE NON DISPO", 181, 58, { align: "center" });
      }
    }

    // =========================
    // 📊 TABLEAU DES NOTES
    // =========================
    const tableData = classeData.cours.map((c) => {
      // ✅ COEFFICIENT RÉEL : On cherche le coeff qui correspond à la série de la classe
      const coeffObj = c.matiere.coefficients.find((k: any) => k.serieId === classeData.serie?.id);
      const coeff = coeffObj?.valeur || c.matiere.coefficientDefaut;
      console.log(coeff)
      const nms = eleve.notes.filter(n => n.coursId === c.id);
      
      const interros = nms.filter(n => n.type.startsWith("INT"));
      const moyInt = interros.length > 0 ? interros.reduce((a, b) => a + b.valeur, 0) / interros.length : 0;
      const d1 = nms.find(n => n.type === "DEV1")?.valeur || 0;
      const d2 = nms.find(n => n.type === "DEV2")?.valeur || 0;
      
      const moyMatiere = (moyInt + d1 + d2) / 3;
      const points = moyMatiere * coeff;

      return [
        c.matiere.nom,
        coeff,
        moyInt.toFixed(2),
        d1.toFixed(2),
        d2.toFixed(2),
        moyMatiere.toFixed(2),
        points.toFixed(2),
        getMention(moyMatiere)
      ];
    });

    autoTable(doc, {
      startY: 75,
      head: [["MATIÈRES", "COEF", "MOY INT", "DEV 1", "DEV 2", "MOY/20", "POINTS", "APPRÉCIATION"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2.5 },
      columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold' } }
    });

    // =========================
    // 📈 RÉSULTATS FINAUX
    // =========================
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const moyGen = bulletin?.moyenne || 0;

    doc.setDrawColor(30, 41, 59); doc.setLineWidth(0.5); doc.rect(14, finalY, 80, 25);
    doc.setFont("helvetica", "bold");
    doc.text(`MOYENNE GÉNÉRALE : ${moyGen.toFixed(2)} / 20`, 18, finalY + 10);
    doc.text(`RANG : ${bulletin?.rang || "—"} / ${classeData.eleves.length}`, 18, finalY + 18);
    doc.text(`MENTION : ${getMention(moyGen)}`, 14, finalY + 32);

    doc.text("Le Directeur,", 150, finalY + 5);
    doc.setFontSize(7); doc.setFont("helvetica", "normal");
    doc.text("(Cachet et Signature)", 150, finalY + 10);
    doc.rect(145, finalY + 12, 45, 22);
  }

  const pdfOutput = doc.output("arraybuffer");
  return new NextResponse(pdfOutput, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Bulletins_${classeData.nom}_T${trimestre}.pdf"`,
    },
  });
}