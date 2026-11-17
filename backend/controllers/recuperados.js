const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

// Historias de recuperación para la sección pública "Casos Recuperados"
router.get("/recuperados", async (req, res) => {
  try {
    const recuperados = await prisma.recuperados.findMany({
      include: { paciente: true },
      orderBy: { createdAt: "desc" },
    });

    const stories = recuperados.map((r) => ({
      id: r.id,
      diagnosis: r.diagnosis,
      image: r.image,
      quote: r.quote,
      recovered: r.recovered,
      name: `${r.paciente.nombre} ${r.paciente.apellido}`,
      age: r.paciente.edad,
    }));

    res.json(stories);
  } catch (error) {
    console.error("Error al obtener historias de recuperación:", error);
    res.status(500).json({
      mensaje: "Error al obtener historias de recuperación",
      error: error.message,
    });
  }
});

module.exports = router;
