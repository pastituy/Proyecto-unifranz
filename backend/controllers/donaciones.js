const express = require("express");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer").default || require("nodemailer");
const { enviarAgradecimientoDonacion } = require("../services/emailService");
const app = express();
const prisma = new PrismaClient();

// Configurar transporte de email
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.get("/donaciones", async (req, res) => {
  try {
    const donaciones = await prisma.donaciones.findMany({});
    res.json({
      data: donaciones,
      mensaje: "donaciones obtenidos correctamente",
    });
  } catch (error) {
    console.error("Error al obtener donaciones:", error);
    res.status(500).json({
      mensaje: "Error al traer donaciones",
      error: error.message,
    });
  }
});

// Endpoint para obtener estadísticas de donaciones con filtro de periodo
app.get("/donaciones/estadisticas", async (req, res) => {
  try {
    const { periodo = 'mes' } = req.query; // 'dia', 'mes', 'año'

    // Calcular fecha de inicio según el periodo
    const fechaInicio = new Date();

    switch(periodo) {
      case 'dia':
        // Desde las 00:00 del día actual
        fechaInicio.setHours(0, 0, 0, 0);
        break;
      case 'año':
        // Desde hace un año
        fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
        break;
      case 'mes':
      default:
        // Desde hace un mes (por defecto)
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);
        break;
    }

    // Obtener todas las donaciones del periodo seleccionado
    const donacionesPeriodo = await prisma.donaciones.findMany({
      where: {
        fecha: {
          gte: fechaInicio
        }
      }
    });

    // Clasificar donaciones por tipo basándose en la descripción o nombre
    const personasNaturales = donacionesPeriodo.filter(d => {
      const desc = (d.descripcion || '').toLowerCase();
      const nombre = d.nombreDonante.toLowerCase();
      return desc.includes('personal') || desc.includes('natural') ||
             (!desc.includes('empresa') && !desc.includes('corporat') && !desc.includes('internacional'));
    });

    const empresasPrivadas = donacionesPeriodo.filter(d => {
      const desc = (d.descripcion || '').toLowerCase();
      const nombre = d.nombreDonante.toLowerCase();
      return desc.includes('empresa') || desc.includes('corporat') ||
             nombre.includes('s.a.') || nombre.includes('ltda') || nombre.includes('srl');
    });

    const donacionesExtranjero = donacionesPeriodo.filter(d => {
      const desc = (d.descripcion || '').toLowerCase();
      return desc.includes('internacional') || desc.includes('extranjero') || desc.includes('foreign');
    });

    // Calcular totales
    const calcularTotal = (donaciones) => {
      return donaciones.reduce((sum, d) => sum + parseFloat(d.cantidad || 0), 0);
    };

    const estadisticas = {
      personasNaturales: {
        cantidad: personasNaturales.length,
        total: calcularTotal(personasNaturales)
      },
      empresasPrivadas: {
        cantidad: empresasPrivadas.length,
        total: calcularTotal(empresasPrivadas)
      },
      donacionesExtranjero: {
        cantidad: donacionesExtranjero.length,
        total: calcularTotal(donacionesExtranjero)
      },
      totalGeneral: {
        cantidad: donacionesPeriodo.length,
        total: calcularTotal(donacionesPeriodo)
      }
    };

    res.json({
      success: true,
      data: estadisticas,
      mensaje: "Estadísticas obtenidas correctamente"
    });
  } catch (error) {
    console.error('[Estadísticas] Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener estadísticas",
      error: error.message
    });
  }
});

app.get("/donaciones/:id", async (req, res) => {
  try {
    const donaciones = await prisma.donaciones.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      data: donaciones,
      mensaje: "donaciones obtenidos correctamente",
    });
  } catch (error) {
    console.error("Error al obtener donación:", error);
    res.status(500).json({
      mensaje: "Error al traer donaciones",
      error: error.message,
    });
  }
});
app.post("/donaciones", async (req, res) => {
  try {
    const {email, nombreDonante, cantidad, ...rest} = req.body;

    // Crear la donación en la base de datos
    const donacionesCreado = await prisma.donaciones.create({
      data: {
        nombreDonante,
        cantidad,
        ...rest
      },
    });

    // Si se proporcionó un email, enviar correo de agradecimiento
    if (email) {
      try {
        await enviarAgradecimientoDonacion(email, nombreDonante, cantidad);
        console.log(`✉️ Correo de agradecimiento enviado a: ${email}`);
      } catch (emailError) {
        console.error('Error al enviar correo de agradecimiento:', emailError);
        // No bloqueamos la respuesta si falla el envío del correo
      }
    }

    res.json({
      mensaje: "donaciones creado correctamente",
      data: donacionesCreado,
    });
  } catch (error) {
    console.error("Error al crear donación:", error);
    res.status(500).json({
      mensaje: "Error al crear donaciones",
      error: error.message,
    });
  }
});
// ============================================
// ENDPOINTS DESHABILITADOS PARA TRANSPARENCIA
// ============================================
// Las donaciones NO pueden ser modificadas ni eliminadas
// para mantener la trazabilidad y transparencia de los registros

app.put("/donaciones/:id", async (req, res) => {
  console.warn(`⚠️ Intento de modificar donación ID ${req.params.id} bloqueado por política de transparencia`);
  return res.status(403).json({
    error: "Operación no permitida",
    mensaje: "Las donaciones no pueden ser modificadas por motivos de transparencia y trazabilidad. Todos los registros de donaciones son inmutables.",
    codigo: "DONATION_IMMUTABLE"
  });
});

app.delete("/donaciones/:id", async (req, res) => {
  console.warn(`⚠️ Intento de eliminar donación ID ${req.params.id} bloqueado por política de transparencia`);
  return res.status(403).json({
    error: "Operación no permitida",
    mensaje: "Las donaciones no pueden ser eliminadas por motivos de transparencia y trazabilidad. Todos los registros de donaciones son permanentes.",
    codigo: "DONATION_IMMUTABLE"
  });
});

// Endpoint para enviar notificación de donación por email
app.post("/api/donaciones/send-notification", async (req, res) => {
  try {
    const { donation, registeredId } = req.body;

    const emailText = `
Nueva Donación Recibida - Fundación OncoFeliz

Se ha registrado una nueva donación en el sistema:

Donante: ${donation.nombreDonante}
Monto: ${donation.cantidad} Bs
Método de Pago: ${donation.metodoPago}
Fecha y Hora: ${new Date().toLocaleString('es-BO')}
${donation.descripcion ? `Descripción: ${donation.descripcion}` : ''}

---
Este es un mensaje automático del Sistema de Donaciones de Fundación OncoFeliz.
    `;

    // Enviar email al administrador
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'cbbe.jhoselindiana.cespedes.br@unifranz.edu.bo',
      subject: `Nueva Donación - ${donation.nombreDonante} - ${donation.cantidad} Bs`,
      text: emailText
    });

    console.log('[Email] Notificación de donación enviada exitosamente');

    res.json({
      success: true,
      mensaje: "Notificación enviada correctamente"
    });
  } catch (error) {
    console.error('[Email] Error al enviar notificación:', error);
    res.status(500).json({
      success: false,
      mensaje: "Error al enviar notificación",
      error: error.message
    });
  }
});

module.exports = app;
