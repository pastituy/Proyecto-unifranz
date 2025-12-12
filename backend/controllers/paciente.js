const express = require("express");
const { PrismaClient } = require("@prisma/client");
const app = express();
const prisma = new PrismaClient();

app.get("/paciente", async (req, res) => {
  try {
    const pacientes = await prisma.paciente.findMany({
      include: {
        padre: true,
        DerivacionesEnviadas: true,
      },
    });

    const pacientesFormateados = pacientes.map((paciente) => ({
      id: paciente.id,
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      ciudad: paciente.ciudad,
      tipoCancer: paciente.tipoCancer,
      edad: paciente.edad,
      fechaNacimiento: paciente.fechaNacimiento,
      ci: paciente.ci,
      idPadre: paciente.idPadre,
      fechaRegistro: paciente.fechaRegistro,
      DerivacionesEnviadas: paciente.DerivacionesEnviadas,
      // Incluir objeto padre completo
      padre: paciente.padre,
      // Añadir campos del padre directamente (por compatibilidad)
      padreNombre: paciente.padre.nombre,
      padreApellido: paciente.padre.apellido,
      padreTelefono: paciente.padre.telefono,
      padreCi: paciente.padre.ci,
      padreUbicacion: paciente.padre.ubicacion,
    }));

    res.json({
      data: pacientesFormateados,
      mensaje: "Pacientes obtenidos correctamente",
    });
  } catch (error) {
    console.error("Error en GET /paciente:", error);
    res.status(500).json({
      mensaje: "Error al obtener pacientes",
      error: error.message,
    });
  }
});
app.get("/paciente/:id", async (req, res) => {
  try {
    const paciente = await prisma.paciente.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        padre: true,
        DerivacionesEnviadas: true,
      },
    });
    res.json({
      data: paciente,
      mensaje: "paciente obtenidos correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al traer paciente",
      error: error.mensaje,
    });
  }
});

app.post("/paciente", async (req, res) => {
  try {
    const { nombre, apellido, edad, ciudad, tipoCancer, idPadre, fechaNacimiento, ci } = req.body;

    const pacienteCreado = await prisma.paciente.create({
      data: {
        nombre,
        apellido,
        ciudad,
        tipoCancer,
        edad: parseInt(edad),
        idPadre: parseInt(idPadre),
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        ci: ci || null,
      },
      include: {
        padre: true,
        DerivacionesEnviadas: true,
      },
    });

    res.status(201).json({
      mensaje: "Paciente creado correctamente",
      data: pacienteCreado,
    });
  } catch (error) {
    console.error("Error en POST /paciente:", error);
    if (error.code === "P2002") {
      return res.status(400).json({
        mensaje: "Error de validación",
        error: "Ya existe un registro con estos datos",
      });
    }
    if (error.code === "P2003") {
      return res.status(400).json({
        mensaje: "Error de validación",
        error: "El padre especificado no existe",
      });
    }

    res.status(500).json({
      mensaje: "Error interno al crear paciente",
      error: error.message,
    });
  }
});
app.post("/pacientes", async (req, res) => {
  try {
    const { padre, paciente } = req.body;

    const padreCreado = await prisma.padre.create({
      data: {
        nombre: padre.nombre,
        apellido: padre.apellido,
        telefono: padre.telefono,
        ci: padre.ci,
        ubicacion: padre.ubicacion,
      },
    });
    const pacienteCreado = await prisma.paciente.create({
      data: {
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        ciudad: paciente.ciudad,
        tipoCancer: paciente.tipoCancer,
        edad: parseInt(paciente.edad),
        idPadre: padreCreado.id,
      },
      include: {
        padre: true,
      },
    });

    res.status(201).json({
      mensaje: "Paciente creado correctamente",
      data: pacienteCreado,
    });
  } catch (error) {
    console.error("Error en POST /paciente:", error);
    if (error.code === "P2002") {
      return res.status(400).json({
        mensaje: "Error de validación",
        error: "Ya existe un registro con estos datos",
      });
    }

    res.status(500).json({
      mensaje: "Error interno al crear paciente",
      error: error.message,
    });
  }
});
app.put("/pacientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { padre, paciente } = req.body;

    const pacienteExistente = await prisma.paciente.findUnique({
      where: { id: parseInt(id) },
      include: { padre: true },
    });

    if (!pacienteExistente) {
      return res.status(404).json({
        mensaje: "Paciente no encontrado",
      });
    }
    // 2. Actualizar los datos del padre
    const padreActualizado = await prisma.padre.update({
      where: { id: pacienteExistente.idPadre },
      data: {
        nombre: padre.nombre,
        apellido: padre.apellido,
        telefono: padre.telefono,
        ci: padre.ci,
        ubicacion: padre.ubicacion,
      },
    });

    // 3. Actualizar los datos del paciente
    const pacienteActualizado = await prisma.paciente.update({
      where: { id: parseInt(id) },
      data: {
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        ciudad: paciente.ciudad,
        tipoCancer: paciente.tipoCancer,
        edad: parseInt(paciente.edad),
        ci: paciente.ci || null,
      },
      include: {
        padre: true,
      },
    });

    res.json({
      mensaje: "Paciente y padre actualizados correctamente",
      data: pacienteActualizado,
    });
  } catch (error) {
    console.error("Error en PUT /pacientes/:id:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        mensaje: "Error de validación",
        error: "Conflicto con datos únicos (CI duplicado)",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        mensaje: "Registro no encontrado",
        error: error.meta?.cause || "El registro solicitado no existe",
      });
    }

    res.status(500).json({
      mensaje: "Error interno al actualizar paciente",
      error: error.message,
    });
  }
});
app.delete("/paciente/:id", async (req, res) => {
  try {
    await prisma.paciente.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      mensaje: "paciente eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar paciente",
      error: error.mensaje,
    });
  }
});

module.exports = app;
