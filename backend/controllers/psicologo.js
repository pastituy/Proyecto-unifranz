const { PrismaClient } = require("@prisma/client");
const express = require("express");

const prisma = new PrismaClient();
const app = express();
// ========== CONTROLADORES DE PACIENTES ==========
// Obtener todos los pacientes
app.get("/pacientes", async (req, res) => {
  try {
    const pacientes = await prisma.paciente.findMany({
      orderBy: { nombre: "asc" },
    });
    res.json({
      data: pacientes,
      mensaje: "Pacientes obtenidos correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener pacientes",
      error: error.message,
    });
  }
});

app.get("/sesiones", async (req, res) => {
  try {
    const sesiones = await prisma.sesion.findMany({
      include: {
        paciente: true,
      },
      orderBy: { fecha: "desc" },
    });

    const sesionesFormatted = sesiones.map((sesion) => ({
      id: sesion.id,
      paciente: `${sesion.paciente.nombre} ${
        sesion.paciente.apellidos || ""
      }`.trim(),
      pacienteId: sesion.pacienteId,
      fecha: sesion.fecha.toISOString().split("T")[0],
      hora: sesion.hora,
      tipo: sesion.tipo,
      estado: sesion.estado.toLowerCase(),
      duracion: `${sesion.duracion} min`,
      notas: sesion.notas,
      createdAt: sesion.createdAt,
      updatedAt: sesion.updatedAt,
    }));

    res.json({
      data: sesionesFormatted,
      mensaje: "Sesiones obtenidas correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener sesiones",
      error: error.message,
    });
  }
});

app.post("/sesiones", async (req, res) => {
  try {
    const { pacienteId, fecha, hora, tipo, duracion, notas } = req.body;
    const sesion = await prisma.sesion.create({
      data: {
        pacienteId: parseInt(pacienteId),
        fecha: new Date(fecha),
        hora,
        tipo,
        estado: "PROGRAMADA",
        duracion: parseInt(duracion),
        notas,
      },
      include: {
        paciente: true,
      },
    });

    const sesionFormatted = {
      id: sesion.id,
      paciente: `${sesion.paciente.nombre} ${
        sesion.paciente.apellidos || ""
      }`.trim(),
      pacienteId: sesion.pacienteId,
      fecha: sesion.fecha.toISOString().split("T")[0],
      hora: sesion.hora,
      tipo: sesion.tipo,
      estado: sesion.estado.toLowerCase(),
      duracion: `${sesion.duracion} min`,
      notas: sesion.notas,
    };

    res.status(201).json({
      data: sesionFormatted,
      mensaje: "Sesión creada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear sesión",
      error: error.message,
    });
  }
});
// Actualizar sesión
app.put("/sesiones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, notas } = req.body;

    const sesion = await prisma.sesion.update({
      where: { id: parseInt(id) },
      data: {
        ...(estado && { estado: estado.toUpperCase() }),
        ...(notas && { notas }),
      },
      include: {
        paciente: true,
      },
    });

    const sesionFormatted = {
      id: sesion.id,
      paciente: `${sesion.paciente.nombre} ${
        sesion.paciente.apellidos || ""
      }`.trim(),
      pacienteId: sesion.pacienteId,
      fecha: sesion.fecha.toISOString().split("T")[0],
      hora: sesion.hora,
      tipo: sesion.tipo,
      estado: sesion.estado.toLowerCase(),
      duracion: `${sesion.duracion} min`,
      notas: sesion.notas,
    };

    res.json({
      data: sesionFormatted,
      mensaje: "Sesión actualizada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar sesión",
      error: error.message,
    });
  }
});
// ========== CONTROLADORES DE HISTORIALES CLÍNICOS ==========
// Obtener todos los historiales
app.get("/historiales", async (req, res) => {
  try {
    const historiales = await prisma.historialClinico.findMany({
      include: {
        paciente: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const historialesFormatted = historiales.map((historial) => ({
      id: historial.id,
      paciente: `${historial.paciente.nombre} ${
        historial.paciente.apellidos || ""
      }`.trim(),
      pacienteId: historial.pacienteId,
      diagnostico: historial.diagnostico,
      fechaIngreso: historial.fechaIngreso.toISOString().split("T")[0],
      sesiones: historial.sesiones || 0, // Agregar valor por defecto
      estado: historial.estado,
      ultimaActualizacion: historial.updatedAt.toISOString().split("T")[0],
      observaciones: historial.observaciones,
    }));

    res.json({
      data: historialesFormatted,
      mensaje: "Historiales obtenidos correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener historiales",
      error: error.message,
    });
  }
});
app.post("/historiales", async (req, res) => {
  try {
    const { pacienteId, diagnostico, fechaIngreso, observaciones } = req.body;
    const historial = await prisma.historialClinico.create({
      data: {
        pacienteId: parseInt(pacienteId),
        diagnostico,
        fechaIngreso: new Date(fechaIngreso),
        estado: "EN_TRATAMIENTO",
        sesiones: 0, // Inicializar en 0
        observaciones,
      },
      include: {
        paciente: true,
      },
    });

    const historialFormatted = {
      id: historial.id,
      paciente: `${historial.paciente.nombre} ${
        historial.paciente.apellido || ""
      }`.trim(),
      pacienteId: historial.pacienteId,
      diagnostico: historial.diagnostico,
      fechaIngreso: historial.fechaIngreso.toISOString().split("T")[0],
      sesiones: historial.sesiones,
      estado: historial.estado,
      ultimaActualizacion: historial.updatedAt.toISOString().split("T")[0],
      observaciones: historial.observaciones,
    };

    res.status(201).json({
      data: historialFormatted,
      mensaje: "Historial creado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear historial",
      error: error.message,
    });
  }
});

app.get("/citas", async (req, res) => {
  try {
    const citas = await prisma.cita.findMany({
      include: {
        paciente: true,
      },
      orderBy: { fecha: "asc" },
    });

    const citasFormatted = citas.map((cita) => ({
      id: cita.id,
      paciente: `${cita.paciente.nombre} ${
        cita.paciente.apellidos || ""
      }`.trim(),
      pacienteId: cita.pacienteId,
      fecha: cita.fecha.toISOString().split("T")[0],
      hora: cita.hora,
      tipo: cita.tipo,
      estado: cita.estado.toLowerCase(),
      recordatorio: getRecordatorioText(cita.recordatorio),
      notas: cita.notas,
    }));

    res.json({
      data: citasFormatted,
      mensaje: "Citas obtenidas correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener citas",
      error: error.message,
    });
  }
});

app.post("/citas", async (req, res) => {
  try {
    const { pacienteId, fecha, hora, tipo, recordatorio, notas } = req.body;
    console.log("Recordatorio recibido:", recordatorio);
    console.log("Recordatorio convertido:", getRecordatorioEnum(recordatorio));

    const cita = await prisma.cita.create({
      data: {
        pacienteId: parseInt(pacienteId),
        fecha: new Date(fecha),
        hora,
        tipo,
        estado: "PROGRAMADA",
        recordatorio: getRecordatorioEnum(recordatorio), // CORREGIDO: usar la función correcta
        notas,
      },
      include: {
        paciente: true,
      },
    });

    const citaFormatted = {
      id: cita.id,
      paciente: `${cita.paciente.nombre} ${
        cita.paciente.apellido || ""
      }`.trim(),
      pacienteId: cita.pacienteId,
      fecha: cita.fecha.toISOString().split("T")[0],
      hora: cita.hora,
      tipo: cita.tipo,
      estado: cita.estado.toLowerCase(),
      recordatorio: getRecordatorioText(cita.recordatorio),
      notas: cita.notas,
    };

    res.status(201).json({
      data: citaFormatted,
      mensaje: "Cita creada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear cita",
      error: error.message,
    });
  }
});
app.put("/citas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, notas } = req.body;

    const cita = await prisma.cita.update({
      where: { id: parseInt(id) },
      data: {
        ...(estado && { estado: estado.toUpperCase() }),
        ...(notas && { notas }),
      },
      include: {
        paciente: true,
      },
    });

    const citaFormatted = {
      id: cita.id,
      paciente: `${cita.paciente.nombre} ${
        cita.paciente.apellido || ""
      }`.trim(),
      pacienteId: cita.pacienteId,
      fecha: cita.fecha.toISOString().split("T")[0],
      hora: cita.hora,
      tipo: cita.tipo,
      estado: cita.estado.toLowerCase(),
      recordatorio: getRecordatorioText(cita.recordatorio),
      notas: cita.notas,
    };

    res.json({
      data: citaFormatted,
      mensaje: "Cita actualizada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar cita",
      error: error.message,
    });
  }
});
function getRecordatorioText(recordatorio) {
  const recordatorios = {
    RECORDATORIO_24H: "Enviar recordatorio 24h antes",
    RECORDATORIO_1H: "Enviar recordatorio 1 hora antes",
    LLAMAR_CONFIRMAR: "Llamar para confirmar",
    SIN_RECORDATORIO: "Sin recordatorio",
  };
  return recordatorios[recordatorio] || recordatorio;
}

function getRecordatorioEnum(texto) {
  const recordatorios = {
    "Enviar recordatorio 24h antes": "RECORDATORIO_24H",
    "Enviar recordatorio 1 hora antes": "RECORDATORIO_1H",
    "Llamar para confirmar": "LLAMAR_CONFIRMAR",
    "Sin recordatorio": "SIN_RECORDATORIO",
  };
  return recordatorios[texto] || "SIN_RECORDATORIO";
}
module.exports = app;
