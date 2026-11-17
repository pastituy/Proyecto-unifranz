/**
 * Controlador de Derivaciones Psicológicas
 * Arquitectura MVC - Capa de Controladores
 *
 * Flujo:
 *  1. El trabajador social deriva uno de sus casos al psicólogo (con un motivo).
 *  2. El psicólogo ve solo los casos derivados y sube el informe psicológico (PDF).
 *  3. El trabajador social que derivó y el administrador pueden ver el informe.
 *
 * La derivación NO bloquea el flujo de aprobación: el caso sigue su curso normal
 * (trabajador social -> administrador) aunque el informe esté pendiente.
 *
 * Los PDF son datos sensibles de salud mental: se guardan en una carpeta privada
 * (no servida como estática) y solo se descargan con sesión y rol autorizado.
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const INFORMES_DIR = path.join(__dirname, "../private/informes-psicologicos");

const MAX_MOTIVO = 1000;
const MAX_OBSERVACIONES = 2000;

const includeDerivacion = {
  pacienteRegistro: {
    select: {
      id: true,
      nombreCompletoNino: true,
      edad: true,
      fechaNacimiento: true,
      diagnostico: true,
      nombreCompletoTutor: true,
      ciTutor: true,
      parentesco: true,
      telefonoTutor: true,
      estado: true,
    },
  },
  derivadoPor: { select: { id: true, nombre: true } },
  psicologo: { select: { id: true, nombre: true } },
};

function eliminarArchivo(nombre) {
  if (!nombre) return;
  const ruta = path.join(INFORMES_DIR, path.basename(nombre));
  fs.unlink(ruta, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("No se pudo eliminar el informe anterior:", err.message);
    }
  });
}

/**
 * POST /api/psicologia/derivaciones
 * Body: { pacienteRegistroId, motivo }
 * Rol: TRABAJADOR_SOCIAL (solo sus propios casos)
 */
const crearDerivacion = async (req, res) => {
  const pacienteRegistroId = parseInt(req.body.pacienteRegistroId);
  const motivo = (req.body.motivo || "").trim();

  if (!pacienteRegistroId || !motivo) {
    return res.status(400).json({
      success: false,
      mensaje: "Debe indicar el caso y el motivo de la derivación",
    });
  }
  if (motivo.length > MAX_MOTIVO) {
    return res.status(400).json({
      success: false,
      mensaje: `El motivo no puede superar ${MAX_MOTIVO} caracteres`,
    });
  }

  try {
    const registro = await prisma.pacienteRegistro.findUnique({
      where: { id: pacienteRegistroId },
      select: { id: true, creadoPorId: true, estado: true, nombreCompletoNino: true },
    });

    if (!registro) {
      return res.status(404).json({ success: false, mensaje: "Caso no encontrado" });
    }
    if (registro.creadoPorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        mensaje: "Solo puede derivar casos registrados por usted",
      });
    }
    if (registro.estado === "CASO_RECHAZADO") {
      return res.status(400).json({
        success: false,
        mensaje: "No se puede derivar un caso rechazado",
      });
    }

    const pendiente = await prisma.derivacionPsicologica.findFirst({
      where: { pacienteRegistroId, estado: "PENDIENTE" },
      select: { id: true },
    });
    if (pendiente) {
      return res.status(409).json({
        success: false,
        mensaje: "Este caso ya tiene una derivación pendiente con psicología",
      });
    }

    const derivacion = await prisma.derivacionPsicologica.create({
      data: {
        pacienteRegistroId,
        derivadoPorId: req.user.id,
        motivo,
      },
      include: includeDerivacion,
    });

    // Notificar a los psicólogos (si falla, la derivación igual queda creada)
    try {
      const psicologos = await prisma.usuario.findMany({
        where: { rol: "PSICOLOGO" },
        select: { id: true, email: true },
      });
      if (psicologos.length) {
        await prisma.notificacion.createMany({
          data: psicologos.map((p) => ({
            usuarioId: p.id,
            emailDestinatario: p.email,
            tipo: "derivacion_psicologica",
            prioridad: "normal",
            titulo: "Nuevo caso derivado a psicología",
            mensaje: `${derivacion.derivadoPor.nombre} derivó el caso de ${registro.nombreCompletoNino}. Motivo: ${motivo}`,
            relacionadoTipo: "derivacion_psicologica",
            relacionadoId: derivacion.id,
          })),
        });
      }
    } catch (err) {
      console.error("No se pudo notificar a los psicólogos:", err.message);
    }

    return res.status(201).json({
      success: true,
      mensaje: "Caso derivado a psicología",
      data: derivacion,
    });
  } catch (error) {
    console.error("Error al crear derivación:", error);
    return res.status(500).json({ success: false, mensaje: "Error al derivar el caso" });
  }
};

/**
 * GET /api/psicologia/derivaciones?estado=PENDIENTE|COMPLETADA&pacienteRegistroId=1
 * - PSICOLOGO y ADMINISTRADOR: todas las derivaciones
 * - TRABAJADOR_SOCIAL: solo las que él derivó
 */
const listarDerivaciones = async (req, res) => {
  try {
    const where = {};
    if (req.user.rol === "TRABAJADOR_SOCIAL") where.derivadoPorId = req.user.id;
    if (["PENDIENTE", "COMPLETADA"].includes(req.query.estado)) where.estado = req.query.estado;
    if (req.query.pacienteRegistroId) {
      where.pacienteRegistroId = parseInt(req.query.pacienteRegistroId) || -1;
    }

    const derivaciones = await prisma.derivacionPsicologica.findMany({
      where,
      include: includeDerivacion,
      orderBy: [{ estado: "asc" }, { fechaDerivacion: "desc" }],
    });

    return res.json({ success: true, data: derivaciones });
  } catch (error) {
    console.error("Error al listar derivaciones:", error);
    return res.status(500).json({ success: false, mensaje: "Error al obtener las derivaciones" });
  }
};

/**
 * PUT /api/psicologia/derivaciones/:id/informe
 * Body: multipart/form-data con "informePdf" (PDF) y "observaciones" (opcional)
 * Rol: PSICOLOGO. Si el informe ya existe, solo el mismo psicólogo puede reemplazarlo.
 */
const subirInforme = async (req, res) => {
  const id = parseInt(req.params.id);
  const observaciones = (req.body.observaciones || "").trim();

  if (!req.file) {
    return res.status(400).json({
      success: false,
      mensaje: "Debe adjuntar el informe psicológico en PDF",
    });
  }
  if (observaciones.length > MAX_OBSERVACIONES) {
    eliminarArchivo(req.file.filename);
    return res.status(400).json({
      success: false,
      mensaje: `Las observaciones no pueden superar ${MAX_OBSERVACIONES} caracteres`,
    });
  }

  try {
    const derivacion = await prisma.derivacionPsicologica.findUnique({
      where: { id: id || -1 },
      include: { pacienteRegistro: { select: { nombreCompletoNino: true } } },
    });

    if (!derivacion) {
      eliminarArchivo(req.file.filename);
      return res.status(404).json({ success: false, mensaje: "Derivación no encontrada" });
    }
    if (derivacion.estado === "COMPLETADA" && derivacion.psicologoId !== req.user.id) {
      eliminarArchivo(req.file.filename);
      return res.status(403).json({
        success: false,
        mensaje: "Solo el psicólogo que subió el informe puede reemplazarlo",
      });
    }

    const actualizada = await prisma.derivacionPsicologica.update({
      where: { id: derivacion.id },
      data: {
        estado: "COMPLETADA",
        psicologoId: req.user.id,
        informePdf: req.file.filename,
        observaciones: observaciones || null,
        fechaInforme: new Date(),
      },
      include: includeDerivacion,
    });

    if (derivacion.informePdf && derivacion.informePdf !== req.file.filename) {
      eliminarArchivo(derivacion.informePdf);
    }

    // Avisar al trabajador social que derivó el caso
    try {
      await prisma.notificacion.create({
        data: {
          usuarioId: derivacion.derivadoPorId,
          tipo: "informe_psicologico",
          prioridad: "normal",
          titulo: derivacion.estado === "COMPLETADA"
            ? "Informe psicológico actualizado"
            : "Informe psicológico disponible",
          mensaje: `${actualizada.psicologo.nombre} subió el informe psicológico de ${derivacion.pacienteRegistro.nombreCompletoNino}.`,
          relacionadoTipo: "derivacion_psicologica",
          relacionadoId: derivacion.id,
        },
      });
    } catch (err) {
      console.error("No se pudo notificar al trabajador social:", err.message);
    }

    return res.json({
      success: true,
      mensaje: "Informe psicológico guardado",
      data: actualizada,
    });
  } catch (error) {
    console.error("Error al subir informe psicológico:", error);
    eliminarArchivo(req.file.filename);
    return res.status(500).json({ success: false, mensaje: "Error al guardar el informe" });
  }
};

/**
 * GET /api/psicologia/derivaciones/:id/informe
 * Devuelve el PDF. Roles: PSICOLOGO, ADMINISTRADOR, o el TRABAJADOR_SOCIAL que derivó.
 */
const descargarInforme = async (req, res) => {
  try {
    const derivacion = await prisma.derivacionPsicologica.findUnique({
      where: { id: parseInt(req.params.id) || -1 },
      select: { derivadoPorId: true, informePdf: true },
    });

    if (!derivacion || !derivacion.informePdf) {
      return res.status(404).json({ success: false, mensaje: "Informe no encontrado" });
    }
    if (req.user.rol === "TRABAJADOR_SOCIAL" && derivacion.derivadoPorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        mensaje: "No tiene permisos para ver este informe",
      });
    }

    const ruta = path.join(INFORMES_DIR, path.basename(derivacion.informePdf));
    if (!fs.existsSync(ruta)) {
      return res.status(404).json({ success: false, mensaje: "El archivo del informe no existe" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "private, no-store");
    return res.sendFile(ruta);
  } catch (error) {
    console.error("Error al descargar informe:", error);
    return res.status(500).json({ success: false, mensaje: "Error al obtener el informe" });
  }
};

module.exports = {
  INFORMES_DIR,
  crearDerivacion,
  listarDerivaciones,
  subirInforme,
  descargarInforme,
};
