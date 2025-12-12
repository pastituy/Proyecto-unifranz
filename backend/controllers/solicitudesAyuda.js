const express = require("express");
const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const path = require("path");
const app = express();
const prisma = new PrismaClient();

// Configuración de multer para subir archivos PDF
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// ================================
// OBTENER TODAS LAS SOLICITUDES
// ================================
app.get("/solicitudes-ayuda", async (req, res) => {
  try {
    const { estado, beneficiarioId, solicitadoPorId } = req.query;

    const where = {};
    if (estado) where.estado = estado;
    if (beneficiarioId) where.beneficiarioId = parseInt(beneficiarioId);
    if (solicitadoPorId) where.solicitadoPorId = parseInt(solicitadoPorId);

    const solicitudes = await prisma.solicitudAyuda.findMany({
      where,
      include: {
        beneficiario: {
          include: {
            pacienteRegistro: true,
          },
        },
        solicitadoPor: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
        revisadoPor: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: [
        { prioridad: 'desc' },
        { fechaSolicitud: 'desc' },
      ],
    });

    res.json({
      success: true,
      data: solicitudes,
      mensaje: "Solicitudes obtenidas correctamente",
    });
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener solicitudes",
      error: error.message,
    });
  }
});

// ================================
// OBTENER SOLICITUD POR ID
// ================================
app.get("/solicitudes-ayuda/:id", async (req, res) => {
  try {
    const solicitud = await prisma.solicitudAyuda.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        beneficiario: {
          include: {
            pacienteRegistro: true,
            evaluacionPsicologica: true,
            evaluacionSocial: true,
          },
        },
        solicitadoPor: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
            rol: true,
          },
        },
        revisadoPor: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        mensaje: "Solicitud no encontrada",
      });
    }

    res.json({
      success: true,
      data: solicitud,
      mensaje: "Solicitud obtenida correctamente",
    });
  } catch (error) {
    console.error("Error al obtener solicitud:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener solicitud",
      error: error.message,
    });
  }
});

// ================================
// CREAR NUEVA SOLICITUD
// ================================
app.post("/solicitudes-ayuda", upload.single('documentoRespaldo'), async (req, res) => {
  try {
    console.log('=== SOLICITUD NUEVA ===');
    console.log('Body:', req.body);
    console.log('Archivo recibido:', req.file ? req.file.filename : 'No se recibió archivo');

    const {
      beneficiarioId,
      solicitadoPorId,
      tipoAyuda,
      prioridad,
      descripcion,
    } = req.body;

    // Validar campos requeridos
    if (!beneficiarioId || !solicitadoPorId || !tipoAyuda || !descripcion) {
      return res.status(400).json({
        success: false,
        mensaje: "Faltan campos requeridos: beneficiarioId, solicitadoPorId, tipoAyuda, descripcion",
      });
    }

    // Validar estado médico del beneficiario
    const beneficiario = await prisma.beneficiario.findUnique({
      where: { id: parseInt(beneficiarioId) },
      select: { estadoMedico: true, codigoBeneficiario: true },
    });

    if (!beneficiario) {
      return res.status(404).json({
        success: false,
        mensaje: "Beneficiario no encontrado",
      });
    }

    // Bloquear solicitudes para estados no permitidos
    if (beneficiario.estadoMedico === 'ABANDONO') {
      return res.status(403).json({
        success: false,
        mensaje: "No se pueden crear solicitudes para beneficiarios en estado de ABANDONO. El beneficiario debe retornar al sistema primero.",
      });
    }

    if (beneficiario.estadoMedico === 'FALLECIDO') {
      return res.status(403).json({
        success: false,
        mensaje: "No se pueden crear solicitudes para beneficiarios fallecidos.",
      });
    }

    // Generar código único de solicitud
    const ultimaSolicitud = await prisma.solicitudAyuda.findFirst({
      orderBy: { id: 'desc' },
    });

    const numeroSolicitud = ultimaSolicitud ? ultimaSolicitud.id + 1 : 1;
    const codigoSolicitud = `SOL-${String(numeroSolicitud).padStart(3, '0')}`;

    // Crear solicitud
    const solicitud = await prisma.solicitudAyuda.create({
      data: {
        codigoSolicitud,
        beneficiarioId: parseInt(beneficiarioId),
        solicitadoPorId: parseInt(solicitadoPorId),
        tipoAyuda,
        prioridad: prioridad || 'MEDIA',
        detalleSolicitud: descripcion,
        recetaPdf: req.file ? req.file.filename : null,
        estado: 'PENDIENTE',
      },
      include: {
        beneficiario: {
          include: {
            pacienteRegistro: true,
          },
        },
        solicitadoPor: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: solicitud,
      mensaje: "Solicitud creada correctamente",
    });
  } catch (error) {
    console.error("Error al crear solicitud:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al crear solicitud",
      error: error.message,
    });
  }
});

// ================================
// APROBAR SOLICITUD (RECEPCIONAR)
// ================================
app.put("/solicitudes-ayuda/:id/aprobar", async (req, res) => {
  try {
    const { revisadoPorId, instruccionesEntrega } = req.body;

    if (!revisadoPorId) {
      return res.status(400).json({
        success: false,
        mensaje: "Se requiere revisadoPorId",
      });
    }

    const solicitud = await prisma.solicitudAyuda.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        estado: 'RECEPCIONADO',
        revisadoPorId: parseInt(revisadoPorId),
        fechaRevision: new Date(),
        instruccionesEntrega: instruccionesEntrega || null,
      },
      include: {
        beneficiario: {
          include: {
            pacienteRegistro: true,
          },
        },
        solicitadoPor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        revisadoPor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    // Crear notificación para el trabajador social
    await prisma.notificacion.create({
      data: {
        usuarioId: solicitud.solicitadoPorId,
        emailDestinatario: solicitud.solicitadoPor.email,
        tipo: 'solicitud_recepcionada',
        prioridad: 'normal',
        titulo: `Solicitud ${solicitud.codigoSolicitud} Recepcionada`,
        mensaje: `Tu solicitud de ayuda para ${solicitud.beneficiario.pacienteRegistro.nombreCompletoNino} ha sido recepcionada y está en proceso. ${instruccionesEntrega ? 'Instrucciones: ' + instruccionesEntrega : ''}`,
        relacionadoTipo: 'solicitud',
        relacionadoId: solicitud.id,
      },
    });

    // Crear notificación para el beneficiario
    const usuarioBeneficiario = await prisma.usuario.findFirst({
      where: {
        ci: solicitud.beneficiario.pacienteRegistro.ciTutor,
        rol: 'BENEFICIARIO'
      }
    });

    if (usuarioBeneficiario) {
      await prisma.notificacion.create({
        data: {
          usuarioId: usuarioBeneficiario.id,
          emailDestinatario: usuarioBeneficiario.email,
          tipo: 'solicitud_recepcionada',
          prioridad: 'alta',
          titulo: `Solicitud ${solicitud.codigoSolicitud} Recepcionada`,
          mensaje: `Tu solicitud de ayuda para ${solicitud.beneficiario.pacienteRegistro.nombreCompletoNino} ha sido recepcionada y está en proceso. ${instruccionesEntrega ? 'Instrucciones: ' + instruccionesEntrega : 'Te notificaremos cuando esté lista para recoger.'}`,
          relacionadoTipo: 'solicitud',
          relacionadoId: solicitud.id,
        },
      });
    }

    res.json({
      success: true,
      data: solicitud,
      mensaje: "Solicitud aprobada correctamente",
    });
  } catch (error) {
    console.error("Error al aprobar solicitud:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al aprobar solicitud",
      error: error.message,
    });
  }
});

// ================================
// RECHAZAR SOLICITUD
// ================================
app.put("/solicitudes-ayuda/:id/rechazar", async (req, res) => {
  try {
    const { revisadoPorId, motivoRechazo } = req.body;

    if (!revisadoPorId || !motivoRechazo) {
      return res.status(400).json({
        success: false,
        mensaje: "Se requiere revisadoPorId y motivoRechazo",
      });
    }

    const solicitud = await prisma.solicitudAyuda.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        estado: 'RECHAZADO',
        revisadoPorId: parseInt(revisadoPorId),
        fechaRevision: new Date(),
        motivoRechazo,
      },
      include: {
        beneficiario: {
          include: {
            pacienteRegistro: true,
          },
        },
        solicitadoPor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: solicitud,
      mensaje: "Solicitud rechazada correctamente",
    });
  } catch (error) {
    console.error("Error al rechazar solicitud:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al rechazar solicitud",
      error: error.message,
    });
  }
});

// ================================
// REGISTRAR ENTREGA (con factura)
// ================================
app.put("/solicitudes-ayuda/:id/entregar", upload.single('facturaPdf'), async (req, res) => {
  try {
    const {
      costoReal,
      proveedor,
      instruccionesEntrega,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        mensaje: "Se requiere cargar la factura en PDF",
      });
    }

    const solicitud = await prisma.solicitudAyuda.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        estado: 'ENTREGADO',
        fechaEntrega: new Date(),
        costoReal: costoReal ? parseFloat(costoReal) : null,
        proveedor: proveedor || null,
        facturaPdf: req.file.filename,
        instruccionesEntrega: instruccionesEntrega || null,
      },
      include: {
        beneficiario: {
          include: {
            pacienteRegistro: true,
          },
        },
        solicitadoPor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        revisadoPor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    // Crear notificación para el trabajador social sobre la entrega
    await prisma.notificacion.create({
      data: {
        usuarioId: solicitud.solicitadoPorId,
        emailDestinatario: solicitud.solicitadoPor.email,
        tipo: 'ayuda_entregada',
        prioridad: 'alta',
        titulo: `¡Ayuda Entregada! - ${solicitud.codigoSolicitud}`,
        mensaje: `La ayuda para ${solicitud.beneficiario.pacienteRegistro.nombreCompletoNino} ha sido entregada. El beneficiario puede pasar a recogerla. ${instruccionesEntrega ? 'Instrucciones: ' + instruccionesEntrega : 'Debe presentarse con su receta médica.'}`,
        relacionadoTipo: 'solicitud',
        relacionadoId: solicitud.id,
        emailEnviado: false,
      },
    });

    // Crear notificación para el beneficiario sobre la entrega
    const usuarioBeneficiario = await prisma.usuario.findFirst({
      where: {
        ci: solicitud.beneficiario.pacienteRegistro.ciTutor,
        rol: 'BENEFICIARIO'
      }
    });

    if (usuarioBeneficiario) {
      await prisma.notificacion.create({
        data: {
          usuarioId: usuarioBeneficiario.id,
          emailDestinatario: usuarioBeneficiario.email,
          tipo: 'ayuda_entregada',
          prioridad: 'urgente',
          titulo: `¡Tu Ayuda está Lista! - ${solicitud.codigoSolicitud}`,
          mensaje: `La ayuda para ${solicitud.beneficiario.pacienteRegistro.nombreCompletoNino} está lista. Puedes pasar a recogerla. ${instruccionesEntrega ? 'Instrucciones: ' + instruccionesEntrega : 'Debes presentarte con tu cédula de identidad y receta médica.'}`,
          relacionadoTipo: 'solicitud',
          relacionadoId: solicitud.id,
          emailEnviado: false,
        },
      });
    }

    res.json({
      success: true,
      data: solicitud,
      mensaje: "Entrega registrada correctamente",
    });
  } catch (error) {
    console.error("Error al registrar entrega:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al registrar entrega",
      error: error.message,
    });
  }
});

// ================================
// ACTUALIZAR SOLICITUD
// ================================
app.put("/solicitudes-ayuda/:id", async (req, res) => {
  try {
    const {
      tipoAyuda,
      prioridad,
      numeroReceta,
      fechaReceta,
      medicoPrescriptor,
      recetaPdf,
      detalleSolicitud,
      costoEstimado,
      observaciones,
    } = req.body;

    const solicitud = await prisma.solicitudAyuda.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        ...(tipoAyuda && { tipoAyuda }),
        ...(prioridad && { prioridad }),
        ...(numeroReceta !== undefined && { numeroReceta }),
        ...(fechaReceta && { fechaReceta: new Date(fechaReceta) }),
        ...(medicoPrescriptor !== undefined && { medicoPrescriptor }),
        ...(recetaPdf !== undefined && { recetaPdf }),
        ...(detalleSolicitud && { detalleSolicitud }),
        ...(costoEstimado !== undefined && { costoEstimado: parseFloat(costoEstimado) }),
        ...(observaciones !== undefined && { observaciones }),
      },
      include: {
        beneficiario: {
          include: {
            pacienteRegistro: true,
          },
        },
        solicitadoPor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: solicitud,
      mensaje: "Solicitud actualizada correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar solicitud:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al actualizar solicitud",
      error: error.message,
    });
  }
});

// ================================
// ELIMINAR SOLICITUD
// ================================
app.delete("/solicitudes-ayuda/:id", async (req, res) => {
  try {
    await prisma.solicitudAyuda.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    res.json({
      success: true,
      mensaje: "Solicitud eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar solicitud:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al eliminar solicitud",
      error: error.message,
    });
  }
});

// ================================
// ESTADÍSTICAS DE SOLICITUDES
// ================================
app.get("/solicitudes-ayuda/stats/resumen", async (req, res) => {
  try {
    const { solicitadoPorId } = req.query;

    const where = solicitadoPorId ? { solicitadoPorId: parseInt(solicitadoPorId) } : {};

    const [
      totalPendientes,
      totalRecepcionados,
      totalEntregados,
      totalRechazados,
    ] = await Promise.all([
      prisma.solicitudAyuda.count({ where: { ...where, estado: 'PENDIENTE' } }),
      prisma.solicitudAyuda.count({ where: { ...where, estado: 'RECEPCIONADO' } }),
      prisma.solicitudAyuda.count({ where: { ...where, estado: 'ENTREGADO' } }),
      prisma.solicitudAyuda.count({ where: { ...where, estado: 'RECHAZADO' } }),
    ]);

    res.json({
      success: true,
      data: {
        pendientes: totalPendientes,
        recepcionados: totalRecepcionados,
        entregados: totalEntregados,
        rechazados: totalRechazados,
        total: totalPendientes + totalRecepcionados + totalEntregados + totalRechazados,
      },
      mensaje: "Estadísticas obtenidas correctamente",
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener estadísticas",
      error: error.message,
    });
  }
});

module.exports = app;
