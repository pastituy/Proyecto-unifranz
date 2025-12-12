const express = require("express");
const { PrismaClient } = require("@prisma/client");
const app = express();
const prisma = new PrismaClient();

app.get("/data-paciente-mobile/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const info = await prisma.paciente.findMany({
      where: {
        idPadre: +id,
      },
      include: {
        Cita: true,
        padre: true,
        HistorialClinico: true,
        Tratamiento: true,
        DerivacionesEnviadas: true,
        ExpedienteSocial: true,
        EvaluacionVulnerabilidad: true,
        Visita: true,
        Sesion: true,
        GastoMedico: true,
      },
    });
    res.json({
      data: info,
      mensaje: "informacion del usuairo  obtenidos correctamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      mensaje: "Error al traer info",
      error: error.mensaje,
    });
  }
});

module.exports = app;
