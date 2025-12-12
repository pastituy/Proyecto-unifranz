const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Datos de los 30 pacientes iniciales
const pacientesIniciales = [
  { nombre: "Jesica Mamani Colque", edad: 8, diagnostico: "Tumor de Wilms derecho", tutorNombre: "Rosa Colque de Mamani", tutorCI: "4567890", tutorDireccion: "Av. Blanco Galindo km 5", tutorTelefono: "4234567", tutorEmail: "rosa.mamani@gmail.com" },
  { nombre: "Sheyla Mamani Chuquichambi", edad: 6, diagnostico: "Histiocitosis células Langerhans", tutorNombre: "Juan Mamani Quispe", tutorCI: "3456789", tutorDireccion: "Calle Jordán 234", tutorTelefono: "4345678", tutorEmail: "juan.mamani@hotmail.com" },
  { nombre: "Jhoel Carvallo Lazarte", edad: 7, diagnostico: "Histiocitosis células Langerhans", tutorNombre: "Maria Lazarte Vda. de Carvallo", tutorCI: "5678901", tutorDireccion: "Av. América 567", tutorTelefono: "4456789", tutorEmail: "maria.lazarte@gmail.com" },
  { nombre: "Katerin Callejas Cerrudo", edad: 12, diagnostico: "Tumor de células germinales (ovario izquierdo)", tutorNombre: "Pedro Callejas Rojas", tutorCI: "6789012", tutorDireccion: "Calle Sucre 890", tutorTelefono: "4567890", tutorEmail: "pedro.callejas@yahoo.com" },
  { nombre: "Gustavo Cossio Acha", edad: 9, diagnostico: "Histiocitosis CL", tutorNombre: "Ana Acha de Cossio", tutorCI: "7890123", tutorDireccion: "Av. Heroínas 123", tutorTelefono: "4678901", tutorEmail: "ana.cossio@gmail.com" },
  { nombre: "Diana Angelica Chayra Calle", edad: 11, diagnostico: "Tumor de senos endodérmicos (ovario derecho)", tutorNombre: "Miguel Chayra Miranda", tutorCI: "8901234", tutorDireccion: "Calle Aroma 456", tutorTelefono: "4789012", tutorEmail: "miguel.chayra@hotmail.com" },
  { nombre: "Cristhian Jimenez Toro", edad: 10, diagnostico: "Linfoma no Hodgkin, inmunofenotipo B", tutorNombre: "Sandra Toro de Jimenez", tutorCI: "9012345", tutorDireccion: "Av. Ayacucho 789", tutorTelefono: "4890123", tutorEmail: "sandra.jimenez@gmail.com" },
  { nombre: "Jhostin Arcani Quispe", edad: 5, diagnostico: "Hepatoblastoma lóbulo derecho", tutorNombre: "Roberto Arcani Pérez", tutorCI: "1234567", tutorDireccion: "Calle Baptista 321", tutorTelefono: "4901234", tutorEmail: "roberto.arcani@yahoo.com" },
  { nombre: "Benjamin Huarachi Tuno", edad: 13, diagnostico: "Linfoma de Hodgkin E IV", tutorNombre: "Carmen Tuno Vda. de Huarachi", tutorCI: "2345678", tutorDireccion: "Av. Oquendo 654", tutorTelefono: "4012345", tutorEmail: "carmen.huarachi@gmail.com" },
  { nombre: "Jhon Fernando Humerez", edad: 8, diagnostico: "Histiocitosis CL", tutorNombre: "Fernando Humerez Soto", tutorCI: "3456780", tutorDireccion: "Calle España 987", tutorTelefono: "4123456", tutorEmail: "fernando.humerez@hotmail.com" },
  { nombre: "Adrian Calvimontes Calle", edad: 9, diagnostico: "Tumor de senos endodérmicos", tutorNombre: "Patricia Calle de Calvimontes", tutorCI: "4567891", tutorDireccion: "Av. Libertador 147", tutorTelefono: "4234568", tutorEmail: "patricia.calvimontes@gmail.com" },
  { nombre: "Oscar Antonio Olmos Ramos", edad: 14, diagnostico: "Carcinoma de células escamosas", tutorNombre: "Antonio Olmos Vargas", tutorCI: "5678902", tutorDireccion: "Calle Colombia 258", tutorTelefono: "4345679", tutorEmail: "antonio.olmos@yahoo.com" },
  { nombre: "Milenka Pinto Jimenez", edad: 7, diagnostico: "Tumor de Wilms EIII", tutorNombre: "Rosa Jimenez de Pinto", tutorCI: "6789013", tutorDireccion: "Av. Ballivián 369", tutorTelefono: "4456780", tutorEmail: "rosa.pinto@gmail.com" },
  { nombre: "Alejandra Muriel Lozano", edad: 12, diagnostico: "Linfoma de Hodgkin E III B", tutorNombre: "Carlos Muriel Rocha", tutorCI: "7890124", tutorDireccion: "Calle Antezana 741", tutorTelefono: "4567891", tutorEmail: "carlos.muriel@hotmail.com" },
  { nombre: "Brayan Sanchez", edad: 10, diagnostico: "Linfoma de Burkit", tutorNombre: "Gloria Sanchez Mamani", tutorCI: "8901235", tutorDireccion: "Av. Petrolera 852", tutorTelefono: "4678902", tutorEmail: "gloria.sanchez@gmail.com" },
  { nombre: "Alejandra Monserrat Soto Nava", edad: 6, diagnostico: "Tumor de Wilms", tutorNombre: "José Soto Miranda", tutorCI: "9012346", tutorDireccion: "Calle 6 de Agosto 963", tutorTelefono: "4789013", tutorEmail: "jose.soto@yahoo.com" },
  { nombre: "Hubner Gustavo Ayala Gonzales", edad: 4, diagnostico: "Retinoblastoma bilateral", tutorNombre: "Martha Gonzales de Ayala", tutorCI: "1234568", tutorDireccion: "Av. Circunvalación 159", tutorTelefono: "4890124", tutorEmail: "martha.ayala@gmail.com" },
  { nombre: "Daner Herrera Monroy", edad: 11, diagnostico: "Linfoma de Hodgkin E III", tutorNombre: "Daniel Herrera López", tutorCI: "2345679", tutorDireccion: "Calle Nataniel Aguirre 267", tutorTelefono: "4901235", tutorEmail: "daniel.herrera@hotmail.com" },
  { nombre: "Lilian Bravo Loza", edad: 8, diagnostico: "Tumor de Wilms", tutorNombre: "Silvia Loza Vda. de Bravo", tutorCI: "3456781", tutorDireccion: "Av. Beijing 378", tutorTelefono: "4012346", tutorEmail: "silvia.bravo@gmail.com" },
  { nombre: "Esmeralda Velasquez", edad: 9, diagnostico: "Tumor de Wilms", tutorNombre: "Luis Velasquez Quispe", tutorCI: "4567892", tutorDireccion: "Calle Esteban Arce 489", tutorTelefono: "4123457", tutorEmail: "luis.velasquez@yahoo.com" },
  { nombre: "Fabiola Milenka Ventura Claros", edad: 5, diagnostico: "Retinoblastoma ocular", tutorNombre: "Elena Claros de Ventura", tutorCI: "5678903", tutorDireccion: "Av. Melchor Pérez 591", tutorTelefono: "4234569", tutorEmail: "elena.ventura@gmail.com" },
  { nombre: "Jhair Miguel Gallego Condori", edad: 7, diagnostico: "Tumor saco vitelino", tutorNombre: "Miguel Gallego Rojas", tutorCI: "6789014", tutorDireccion: "Calle Venezuela 612", tutorTelefono: "4345670", tutorEmail: "miguel.gallego@hotmail.com" },
  { nombre: "Luis Fernando Villarroel Rios", edad: 13, diagnostico: "Ependimoma anaplásico", tutorNombre: "Fernando Villarroel Soto", tutorCI: "7890125", tutorDireccion: "Av. San Martín 723", tutorTelefono: "4456781", tutorEmail: "fernando.villarroel@gmail.com" },
  { nombre: "Willam Córdova Vargas", edad: 10, diagnostico: "Histiocitosis ganglionar", tutorNombre: "Ana Vargas de Córdova", tutorCI: "8901236", tutorDireccion: "Calle Potosí 834", tutorTelefono: "4567892", tutorEmail: "ana.cordova@yahoo.com" },
  { nombre: "Sheyla Mejia Rodriguez", edad: 14, diagnostico: "Osteosarcoma húmero", tutorNombre: "Ricardo Mejia Santos", tutorCI: "9012347", tutorDireccion: "Av. Túpac Amaru 945", tutorTelefono: "4678903", tutorEmail: "ricardo.mejia@gmail.com" },
  { nombre: "Vania Estalla Vargas", edad: 8, diagnostico: "Tumor de Wilms metastásico", tutorNombre: "Claudia Vargas de Estalla", tutorCI: "1234569", tutorDireccion: "Calle La Paz 156", tutorTelefono: "4789014", tutorEmail: "claudia.estalla@hotmail.com" },
  { nombre: "Emyli Melisa Soliz Delgadillo", edad: 11, diagnostico: "Sarcoma de Ewing", tutorNombre: "Jorge Soliz Miranda", tutorCI: "2345670", tutorDireccion: "Av. Villazón 267", tutorTelefono: "4890125", tutorEmail: "jorge.soliz@gmail.com" },
  { nombre: "Anahi Gissel Soria Salguero", edad: 6, diagnostico: "Histiocitosis células Langerhans", tutorNombre: "María Salguero de Soria", tutorCI: "3456782", tutorDireccion: "Calle Tarata 378", tutorTelefono: "4901236", tutorEmail: "maria.soria@yahoo.com" },
  { nombre: "Mariela Guari", edad: 9, diagnostico: "Rabdomiosarcoma", tutorNombre: "Pedro Guari Choque", tutorCI: "4567893", tutorDireccion: "Av. Aniceto Arce 489", tutorTelefono: "4012347", tutorEmail: "pedro.guari@gmail.com" },
  { nombre: "Jose Chirinos Choque", edad: 12, diagnostico: "Astrocitoma pilocítico / Sarcoma no rabdomiosarcoma", tutorNombre: "Juana Choque Vda. de Chirinos", tutorCI: "5678904", tutorDireccion: "Calle Cochabamba 590", tutorTelefono: "4123458", tutorEmail: "juana.chirinos@hotmail.com" },
];

async function registrarPacientesIniciales() {
  console.log('🏥 Registrando pacientes iniciales en el sistema...\n');

  try {
    // Obtener el ID del trabajador social
    const trabajadorSocial = await prisma.usuario.findFirst({
      where: { rol: 'TRABAJADOR_SOCIAL' }
    });

    if (!trabajadorSocial) {
      console.log('❌ No se encontró usuario con rol TRABAJADOR_SOCIAL');
      return;
    }

    console.log(`✅ Trabajador Social: ${trabajadorSocial.nombre} (ID: ${trabajadorSocial.id})\n`);
    console.log('📝 Registrando pacientes...\n');

    let registrados = 0;
    let errores = 0;

    for (const paciente of pacientesIniciales) {
      try {
        // Crear el registro inicial del paciente
        const registro = await prisma.pacienteRegistro.create({
          data: {
            nombreCompletoNino: paciente.nombre,
            fechaNacimiento: new Date(new Date().getFullYear() - paciente.edad, 0, 1),
            edad: paciente.edad,
            diagnostico: paciente.diagnostico,
            estado: 'REGISTRO_INICIAL',
            creadoPorId: trabajadorSocial.id,

            // Datos del tutor
            nombreCompletoTutor: paciente.tutorNombre,
            ciTutor: paciente.tutorCI,
            parentesco: 'Padre/Madre',
            direccion: paciente.tutorDireccion,
            telefonoTutor: paciente.tutorTelefono,
            emailTutor: paciente.tutorEmail,
          }
        });

        console.log(`✅ ${registrados + 1}. ${paciente.nombre} - ${paciente.diagnostico}`);
        console.log(`   Tutor: ${paciente.tutorNombre} - CI: ${paciente.tutorCI}`);
        console.log(`   Dirección: ${paciente.tutorDireccion}`);
        console.log(`   Email: ${paciente.tutorEmail}`);
        console.log('');

        registrados++;
      } catch (error) {
        console.log(`❌ Error al registrar ${paciente.nombre}:`, error.message);
        errores++;
      }
    }

    console.log('');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║     REGISTROS INICIALES COMPLETADOS           ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
    console.log(`✅ Pacientes registrados: ${registrados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log('');
    console.log('📋 Todos los pacientes están en estado "REGISTRO_INICIAL"');
    console.log('📄 Puedes completar el proceso manualmente subiendo los PDFs');
    console.log('');

    // Verificar el total de registros
    const totalRegistros = await prisma.pacienteRegistro.count({
      where: {
        creadoPorId: trabajadorSocial.id,
        estado: 'REGISTRO_INICIAL'
      }
    });

    console.log(`📊 Total de registros iniciales: ${totalRegistros}`);

  } catch (error) {
    console.error('❌ Error durante el registro:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
registrarPacientesIniciales()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
