const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        pais: true,
        ci: true,
        rol: true,
        creadoEn: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log('\n========================================');
    console.log('USUARIOS REGISTRADOS EN EL SISTEMA');
    console.log('========================================\n');

    usuarios.forEach((usuario, index) => {
      console.log(`\n--- Usuario ${index + 1} ---`);
      console.log(`ID: ${usuario.id}`);
      console.log(`Nombre: ${usuario.nombre}`);
      console.log(`Email: ${usuario.email}`);
      console.log(`Teléfono: ${usuario.telefono}`);
      console.log(`País: ${usuario.pais}`);
      console.log(`CI: ${usuario.ci || 'No registrado'}`);
      console.log(`Rol: ${usuario.rol || 'Sin rol asignado'}`);
      console.log(`Fecha de Registro: ${new Date(usuario.creadoEn).toLocaleString('es-BO')}`);
    });

    console.log(`\n========================================`);
    console.log(`TOTAL DE USUARIOS: ${usuarios.length}`);
    console.log(`========================================\n`);

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
