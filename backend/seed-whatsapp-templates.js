const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const templatesData = [
  {
    codigo: "BIENVENIDA_BENEFICIARIO",
    descripcion: "Mensaje de bienvenida al aceptar un caso",
    plantilla: `Hola {{nombre}},

¡Bienvenido/a a la Fundación OncoFeliz! 🎗️

Nos complace informarte que tu caso ha sido aceptado y estaremos acompañándote en este proceso. Nuestro equipo estará contigo para brindarte el apoyo que necesitas.

Si tienes alguna pregunta, no dudes en contactarnos.

¡Ánimo y fuerza! 💪`,
  },
  {
    codigo: "CITA_RECORDATORIO",
    descripcion: "Recordatorio de cita programada",
    plantilla: `Hola {{nombre}},

Te recordamos que tienes una cita programada:

📅 Fecha: {{fecha}}
🕐 Hora: {{hora}}
📍 Lugar: {{ubicacion}}

Por favor confirma tu asistencia respondiendo a este mensaje.

Fundación OncoFeliz`,
  },
  {
    codigo: "SOLICITUD_DOCUMENTOS",
    descripcion: "Solicitud de documentación adicional",
    plantilla: `Hola {{nombre}},

Para continuar con tu proceso, necesitamos que nos proporciones los siguientes documentos:

{{lista_documentos}}

Puedes enviarlos respondiendo a este mensaje o acercándote a nuestras oficinas.

Gracias por tu colaboración.
Fundación OncoFeliz`,
  },
  {
    codigo: "APROBACION_AYUDA",
    descripcion: "Notificación de aprobación de ayuda",
    plantilla: `¡Buenas noticias {{nombre}}! 🎉

Tu solicitud de ayuda ha sido aprobada.

Tipo de ayuda: {{tipo_ayuda}}
Monto/Detalle: {{detalle}}

Nos pondremos en contacto contigo pronto para coordinar la entrega.

Fundación OncoFeliz`,
  },
  {
    codigo: "EVENTO_INVITACION",
    descripcion: "Invitación a eventos de la fundación",
    plantilla: `Hola {{nombre}},

Te invitamos a participar en nuestro próximo evento:

🎪 {{nombre_evento}}
📅 {{fecha}}
🕐 {{hora}}
📍 {{ubicacion}}

{{descripcion_evento}}

¡Tu presencia es muy importante para nosotros!

Fundación OncoFeliz`,
  },
];

async function seedTemplates() {
  console.log("🌱 Iniciando carga de datos de prueba...\n");

  try {
    // Verificar si ya existen templates
    const existingTemplates = await prisma.whatsappTemplate.count();

    if (existingTemplates > 0) {
      console.log(`⚠️  Ya existen ${existingTemplates} plantillas en la base de datos.`);
      console.log("¿Deseas continuar? Esto creará plantillas adicionales.\n");
    }

    // Insertar cada plantilla
    for (const template of templatesData) {
      try {
        const created = await prisma.whatsappTemplate.create({
          data: template,
        });
        console.log(`✅ Plantilla creada: ${created.codigo}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  La plantilla ${template.codigo} ya existe, saltando...`);
        } else {
          console.error(`❌ Error al crear ${template.codigo}:`, error.message);
        }
      }
    }

    console.log("\n🎉 Carga de datos completada!");

    // Mostrar resumen
    const total = await prisma.whatsappTemplate.count();
    console.log(`\n📊 Total de plantillas en la base de datos: ${total}`);

  } catch (error) {
    console.error("❌ Error general:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
seedTemplates();
