const express = require("express");
const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { analizarInformeSocial, generarResumenCaso } = require("../services/iaAnalisisService");

const app = express.Router();
const prisma = new PrismaClient();

// Configuración de Multer para PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/informes");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"), false);
    }
  },
});

// ================================
// TRABAJADOR SOCIAL - ENDPOINTS
// ================================

// Crear nuevo registro de paciente
app.post("/registro-paciente", async (req, res) => {
  try {
    const {
      nombreCompletoNino,
      fechaNacimiento,
      edad,
      ciNino,
      diagnostico,
      nombreCompletoTutor,
      ciTutor,
      parentesco,
      telefonoTutor,
      direccion,
      emailTutor,
      creadoPorId,
    } = req.body;

    // Validar que el CI del tutor sea único
    const existeTutor = await prisma.pacienteRegistro.findFirst({
      where: { ciTutor: ciTutor }
    });

    if (existeTutor) {
      return res.status(400).json({
        success: false,
        mensaje: `Ya existe un registro con el CI del tutor: ${ciTutor}. El paciente ${existeTutor.nombreCompletoNino} ya fue registrado.`
      });
    }

    // Validar que el CI del niño sea único (si se proporciona)
    if (ciNino && ciNino.trim() !== "") {
      const existeNino = await prisma.pacienteRegistro.findFirst({
        where: { ciNino: ciNino }
      });

      if (existeNino) {
        return res.status(400).json({
          success: false,
          mensaje: `Ya existe un registro con el CI del niño/a: ${ciNino}. El paciente ${existeNino.nombreCompletoNino} ya fue registrado.`
        });
      }
    }

    const registro = await prisma.pacienteRegistro.create({
      data: {
        nombreCompletoNino,
        fechaNacimiento: new Date(fechaNacimiento),
        edad: parseInt(edad),
        ciNino,
        diagnostico,
        nombreCompletoTutor,
        ciTutor,
        parentesco,
        telefonoTutor,
        direccion,
        emailTutor,
        creadoPorId: parseInt(creadoPorId),
        estado: "REGISTRO_INICIAL",
      },
    });

    res.status(201).json({
      success: true,
      data: registro,
      mensaje: "Registro de paciente creado correctamente",
    });
  } catch (error) {
    console.error("Error al crear registro:", error);
    res.status(500).json({ success: false, mensaje: "Error al crear registro", error: error.message });
  }
});

// Actualizar registro de paciente (PUT)
app.put("/paciente-registro/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombreCompletoNino,
      fechaNacimiento,
      edad,
      ciNino,
      diagnostico,
      nombreCompletoTutor,
      ciTutor,
      parentesco,
      telefonoTutor,
      direccion,
      emailTutor,
    } = req.body;

    // Verificar que el registro existe y está en REGISTRO_INICIAL
    const registroExistente = await prisma.pacienteRegistro.findUnique({
      where: { id: parseInt(id) }
    });

    if (!registroExistente) {
      return res.status(404).json({
        success: false,
        mensaje: "Registro no encontrado"
      });
    }

    if (registroExistente.estado !== "REGISTRO_INICIAL") {
      return res.status(400).json({
        success: false,
        mensaje: "Solo se pueden editar registros en estado inicial"
      });
    }

    // Validar que el CI del tutor sea único (excepto el registro actual)
    if (ciTutor !== registroExistente.ciTutor) {
      const existeTutor = await prisma.pacienteRegistro.findFirst({
        where: {
          ciTutor: ciTutor,
          id: { not: parseInt(id) }
        }
      });

      if (existeTutor) {
        return res.status(400).json({
          success: false,
          mensaje: `Ya existe un registro con el CI del tutor: ${ciTutor}`
        });
      }
    }

    // Validar que el CI del niño sea único (si se proporciona)
    if (ciNino && ciNino.trim() !== "" && ciNino !== registroExistente.ciNino) {
      const existeNino = await prisma.pacienteRegistro.findFirst({
        where: {
          ciNino: ciNino,
          id: { not: parseInt(id) }
        }
      });

      if (existeNino) {
        return res.status(400).json({
          success: false,
          mensaje: `Ya existe un registro con el CI del niño/a: ${ciNino}`
        });
      }
    }

    // Actualizar el registro
    const registro = await prisma.pacienteRegistro.update({
      where: { id: parseInt(id) },
      data: {
        nombreCompletoNino,
        fechaNacimiento: new Date(fechaNacimiento),
        edad: parseInt(edad),
        ciNino,
        diagnostico,
        nombreCompletoTutor,
        ciTutor,
        parentesco,
        telefonoTutor,
        direccion,
        emailTutor,
      },
    });

    res.json({
      success: true,
      data: registro,
      mensaje: "Registro actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar registro:", error);
    res.status(500).json({ success: false, mensaje: "Error al actualizar registro", error: error.message });
  }
});

// Eliminar registro de paciente (DELETE)
app.delete("/paciente-registro/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el registro existe y está en REGISTRO_INICIAL
    const registroExistente = await prisma.pacienteRegistro.findUnique({
      where: { id: parseInt(id) },
      include: {
        evaluacionSocial: true,
        beneficiario: true
      }
    });

    if (!registroExistente) {
      return res.status(404).json({
        success: false,
        mensaje: "Registro no encontrado"
      });
    }

    if (registroExistente.estado !== "REGISTRO_INICIAL") {
      return res.status(400).json({
        success: false,
        mensaje: "Solo se pueden eliminar registros en estado inicial"
      });
    }

    // Eliminar el registro (las relaciones se eliminan en cascada según el schema)
    await prisma.pacienteRegistro.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      mensaje: "Registro eliminado correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar registro:", error);
    res.status(500).json({ success: false, mensaje: "Error al eliminar registro", error: error.message });
  }
});

// Obtener registros del trabajador social
app.get("/mis-registros/:trabajadorId", async (req, res) => {
  try {
    const { trabajadorId } = req.params;
    const { estado } = req.query;

    const where = { creadoPorId: parseInt(trabajadorId) };
    if (estado) where.estado = estado;

    const registros = await prisma.pacienteRegistro.findMany({
      where,
      include: {
        evaluacionSocial: true,
      },
      orderBy: { fechaRegistro: "desc" },
    });

    res.json({ success: true, data: registros, mensaje: "Registros obtenidos correctamente" });
  } catch (error) {
    console.error("Error al obtener registros:", error);
    res.status(500).json({ success: false, mensaje: "Error al obtener registros", error: error.message });
  }
});

// Analizar PDF con IA y obtener puntajes sugeridos
app.post("/analizar-informe-social", upload.single("informeSocialPdf"), async (req, res) => {
  try {
    console.log("=== ANALIZAR INFORME SOCIAL CON IA ===");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        mensaje: "Debe subir el archivo PDF del informe social"
      });
    }

    const pdfPath = req.file.path;
    console.log("Analizando PDF:", pdfPath);

    // Llamar al servicio de IA para analizar el PDF
    const resultado = await analizarInformeSocial(pdfPath);

    if (resultado.success) {
      res.json({
        success: true,
        data: {
          puntajes: resultado.data,
          nombreArchivo: req.file.filename,
          textoExtraido: resultado.textoExtraido
        },
        mensaje: "Análisis completado exitosamente. Revisa y ajusta los puntajes si es necesario."
      });
    } else {
      res.json({
        success: false,
        data: {
          puntajes: resultado.data,
          nombreArchivo: req.file.filename,
          error: resultado.error
        },
        mensaje: "Hubo un problema con el análisis automático. Se muestran valores por defecto. Por favor, ajusta los puntajes manualmente."
      });
    }

  } catch (error) {
    console.error("Error al analizar informe:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al analizar el informe",
      error: error.message
    });
  }
});

// Generar resumen ejecutivo del caso (solo para ADMINISTRADOR)
app.post("/generar-resumen-caso", upload.single("informeSocialPdf"), async (req, res) => {
  try {
    console.log("=== GENERAR RESUMEN DEL CASO (ADMINISTRADOR) ===");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        mensaje: "Debe subir el archivo PDF del informe social"
      });
    }

    const pdfPath = req.file.path;
    console.log("Generando resumen del PDF:", pdfPath);

    // Llamar al servicio de IA para generar el resumen
    const resultado = await generarResumenCaso(pdfPath);

    if (resultado.success) {
      res.json({
        success: true,
        data: {
          resumen: resultado.data,
          nombreArchivo: req.file.filename,
          textoExtraido: resultado.textoExtraido
        },
        mensaje: "Resumen generado exitosamente."
      });
    } else {
      res.json({
        success: false,
        data: {
          resumen: resultado.data,
          nombreArchivo: req.file.filename,
          error: resultado.error
        },
        mensaje: "Hubo un problema al generar el resumen automático."
      });
    }

  } catch (error) {
    console.error("Error al generar resumen:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al generar el resumen",
      error: error.message
    });
  }
});

// Crear evaluación social
app.post("/evaluacion-social", upload.single("informeSocialPdf"), async (req, res) => {
  try {
    const {
      pacienteRegistroId,
      ingresoFamiliar,
      numPersonasHogar,
      tipoVivienda,
      situacionLaboralPadres,
      accesoSalud,
      gastosMedicosMensuales,
      trabajadorSocialId,
      nombreArchivoPdf, // Nombre del archivo ya subido en el análisis previo
      observaciones, // Resumen generado por IA
    } = req.body;

    console.log("=== CREAR EVALUACIÓN SOCIAL ===");
    console.log("Archivo nuevo:", req.file?.filename);
    console.log("Archivo previo:", nombreArchivoPdf);
    console.log("Observaciones:", observaciones);

    // Calcular puntaje total
    const puntajes = [
      parseInt(ingresoFamiliar),
      parseInt(numPersonasHogar),
      parseInt(tipoVivienda),
      parseInt(situacionLaboralPadres),
      parseInt(accesoSalud),
      parseInt(gastosMedicosMensuales),
    ];
    const puntajeTotal = puntajes.reduce((a, b) => a + b, 0);

    // Determinar nivel de vulnerabilidad basado en escala 0-100
    let nivelVulnerabilidad = "BAJO";
    if (puntajeTotal >= 60) nivelVulnerabilidad = "ALTO";
    else if (puntajeTotal >= 30) nivelVulnerabilidad = "MEDIO";

    // Usar el archivo nuevo si se subió, o el previo del análisis
    const archivoFinal = req.file ? req.file.filename : nombreArchivoPdf;

    const evaluacion = await prisma.evaluacionSocial.create({
      data: {
        pacienteRegistroId: parseInt(pacienteRegistroId),
        ingresoFamiliar: parseInt(ingresoFamiliar),
        numPersonasHogar: parseInt(numPersonasHogar),
        tipoVivienda: parseInt(tipoVivienda),
        situacionLaboralPadres: parseInt(situacionLaboralPadres),
        accesoSalud: parseInt(accesoSalud),
        gastosMedicosMensuales: parseInt(gastosMedicosMensuales),
        puntajeTotal,
        nivelVulnerabilidad,
        informeSocialPdf: archivoFinal,
        observaciones: observaciones || null,
        trabajadorSocialId: parseInt(trabajadorSocialId),
      },
    });

    res.status(201).json({
      success: true,
      data: evaluacion,
      mensaje: "Evaluación social creada correctamente",
    });
  } catch (error) {
    console.error("Error al crear evaluación:", error);
    res.status(500).json({ success: false, mensaje: "Error al crear evaluación", error: error.message });
  }
});

// ================================
// ENDPOINTS DESHABILITADOS - EVALUACIÓN PSICOLÓGICA
// ================================
// El psicólogo ya no participa en el flujo de evaluación
// Solo el trabajador social sube informe social (obligatorio)

/* ENDPOINT DESHABILITADO - Solicitar evaluación psicológica
app.put("/solicitar-evaluacion-psicologica/:registroId", async (req, res) => {
  try {
    const { registroId } = req.params;

    // Verificar que tenga evaluación social completa
    const registro = await prisma.pacienteRegistro.findUnique({
      where: { id: parseInt(registroId) },
      include: { evaluacionSocial: true },
    });

    if (!registro) {
      return res.status(404).json({ success: false, mensaje: "Registro no encontrado" });
    }

    if (!registro.evaluacionSocial) {
      return res.status(400).json({ success: false, mensaje: "Debe completar la evaluación social primero" });
    }

    if (!registro.evaluacionSocial.informeSocialPdf) {
      return res.status(400).json({ success: false, mensaje: "Debe subir el informe social PDF" });
    }

    const actualizado = await prisma.pacienteRegistro.update({
      where: { id: parseInt(registroId) },
      data: { estado: "PENDIENTE_EVALUACION_PSICOLOGICA" },
    });

    res.json({
      success: true,
      data: actualizado,
      mensaje: "Solicitud de evaluación psicológica enviada",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, mensaje: "Error al solicitar evaluación", error: error.message });
  }
});
*/

/* ENDPOINT DESHABILITADO - Obtener casos pendientes de evaluación psicológica
app.get("/casos-pendientes-psicologia", async (req, res) => {
  try {
    const casos = await prisma.pacienteRegistro.findMany({
      where: { estado: "PENDIENTE_EVALUACION_PSICOLOGICA" },
      include: {
        evaluacionSocial: {
          select: {
            puntajeTotal: true,
            nivelVulnerabilidad: true,
            ingresoFamiliar: true,
            numPersonasHogar: true,
            tipoVivienda: true,
            situacionLaboralPadres: true,
            accesoSalud: true,
            gastosMedicosMensuales: true,
            // NO incluir informeSocialPdf
          },
        },
      },
      orderBy: { fechaRegistro: "asc" },
    });

    res.json({ success: true, data: casos, mensaje: "Casos obtenidos correctamente" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ mensaje: "Error al obtener casos", error: error.message });
  }
});
*/

// ================================
// ENVIAR CASO A ADMINISTRADOR (NUEVO FLUJO)
// ================================
// Después de la evaluación social, el caso va directo al administrador
app.put("/enviar-a-administrador/:registroId", async (req, res) => {
  try {
    const { registroId } = req.params;

    // Verificar que tenga evaluación social completa
    const registro = await prisma.pacienteRegistro.findUnique({
      where: { id: parseInt(registroId) },
      include: { evaluacionSocial: true },
    });

    if (!registro) {
      return res.status(404).json({ success: false, mensaje: "Registro no encontrado" });
    }

    if (!registro.evaluacionSocial) {
      return res.status(400).json({ success: false, mensaje: "Debe completar la evaluación social primero" });
    }

    if (!registro.evaluacionSocial.informeSocialPdf) {
      return res.status(400).json({ success: false, mensaje: "Debe subir el informe social PDF" });
    }

    // Cambiar estado a EN_EVALUACION_ADMINISTRADOR
    const actualizado = await prisma.pacienteRegistro.update({
      where: { id: parseInt(registroId) },
      data: { estado: "EN_EVALUACION_ADMINISTRADOR" },
    });

    res.json({
      success: true,
      data: actualizado,
      mensaje: "Caso enviado a revisión del administrador exitosamente",
    });
  } catch (error) {
    console.error("Error al enviar a administrador:", error);
    res.status(500).json({ success: false, mensaje: "Error al enviar el caso", error: error.message });
  }
});

// ================================
// EVALUACIÓN PSICOLÓGICA - DESHABILITADO
// ================================
// El psicólogo ya no participa en el flujo de evaluación
// Solo el trabajador social sube informe social (obligatorio)

/* ENDPOINT DESHABILITADO - El psicólogo no sube informes en el nuevo flujo
app.post("/evaluacion-psicologica", upload.single("informePsicologicoPdf"), async (req, res) => {
  try {
    console.log("=== INICIO EVALUACIÓN PSICOLÓGICA ===");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { pacienteRegistroId, observaciones, psicologoId } = req.body;

    const evaluacionExistente = await prisma.evaluacionPsicologica.findUnique({
      where: { pacienteRegistroId: parseInt(pacienteRegistroId) }
    });

    console.log("Evaluación existente:", evaluacionExistente);

    let evaluacion;
    if (evaluacionExistente) {
      evaluacion = await prisma.evaluacionPsicologica.update({
        where: { pacienteRegistroId: parseInt(pacienteRegistroId) },
        data: {
          informePsicologicoPdf: req.file ? req.file.filename : evaluacionExistente.informePsicologicoPdf,
          observaciones,
          psicologoId: parseInt(psicologoId),
          fechaEvaluacion: new Date(),
        },
      });
    } else {
      evaluacion = await prisma.evaluacionPsicologica.create({
        data: {
          pacienteRegistroId: parseInt(pacienteRegistroId),
          informePsicologicoPdf: req.file ? req.file.filename : null,
          observaciones,
          psicologoId: parseInt(psicologoId),
        },
      });
    }

    await prisma.pacienteRegistro.update({
      where: { id: parseInt(pacienteRegistroId) },
      data: { estado: "EN_EVALUACION_ADMINISTRADOR" },
    });

    res.status(201).json({
      success: true,
      data: evaluacion,
      mensaje: "Evaluación psicológica guardada correctamente",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al guardar evaluación",
      error: error.message
    });
  }
});
*/

// ================================
// ADMINISTRADOR - ENDPOINTS
// ================================

// Obtener casos en evaluación (solo con informe social)
app.get("/casos-en-evaluacion", async (req, res) => {
  try {
    console.log("=== OBTENIENDO CASOS EN EVALUACIÓN ===");
    const casos = await prisma.pacienteRegistro.findMany({
      where: { estado: "EN_EVALUACION_ADMINISTRADOR" },
      include: {
        evaluacionSocial: true,
        creadoPor: { select: { nombre: true } },
      },
      orderBy: { fechaRegistro: "asc" },
    });

    console.log("Casos encontrados:", casos.length);
    console.log("Casos:", casos.map(c => ({ id: c.id, nombre: c.nombreCompletoNino, estado: c.estado })));

    res.json({ success: true, data: casos, mensaje: "Casos obtenidos correctamente" });
  } catch (error) {
    console.error("Error al obtener casos:", error);
    res.status(500).json({ success: false, mensaje: "Error al obtener casos", error: error.message });
  }
});

// Aceptar caso (crear beneficiario)
app.post("/aceptar-caso/:registroId", async (req, res) => {
  try {
    const { registroId } = req.params;
    const { adminId, asignadoAId } = req.body;

    console.log("=== ACEPTAR CASO ===");
    console.log("registroId:", registroId);
    console.log("adminId:", adminId);
    console.log("asignadoAId:", asignadoAId);

    // Validar que adminId sea un número válido
    if (!adminId || isNaN(parseInt(adminId))) {
      return res.status(400).json({
        success: false,
        mensaje: "El ID del administrador es requerido y debe ser válido"
      });
    }

    // Generar código de beneficiario
    const ultimoBeneficiario = await prisma.beneficiario.findFirst({
      orderBy: { id: "desc" },
    });
    const nuevoNumero = ultimoBeneficiario ? ultimoBeneficiario.id + 1 : 1;
    const codigoBeneficiario = `B${String(nuevoNumero).padStart(3, "0")}`;

    // Crear beneficiario
    const beneficiario = await prisma.beneficiario.create({
      data: {
        pacienteRegistroId: parseInt(registroId),
        codigoBeneficiario,
        aceptadoPorId: parseInt(adminId),
        asignadoAId: asignadoAId ? parseInt(asignadoAId) : null,
      },
    });

    // Actualizar estado del registro
    await prisma.pacienteRegistro.update({
      where: { id: parseInt(registroId) },
      data: { estado: "BENEFICIARIO_ACTIVO" },
    });

    res.status(201).json({
      success: true,
      data: beneficiario,
      mensaje: `Caso aceptado. Código de beneficiario: ${codigoBeneficiario}`,
    });
  } catch (error) {
    console.error("Error al aceptar caso:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al aceptar caso",
      error: error.message
    });
  }
});

// Rechazar caso
app.put("/rechazar-caso/:registroId", async (req, res) => {
  try {
    const { registroId } = req.params;
    const { motivo } = req.body;

    if (!motivo || !motivo.trim()) {
      return res.status(400).json({
        success: false,
        mensaje: "El motivo de rechazo es requerido"
      });
    }

    const actualizado = await prisma.pacienteRegistro.update({
      where: { id: parseInt(registroId) },
      data: {
        estado: "CASO_RECHAZADO",
        motivoRechazo: motivo
      },
    });

    res.json({
      success: true,
      data: actualizado,
      mensaje: "Caso rechazado correctamente"
    });
  } catch (error) {
    console.error("Error al rechazar caso:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al rechazar caso",
      error: error.message
    });
  }
});

// ==================================
// ACEPTAR CASO Y CREAR BENEFICIARIO
// ==================================
app.put("/aceptar-caso/:registroId", async (req, res) => {
  try {
    const { registroId } = req.params;
    const { aceptadoPorId } = req.body;

    const registro = await prisma.pacienteRegistro.findUnique({
      where: { id: parseInt(registroId) },
      include: {
        evaluacionSocial: true
      }
    });

    if (!registro) {
      return res.status(404).json({ success: false, mensaje: "Registro no encontrado" });
    }

    // Generar código único
    const ultimoBeneficiario = await prisma.beneficiario.findFirst({
      orderBy: { id: 'desc' }
    });
    const nuevoNumero = ultimoBeneficiario ? parseInt(ultimoBeneficiario.codigoBeneficiario.substring(1)) + 1 : 1;
    const codigoBeneficiario = `B${String(nuevoNumero).padStart(3, '0')}`;

    const resultado = await prisma.$transaction(async (tx) => {
      // Crear beneficiario
      const beneficiario = await tx.beneficiario.create({
        data: {
          pacienteRegistroId: registro.id,
          codigoBeneficiario,
          aceptadoPorId: parseInt(aceptadoPorId)
        }
      });

      // Actualizar estado del registro
      await tx.pacienteRegistro.update({
        where: { id: registro.id },
        data: { estado: "BENEFICIARIO_ACTIVO" }
      });

      // Crear usuario automáticamente para app móvil
      // Usuario: código del beneficiario (ej: B001)
      // Contraseña: CI del tutor
      await tx.usuario.create({
        data: {
          nombre: registro.nombreCompletoTutor,
          email: registro.emailTutor || `${codigoBeneficiario.toLowerCase()}@beneficiario.com`,
          telefono: registro.telefonoTutor,
          pais: "Bolivia",
          password: registro.ciTutor, // Contraseña es el CI del tutor
          ci: registro.ciTutor,
          rol: "BENEFICIARIO"
        }
      });

      // Crear notificaciones
      const notificaciones = [];
      if (registro.evaluacionSocial) {
        notificaciones.push(
          tx.notificacion.create({
            data: {
              usuarioId: registro.evaluacionSocial.trabajadorSocialId,
              tipo: "beneficiario_aceptado",
              prioridad: "alta",
              titulo: "✅ Caso Aceptado",
              mensaje: `El caso de ${registro.nombreCompletoNino} ha sido aceptado. Código: ${codigoBeneficiario}`,
              relacionadoTipo: "beneficiario",
              relacionadoId: beneficiario.id
            }
          })
        );
      }
      // Notificación al psicólogo removida - ya no participa en evaluaciones
      await Promise.all(notificaciones);
      return beneficiario;
    });

    res.json({
      success: true,
      data: resultado,
      mensaje: `Caso aceptado correctamente. Usuario creado - Código: ${codigoBeneficiario}, Contraseña: CI del tutor`
    });
  } catch (error) {
    console.error("Error al aceptar caso:", error);
    res.status(500).json({ success: false, mensaje: "Error al aceptar caso", error: error.message });
  }
});

// Obtener asistentes para asignar
app.get("/asistentes", async (req, res) => {
  try {
    console.log("=== PETICIÓN A /asistentes ===");
    console.log("Headers:", req.headers);

    const asistentes = await prisma.usuario.findMany({
      where: { rol: "ASISTENTE" },
      select: { id: true, nombre: true, email: true },
    });

    console.log("Asistentes encontrados:", asistentes);
    console.log("Cantidad:", asistentes.length);

    res.json({ success: true, data: asistentes, mensaje: "Asistentes obtenidos" });
  } catch (error) {
    console.error("Error al obtener asistentes:", error);
    res.status(500).json({ success: false, mensaje: "Error al obtener asistentes", error: error.message });
  }
});

// ================================
// ASISTENTE - ENDPOINTS
// ================================

// Obtener beneficiarios (con filtros de estado médico)
app.get("/beneficiarios", async (req, res) => {
  try {
    const { asignadoAId, estadoMedico, estadoBeneficiario } = req.query;

    const where = {};
    if (asignadoAId) where.asignadoAId = parseInt(asignadoAId);
    if (estadoMedico) where.estadoMedico = estadoMedico;
    if (estadoBeneficiario) where.estadoBeneficiario = estadoBeneficiario;

    const beneficiarios = await prisma.beneficiario.findMany({
      where,
      include: {
        pacienteRegistro: {
          include: {
            evaluacionSocial: true,
          },
        },
        ayudas: { orderBy: { fechaAyuda: "desc" }, take: 5 },
        sesionesQuimioterapia: { orderBy: { fechaProgramada: "desc" }, take: 5 },
      },
      orderBy: { fechaAceptacion: "desc" },
    });

    res.json({
      success: true,
      data: beneficiarios,
      mensaje: "Beneficiarios obtenidos"
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener beneficiarios",
      error: error.message
    });
  }
});

// Mantener compatibilidad con endpoint anterior
app.get("/beneficiarios-activos", async (req, res) => {
  try {
    const { asignadoAId } = req.query;

    console.log("=== BACKEND: /beneficiarios-activos ===");
    console.log("asignadoAId recibido:", asignadoAId);

    const where = { estadoBeneficiario: "ACTIVO" };
    if (asignadoAId) where.asignadoAId = parseInt(asignadoAId);

    console.log("Where clause:", where);

    const beneficiarios = await prisma.beneficiario.findMany({
      where,
      include: {
        pacienteRegistro: {
          include: {
            evaluacionSocial: true,
          },
        },
        ayudas: { orderBy: { fechaAyuda: "desc" }, take: 5 },
        sesionesQuimioterapia: { orderBy: { fechaProgramada: "desc" }, take: 5 },
      },
      orderBy: { fechaAceptacion: "desc" },
    });

    console.log("Beneficiarios encontrados:", beneficiarios.length);

    res.json({
      success: true,
      data: beneficiarios,
      mensaje: "Beneficiarios obtenidos"
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener beneficiarios",
      error: error.message
    });
  }
});

// Registrar ayuda
app.post("/registrar-ayuda", async (req, res) => {
  try {
    const {
      beneficiarioId,
      medicamentos,
      analisisExamenes,
      quimioterapia,
      transporte,
      alimentacion,
      otros,
      observaciones,
      registradoPorId,
    } = req.body;

    const montos = [
      parseFloat(medicamentos) || 0,
      parseFloat(analisisExamenes) || 0,
      parseFloat(quimioterapia) || 0,
      parseFloat(transporte) || 0,
      parseFloat(alimentacion) || 0,
      parseFloat(otros) || 0,
    ];
    const totalAyuda = montos.reduce((a, b) => a + b, 0);

    const ayuda = await prisma.ayuda.create({
      data: {
        beneficiarioId: parseInt(beneficiarioId),
        medicamentos: parseFloat(medicamentos) || 0,
        analisisExamenes: parseFloat(analisisExamenes) || 0,
        quimioterapia: parseFloat(quimioterapia) || 0,
        transporte: parseFloat(transporte) || 0,
        alimentacion: parseFloat(alimentacion) || 0,
        otros: parseFloat(otros) || 0,
        totalAyuda,
        observaciones,
        registradoPorId: parseInt(registradoPorId),
      },
    });

    res.status(201).json({ data: ayuda, mensaje: "Ayuda registrada correctamente" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ mensaje: "Error al registrar ayuda", error: error.message });
  }
});

// Obtener historial de ayudas de un beneficiario
app.get("/historial-ayudas/:beneficiarioId", async (req, res) => {
  try {
    const { beneficiarioId } = req.params;

    const ayudas = await prisma.ayuda.findMany({
      where: { beneficiarioId: parseInt(beneficiarioId) },
      include: { registradoPor: { select: { nombre: true } } },
      orderBy: { fechaAyuda: "desc" },
    });

    res.json({ data: ayudas, mensaje: "Historial obtenido" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ mensaje: "Error al obtener historial", error: error.message });
  }
});

// Registrar sesión de quimioterapia
app.post("/sesion-quimioterapia", async (req, res) => {
  try {
    const { beneficiarioId, numeroSesion, fechaProgramada, observaciones } = req.body;

    const sesion = await prisma.sesionQuimioterapia.create({
      data: {
        beneficiarioId: parseInt(beneficiarioId),
        numeroSesion: parseInt(numeroSesion),
        fechaProgramada: new Date(fechaProgramada),
        observaciones,
      },
    });

    res.status(201).json({ data: sesion, mensaje: "Sesión programada" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ mensaje: "Error al programar sesión", error: error.message });
  }
});

// Actualizar estado de sesión de quimioterapia
app.put("/sesion-quimioterapia/:sesionId", async (req, res) => {
  try {
    const { sesionId } = req.params;
    const { estado, fechaRealizada, observaciones } = req.body;

    const sesion = await prisma.sesionQuimioterapia.update({
      where: { id: parseInt(sesionId) },
      data: {
        estado,
        fechaRealizada: fechaRealizada ? new Date(fechaRealizada) : null,
        observaciones,
      },
    });

    res.json({ data: sesion, mensaje: "Sesión actualizada" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ mensaje: "Error al actualizar sesión", error: error.message });
  }
});

// Actualizar estado administrativo del beneficiario
app.put("/estado-beneficiario/:beneficiarioId", async (req, res) => {
  try {
    const { beneficiarioId } = req.params;
    const { estadoBeneficiario } = req.body;

    const beneficiario = await prisma.beneficiario.update({
      where: { id: parseInt(beneficiarioId) },
      data: { estadoBeneficiario },
    });

    res.json({ data: beneficiario, mensaje: "Estado actualizado" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ mensaje: "Error al actualizar estado", error: error.message });
  }
});

// ================================
// NUEVOS ENDPOINTS - INFORMACIÓN MÉDICA
// ================================

// Actualizar estado médico del beneficiario
app.put("/estado-medico/:beneficiarioId", async (req, res) => {
  try {
    const { beneficiarioId } = req.params;
    const { estadoMedico, motivo } = req.body;

    const updateData = { estadoMedico };

    // Agregar campos específicos según el estado
    if (estadoMedico === 'VIGILANCIA') {
      updateData.fechaInicioVigilancia = new Date();
      updateData.faseTratamiento = 'POST_TRATAMIENTO';
    } else if (estadoMedico === 'ABANDONO') {
      updateData.fechaUltimaAsistencia = new Date();
      updateData.motivoAbandono = motivo;
    } else if (estadoMedico === 'FALLECIDO') {
      updateData.fechaFallecimiento = new Date();
      updateData.causaFallecimiento = motivo;
    }

    const beneficiario = await prisma.beneficiario.update({
      where: { id: parseInt(beneficiarioId) },
      data: updateData,
    });

    res.json({
      success: true,
      data: beneficiario,
      mensaje: "Estado médico actualizado"
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al actualizar estado médico",
      error: error.message
    });
  }
});

// Actualizar información médica completa
app.put("/informacion-medica/:beneficiarioId", async (req, res) => {
  try {
    const { beneficiarioId } = req.params;
    const {
      historiaClinica,
      fechaPrimerContacto,
      nombreMedicoTratante,
      especialidadMedico,
      telefonoMedico,
      institucionMedica,
      faseTratamiento,
      semanaProtocolo,
      esquemaTratamiento,
      ultimaFechaControl,
      proximaFechaControl,
      frecuenciaControl,
      alergiasMedicamentos,
      complicaciones,
      observacionesMedicas,
    } = req.body;

    const beneficiario = await prisma.beneficiario.update({
      where: { id: parseInt(beneficiarioId) },
      data: {
        ...(historiaClinica && { historiaClinica }),
        ...(fechaPrimerContacto && { fechaPrimerContacto: new Date(fechaPrimerContacto) }),
        ...(nombreMedicoTratante !== undefined && { nombreMedicoTratante }),
        ...(especialidadMedico !== undefined && { especialidadMedico }),
        ...(telefonoMedico !== undefined && { telefonoMedico }),
        ...(institucionMedica !== undefined && { institucionMedica }),
        ...(faseTratamiento && { faseTratamiento }),
        ...(semanaProtocolo !== undefined && { semanaProtocolo: parseInt(semanaProtocolo) }),
        ...(esquemaTratamiento !== undefined && { esquemaTratamiento }),
        ...(ultimaFechaControl && { ultimaFechaControl: new Date(ultimaFechaControl) }),
        ...(proximaFechaControl && { proximaFechaControl: new Date(proximaFechaControl) }),
        ...(frecuenciaControl !== undefined && { frecuenciaControl }),
        ...(alergiasMedicamentos !== undefined && { alergiasMedicamentos }),
        ...(complicaciones !== undefined && { complicaciones }),
        ...(observacionesMedicas !== undefined && { observacionesMedicas }),
      },
    });

    res.json({
      success: true,
      data: beneficiario,
      mensaje: "Información médica actualizada"
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al actualizar información médica",
      error: error.message
    });
  }
});

// Marcar abandono y notificar defensoría
app.put("/marcar-abandono/:beneficiarioId", async (req, res) => {
  try {
    const { beneficiarioId } = req.params;
    const { motivoAbandono } = req.body;

    const beneficiario = await prisma.beneficiario.update({
      where: { id: parseInt(beneficiarioId) },
      data: {
        estadoMedico: 'ABANDONO',
        fechaUltimaAsistencia: new Date(),
        motivoAbandono,
        notificadoDefensoria: true,
        fechaNotificacionDefensoria: new Date(),
      },
    });

    res.json({
      success: true,
      data: beneficiario,
      mensaje: "Beneficiario marcado como abandono. Defensoría notificada."
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al marcar abandono",
      error: error.message
    });
  }
});

// Obtener estadísticas por estado médico
app.get("/estadisticas-estado-medico", async (req, res) => {
  try {
    const [
      enTratamiento,
      vigilancia,
      paliativo,
      abandono,
      fallecidos,
    ] = await Promise.all([
      prisma.beneficiario.count({ where: { estadoMedico: 'EN_TRATAMIENTO' } }),
      prisma.beneficiario.count({ where: { estadoMedico: 'VIGILANCIA' } }),
      prisma.beneficiario.count({ where: { estadoMedico: 'PALIATIVO' } }),
      prisma.beneficiario.count({ where: { estadoMedico: 'ABANDONO' } }),
      prisma.beneficiario.count({ where: { estadoMedico: 'FALLECIDO' } }),
    ]);

    res.json({
      success: true,
      data: {
        enTratamiento,
        vigilancia,
        paliativo,
        abandono,
        fallecidos,
        total: enTratamiento + vigilancia + paliativo + abandono + fallecidos,
      },
      mensaje: "Estadísticas obtenidas"
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener estadísticas",
      error: error.message
    });
  }
});

// ================================
// ESTADÍSTICAS
// ================================

app.get("/estadisticas", async (req, res) => {
  try {
    const [
      totalRegistros,
      registrosIniciales,
      enEvaluacion,
      beneficiariosActivos,
      casosRechazados,
    ] = await Promise.all([
      prisma.pacienteRegistro.count(),
      prisma.pacienteRegistro.count({ where: { estado: "REGISTRO_INICIAL" } }),
      prisma.pacienteRegistro.count({ where: { estado: "EN_EVALUACION_ADMINISTRADOR" } }),
      prisma.beneficiario.count({ where: { estadoBeneficiario: "ACTIVO" } }),
      prisma.pacienteRegistro.count({ where: { estado: "CASO_RECHAZADO" } }),
    ]);

    res.json({
      data: {
        totalRegistros,
        registrosIniciales,
        enEvaluacion,
        beneficiariosActivos,
        casosRechazados,
      },
      mensaje: "Estadísticas obtenidas",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ mensaje: "Error al obtener estadísticas", error: error.message });
  }
});

// Obtener TODOS los beneficiarios (para admin)
app.get("/beneficiarios", async (req, res) => {
  try {
    const beneficiarios = await prisma.beneficiario.findMany({
      include: {
        pacienteRegistro: {
          include: {
            evaluacionSocial: true
          }
        },
        aceptadoPor: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: {
        fechaAceptacion: 'desc'
      }
    });

    res.json({
      success: true,
      data: beneficiarios,
      mensaje: "Beneficiarios obtenidos correctamente"
    });
  } catch (error) {
    console.error("Error al obtener beneficiarios:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener beneficiarios",
      error: error.message
    });
  }
});

// Obtener beneficiarios asociados a un usuario (Trabajador Social o Psicólogo)
app.get("/beneficiarios-usuario/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Buscar registros donde el usuario participó en las evaluaciones
    const registros = await prisma.pacienteRegistro.findMany({
      where: {
        // Solo trabajador social tiene evaluaciones ahora
        evaluacionSocial: {
          trabajadorSocialId: parseInt(usuarioId)
        },
        estado: "BENEFICIARIO_ACTIVO"
      },
      include: {
        beneficiario: true,
        evaluacionSocial: true
      }
    });

    // Extraer los beneficiarios
    const beneficiarios = registros
      .filter(r => r.beneficiario)
      .map(r => ({
        ...r.beneficiario,
        pacienteRegistro: r
      }));

    res.json({
      success: true,
      data: beneficiarios,
      mensaje: "Beneficiarios obtenidos correctamente"
    });
  } catch (error) {
    console.error("Error al obtener beneficiarios:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener beneficiarios",
      error: error.message
    });
  }
});

// Servir archivos PDF
app.get("/pdf/:filename", (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, "../uploads/informes", filename);

  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ mensaje: "Archivo no encontrado" });
  }
});

// ================================
// ENDPOINTS PARA APP MÓVIL - BENEFICIARIO
// ================================

// Obtener información completa del beneficiario por código
app.get("/beneficiario-movil/:codigoBeneficiario", async (req, res) => {
  try {
    const { codigoBeneficiario } = req.params;

    const beneficiario = await prisma.beneficiario.findUnique({
      where: { codigoBeneficiario: codigoBeneficiario.toUpperCase() },
      include: {
        pacienteRegistro: {
          include: {
            evaluacionSocial: true,
          },
        },
        aceptadoPor: {
          select: {
            nombre: true,
            email: true,
          },
        },
        asignadoA: {
          select: {
            nombre: true,
            email: true,
            telefono: true,
          },
        },
      },
    });

    if (!beneficiario) {
      return res.status(404).json({
        success: false,
        mensaje: "Beneficiario no encontrado",
      });
    }

    res.json({
      success: true,
      data: beneficiario,
      mensaje: "Información obtenida correctamente",
    });
  } catch (error) {
    console.error("Error al obtener beneficiario:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener información",
      error: error.message,
    });
  }
});

// Obtener historial de solicitudes de ayuda del beneficiario
app.get("/beneficiario-solicitudes/:beneficiarioId", async (req, res) => {
  try {
    const { beneficiarioId } = req.params;

    const solicitudes = await prisma.solicitudAyuda.findMany({
      where: { beneficiarioId: parseInt(beneficiarioId) },
      include: {
        solicitadoPor: {
          select: {
            nombre: true,
            email: true,
            telefono: true,
          },
        },
        revisadoPor: {
          select: {
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: { fechaSolicitud: "desc" },
    });

    res.json({
      success: true,
      data: solicitudes,
      mensaje: "Historial de solicitudes obtenido correctamente",
    });
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener historial",
      error: error.message,
    });
  }
});

// Obtener notificaciones del beneficiario
app.get("/beneficiario-notificaciones/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { limite } = req.query;

    console.log("=== OBTENER NOTIFICACIONES BENEFICIARIO ===");
    console.log("usuarioId recibido:", usuarioId);
    console.log("limite:", limite);

    const notificaciones = await prisma.notificacion.findMany({
      where: { usuarioId: parseInt(usuarioId) },
      orderBy: { createdAt: "desc" },
      take: limite ? parseInt(limite) : undefined,
    });

    console.log("Notificaciones encontradas:", notificaciones.length);
    console.log("Notificaciones:", notificaciones);

    const noLeidas = await prisma.notificacion.count({
      where: {
        usuarioId: parseInt(usuarioId),
        leida: false,
      },
    });

    console.log("No leídas:", noLeidas);

    res.json({
      success: true,
      data: {
        notificaciones,
        noLeidas,
      },
      mensaje: "Notificaciones obtenidas correctamente",
    });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener notificaciones",
      error: error.message,
    });
  }
});

// Marcar notificación como leída
app.put("/marcar-notificacion-leida/:notificacionId", async (req, res) => {
  try {
    const { notificacionId } = req.params;

    const notificacion = await prisma.notificacion.update({
      where: { id: parseInt(notificacionId) },
      data: {
        leida: true,
        fechaLeida: new Date(),
      },
    });

    res.json({
      success: true,
      data: notificacion,
      mensaje: "Notificación marcada como leída",
    });
  } catch (error) {
    console.error("Error al marcar notificación:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al actualizar notificación",
      error: error.message,
    });
  }
});

module.exports = app;
