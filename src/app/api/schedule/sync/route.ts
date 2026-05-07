// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// /**
//  * 📅 SYNC EMPLOI DU TEMPS OFFLINE → PRISMA
//  */
// export async function POST(req: Request) {
//   try {
//     const body = await req.json();

//     const {
//       jour,
//       matiere,
//       heure,
//       classe,
//       ecoleId,
//       teacherId,
//     } = body;

//     // 1️⃣ VALIDATION MINIMALE
//     if (!jour || !matiere || !heure || !classe) {
//       return NextResponse.json(
//         { error: "Champs manquants" },
//         { status: 400 }
//       );
//     }

//     // 2️⃣ ANTI-DOUBLON SIMPLE
//     const existing = await prisma.schedule.findFirst({
//       where: {
//         jour,
//         matiere,
//         heure,
//         classe,
//         ecoleId: ecoleId ?? null,
//       },
//     });

//     if (existing) {
//       return NextResponse.json(
//         { message: "Déjà synchronisé" },
//         { status: 200 }
//       );
//     }

//     // 3️⃣ CREATION PRISMA
//     const schedule = await prisma.schedule.create({
//       data: {
//         jour,
//         matiere,
//         heure,
//         classe,
//         ecoleId: ecoleId ?? null,
//         teacherId: teacherId ?? null,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       schedule,
//     });

//   } catch (error) {
//     console.error("SYNC SCHEDULE ERROR:", error);

//     return NextResponse.json(
//       { error: "Erreur serveur sync schedule" },
//       { status: 500 }
//     );
//   }
// }