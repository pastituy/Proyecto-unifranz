/**
 * Rutas de Pacientes/Beneficiarios
 * Arquitectura MVC - Capa de Rutas
 *
 * Control de acceso:
 * - Admin: Acceso completo
 * - Psicólogo: Lectura/escritura de evaluaciones psicológicas
 * - Trabajador Social: Lectura/escritura de evaluaciones sociales y ayudas
 * - Beneficiario: Solo sus propios datos
 */

const express = require('express');
const router = express.Router();

// Middlewares de seguridad
const { authenticateToken } = require('../middleware/auth');
const {
  requireRole,
  requireAdmin,
  requireProfessional,
  requireOwnership,
  requireRoleOrOwnership,
  requirePermission,
  roles
} = require('../middleware/rbac');
const { apiLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const { validatePatient, validateId, validateSearch, validateFileUpload } = require('../middleware/validator');

// Controladores
// const pacienteController = require('../controllers/paciente');
// const beneficiariosController = require('../controllers/beneficiarios');

// ============================================
// RUTAS - GESTIÓN DE PACIENTES
// ============================================

/**
 * GET /api/pacientes
 * Listar todos los pacientes
 *
 * Permisos:
 * - Admin: Todos los pacientes
 * - Profesionales: Pacientes asignados
 */
router.get('/',
  authenticateToken,
  requireProfessional,    // Admin, Psicólogo, Trabajador Social
  validateSearch,
  apiLimiter,
  // pacienteController.getAll
);

/**
 * GET /api/pacientes/:id
 * Obtener detalle de un paciente
 *
 * Permisos:
 * - Admin: Cualquier paciente
 * - Profesionales: Pacientes asignados
 * - Beneficiario: Solo sus propios datos
 */
router.get('/:id',
  authenticateToken,
  validateId,
  requireRoleOrOwnership([roles.ADMIN, roles.PSICOLOGO, roles.TRABAJADOR_SOCIAL], 'id'),
  // pacienteController.getById
);

/**
 * POST /api/pacientes
 * Registrar nuevo paciente
 *
 * Permisos:
 * - Admin: Crear cualquier paciente
 * - Trabajador Social: Crear paciente
 */
router.post('/',
  authenticateToken,
  requireRole([roles.ADMIN, roles.TRABAJADOR_SOCIAL]),
  validatePatient,
  apiLimiter,
  // pacienteController.create
);

/**
 * PUT /api/pacientes/:id
 * Actualizar datos de un paciente
 *
 * Permisos:
 * - Admin: Actualizar cualquier paciente
 * - Profesionales: Pacientes asignados
 * - Beneficiario: Sus propios datos (campos limitados)
 */
router.put('/:id',
  authenticateToken,
  validateId,
  validatePatient,
  requireRoleOrOwnership([roles.ADMIN, roles.PSICOLOGO, roles.TRABAJADOR_SOCIAL], 'id'),
  // pacienteController.update
);

/**
 * DELETE /api/pacientes/:id
 * Eliminar un paciente (soft delete)
 *
 * Permisos:
 * - Solo Admin
 */
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  validateId,
  // pacienteController.delete
);

// ============================================
// RUTAS - EVALUACIONES PSICOLÓGICAS
// ============================================

/**
 * GET /api/pacientes/:id/evaluaciones-psicologicas
 * Obtener evaluaciones psicológicas de un paciente
 *
 * Permisos:
 * - Admin: Todas
 * - Psicólogo: Del paciente
 * - Beneficiario: Sus propias evaluaciones
 */
router.get('/:id/evaluaciones-psicologicas',
  authenticateToken,
  validateId,
  requireRoleOrOwnership([roles.ADMIN, roles.PSICOLOGO], 'id'),
  // pacienteController.getEvaluacionesPsicologicas
);

/**
 * POST /api/pacientes/:id/evaluaciones-psicologicas
 * Crear evaluación psicológica
 *
 * Permisos:
 * - Admin: Cualquier paciente
 * - Psicólogo: Paciente asignado
 */
router.post('/:id/evaluaciones-psicologicas',
  authenticateToken,
  validateId,
  requireRole([roles.ADMIN, roles.PSICOLOGO]),
  requirePermission('evaluacion_psicologica:write'),
  apiLimiter,
  // beneficiariosController.createEvaluacionPsicologica
);

/**
 * PUT /api/pacientes/:id/evaluaciones-psicologicas/:evalId
 * Actualizar evaluación psicológica
 *
 * Permisos:
 * - Admin: Cualquiera
 * - Psicólogo: Sus propias evaluaciones
 */
router.put('/:id/evaluaciones-psicologicas/:evalId',
  authenticateToken,
  validateId,
  requireRole([roles.ADMIN, roles.PSICOLOGO]),
  // beneficiariosController.updateEvaluacionPsicologica
);

// ============================================
// RUTAS - EVALUACIONES SOCIALES
// ============================================

/**
 * GET /api/pacientes/:id/evaluaciones-sociales
 * Obtener evaluaciones sociales de un paciente
 *
 * Permisos:
 * - Admin: Todas
 * - Trabajador Social: Del paciente
 * - Beneficiario: Sus propias evaluaciones
 */
router.get('/:id/evaluaciones-sociales',
  authenticateToken,
  validateId,
  requireRoleOrOwnership([roles.ADMIN, roles.TRABAJADOR_SOCIAL], 'id'),
  // pacienteController.getEvaluacionesSociales
);

/**
 * POST /api/pacientes/:id/evaluaciones-sociales
 * Crear evaluación social
 *
 * Permisos:
 * - Admin: Cualquier paciente
 * - Trabajador Social: Paciente asignado
 */
router.post('/:id/evaluaciones-sociales',
  authenticateToken,
  validateId,
  requireRole([roles.ADMIN, roles.TRABAJADOR_SOCIAL]),
  requirePermission('evaluacion_social:write'),
  apiLimiter,
  // beneficiariosController.createEvaluacionSocial
);

// ============================================
// RUTAS - SOLICITUDES DE AYUDA
// ============================================

/**
 * GET /api/pacientes/:id/solicitudes-ayuda
 * Obtener solicitudes de ayuda de un paciente
 *
 * Permisos:
 * - Admin: Todas
 * - Trabajador Social: Del paciente
 * - Beneficiario: Sus propias solicitudes
 */
router.get('/:id/solicitudes-ayuda',
  authenticateToken,
  validateId,
  requireRoleOrOwnership([roles.ADMIN, roles.TRABAJADOR_SOCIAL], 'id'),
  // pacienteController.getSolicitudesAyuda
);

/**
 * POST /api/pacientes/:id/solicitudes-ayuda
 * Crear solicitud de ayuda
 *
 * Permisos:
 * - Admin: Cualquier paciente
 * - Trabajador Social: Cualquier paciente
 * - Beneficiario: Solo para sí mismo
 */
router.post('/:id/solicitudes-ayuda',
  authenticateToken,
  validateId,
  requireRoleOrOwnership([roles.ADMIN, roles.TRABAJADOR_SOCIAL, roles.BENEFICIARIO], 'id'),
  apiLimiter,
  // beneficiariosController.createSolicitudAyuda
);

/**
 * PUT /api/pacientes/:id/solicitudes-ayuda/:solicitudId
 * Actualizar estado de solicitud de ayuda
 *
 * Permisos:
 * - Admin: Cualquier solicitud
 * - Trabajador Social: Solicitudes asignadas
 */
router.put('/:id/solicitudes-ayuda/:solicitudId',
  authenticateToken,
  requireRole([roles.ADMIN, roles.TRABAJADOR_SOCIAL]),
  // beneficiariosController.updateSolicitudAyuda
);

// ============================================
// RUTAS - DOCUMENTOS Y ARCHIVOS
// ============================================

/**
 * POST /api/pacientes/:id/documentos
 * Subir documento del paciente
 *
 * Permisos:
 * - Admin: Cualquier paciente
 * - Profesionales: Pacientes asignados
 * - Beneficiario: Sus propios documentos
 */
router.post('/:id/documentos',
  authenticateToken,
  validateId,
  uploadLimiter,
  requireRoleOrOwnership([roles.ADMIN, roles.PSICOLOGO, roles.TRABAJADOR_SOCIAL], 'id'),
  validateFileUpload,
  // pacienteController.uploadDocument
);

/**
 * GET /api/pacientes/:id/documentos
 * Listar documentos del paciente
 *
 * Permisos:
 * - Admin: Cualquier paciente
 * - Profesionales: Pacientes asignados
 * - Beneficiario: Sus propios documentos
 */
router.get('/:id/documentos',
  authenticateToken,
  validateId,
  requireRoleOrOwnership([roles.ADMIN, roles.PSICOLOGO, roles.TRABAJADOR_SOCIAL], 'id'),
  // pacienteController.getDocuments
);

/**
 * GET /api/pacientes/:id/documentos/:docId
 * Descargar documento específico
 *
 * Permisos:
 * - Admin: Cualquier documento
 * - Profesionales: Documentos de pacientes asignados
 * - Beneficiario: Sus propios documentos
 */
router.get('/:id/documentos/:docId',
  authenticateToken,
  validateId,
  requireRoleOrOwnership([roles.ADMIN, roles.PSICOLOGO, roles.TRABAJADOR_SOCIAL], 'id'),
  // pacienteController.downloadDocument
);

/**
 * DELETE /api/pacientes/:id/documentos/:docId
 * Eliminar documento
 *
 * Permisos:
 * - Solo Admin
 */
router.delete('/:id/documentos/:docId',
  authenticateToken,
  requireAdmin,
  validateId,
  // pacienteController.deleteDocument
);

// ============================================
// RUTAS - REPORTES
// ============================================

/**
 * GET /api/pacientes/:id/historial-completo
 * Obtener historial completo del paciente
 * (evaluaciones, solicitudes, documentos, etc.)
 *
 * Permisos:
 * - Admin: Cualquier paciente
 * - Profesionales: Pacientes asignados
 */
router.get('/:id/historial-completo',
  authenticateToken,
  validateId,
  requireRole([roles.ADMIN, roles.PSICOLOGO, roles.TRABAJADOR_SOCIAL]),
  // pacienteController.getHistorialCompleto
);

/**
 * GET /api/pacientes/:id/reporte-pdf
 * Generar reporte PDF del paciente
 *
 * Permisos:
 * - Admin: Cualquier paciente
 * - Profesionales: Pacientes asignados
 */
router.get('/:id/reporte-pdf',
  authenticateToken,
  validateId,
  requireRole([roles.ADMIN, roles.PSICOLOGO, roles.TRABAJADOR_SOCIAL]),
  // pacienteController.generateReportPdf
);

module.exports = router;
