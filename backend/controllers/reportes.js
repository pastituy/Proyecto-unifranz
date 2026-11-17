const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

/**
 * Obtener historial completo de ayudas con filtros avanzados
 * GET /reportes/historial-ayudas
 * Query params:
 *   - beneficiarioId (opcional)
 *   - beneficiarioNombre (opcional - busca por nombre o código del beneficiario)
 *   - tipoAyuda (opcional)
 *   - estadoBeneficiario (opcional: ACTIVO, INACTIVO, FALLECIDO, RECUPERADO)
 *   - edadMin, edadMax (opcional)
 *   - fechaInicio, fechaFin (opcional)
 *   - trabajadorSocialId (opcional - para filtrar por TS específico)
 */
const obtenerHistorialAyudas = async (req, res) => {
  try {
    const {
      beneficiarioId,
      beneficiarioNombre,
      tipoAyuda,
      estadoBeneficiario,
      edadMin,
      edadMax,
      fechaInicio,
      fechaFin,
      trabajadorSocialId
    } = req.query;

    // Construir filtros dinámicamente
    let where = {};

    // Filtro opcional por estado de solicitud (si no se especifica, muestra TODAS)
    // Por defecto NO filtra, muestra todas las solicitudes

    // Filtro por beneficiario específico
    if (beneficiarioId) {
      where.beneficiarioId = parseInt(beneficiarioId);
    }

    // Filtro por tipo de ayuda
    if (tipoAyuda) {
      where.tipoAyuda = tipoAyuda;
    }

    // Filtro por fecha
    if (fechaInicio || fechaFin) {
      where.fechaSolicitud = {};
      if (fechaInicio) {
        where.fechaSolicitud.gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        where.fechaSolicitud.lte = new Date(fechaFin);
      }
    }

    // Filtros para beneficiario
    const beneficiarioFilters = {};

    // Filtro por nombre o código del beneficiario
    if (beneficiarioNombre) {
      // Convertir a mayúsculas para búsqueda exacta de código
      const searchUpper = beneficiarioNombre.toUpperCase();
      beneficiarioFilters.OR = [
        { nombreNino: { contains: beneficiarioNombre, mode: 'insensitive' } },
        { codigo: searchUpper }
      ];
    }

    // Filtro por estado del beneficiario
    if (estadoBeneficiario) {
      beneficiarioFilters.estadoBeneficiario = estadoBeneficiario;
    }

    // Filtro por trabajador social asignado
    if (trabajadorSocialId) {
      beneficiarioFilters.asignadoAId = parseInt(trabajadorSocialId);
    }

    // ⚡ Bolt: Optimización de rendimiento
    // Mover el filtro de edad a la consulta de la base de datos para reducir la transferencia de datos
    // y el uso de memoria. Anteriormente, esto se filtraba en memoria después de obtener *todos* los registros.
    if (edadMin || edadMax) {
      beneficiarioFilters.pacienteRegistro = {
        edad: {}
      };
      if (edadMin) {
        beneficiarioFilters.pacienteRegistro.edad.gte = parseInt(edadMin, 10);
      }
      if (edadMax) {
        beneficiarioFilters.pacienteRegistro.edad.lte = parseInt(edadMax, 10);
      }
    }

    // Solo agregar filtros de beneficiario si existen
    if (Object.keys(beneficiarioFilters).length > 0) {
      where.beneficiario = beneficiarioFilters;
    }

    // Obtener solicitudes con todos los datos relacionados
    const solicitudes = await prisma.solicitudAyuda.findMany({
      where,
      include: {
        beneficiario: {
          include: {
            pacienteRegistro: true,
            asignadoA: {
              select: {
                id: true,
                nombre: true,
                email: true,
                rol: true
              }
            }
          }
        },
        solicitadoPor: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true
          }
        },
        revisadoPor: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      },
      orderBy: {
        fechaSolicitud: 'desc'
      }
    });

    // El filtro de edad ahora se aplica directamente en la consulta de Prisma.

    // Formatear datos para el frontend
    const historial = solicitudes.map(s => ({
      id: s.id,
      codigoSolicitud: s.codigoSolicitud,
      // Datos del beneficiario
      beneficiario: {
        id: s.beneficiario.id,
        codigo: s.beneficiario.codigoBeneficiario,
        nombreNino: s.beneficiario.pacienteRegistro.nombreCompletoNino,
        edad: s.beneficiario.pacienteRegistro.edad,
        diagnostico: s.beneficiario.pacienteRegistro.diagnostico,
        nombreTutor: s.beneficiario.pacienteRegistro.nombrePadre,
        telefonoTutor: s.beneficiario.pacienteRegistro.telefonoPadre,
        estadoBeneficiario: s.beneficiario.estadoBeneficiario,
        trabajadorSocialAsignado: s.beneficiario.asignadoA
      },
      // Datos de la solicitud
      tipoAyuda: s.tipoAyuda,
      fechaSolicitud: s.fechaSolicitud,
      prioridad: s.prioridad,
      detalleSolicitud: s.detalleSolicitud,
      costoEstimado: s.costoEstimado ? parseFloat(s.costoEstimado) : null,
      // Datos de aprobación
      estado: s.estado,
      montoAprobado: s.montoAprobado ? parseFloat(s.montoAprobado) : null,
      fechaRevision: s.fechaRevision,
      fechaEntrega: s.fechaEntrega,
      costoReal: s.costoReal ? parseFloat(s.costoReal) : null,
      proveedor: s.proveedor,
      observaciones: s.observaciones,
      // Responsables
      solicitadoPor: s.solicitadoPor,
      revisadoPor: s.revisadoPor
    }));

    // Calcular estadísticas
    const estadisticas = {
      totalSolicitudes: historial.length,
      montoTotalAprobado: historial.reduce((sum, h) => sum + (h.montoAprobado || 0), 0),
      montoTotalReal: historial.reduce((sum, h) => sum + (h.costoReal || 0), 0),
      porTipoAyuda: {},
      porEstadoBeneficiario: {},
      porRangoEdad: {
        '0-5': 0,
        '6-10': 0,
        '11-15': 0
      }
    };

    // Agrupar por tipo de ayuda
    historial.forEach(h => {
      // Por tipo de ayuda
      if (!estadisticas.porTipoAyuda[h.tipoAyuda]) {
        estadisticas.porTipoAyuda[h.tipoAyuda] = {
          cantidad: 0,
          montoTotal: 0
        };
      }
      estadisticas.porTipoAyuda[h.tipoAyuda].cantidad++;
      estadisticas.porTipoAyuda[h.tipoAyuda].montoTotal += (h.montoAprobado || 0);

      // Por estado beneficiario
      const estado = h.beneficiario.estadoBeneficiario;
      if (!estadisticas.porEstadoBeneficiario[estado]) {
        estadisticas.porEstadoBeneficiario[estado] = {
          cantidad: 0,
          montoTotal: 0
        };
      }
      estadisticas.porEstadoBeneficiario[estado].cantidad++;
      estadisticas.porEstadoBeneficiario[estado].montoTotal += (h.montoAprobado || 0);

      // Por rango de edad (solo 0-15 años según política de la fundación)
      const edad = h.beneficiario.edad;
      if (edad >= 0 && edad <= 5) estadisticas.porRangoEdad['0-5']++;
      else if (edad >= 6 && edad <= 10) estadisticas.porRangoEdad['6-10']++;
      else if (edad >= 11 && edad <= 15) estadisticas.porRangoEdad['11-15']++;
    });

    res.json({
      success: true,
      data: {
        historial,
        estadisticas
      }
    });

  } catch (error) {
    console.error('Error al obtener historial de ayudas:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el historial',
      error: error.message
    });
  }
};

/**
 * Actualizar estado de un beneficiario
 * PUT /reportes/beneficiario/:id/estado
 * Body: { estadoBeneficiario: 'ACTIVO' | 'INACTIVO' | 'FALLECIDO' | 'RECUPERADO' }
 */
const actualizarEstadoBeneficiario = async (req, res) => {
  try {
    const { id } = req.params;
    const { estadoBeneficiario } = req.body;

    // Validar que el estado sea válido
    const estadosValidos = ['ACTIVO', 'INACTIVO', 'FALLECIDO', 'RECUPERADO'];
    if (!estadosValidos.includes(estadoBeneficiario)) {
      return res.status(400).json({
        success: false,
        mensaje: 'Estado inválido. Debe ser ACTIVO, INACTIVO, FALLECIDO o RECUPERADO'
      });
    }

    // Actualizar el beneficiario
    const beneficiarioActualizado = await prisma.beneficiario.update({
      where: { id: parseInt(id) },
      data: { estadoBeneficiario },
      include: {
        pacienteRegistro: true
      }
    });

    res.json({
      success: true,
      mensaje: `Estado del beneficiario actualizado a ${estadoBeneficiario}`,
      data: beneficiarioActualizado
    });

  } catch (error) {
    console.error('Error al actualizar estado del beneficiario:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar el estado',
      error: error.message
    });
  }
};

/**
 * Obtener resumen de beneficiario específico
 * GET /reportes/beneficiario/:id/resumen
 */
const obtenerResumenBeneficiario = async (req, res) => {
  try {
    const { id } = req.params;

    const beneficiario = await prisma.beneficiario.findUnique({
      where: { id: parseInt(id) },
      include: {
        pacienteRegistro: true,
        asignadoA: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true
          }
        },
        solicitudesAyuda: {
          where: {
            estado: { in: ['RECEPCIONADO', 'ENTREGADO'] }
          },
          orderBy: {
            fechaSolicitud: 'desc'
          }
        }
      }
    });

    if (!beneficiario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Beneficiario no encontrado'
      });
    }

    // Calcular estadísticas de ayudas del beneficiario
    const estadisticas = {
      totalAyudas: beneficiario.solicitudesAyuda.length,
      montoTotal: beneficiario.solicitudesAyuda.reduce((sum, s) =>
        sum + (s.montoAprobado ? parseFloat(s.montoAprobado) : 0), 0
      ),
      porTipoAyuda: {}
    };

    beneficiario.solicitudesAyuda.forEach(s => {
      if (!estadisticas.porTipoAyuda[s.tipoAyuda]) {
        estadisticas.porTipoAyuda[s.tipoAyuda] = {
          cantidad: 0,
          montoTotal: 0
        };
      }
      estadisticas.porTipoAyuda[s.tipoAyuda].cantidad++;
      estadisticas.porTipoAyuda[s.tipoAyuda].montoTotal +=
        (s.montoAprobado ? parseFloat(s.montoAprobado) : 0);
    });

    res.json({
      success: true,
      data: {
        beneficiario,
        estadisticas
      }
    });

  } catch (error) {
    console.error('Error al obtener resumen del beneficiario:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el resumen',
      error: error.message
    });
  }
};

/**
 * Obtener lista de beneficiarios con totales de ayuda
 * GET /reportes/beneficiarios-trabajador/:trabajadorSocialId
 */
const obtenerBeneficiariosConTotales = async (req, res) => {
  try {
    const { trabajadorSocialId } = req.params;

    // Obtener todos los beneficiarios cuyos registros fueron creados por el trabajador social
    const beneficiarios = await prisma.beneficiario.findMany({
      where: {
        pacienteRegistro: {
          creadoPorId: parseInt(trabajadorSocialId)
        }
      },
      include: {
        pacienteRegistro: true,
        solicitudesAyuda: {
          where: {
            estado: { in: ['RECEPCIONADO', 'ENTREGADO'] }
          }
        }
      },
      orderBy: {
        fechaAceptacion: 'desc'
      }
    });

    // Formatear datos con totales
    const beneficiariosConTotales = beneficiarios.map(b => {
      const solicitudes = b.solicitudesAyuda || [];

      // Calcular totales
      const totalAyudas = solicitudes.length;
      const montoTotal = solicitudes.reduce((sum, s) =>
        sum + (s.montoAprobado ? parseFloat(s.montoAprobado) : 0), 0
      );

      // Obtener última fecha de ayuda
      const ultimaFecha = solicitudes.length > 0
        ? solicitudes.reduce((latest, s) =>
            s.fechaSolicitud > latest ? s.fechaSolicitud : latest,
            solicitudes[0].fechaSolicitud
          )
        : null;

      // Contar ayudas por tipo
      const ayudasPorTipo = {};
      solicitudes.forEach(s => {
        ayudasPorTipo[s.tipoAyuda] = (ayudasPorTipo[s.tipoAyuda] || 0) + 1;
      });

      return {
        id: b.id,
        codigoBeneficiario: b.codigoBeneficiario,
        nombreNino: b.pacienteRegistro.nombreCompletoNino,
        edad: b.pacienteRegistro.edad,
        diagnostico: b.pacienteRegistro.diagnostico,
        nombreTutor: b.pacienteRegistro.nombreCompletoTutor,
        telefonoTutor: b.pacienteRegistro.telefonoTutor,
        estadoBeneficiario: b.estadoBeneficiario,
        fechaAceptacion: b.fechaAceptacion,
        totalAyudas,
        montoTotal,
        ultimaFechaAyuda: ultimaFecha,
        ayudasPorTipo
      };
    });

    res.json({
      success: true,
      data: beneficiariosConTotales
    });

  } catch (error) {
    console.error('Error al obtener beneficiarios con totales:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener los beneficiarios',
      error: error.message
    });
  }
};

// Rutas - SIN el prefijo /api porque Express ya las sirve sin él
router.get("/reportes/historial-ayudas", obtenerHistorialAyudas);
router.get("/reportes/beneficiarios-trabajador/:trabajadorSocialId", obtenerBeneficiariosConTotales);
router.put("/reportes/beneficiario/:id/estado", actualizarEstadoBeneficiario);
router.get("/reportes/beneficiario/:id/resumen", obtenerResumenBeneficiario);

module.exports = router;
