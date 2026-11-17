const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de Campañas y Eventos...");

  // Limpiar datos existentes (opcional)
  console.log("🗑️  Limpiando campañas y eventos existentes...");
  await prisma.usuarioCompana.deleteMany();
  await prisma.donaciones.deleteMany();
  await prisma.campana.deleteMany();
  await prisma.evento.deleteMany();

  // ==================================
  // CREAR CAMPAÑAS
  // ==================================
  console.log("📢 Creando campañas...");

  const campana1 = await prisma.campana.create({
    data: {
      titulo: "Navidad Solidaria 2025",
      descripcion:
        "Únete a nuestra campaña navideña para llevar alegría y esperanza a los niños con cáncer. Tu donación ayudará a cubrir tratamientos médicos y regalos navideños para nuestros pequeños guerreros.",
      fecha: "2025-12-01",
      multimedia: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800",
      recaudado: 15750.50,
      previstro: 50000.00,
    },
  });

  const campana2 = await prisma.campana.create({
    data: {
      titulo: "Maratón por la Vida",
      descripcion:
        "Participa en nuestra maratón benéfica. Cada kilómetro cuenta para recaudar fondos destinados a quimioterapias y medicamentos para niños en tratamiento oncológico.",
      fecha: "2025-03-15",
      multimedia: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800",
      recaudado: 28340.00,
      previstro: 100000.00,
    },
  });

  const campana3 = await prisma.campana.create({
    data: {
      titulo: "Juntos contra el Cáncer Infantil",
      descripcion:
        "Campaña permanente para apoyar el tratamiento integral de niños con cáncer. Incluye medicamentos, análisis de laboratorio, transporte y alimentación para las familias.",
      fecha: "2025-01-01",
      multimedia: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800",
      recaudado: 45600.75,
      previstro: 200000.00,
    },
  });

  const campana4 = await prisma.campana.create({
    data: {
      titulo: "Esperanza en Acción",
      descripcion:
        "Apoya a las familias que luchan contra el cáncer infantil. Esta campaña busca financiar evaluaciones sociales, apoyo psicológico y asistencia médica especializada.",
      fecha: "2025-06-01",
      multimedia: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",
      recaudado: 12890.00,
      previstro: 75000.00,
    },
  });

  const campana5 = await prisma.campana.create({
    data: {
      titulo: "Sonrisas que Curan",
      descripcion:
        "Programa de apoyo emocional y recreativo para niños en tratamiento. Incluye actividades terapéuticas, juegos educativos y eventos especiales para levantar el ánimo de nuestros guerreros.",
      fecha: "2025-04-10",
      multimedia: "https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=800",
      recaudado: 8250.00,
      previstro: 30000.00,
    },
  });

  console.log(`✅ ${5} campañas creadas exitosamente.`);

  // ==================================
  // CREAR DONACIONES PARA LAS CAMPAÑAS
  // ==================================
  console.log("💰 Creando donaciones de ejemplo...");

  await prisma.donaciones.createMany({
    data: [
      {
        nombreDonante: "María Rodríguez",
        cantidad: "500.00",
        metodoPago: "Tarjeta de Crédito",
        descripcion: "Donación para tratamiento de quimioterapia",
        idCampana: campana1.id,
      },
      {
        nombreDonante: "Juan Carlos Pérez",
        cantidad: "1000.00",
        metodoPago: "Transferencia Bancaria",
        descripcion: "Aporte para medicamentos",
        idCampana: campana1.id,
      },
      {
        nombreDonante: "Ana Martínez",
        cantidad: "750.50",
        metodoPago: "PayPal",
        descripcion: "Donación navideña",
        idCampana: campana1.id,
      },
      {
        nombreDonante: "Empresa TechBolivia S.A.",
        cantidad: "5000.00",
        metodoPago: "Transferencia Bancaria",
        descripcion: "Donación corporativa anual",
        idCampana: campana2.id,
      },
      {
        nombreDonante: "Pedro Gómez",
        cantidad: "250.00",
        metodoPago: "Efectivo",
        descripcion: "Participación en maratón",
        idCampana: campana2.id,
      },
      {
        nombreDonante: "Sofía Vargas",
        cantidad: "1500.00",
        metodoPago: "Tarjeta de Débito",
        descripcion: "Apoyo para transporte y alimentación",
        idCampana: campana3.id,
      },
      {
        nombreDonante: "Anónimo",
        cantidad: "300.00",
        metodoPago: "Transferencia Bancaria",
        descripcion: "Donación anónima",
        idCampana: campana3.id,
      },
      {
        nombreDonante: "Fundación Esperanza",
        cantidad: "10000.00",
        metodoPago: "Transferencia Bancaria",
        descripcion: "Donación institucional",
        idCampana: campana3.id,
      },
      {
        nombreDonante: "Roberto Silva",
        cantidad: "450.00",
        metodoPago: "Tarjeta de Crédito",
        descripcion: "Apoyo psicológico",
        idCampana: campana4.id,
      },
      {
        nombreDonante: "Claudia Morales",
        cantidad: "200.00",
        metodoPago: "PayPal",
        descripcion: "Para actividades recreativas",
        idCampana: campana5.id,
      },
    ],
  });

  console.log("✅ 10 donaciones creadas exitosamente.");

  // ==================================
  // CREAR EVENTOS
  // ==================================
  console.log("🎉 Creando eventos...");

  await prisma.evento.createMany({
    data: [
      {
        titulo: "Día Mundial contra el Cáncer Infantil",
        descripcion:
          "Jornada de concientización sobre el cáncer infantil. Incluye charlas médicas, testimonios de sobrevivientes, actividades lúdicas para niños y feria de salud gratuita. ¡Toda la familia está invitada!",
        fecha: "2025-02-15",
        ubicacion: "Plaza Principal - Santa Cruz de la Sierra",
        img: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800",
      },
      {
        titulo: "Caminata Solidaria por la Vida",
        descripcion:
          "Únete a nuestra caminata de 5km para apoyar a niños con cáncer. Incluye inscripción gratuita, playera del evento, hidratación y refrigerio. El recorrido es apto para toda la familia.",
        fecha: "2025-03-22",
        ubicacion: "Parque Urbano Central - La Paz",
        img: "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800",
      },
      {
        titulo: "Concierto Benéfico 'Música con Corazón'",
        descripcion:
          "Noche de música en vivo con artistas bolivianos reconocidos. Todos los fondos recaudados irán destinados a tratamientos de quimioterapia. Venta de entradas disponible en línea y taquilla.",
        fecha: "2025-04-18",
        ubicacion: "Teatro Municipal - Cochabamba",
        img: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
      },
      {
        titulo: "Feria de Salud Infantil",
        descripcion:
          "Jornada gratuita de chequeos médicos, vacunación, charlas preventivas sobre el cáncer y talleres educativos. Atención a cargo de profesionales voluntarios de la salud.",
        fecha: "2025-05-10",
        ubicacion: "Centro de Convenciones - Tarija",
        img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
      },
      {
        titulo: "Noche de Gala Benéfica",
        descripcion:
          "Elegante velada con cena, subasta silenciosa de obras de arte, presentaciones artísticas y sorteos. Evento formal para recaudar fondos destinados a cirugías oncológicas pediátricas.",
        fecha: "2025-06-28",
        ubicacion: "Hotel Camino Real - Santa Cruz",
        img: "https://images.unsplash.com/photo-1519167758481-83f29da8c851?w=800",
      },
      {
        titulo: "Torneo de Fútbol Infantil 'Jugando por una Causa'",
        descripcion:
          "Torneo deportivo para niños de 6 a 12 años. Inscripción por equipos con cuota solidaria. Incluye trofeos, medallas y refrigerio para todos los participantes.",
        fecha: "2025-07-14",
        ubicacion: "Estadio Municipal - Oruro",
        img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
      },
      {
        titulo: "Festival de Comida Solidaria",
        descripcion:
          "Degustación de platos típicos bolivianos preparados por chefs reconocidos. Venta de tickets para apoyar programas de alimentación para familias de niños en tratamiento.",
        fecha: "2025-08-20",
        ubicacion: "Plaza de las Banderas - El Alto",
        img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
      },
      {
        titulo: "Día del Niño Especial",
        descripcion:
          "Celebración dedicada a nuestros pequeños guerreros con cáncer. Actividades recreativas, show de payasos, mago, cara pintada, juegos inflables y entrega de regalos.",
        fecha: "2025-04-12",
        ubicacion: "Parque Infantil OncoFeliz - Santa Cruz",
        img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
      },
      {
        titulo: "Charla: Detección Temprana del Cáncer Infantil",
        descripcion:
          "Conferencia médica dirigida a padres de familia y educadores sobre signos de alerta del cáncer infantil. Entrada gratuita con inscripción previa. Incluye material educativo.",
        fecha: "2025-05-25",
        ubicacion: "Auditorio Universidad Mayor de San Andrés - La Paz",
        img: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800",
      },
      {
        titulo: "Navidad en el Hospital",
        descripcion:
          "Visita especial de Papá Noel y sus duendes a los niños hospitalizados. Entrega de regalos, villancicos y actividades navideñas para llevar alegría a los pequeños pacientes.",
        fecha: "2025-12-24",
        ubicacion: "Hospital Oncológico Pediátrico - Cochabamba",
        img: "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800",
      },
    ],
  });

  console.log("✅ 10 eventos creados exitosamente.");

  // ==================================
  // RESUMEN
  // ==================================
  console.log("\n📊 RESUMEN DEL SEED:");
  console.log("========================");
  console.log("✅ 5 Campañas creadas");
  console.log("✅ 10 Donaciones registradas");
  console.log("✅ 10 Eventos programados");
  console.log("========================\n");

  console.log("🎯 Campañas disponibles:");
  const campanas = await prisma.campana.findMany({
    include: {
      donaciones: true,
    },
  });

  campanas.forEach((c) => {
    const porcentaje = c.previstro
      ? ((Number(c.recaudado) / Number(c.previstro)) * 100).toFixed(1)
      : 0;
    console.log(
      `   📢 ${c.titulo}: $${c.recaudado} / $${c.previstro} (${porcentaje}%)`
    );
  });

  console.log("\n🎉 Próximos eventos:");
  const eventos = await prisma.evento.findMany({
    orderBy: {
      fecha: "asc",
    },
    take: 5,
  });

  eventos.forEach((e) => {
    console.log(`   📅 ${e.fecha} - ${e.titulo} (${e.ubicacion})`);
  });

  console.log("\n✅ Seed de Campañas y Eventos completado exitosamente!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error ejecutando el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
