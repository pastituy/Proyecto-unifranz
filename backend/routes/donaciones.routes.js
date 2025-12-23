/**
 * Rutas de Donaciones
 * Arquitectura MVC - Capa de Rutas
 */

const express = require('express');
const router = express.Router();

// Middlewares de seguridad
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireRole, requireAdmin } = require('../middleware/rbac');
const { apiLimiter } = require('../middleware/rateLimiter');
const { validateDonation, validateId, validateSearch } = require('../middleware/validator');

// Controlador
// const donacionesController = require('../controllers/donaciones');

/**
 * NOTA: El controlador actual (controllers/donaciones.js) exporta un router.
 * Idealmente debería exportar funciones:
 *
 * // En controllers/donaciones.js
 * const getDonaciones = async (req, res) => { ... }
 * const createDonacion = async (req, res) => { ... }
 * module.exports = { getDonaciones, createDonacion, ... }
 */

// ============================================
// RUTAS PÚBLICAS
// ============================================

/**
 * POST /api/donaciones
 * Crear una nueva donación (público puede donar)
 *
 * Seguridad:
 * - Rate limiting general
 * - Validación de datos de donación
 * - Autenticación opcional (registra usuario si está logueado)
 */
router.post('/',
  apiLimiter,
  optionalAuth,           // Opcional: permite donaciones anónimas
  validateDonation,
  // donacionesController.create
);

/**
 * GET /api/donaciones/stats
 * Obtener estadísticas públicas de donaciones
 * (total recaudado, número de donaciones, etc.)
 *
 * Seguridad:
 * - Rate limiting
 * - Sin datos sensibles (montos agregados únicamente)
 */
router.get('/stats',
  apiLimiter,
  // donacionesController.getPublicStats
);

// ============================================
// RUTAS PROTEGIDAS - USUARIOS AUTENTICADOS
// ============================================

/**
 * GET /api/donaciones/mis-donaciones
 * Obtener donaciones del usuario autenticado
 *
 * Seguridad:
 * - Autenticación JWT requerida
 * - Solo retorna donaciones del usuario
 */
router.get('/mis-donaciones',
  authenticateToken,
  apiLimiter,
  // donacionesController.getMyDonations
);

/**
 * GET /api/donaciones/:id/comprobante
 * Descargar comprobante de donación
 *
 * Seguridad:
 * - Autenticación JWT
 * - Verificar ownership (solo su comprobante)
 * - Validación de ID
 */
router.get('/:id/comprobante',
  authenticateToken,
  validateId,
  // donacionesController.downloadReceipt
);

// ============================================
// RUTAS PROTEGIDAS - SOLO ADMINISTRADORES
// ============================================

/**
 * GET /api/donaciones
 * Listar todas las donaciones (solo admin)
 *
 * Seguridad:
 * - Autenticación JWT
 * - Rol de administrador requerido
 * - Paginación y búsqueda validadas
 */
router.get('/',
  authenticateToken,
  requireAdmin,
  validateSearch,
  apiLimiter,
  // donacionesController.getAll
);

/**
 * GET /api/donaciones/:id
 * Obtener detalle de una donación específica (solo admin)
 *
 * Seguridad:
 * - Autenticación JWT
 * - Rol de administrador requerido
 * - Validación de ID
 */
router.get('/:id',
  authenticateToken,
  requireAdmin,
  validateId,
  // donacionesController.getById
);

/**
 * PUT /api/donaciones/:id
 * Actualizar una donación (solo admin)
 *
 * Seguridad:
 * - Autenticación JWT
 * - Rol de administrador requerido
 * - Validación de ID y datos
 */
router.put('/:id',
  authenticateToken,
  requireAdmin,
  validateId,
  validateDonation,
  // donacionesController.update
);

/**
 * DELETE /api/donaciones/:id
 * Eliminar una donación (solo admin)
 *
 * Seguridad:
 * - Autenticación JWT
 * - Rol de administrador requerido
 * - Validación de ID
 */
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  validateId,
  // donacionesController.delete
);

/**
 * GET /api/donaciones/export/csv
 * Exportar donaciones a CSV (solo admin)
 *
 * Seguridad:
 * - Autenticación JWT
 * - Rol de administrador requerido
 */
router.get('/export/csv',
  authenticateToken,
  requireAdmin,
  // donacionesController.exportToCsv
);

/**
 * GET /api/donaciones/export/pdf
 * Exportar reporte de donaciones a PDF (solo admin)
 *
 * Seguridad:
 * - Autenticación JWT
 * - Rol de administrador requerido
 */
router.get('/export/pdf',
  authenticateToken,
  requireAdmin,
  // donacionesController.exportToPdf
);

/**
 * POST /api/donaciones/:id/verify
 * Verificar una donación manualmente (solo admin)
 *
 * Seguridad:
 * - Autenticación JWT
 * - Rol de administrador requerido
 * - Validación de ID
 */
router.post('/:id/verify',
  authenticateToken,
  requireAdmin,
  validateId,
  // donacionesController.verifyDonation
);

/**
 * GET /api/donaciones/reporte/mensual
 * Obtener reporte mensual de donaciones (solo admin)
 *
 * Seguridad:
 * - Autenticación JWT
 * - Rol de administrador requerido
 */
router.get('/reporte/mensual',
  authenticateToken,
  requireAdmin,
  // donacionesController.getMonthlyReport
);

module.exports = router;
