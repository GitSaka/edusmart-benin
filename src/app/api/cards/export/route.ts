"use server";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import jsPDF from "jspdf";
import QRCode from "qrcode";

export async function GET(req: Request) {
  const session = await auth();
  const user = session?.user as any;
  const { searchParams } = new URL(req.url);
  // const studentId = searchParams.get("studentId");

  if (!user) return new NextResponse("Non autorisé", { status: 401 });

  let targetStudentId: string;

    if (user.role === "ADMIN") {
    // L'admin doit fournir un studentId dans l'URL
    targetStudentId = searchParams.get("studentId") || "";
  } else if (user.role === "STUDENT") {
    // 🛡️ L'élève est forcé d'utiliser SON propre profil (via son compte User)
    const profile = await prisma.student.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });
    if (!profile) return new NextResponse("Profil élève introuvable", { status: 404 });
    targetStudentId = profile.id;
  } else {
    return new NextResponse("Accès interdit", { status: 403 });
  }


   // 🎯 2. RÉCUPÉRATION DES DONNÉES
  const student = await prisma.student.findUnique({
    where: { id: targetStudentId },
    include: { 
      classe: true,
      ecole: true // Optionnel: pour dynamiser le nom de l'école sur le badge
    }
  });

  if (!student) {
    return new NextResponse("Élève introuvable", { status: 404 });
  }

  // 🎯 FORMAT BADGE
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [85, 55],
  });

  // =========================
  // 🎨 BACKGROUND (Gradient simulé)
  // =========================
  doc.setFillColor(30, 64, 175); // blue-700
  doc.rect(0, 0, 85, 55, "F");

  // Effets lumineux (comme Tailwind blur)
  // ✨ Effets lumineux (Version compatible Build)
  doc.setFillColor(255, 255, 255);
  // @ts-ignore
  const gs05 = new (doc as any).GState({ opacity: 0.05 });
  doc.setGState(gs05);
  doc.circle(80, 5, 15, "F");

  doc.setFillColor(250, 204, 21);
  // @ts-ignore
  const gs10 = new (doc as any).GState({ opacity: 0.1 });
  doc.setGState(gs10);
  doc.circle(5, 50, 12, "F");

  // On remet l'opacité à 100% pour le reste du texte
  // @ts-ignore
  const gs100 = new (doc as any).GState({ opacity: 1 });
  doc.setGState(gs100);

  // =========================
  // 🏫 HEADER
  // =========================
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(11);
  doc.text("EduSmart", 6, 8);

  doc.setFontSize(5);
  doc.setFont("helvetica", "bold");
  doc.text("RÉPUBLIQUE DU BÉNIN", 6, 11);

  doc.setTextColor(250, 204, 21);
  doc.text("2025-2026", 30, 11);

  // =========================
  // 👤 PHOTO
  // =========================
  const photoX = 6;
  const photoY = 15;
  const photoW = 18;
  const photoH = 22;

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.roundedRect(photoX, photoY, photoW, photoH, 2, 2);

   if (student.img) {
    try {
      // 🎯 LE SECRET : On modifie l'URL pour demander à Cloudinary 
      // de couper l'image au format 3:4 (Portrait) et de centrer sur le VISAGE (g_face)
      const faceUrl = student.img.replace("/upload/", "/upload/ar_3:4,c_fill,g_face,w_400/");
      
      const res = await fetch(faceUrl);
      const buffer = Buffer.from(await res.arrayBuffer());
      const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;

      // On insère l'image qui est maintenant déjà au bon format
      doc.addImage(base64, "JPEG", photoX, photoY, photoW, photoH);
    } catch (e) {
      doc.setFontSize(6);
      doc.text("PHOTO", photoX + 3, photoY + 12);
    }
  }



  // =========================
  // 🧑 IDENTITÉ
  // =========================
  doc.setTextColor(191, 219, 254); // blue-200
  doc.setFontSize(5);
  doc.text("IDENTITÉ DE L'ÉLÈVE", 28, 18);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(student.nom.toUpperCase(), 28, 23);

  doc.setFontSize(8);
  doc.text(student.prenom, 28, 28);

  // =========================
  // 🟨 BADGE CLASSE (comme Tailwind)
  // =========================
  doc.setFillColor(250, 204, 21);
  doc.roundedRect(28, 31, 25, 5, 2, 2, "F");

  doc.setTextColor(30, 64, 175);
  doc.setFontSize(6);
  doc.text(student.classe.nom, 40.5, 34.5, { align: "center" });

  // =========================
  // 📏 SEPARATOR (Version Build Safe)
  // =========================
  doc.setDrawColor(255, 255, 255);
  // @ts-ignore
  const gsSeparator = new (doc as any).GState({ opacity: 0.2 });
  doc.setGState(gsSeparator);
  
  doc.line(6, 42, 79, 42);
  
  // Retour à l'opacité normale
  // @ts-ignore
  const gsFull = new (doc as any).GState({ opacity: 1 });
  doc.setGState(gsFull);


  // =========================
  // 🆔 MATRICULE
  // =========================
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(5);
  doc.text("ID MATRICULE", 6, 46);

  doc.setFontSize(7);
  doc.setTextColor(219, 234, 254);
  doc.text(student.matricule || "N/A", 6, 50);

  // =========================
  // 📱 QR CODE
  // =========================
  const qrData = `STUDENT:${student.matricule}|${student.nom}`;
  const qr = await QRCode.toDataURL(qrData);

  doc.addImage(qr, "PNG", 68, 43, 12, 12);

  // =========================
  // 📤 EXPORT
  // =========================
  const pdf = doc.output("arraybuffer");

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=badge_${student.matricule}.pdf`,
    },
  });
}