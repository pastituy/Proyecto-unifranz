const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  // Usuario Administrador
  await prisma.usuario.upsert({
    where: { email: "admin@oncofeliz.com" },
    update: { password: hashedPassword },
    create: {
      nombre: "Administrador",
      email: "admin@oncofeliz.com",
      telefono: "+591 00000000",
      pais: "Bolivia",
      password: hashedPassword,
      ci: "10000000",
      rol: "ADMINISTRADOR",
    },
  });

  // Usuario Trabajador Social
  await prisma.usuario.upsert({
    where: { email: "trabajador@oncofeliz.com" },
    update: { password: hashedPassword },
    create: {
      nombre: "María García",
      email: "trabajador@oncofeliz.com",
      telefono: "+591 11111111",
      pais: "Bolivia",
      password: hashedPassword,
      ci: "10000001",
      rol: "TRABAJADOR_SOCIAL",
    },
  });

  // Usuario Psicólogo
  await prisma.usuario.upsert({
    where: { email: "psicologo@oncofeliz.com" },
    update: { password: hashedPassword },
    create: {
      nombre: "Dr. Juan Pérez",
      email: "psicologo@oncofeliz.com",
      telefono: "+591 22222222",
      pais: "Bolivia",
      password: hashedPassword,
      ci: "10000002",
      rol: "PSICOLOGO",
    },
  });

  // Usuario Asistente/Coordinador
  await prisma.usuario.upsert({
    where: { email: "asistente@oncofeliz.com" },
    update: { password: hashedPassword },
    create: {
      nombre: "Ana López",
      email: "asistente@oncofeliz.com",
      telefono: "+591 33333333",
      pais: "Bolivia",
      password: hashedPassword,
      ci: "10000003",
      rol: "ASISTENTE",
    },
  });

  // ================================
  // BENEFICIARIOS DE PRUEBA
  // ================================

  const trabajadorSocial = await prisma.usuario.findUnique({
    where: { email: "trabajador@oncofeliz.com" },
  });

  const psicologo = await prisma.usuario.findUnique({
    where: { email: "psicologo@oncofeliz.com" },
  });

  const admin = await prisma.usuario.findUnique({
    where: { email: "admin@oncofeliz.com" },
  });

  const asistente = await prisma.usuario.findUnique({
    where: { email: "asistente@oncofeliz.com" },
  });

  // 1. Beneficiario EN_TRATAMIENTO - Leucemia
  const paciente1 = await prisma.pacienteRegistro.create({
    data: {
      nombreCompletoNino: "Carlos Mamani Quispe",
      fechaNacimiento: new Date("2015-03-15"),
      edad: 10,
      ciNino: "1234567",
      diagnostico: "Leucemia Linfoblástica Aguda (LLA)",
      nombreCompletoTutor: "Rosa Quispe de Mamani",
      ciTutor: "7654321",
      parentesco: "Madre",
      telefonoTutor: "72345678",
      direccion: "Zona Villa Fátima, Calle Los Sauces #123, El Alto",
      emailTutor: "rosa.quispe@gmail.com",
      estado: "BENEFICIARIO_ACTIVO",
      creadoPorId: trabajadorSocial.id,
    },
  });

  await prisma.evaluacionSocial.create({
    data: {
      pacienteRegistroId: paciente1.id,
      ingresoFamiliar: 15,
      numPersonasHogar: 12,
      tipoVivienda: 10,
      situacionLaboralPadres: 15,
      accesoSalud: 10,
      gastosMedicosMensuales: 15,
      puntajeTotal: 77,
      nivelVulnerabilidad: "ALTO",
      trabajadorSocialId: trabajadorSocial.id,
    },
  });

  await prisma.beneficiario.create({
    data: {
      pacienteRegistroId: paciente1.id,
      codigoBeneficiario: "B001",
      estadoBeneficiario: "ACTIVO",
      estadoMedico: "EN_TRATAMIENTO",
      aceptadoPorId: admin.id,
      asignadoAId: asistente.id,
      historiaClinica: "HC-2025-001",
      fechaPrimerContacto: new Date("2025-01-15"),
      nombreMedicoTratante: "Dr. Pedro Vargas Rojas",
      especialidadMedico: "Oncología Pediátrica",
      telefonoMedico: "79123456",
      institucionMedica: "Hospital del Niño Dr. Ovidio Aliaga Uría",
      faseTratamiento: "INDUCCION",
      semanaProtocolo: 8,
      esquemaTratamiento: "Protocolo POLA 2021",
      ultimaFechaControl: new Date("2025-11-20"),
      proximaFechaControl: new Date("2025-11-27"),
      frecuenciaControl: "Semanal",
      observacionesMedicas: "Paciente respondiendo bien a la quimioterapia. Hemograma dentro de valores esperados.",
    },
  });

  // 2. Beneficiario VIGILANCIA - Post tratamiento
  const paciente2 = await prisma.pacienteRegistro.create({
    data: {
      nombreCompletoNino: "Ana Laura Condori Mamani",
      fechaNacimiento: new Date("2012-08-22"),
      edad: 13,
      ciNino: "2345678",
      diagnostico: "Linfoma de Hodgkin",
      nombreCompletoTutor: "Luis Condori Apaza",
      ciTutor: "8765432",
      parentesco: "Padre",
      telefonoTutor: "73456789",
      direccion: "Zona San Antonio, Av. Buenos Aires #456, La Paz",
      emailTutor: "luis.condori@yahoo.com",
      estado: "BENEFICIARIO_ACTIVO",
      creadoPorId: trabajadorSocial.id,
    },
  });

  await prisma.evaluacionSocial.create({
    data: {
      pacienteRegistroId: paciente2.id,
      ingresoFamiliar: 12,
      numPersonasHogar: 10,
      tipoVivienda: 8,
      situacionLaboralPadres: 12,
      accesoSalud: 8,
      gastosMedicosMensuales: 12,
      puntajeTotal: 62,
      nivelVulnerabilidad: "MEDIO",
      trabajadorSocialId: trabajadorSocial.id,
    },
  });

  await prisma.beneficiario.create({
    data: {
      pacienteRegistroId: paciente2.id,
      codigoBeneficiario: "B002",
      estadoBeneficiario: "ACTIVO",
      estadoMedico: "VIGILANCIA",
      aceptadoPorId: admin.id,
      asignadoAId: asistente.id,
      historiaClinica: "HC-2023-045",
      fechaPrimerContacto: new Date("2023-05-10"),
      nombreMedicoTratante: "Dra. Carmen Flores Ibáñez",
      especialidadMedico: "Hematología Pediátrica",
      telefonoMedico: "79234567",
      institucionMedica: "Hospital del Niño Dr. Ovidio Aliaga Uría",
      faseTratamiento: "POST_TRATAMIENTO",
      esquemaTratamiento: "ABVD (Adriamicina, Bleomicina, Vinblastina, Dacarbazina)",
      fechaInicioVigilancia: new Date("2024-09-01"),
      tiempoVigilanciaAnios: 2,
      ultimaFechaControl: new Date("2025-11-01"),
      proximaFechaControl: new Date("2026-02-01"),
      frecuenciaControl: "Trimestral",
      observacionesMedicas: "Paciente en remisión completa. Vigilancia activa por 5 años según protocolo.",
    },
  });

  // 3. Beneficiario PALIATIVO - Tumor cerebral avanzado
  const paciente3 = await prisma.pacienteRegistro.create({
    data: {
      nombreCompletoNino: "Miguel Ángel Pari Choque",
      fechaNacimiento: new Date("2016-11-30"),
      edad: 8,
      ciNino: "3456789",
      diagnostico: "Glioblastoma Multiforme",
      nombreCompletoTutor: "Martha Choque de Pari",
      ciTutor: "9876543",
      parentesco: "Madre",
      telefonoTutor: "74567890",
      direccion: "Zona 16 de Julio, Calle Los Andes #789, El Alto",
      emailTutor: null,
      estado: "BENEFICIARIO_ACTIVO",
      creadoPorId: trabajadorSocial.id,
    },
  });

  await prisma.evaluacionSocial.create({
    data: {
      pacienteRegistroId: paciente3.id,
      ingresoFamiliar: 18,
      numPersonasHogar: 14,
      tipoVivienda: 12,
      situacionLaboralPadres: 18,
      accesoSalud: 12,
      gastosMedicosMensuales: 15,
      puntajeTotal: 89,
      nivelVulnerabilidad: "ALTO",
      trabajadorSocialId: trabajadorSocial.id,
    },
  });

  await prisma.beneficiario.create({
    data: {
      pacienteRegistroId: paciente3.id,
      codigoBeneficiario: "B003",
      estadoBeneficiario: "ACTIVO",
      estadoMedico: "PALIATIVO",
      aceptadoPorId: admin.id,
      asignadoAId: trabajadorSocial.id,
      historiaClinica: "HC-2024-089",
      fechaPrimerContacto: new Date("2024-03-20"),
      nombreMedicoTratante: "Dr. Roberto Sánchez Pérez",
      especialidadMedico: "Neurocirugía Pediátrica",
      telefonoMedico: "79345678",
      institucionMedica: "Hospital del Niño Dr. Ovidio Aliaga Uría",
      esquemaTratamiento: "Cuidados paliativos - Control del dolor",
      ultimaFechaControl: new Date("2025-11-22"),
      proximaFechaControl: new Date("2025-11-25"),
      frecuenciaControl: "Cada 3 días",
      alergiasMedicamentos: "Penicilina",
      complicaciones: "Hidrocefalia secundaria, requiere derivación VP",
      observacionesMedicas: "Tumor no operable. Tratamiento enfocado en calidad de vida y control de síntomas.",
    },
  });

  // 4. Beneficiario ABANDONO - Osteosarcoma
  const paciente4 = await prisma.pacienteRegistro.create({
    data: {
      nombreCompletoNino: "Juana Flores Ticona",
      fechaNacimiento: new Date("2014-02-18"),
      edad: 11,
      ciNino: "4567890",
      diagnostico: "Osteosarcoma de Tibia Derecha",
      nombreCompletoTutor: "Silvia Ticona Mamani",
      ciTutor: "6543210",
      parentesco: "Madre",
      telefonoTutor: "75678901",
      direccion: "Zona Senkata, Calle Kollasuyo #234, El Alto",
      emailTutor: null,
      estado: "BENEFICIARIO_ACTIVO",
      creadoPorId: trabajadorSocial.id,
    },
  });

  await prisma.evaluacionSocial.create({
    data: {
      pacienteRegistroId: paciente4.id,
      ingresoFamiliar: 17,
      numPersonasHogar: 13,
      tipoVivienda: 11,
      situacionLaboralPadres: 16,
      accesoSalud: 11,
      gastosMedicosMensuales: 14,
      puntajeTotal: 82,
      nivelVulnerabilidad: "ALTO",
      trabajadorSocialId: trabajadorSocial.id,
    },
  });

  await prisma.beneficiario.create({
    data: {
      pacienteRegistroId: paciente4.id,
      codigoBeneficiario: "B004",
      estadoBeneficiario: "INACTIVO",
      estadoMedico: "ABANDONO",
      aceptadoPorId: admin.id,
      asignadoAId: trabajadorSocial.id,
      historiaClinica: "HC-2024-112",
      fechaPrimerContacto: new Date("2024-06-15"),
      nombreMedicoTratante: "Dr. Fernando Gutiérrez Luna",
      especialidadMedico: "Oncología Ortopédica Pediátrica",
      telefonoMedico: "79456789",
      institucionMedica: "Hospital del Niño Dr. Ovidio Aliaga Uría",
      faseTratamiento: "CONSOLIDACION",
      semanaProtocolo: 12,
      esquemaTratamiento: "MAP (Metotrexato, Adriamicina, Cisplatino)",
      fechaUltimaAsistencia: new Date("2025-09-10"),
      motivoAbandono: "Familia decidió buscar tratamiento alternativo en el área rural. No respondieron a llamadas de seguimiento.",
      notificadoDefensoria: true,
      fechaNotificacionDefensoria: new Date("2025-10-15"),
      observacionesMedicas: "Paciente requería amputación. Familia rechazó procedimiento y abandonó tratamiento en fase crítica.",
    },
  });

  // 5. Beneficiario FALLECIDO - Neuroblastoma
  const paciente5 = await prisma.pacienteRegistro.create({
    data: {
      nombreCompletoNino: "Daniel Eduardo Huanca Limachi",
      fechaNacimiento: new Date("2017-05-08"),
      edad: 8,
      ciNino: "5678901",
      diagnostico: "Neuroblastoma Estadio IV",
      nombreCompletoTutor: "Eduardo Huanca Flores",
      ciTutor: "5432109",
      parentesco: "Padre",
      telefonoTutor: "76789012",
      direccion: "Zona Sopocachi, Calle Rosendo Gutiérrez #567, La Paz",
      emailTutor: "eduardo.huanca@hotmail.com",
      estado: "BENEFICIARIO_ACTIVO",
      creadoPorId: trabajadorSocial.id,
    },
  });

  await prisma.evaluacionSocial.create({
    data: {
      pacienteRegistroId: paciente5.id,
      ingresoFamiliar: 10,
      numPersonasHogar: 8,
      tipoVivienda: 7,
      situacionLaboralPadres: 10,
      accesoSalud: 7,
      gastosMedicosMensuales: 10,
      puntajeTotal: 52,
      nivelVulnerabilidad: "MEDIO",
      trabajadorSocialId: trabajadorSocial.id,
    },
  });

  await prisma.beneficiario.create({
    data: {
      pacienteRegistroId: paciente5.id,
      codigoBeneficiario: "B005",
      estadoBeneficiario: "FALLECIDO",
      estadoMedico: "FALLECIDO",
      aceptadoPorId: admin.id,
      asignadoAId: trabajadorSocial.id,
      historiaClinica: "HC-2024-078",
      fechaPrimerContacto: new Date("2024-04-05"),
      nombreMedicoTratante: "Dra. Mónica Ramos Delgado",
      especialidadMedico: "Oncología Pediátrica",
      telefonoMedico: "79567890",
      institucionMedica: "Hospital del Niño Dr. Ovidio Aliaga Uría",
      esquemaTratamiento: "Quimioterapia paliativa - Protocolo reducido",
      fechaFallecimiento: new Date("2025-10-28"),
      causaFallecimiento: "Complicaciones por progresión de neuroblastoma metastásico. Falla multiorgánica.",
      observacionesMedicas: "Paciente diagnosticado en estadio terminal. Se brindó cuidado paliativo y apoyo a la familia.",
    },
  });

  // 6. Beneficiario EN_TRATAMIENTO adicional - Leucemia Mieloide
  const paciente6 = await prisma.pacienteRegistro.create({
    data: {
      nombreCompletoNino: "Sofía Valentina Cruz Yujra",
      fechaNacimiento: new Date("2013-12-10"),
      edad: 11,
      ciNino: "6789012",
      diagnostico: "Leucemia Mieloide Aguda (LMA)",
      nombreCompletoTutor: "Patricia Yujra Quispe",
      ciTutor: "4321098",
      parentesco: "Madre",
      telefonoTutor: "77890123",
      direccion: "Zona Miraflores, Calle Méndez Arcos #890, La Paz",
      emailTutor: "patricia.yujra@gmail.com",
      estado: "BENEFICIARIO_ACTIVO",
      creadoPorId: trabajadorSocial.id,
    },
  });

  await prisma.evaluacionSocial.create({
    data: {
      pacienteRegistroId: paciente6.id,
      ingresoFamiliar: 14,
      numPersonasHogar: 11,
      tipoVivienda: 9,
      situacionLaboralPadres: 13,
      accesoSalud: 9,
      gastosMedicosMensuales: 13,
      puntajeTotal: 69,
      nivelVulnerabilidad: "ALTO",
      trabajadorSocialId: trabajadorSocial.id,
    },
  });

  await prisma.beneficiario.create({
    data: {
      pacienteRegistroId: paciente6.id,
      codigoBeneficiario: "B006",
      estadoBeneficiario: "ACTIVO",
      estadoMedico: "EN_TRATAMIENTO",
      aceptadoPorId: admin.id,
      asignadoAId: trabajadorSocial.id,
      historiaClinica: "HC-2025-034",
      fechaPrimerContacto: new Date("2025-02-20"),
      nombreMedicoTratante: "Dr. Andrés Morales Castro",
      especialidadMedico: "Hematología Oncológica Pediátrica",
      telefonoMedico: "79678901",
      institucionMedica: "Hospital del Niño Dr. Ovidio Aliaga Uría",
      faseTratamiento: "CONSOLIDACION",
      semanaProtocolo: 18,
      esquemaTratamiento: "Protocolo AML-BFM 2012",
      ultimaFechaControl: new Date("2025-11-18"),
      proximaFechaControl: new Date("2025-12-02"),
      frecuenciaControl: "Quincenal",
      alergiasMedicamentos: "Ninguna conocida",
      observacionesMedicas: "Buena respuesta al tratamiento. Requiere transfusiones periódicas de plaquetas.",
    },
  });

  console.log("✅ Seed completado exitosamente.");
  console.log("📧 Administrador: admin@oncofeliz.com | Contraseña: 123456");
  console.log("📧 Trabajador Social: trabajador@oncofeliz.com | Contraseña: 123456");
  console.log("📧 Psicólogo: psicologo@oncofeliz.com | Contraseña: 123456");
  console.log("📧 Asistente: asistente@oncofeliz.com | Contraseña: 123456");
  console.log("\n📊 Beneficiarios de prueba creados:");
  console.log("   B001 - Carlos Mamani (EN_TRATAMIENTO - Leucemia LLA)");
  console.log("   B002 - Ana Laura Condori (VIGILANCIA - Linfoma Hodgkin)");
  console.log("   B003 - Miguel Ángel Pari (PALIATIVO - Glioblastoma)");
  console.log("   B004 - Juana Flores (ABANDONO - Osteosarcoma)");
  console.log("   B005 - Daniel Eduardo Huanca (FALLECIDO - Neuroblastoma)");
  console.log("   B006 - Sofía Valentina Cruz (EN_TRATAMIENTO - Leucemia LMA)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
