const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const app = express();
const prisma = new PrismaClient();

app.get("/evento", async (req, res) => {
  try {
    const evento = await prisma.evento.findMany({});
    res.json({
      data: evento,
      mensaje: "eventos obtenidos correctamente",
    });
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    res.status(500).json({
      mensaje: "Error al traer evento",
      error: error.message,
    });
  }
});

app.get("/evento/:id", async (req, res) => {
  try {
    const evento = await prisma.evento.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      data: evento,
      mensaje: "evento obtenido correctamente",
    });
  } catch (error) {
    console.error("Error al obtener evento:", error);
    res.status(500).json({
      mensaje: "Error al traer evento",
      error: error.message,
    });
  }
});
app.post("/evento", async (req, res) => {
  try {
    const { titulo, descripcion, fecha, ubicacion, img } = req.body;

    const eventoCreado = await prisma.evento.create({
      data: {
        titulo,
        descripcion,
        fecha,
        ubicacion,
        img: img || "default-event.jpg", // Valor por defecto si no se proporciona imagen
      },
    });

    res.json({
      mensaje: "evento creado correctamente",
      data: eventoCreado,
    });
  } catch (error) {
    console.error("Error al crear evento:", error);
    res.status(500).json({
      mensaje: "Error al crear evento",
      error: error.message,
    });
  }
});
app.put("/evento/:id", async (req, res) => {
  try {
    const evento = await prisma.evento.update({
      where: {
        id: Number(req.params.id),
      },
      data: req.body,
    });
    res.json({
      mensaje: "evento actualizado correcamente",
      data: evento,
    });
  } catch (error) {
    console.error("Error al editar evento:", error);
    res.status(500).json({
      mensaje: "Error al editar evento",
      error: error.message,
    });
  }
});
app.delete("/evento/:id", async (req, res) => {
  try {
    await prisma.evento.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      mensaje: "evento eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    res.status(500).json({
      mensaje: "Error al eliminar evento",
      error: error.message,
    });
  }
});

module.exports = app;
