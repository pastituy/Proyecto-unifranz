const express = require("express");
const { PrismaClient } = require("@prisma/client");
const app = express();
const prisma = new PrismaClient();

app.get("/padre", async (req, res) => {
  try {
    const padre = await prisma.padre.findMany({});
    res.json({
      data: padre,
      mensaje: "padres obtenidos correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al traer padre",
      error: error.mensaje,
    });
  }
});

app.get("/padre/:id", async (req, res) => {
  try {
    const padre = await prisma.padre.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      data: padre,
      mensaje: "padre obtenidos correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al traer padre",
      error: error.mensaje,
    });
  }
});
app.post("/padre", async (req, res) => {
  try {
    const padreCreado = await prisma.padre.create({
      data: req.body,
    });

    res.status(201).json({
      mensaje: "padre creado correctamente",
      data: padreCreado,
    });
  } catch (error) {
    console.error("Error al crear padre:", error);
    if (error.code === "P2002") {
      return res.status(400).json({
        mensaje: "Error de validación",
        error: "Ya existe un padre/tutor con este CI",
      });
    }
    res.status(500).json({
      mensaje: "Error al crear padre",
      error: error.message,
    });
  }
});
app.put("/padre/:id", async (req, res) => {
  try {
    const padre = await prisma.padre.update({
      where: {
        id: Number(req.params.id),
      },
      data: req.body,
    });
    res.json({
      mensaje: "padre actualizado correcamente",
      data: padre,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al editar padre",
      error: error.mensaje,
    });
  }
});
app.delete("/padre/:id", async (req, res) => {
  try {
    await prisma.padre.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      mensaje: "padre eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar padre",
      error: error.mensaje,
    });
  }
});

module.exports = app;
