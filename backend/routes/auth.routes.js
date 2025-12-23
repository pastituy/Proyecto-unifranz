/**
 * Rutas de Autenticación
 * Arquitectura MVC - Capa de Rutas
 *
 * Responsabilidades:
 * - Definir endpoints
 * - Aplicar middleware de seguridad
 * - Validar inputs
 * - Delegar lógica a controladores
 */

const express = require('express');
const router = express.Router();

// Middlewares de seguridad
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { loginLimiter, twoFactorLimiter, registerLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { validateLogin, validate2FACode, validateRegister } = require('../middleware/validator');

// Controlador de Autenticación (nuevo - MVC)
const {
  login,
  verify2FA,
  refreshToken,
  logout,
  getCurrentUser,
  changePassword
} = require('../controllers/auth.controller');

// ============================================
// RUTAS PÚBLICAS (Sin autenticación)
// ============================================

/**
 * POST /api/auth/login
 * Inicio de sesión con email y contraseña
 *
 * Seguridad aplicada:
 * - Rate limiting: 5 intentos por 15 minutos
 * - Validación de inputs
 */
router.post('/login',
  loginLimiter,           // Rate limiting
  validateLogin,          // Validación
  login                   // Controlador
);

/**
 * POST /api/auth/verify-2fa
 * Verificación de código 2FA
 *
 * Seguridad aplicada:
 * - Rate limiting: 3 intentos por 15 minutos
 * - Validación de código
 */
router.post('/verify-2fa',
  twoFactorLimiter,       // Rate limiting más estricto
  validate2FACode,        // Validación
  verify2FA               // Controlador
);

/**
 * POST /api/auth/register
 * Registro de nuevo usuario
 *
 * Seguridad aplicada:
 * - Rate limiting: 3 registros por hora
 * - Validación estricta de password
 */
router.post('/register',
  registerLimiter,        // Rate limiting
  validateRegister,       // Validación con política de passwords
  // usuarioController.register
);

/**
 * POST /api/auth/forgot-password
 * Solicitud de recuperación de contraseña
 *
 * Seguridad aplicada:
 * - Rate limiting: 3 intentos por hora
 */
router.post('/forgot-password',
  passwordResetLimiter,
  // authController.forgotPassword
);

/**
 * POST /api/auth/reset-password
 * Restablecer contraseña con token
 */
router.post('/reset-password',
  passwordResetLimiter,
  // authController.resetPassword
);

// ============================================
// RUTAS PROTEGIDAS (Requieren autenticación)
// ============================================

/**
 * POST /api/auth/refresh-token
 * Renovar access token usando refresh token
 *
 * Seguridad aplicada:
 * - Verificación de refresh token
 */
router.post('/refresh-token',
  refreshToken            // Controlador
);

/**
 * POST /api/auth/logout
 * Cerrar sesión (invalidar tokens)
 *
 * Seguridad aplicada:
 * - Autenticación JWT
 */
router.post('/logout',
  authenticateToken,
  logout                  // Controlador
);

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado
 *
 * Seguridad aplicada:
 * - Autenticación JWT
 */
router.get('/me',
  authenticateToken,
  getCurrentUser          // Controlador
);

/**
 * PUT /api/auth/change-password
 * Cambiar contraseña (requiere contraseña actual)
 *
 * Seguridad aplicada:
 * - Autenticación JWT
 * - Validación de password policy
 */
router.put('/change-password',
  authenticateToken,
  validateRegister,       // Reutilizar validación de password
  changePassword          // Controlador
);

// ============================================
// RUTAS CON AUTENTICACIÓN OPCIONAL
// ============================================

/**
 * GET /api/auth/status
 * Verificar estado de autenticación
 * Si hay token, retorna usuario; si no, retorna null
 */
router.get('/status',
  optionalAuth,
  (req, res) => {
    res.json({
      success: true,
      authenticated: !!req.user,
      user: req.user || null
    });
  }
);

module.exports = router;
