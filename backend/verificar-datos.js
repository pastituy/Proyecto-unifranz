const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verificar() {
  console.log("🔍 Verificando datos en la base de datos...\n");

  const campanas = await prisma.campana.count();
  const eventos = await prisma.evento.count();
  const donaciones = await prisma.donaciones.count();

  console.log("📊 CONTEO DE REGISTROS:");
  console.log(`   Campañas: ${campanas}`);
  console.log(`   Eventos: ${eventos}`);
  console.log(`   Donaciones: ${donaciones}\n`);

  console.log("✅ Verificación completada!");
  await prisma.$disconnect();
}

verificar();
