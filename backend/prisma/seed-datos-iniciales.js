const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Nombres y apellidos bolivianos comunes
const nombresNinos = [
  'Santiago', 'Mateo', 'Valentina', 'Isabella', 'Sebastián',
  'Sofía', 'Nicolás', 'Emma', 'Gabriel', 'Mía',
  'Lucas', 'María José', 'Diego', 'Luciana', 'Joaquín',
  'Camila', 'Martín', 'Victoria', 'Andrés', 'Antonella'
];

const apellidos = [
  'García', 'Rodríguez', 'López', 'Martínez', 'Pérez',
  'González', 'Sánchez', 'Ramírez', 'Torres', 'Flores',
  'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales',
  'Reyes', 'Gutiérrez', 'Ortiz', 'Chávez', 'Vargas'
];

const diagnosticos = [
  'Leucemia Linfoblástica Aguda (LLA)',
  'Leucemia Mieloide Aguda (LMA)',
  'Linfoma de Hodgkin',
  'Linfoma No Hodgkin',
  'Tumor Cerebral - Meduloblastoma',
  'Neuroblastoma',
  'Tumor de Wilms (Riñón)',
  'Osteosarcoma',
  'Rabdomiosarcoma',
  'Retinoblastoma'
];

const ciudades = ['La Paz', 'El Alto', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí', 'Sucre', 'Tarija'];

const tiposVivienda = [
  'Casa propia',
  'Casa alquilada',
  'Departamento alquilado',
  'Vivienda familiar',
  'Cuarto alquilado'
];

const parentescos = ['Madre', 'Padre', 'Abuela', 'Abuelo', 'Tía', 'Tío'];

// Función para generar CI boliviano ficticio
function generarCI() {
  return `${Math.floor(Math.random() * 10000000) + 1000000}`;
}

// Función para generar teléfono boliviano
function generarTelefono() {
  const prefijos = ['7', '6'];
  const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
  return `${prefijo}${Math.floor(Math.random() * 90000000) + 10000000}`;
}

// Función para generar fecha aleatoria en los últimos meses
function fechaAleatoria(mesesAtras) {
  const hoy = new Date();
  const fecha = new Date(hoy);
  fecha.setMonth(fecha.getMonth() - Math.floor(Math.random() * mesesAtras));
  return fecha;
}

// Función para generar fecha de nacimiento (0-15 años)
function fechaNacimientoAleatoria() {
  const hoy = new Date();
  const edad = Math.floor(Math.random() * 16); // 0-15 años
  const fecha = new Date(hoy);
  fecha.setFullYear(fecha.getFullYear() - edad);
  fecha.setMonth(Math.floor(Math.random() * 12));
  fecha.setDate(Math.floor(Math.random() * 28) + 1);
  return fecha;
}

// Función para calcular edad desde fecha de nacimiento
function calcularEdad(fechaNacimiento) {
  const hoy = new Date();
  const fecha = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const mes = hoy.getMonth() - fecha.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
    edad--;
  }
  return edad;
}

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // Limpiar datos existentes (opcional - comentar si no deseas borrar)
  console.log('🗑️  Limpiando datos existentes...');
  await prisma.notificacion.deleteMany({});
  await prisma.solicitudAyuda.deleteMany({});
  await prisma.sesionQuimioterapia.deleteMany({});
  await prisma.ayuda.deleteMany({});
  await prisma.beneficiario.deleteMany({});
  await prisma.evaluacionSocial.deleteMany({});
  await prisma.pacienteRegistro.deleteMany({});
  await prisma.donaciones.deleteMany({});
  await prisma.usuario.deleteMany({});
  console.log('✅ Datos anteriores eliminados\n');

  // 1. CREAR USUARIOS
  console.log('👥 Creando usuarios...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const usuarios = await Promise.all([
    // ADMINISTRADOR
    prisma.usuario.create({
      data: {
        nombre: 'Dr. Carlos Mendoza',
        email: 'admin@oncofeliz.org',
        telefono: '71234567',
        pais: 'Bolivia',
        ci: '4567890',
        password: passwordHash,
        rol: 'ADMINISTRADOR'
      }
    }),
    // TRABAJADORES SOCIALES
    prisma.usuario.create({
      data: {
        nombre: 'Lic. María Fernández',
        email: 'maria.fernandez@oncofeliz.org',
        telefono: '72345678',
        pais: 'Bolivia',
        ci: '5678901',
        password: passwordHash,
        rol: 'TRABAJADOR_SOCIAL'
      }
    }),
    prisma.usuario.create({
      data: {
        nombre: 'Lic. Ana Gutiérrez',
        email: 'ana.gutierrez@oncofeliz.org',
        telefono: '73456789',
        pais: 'Bolivia',
        ci: '6789012',
        password: passwordHash,
        rol: 'TRABAJADOR_SOCIAL'
      }
    }),
    // PSICÓLOGO
    prisma.usuario.create({
      data: {
        nombre: 'Psic. Roberto Chávez',
        email: 'roberto.chavez@oncofeliz.org',
        telefono: '74567890',
        pais: 'Bolivia',
        ci: '7890123',
        password: passwordHash,
        rol: 'PSICOLOGO'
      }
    }),
    // ASISTENTE
    prisma.usuario.create({
      data: {
        nombre: 'Patricia Ríos',
        email: 'patricia.rios@oncofeliz.org',
        telefono: '75678901',
        pais: 'Bolivia',
        ci: '8901234',
        password: passwordHash,
        rol: 'ASISTENTE'
      }
    })
  ]);

  console.log(`✅ ${usuarios.length} usuarios creados\n`);

  const [admin, trabajadorSocial1, trabajadorSocial2, psicologo, asistente] = usuarios;

  // 2. CREAR DONACIONES
  console.log('💰 Creando donaciones...');
  const metodosPago = ['Transferencia Bancaria', 'QR', 'Efectivo', 'Tarjeta'];
  const donaciones = [];

  for (let i = 0; i < 18; i++) {
    const cantidad = (Math.random() * 4950 + 50).toFixed(2); // Entre 50 y 5000 Bs
    const donacion = await prisma.donaciones.create({
      data: {
        nombreDonante: `${nombresNinos[Math.floor(Math.random() * nombresNinos.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`,
        cantidad: cantidad,
        metodoPago: metodosPago[Math.floor(Math.random() * metodosPago.length)],
        descripcion: i % 3 === 0 ? 'Donación anónima para ayudar a niños con cáncer' : null,
        fecha: fechaAleatoria(6)
      }
    });
    donaciones.push(donacion);
  }

  console.log(`✅ ${donaciones.length} donaciones creadas\n`);

  // 3. CREAR PACIENTES, EVALUACIONES Y BENEFICIARIOS
  console.log('👶 Creando pacientes, evaluaciones y beneficiarios...');

  const tiposAyuda = ['MEDICAMENTOS', 'QUIMIOTERAPIA', 'ANALISIS_EXAMENES', 'OTRO'];
  const estadosSolicitud = ['PENDIENTE', 'RECEPCIONADO', 'ENTREGADO'];
  const prioridades = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];

  for (let i = 0; i < 20; i++) {
    const nombreNino = nombresNinos[i % nombresNinos.length];
    const apellidoNino = apellidos[i % apellidos.length];
    const nombreTutor = `${nombresNinos[Math.floor(Math.random() * nombresNinos.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`;
    const fechaNac = fechaNacimientoAleatoria();
    const edad = calcularEdad(fechaNac);
    const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)];
    const diagnostico = diagnosticos[Math.floor(Math.random() * diagnosticos.length)];
    const trabajadorAsignado = Math.random() > 0.5 ? trabajadorSocial1 : trabajadorSocial2;

    // Crear registro de paciente
    const paciente = await prisma.pacienteRegistro.create({
      data: {
        nombreCompletoNino: `${nombreNino} ${apellidoNino}`,
        fechaNacimiento: fechaNac,
        edad: edad,
        ciNino: edad >= 12 ? generarCI() : null,
        diagnostico: diagnostico,
        nombreCompletoTutor: nombreTutor,
        ciTutor: generarCI(),
        parentesco: parentescos[Math.floor(Math.random() * parentescos.length)],
        telefonoTutor: generarTelefono(),
        direccion: `${tiposVivienda[Math.floor(Math.random() * tiposVivienda.length)]}, Zona ${['Norte', 'Sur', 'Este', 'Oeste'][Math.floor(Math.random() * 4)]}, ${ciudad}`,
        emailTutor: `tutor${i + 1}@email.com`,
        estado: 'BENEFICIARIO_ACTIVO',
        creadoPorId: trabajadorAsignado.id,
        fechaRegistro: fechaAleatoria(8)
      }
    });

    // Crear evaluación social
    const ingresoFamiliar = Math.floor(Math.random() * 3000) + 1000;
    const numPersonas = Math.floor(Math.random() * 5) + 3;
    const puntajeVivienda = Math.floor(Math.random() * 20) + 5;
    const puntajeSituacionLaboral = Math.floor(Math.random() * 25) + 5;
    const puntajeAccesoSalud = Math.floor(Math.random() * 20) + 5;
    const gastosMedicos = Math.floor(Math.random() * 800) + 200;
    const puntajeTotal = puntajeVivienda + puntajeSituacionLaboral + puntajeAccesoSalud + Math.floor(gastosMedicos / 10);

    let nivelVulnerabilidad = 'BAJO';
    if (puntajeTotal >= 60) nivelVulnerabilidad = 'ALTO';
    else if (puntajeTotal >= 40) nivelVulnerabilidad = 'MEDIO';

    await prisma.evaluacionSocial.create({
      data: {
        pacienteRegistroId: paciente.id,
        ingresoFamiliar: ingresoFamiliar,
        numPersonasHogar: numPersonas,
        tipoVivienda: puntajeVivienda,
        situacionLaboralPadres: puntajeSituacionLaboral,
        accesoSalud: puntajeAccesoSalud,
        gastosMedicosMensuales: gastosMedicos,
        puntajeTotal: puntajeTotal,
        nivelVulnerabilidad: nivelVulnerabilidad,
        observaciones: `Familia con ${numPersonas} miembros. Ingreso mensual de Bs. ${ingresoFamiliar}. Gastos médicos mensuales aproximados: Bs. ${gastosMedicos}. Nivel de vulnerabilidad: ${nivelVulnerabilidad}.`,
        trabajadorSocialId: trabajadorAsignado.id,
        fechaEvaluacion: fechaAleatoria(7)
      }
    });

    // Crear beneficiario
    const codigoBeneficiario = `B${String(i + 1).padStart(3, '0')}`;
    const beneficiario = await prisma.beneficiario.create({
      data: {
        pacienteRegistroId: paciente.id,
        codigoBeneficiario: codigoBeneficiario,
        estadoBeneficiario: 'ACTIVO',
        estadoMedico: 'EN_TRATAMIENTO',
        fechaAceptacion: fechaAleatoria(6),
        aceptadoPorId: admin.id,
        asignadoAId: trabajadorAsignado.id,
        historiaClinica: `HC-${codigoBeneficiario}-2024`,
        fechaPrimerContacto: fechaAleatoria(6),
        nombreMedicoTratante: `Dr. ${apellidos[Math.floor(Math.random() * apellidos.length)]}`,
        especialidadMedico: 'Oncología Pediátrica',
        institucionMedica: 'Hospital del Niño - ' + ciudad,
        faseTratamiento: ['INDUCCION', 'CONSOLIDACION', 'MANTENIMIENTO'][Math.floor(Math.random() * 3)],
        semanaProtocolo: Math.floor(Math.random() * 20) + 1,
        observacionesMedicas: `Paciente diagnosticado con ${diagnostico}. Respondiendo favorablemente al tratamiento.`
      }
    });

    // Crear 1-3 solicitudes de ayuda por beneficiario
    const numSolicitudes = Math.floor(Math.random() * 3) + 1;

    for (let j = 0; j < numSolicitudes; j++) {
      const fechaSol = fechaAleatoria(5);
      const codigoSol = `SOL-${String(i + 1).padStart(3, '0')}-${String(j + 1).padStart(2, '0')}`;
      const tipoAyuda = tiposAyuda[Math.floor(Math.random() * tiposAyuda.length)];
      const costoEstimado = parseFloat((Math.random() * 1500 + 200).toFixed(2));
      const costoReal = parseFloat((costoEstimado * (0.8 + Math.random() * 0.3)).toFixed(2));
      const estado = estadosSolicitud[Math.floor(Math.random() * estadosSolicitud.length)];
      const prioridad = prioridades[Math.floor(Math.random() * prioridades.length)];

      let detalleSolicitud = '';
      if (tipoAyuda === 'MEDICAMENTOS') {
        detalleSolicitud = 'Medicamentos oncológicos: Vincristina, Dexametasona, L-Asparaginasa';
      } else if (tipoAyuda === 'QUIMIOTERAPIA') {
        detalleSolicitud = `Sesión de quimioterapia - Semana ${Math.floor(Math.random() * 20) + 1} del protocolo`;
      } else if (tipoAyuda === 'ANALISIS_EXAMENES') {
        detalleSolicitud = 'Exámenes de laboratorio: Hemograma completo, Química sanguínea, Punción lumbar';
      } else {
        detalleSolicitud = 'Apoyo para transporte y alimentación durante tratamiento';
      }

      await prisma.solicitudAyuda.create({
        data: {
          codigoSolicitud: codigoSol,
          beneficiarioId: beneficiario.id,
          solicitadoPorId: trabajadorAsignado.id,
          fechaSolicitud: fechaSol,
          prioridad: prioridad,
          tipoAyuda: tipoAyuda,
          detalleSolicitud: detalleSolicitud,
          costoEstimado: costoEstimado,
          estado: estado,
          revisadoPorId: estado !== 'PENDIENTE' ? admin.id : null,
          fechaRevision: estado !== 'PENDIENTE' ? new Date(fechaSol.getTime() + 86400000 * 2) : null,
          montoAprobado: estado !== 'PENDIENTE' ? costoReal : null,
          costoReal: estado === 'ENTREGADO' ? costoReal : null,
          fechaEntrega: estado === 'ENTREGADO' ? new Date(fechaSol.getTime() + 86400000 * 5) : null,
          lugarEntrega: estado === 'ENTREGADO' ? 'Oficina Fundación OncoFeliz' : null,
          proveedor: estado === 'ENTREGADO' ? ['Farmacia San Martín', 'Laboratorio Central', 'Hospital del Niño'][Math.floor(Math.random() * 3)] : null
        }
      });
    }

    console.log(`  ✓ Beneficiario ${i + 1}/20: ${codigoBeneficiario} - ${nombreNino} ${apellidoNino}`);
  }

  console.log(`\n✅ 20 beneficiarios completos creados con sus evaluaciones y solicitudes\n`);

  // Resumen final
  console.log('📊 RESUMEN DE DATOS CREADOS:');
  console.log('================================');

  const totalUsuarios = await prisma.usuario.count();
  const totalPacientes = await prisma.pacienteRegistro.count();
  const totalBeneficiarios = await prisma.beneficiario.count();
  const totalSolicitudes = await prisma.solicitudAyuda.count();
  const totalDonaciones = await prisma.donaciones.count();
  const totalEvaluacionesSociales = await prisma.evaluacionSocial.count();

  console.log(`👥 Usuarios: ${totalUsuarios}`);
  console.log(`   - 1 ADMINISTRADOR`);
  console.log(`   - 2 TRABAJADORES SOCIALES`);
  console.log(`   - 1 PSICÓLOGO`);
  console.log(`   - 1 ASISTENTE`);
  console.log(`👶 Pacientes registrados: ${totalPacientes}`);
  console.log(`📋 Evaluaciones sociales: ${totalEvaluacionesSociales}`);
  console.log(`✅ Beneficiarios activos: ${totalBeneficiarios}`);
  console.log(`📄 Solicitudes de ayuda: ${totalSolicitudes}`);
  console.log(`💰 Donaciones: ${totalDonaciones}`);
  console.log('================================\n');

  console.log('🔐 CREDENCIALES DE ACCESO:');
  console.log('================================');
  console.log('📧 Email: admin@oncofeliz.org');
  console.log('🔑 Password: Password123!');
  console.log('(Misma contraseña para todos los usuarios)\n');

  console.log('✨ ¡Seed completado exitosamente! ✨\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error durante el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
