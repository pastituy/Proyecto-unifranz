const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const paciente = await prisma.pacienteRegistro.findFirst({
      include: {
        beneficiario: true
      }
    });

    if (paciente && paciente.beneficiario) {
      console.log('\n========================================');
      console.log('DATOS PARA LOGIN MÓVIL');
      console.log('========================================\n');
      console.log('Código Beneficiario:', paciente.beneficiario.codigoBeneficiario);
      console.log('CI del Tutor:', paciente.ciTutor);
      console.log('\nNombre Paciente:', paciente.nombreCompletoNino);
      console.log('Nombre Tutor:', paciente.nombreCompletoTutor);
      console.log('========================================\n');
    } else {
      console.log('No se encontró ningún beneficiario');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
