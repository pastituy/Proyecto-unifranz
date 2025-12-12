const express = require("express");
const { PrismaClient } = require("@prisma/client");
const app = express();
const prisma = new PrismaClient();

// Obtener notificaciones del usuario
app.get("/notificaciones/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { soloNoLeidas } = req.query;

    const where = {
      usuarioId: parseInt(usuarioId)
    };

    if (soloNoLeidas === 'true') {
      where.leida = false;
    }

    const notificaciones = await prisma.notificacion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const noLeidas = await prisma.notificacion.count({
      where: {
        usuarioId: parseInt(usuarioId),
        leida: false
      }
    });

    res.json({
      success: true,
      data: notificaciones,
      noLeidas,
      mensaje: "Notificaciones obtenidas correctamente"
    });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener notificaciones",
      error: error.message
    });
  }
});

// Marcar notificación como leída
app.put("/notificaciones/:id/leer", async (req, res) => {
  try {
    const { id } = req.params;

    const notificacion = await prisma.notificacion.update({
      where: { id: parseInt(id) },
      data: {
        leida: true,
        fechaLeida: new Date()
      }
    });

    res.json({
      success: true,
      data: notificacion,
      mensaje: "Notificación marcada como leída"
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al actualizar notificación",
      error: error.message
    });
  }
});

// Marcar todas como leídas
app.put("/notificaciones/usuario/:usuarioId/leer-todas", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    await prisma.notificacion.updateMany({
      where: {
        usuarioId: parseInt(usuarioId),
        leida: false
      },
      data: {
        leida: true,
        fechaLeida: new Date()
      }
    });

    res.json({
      success: true,
      mensaje: "Todas las notificaciones marcadas como leídas"
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al actualizar notificaciones",
      error: error.message
    });
  }
});

module.exports = app;
