const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const app = express();
const prisma = new PrismaClient();

app.get("/campana", async (req, res) => {
  try {
    const campanas = await prisma.campana.findMany({
      include: {
        donaciones: true,
      },
    });

    // Calcular el total recaudado para cada campaña
    const campanasConTotales = campanas.map((campana) => {
      const totalRecaudado = campana.donaciones.reduce((total, donacion) => {
        // Convertir la cantidad de string a número
        const cantidad = parseFloat(donacion.cantidad) || 0;
        return total + cantidad;
      }, 0);

      return {
        ...campana,
        recaudado: totalRecaudado,
      };
    });

    res.json({
      data: campanasConTotales,
      mensaje: "campanas obtenidos correctamente",
    });
  } catch (error) {
    console.error("Error al obtener campañas:", error);
    res.status(500).json({
      mensaje: "Error al traer campana",
      error: error.message,
    });
  }
});

app.get("/campana/:id", async (req, res) => {
  try {
    const campana = await prisma.campana.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        donaciones: true,
      },
    });

    if (!campana) {
      return res.status(404).json({
        mensaje: "Campaña no encontrada",
      });
    }

    // Calcular el total recaudado
    const totalRecaudado = campana.donaciones.reduce((total, donacion) => {
      const cantidad = parseFloat(donacion.cantidad) || 0;
      return total + cantidad;
    }, 0);

    const campanaConTotal = {
      ...campana,
      recaudado: totalRecaudado,
    };

    res.json({
      data: campanaConTotal,
      mensaje: "campana obtenido correctamente",
    });
  } catch (error) {
    console.error("Error al obtener campaña:", error);
    res.status(500).json({
      mensaje: "Error al traer campana",
      error: error.message,
    });
  }
});
app.post("/campana", async (req, res) => {
  try {
    const campanaCreado = await prisma.campana.create({
      data: req.body,
    });

    res.json({
      mensaje: "campana creado correctamente",
      data: campanaCreado,
    });
  } catch (error) {
    console.error("Error al crear campaña:", error);
    res.status(500).json({
      mensaje: "Error al crear campana",
      error: error.message,
    });
  }
});
app.put("/campana/:id", async (req, res) => {
  try {
    const campana = await prisma.campana.update({
      where: {
        id: Number(req.params.id),
      },
      data: req.body,
    });
    res.json({
      mensaje: "campana actualizado correcamente",
      data: campana,
    });
  } catch (error) {
    console.error("Error al editar campaña:", error);
    res.status(500).json({
      mensaje: "Error al editar campana",
      error: error.message,
    });
  }
});
app.delete("/campana/:id", async (req, res) => {
  try {
    await prisma.campana.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      mensaje: "campana eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar campaña:", error);
    res.status(500).json({
      mensaje: "Error al eliminar campana",
      error: error.message,
    });
  }
});

module.exports = app;
