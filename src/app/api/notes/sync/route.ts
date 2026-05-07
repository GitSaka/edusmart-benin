import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      valeur,
      type,
      trimestre,
      studentId,
      coursId,
      ecoleId,
      teacherId,
      matiereId,
      anneeId,
    } = body;

   if (!valeur || !studentId || !coursId) {
  return NextResponse.json({
    success: false,
    reason: "MISSING_FIELDS",
  }, { status: 400 });
   }

    // 2️⃣ Vérifier si la note existe déjà (clé unique)
    const existingNote = await prisma.note.findFirst({
      where: {
        studentId,
        coursId,
        type,
        trimestre: trimestre ?? 1,
      },
    });

    let result;

    // 3️⃣ UPDATE si existe
    if (existingNote) {
      result = await prisma.note.update({
        where: { id: existingNote.id },
        data: {
          valeur,
          estValidee: false,
          teacherId,
          matiereId,
          anneeId,
          ecoleId,
        },
      });
    } 
    // 4️⃣ CREATE sinon
    else {
      result = await prisma.note.create({
        data: {
          valeur,
          type,
          trimestre: trimestre ?? 1,
          studentId,
          coursId,
          teacherId,
          matiereId,
          anneeId,
          ecoleId,
        },
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("SYNC NOTE ERROR:", error);

    return NextResponse.json(
      { error: "Erreur serveur sync note" },
      { status: 500 }
    );
  }
}