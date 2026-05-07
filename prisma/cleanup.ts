import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function cleanup() {
  console.log("🧹 NETTOYAGE TOTAL (Présences + Notes + Cours)...");

  try {
    // 1. On vide les enfants (Ceux qui bloquent la suppression)
    await prisma.presence.deleteMany({}); // ✅ C'est elle qui bloquait !
    await prisma.noteAudit.deleteMany({});
    await prisma.note.deleteMany({});
    
    // 2. On vide enfin le parent
    const deleted = await prisma.cours.deleteMany({});
    
    console.log(`✅ Nettoyage terminé avec succès.`);
    console.log(`📉 ${deleted.count} cours supprimés de Neon.`);
  } catch (error) {
    console.error("❌ ÉCHEC DU NETTOYAGE :", error);
  }
}

cleanup()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
