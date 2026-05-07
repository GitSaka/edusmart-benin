// Dans ton fichier prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du seed...");

  // 🌍 CRÉATION DU NIVEAU GLOBAL (National)
  const levelGlobal = await prisma.level.upsert({
    where: { nom: "GLOBAL" }, // On cherche par le nom unique
    update: {}, // Si ça existe, on ne change rien
    create: {
      nom: "GLOBAL",
      ecoleId: null, // Indique que c'est au-dessus des écoles
    },
  });

  console.log(`✅ Niveau créé : ${levelGlobal.nom} (ID: ${levelGlobal.id})`);
  
  // Tu peux ajouter ici d'autres niveaux si tu veux (3ème, Terminale...)
  // ...
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
