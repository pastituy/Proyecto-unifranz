/**
 * Middleware de Rate Limiting
 * Protege contra ataques de fuerza bruta y abuso de API
 */

const rateLimit = require('express-rate-limit');
const { rateLimits } = require('../config/security');

/**
 * Rate limiter para endpoints de login
 * Previene ataques de fuerza bruta en autenticación
 */
const loginLimiter = rateLimit({
  windowMs: rateLimits.login.windowMs,
  max: rateLimits.login.max,
  message: {
    success: false,
    mensaje: rateLimits.login.message
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      mensaje: rateLimits.login.message,
      intentosRestantes: 0,
      tiempoEspera: Math.ceil(rateLimits.login.windowMs / 60000) + ' minutos'
    });
  }
});

/**
 * Rate limiter para verificación 2FA
 * Límite más estricto para prevenir bypass de 2FA
 */
const twoFactorLimiter = rateLimit({
  windowMs: rateLimits.twoFactor.windowMs,
  max: rateLimits.twoFactor.max,
  message: {
    success: false,
    mensaje: rateLimits.twoFactor.message
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      mensaje: rateLimits.twoFactor.message,
      intentosRestantes: 0,
      tiempoEspera: Math.ceil(rateLimits.twoFactor.windowMs / 60000) + ' minutos'
    });
  }
});

/**
 * Rate limiter general para API
 * Protege contra abuso general de endpoints
 */
const apiLimiter = rateLimit({
  windowMs: rateLimits.api.windowMs,
  max: rateLimits.api.max,
  message: {
    success: false,
    mensaje: rateLimits.api.message
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      mensaje: rateLimits.api.message,
      intentosRestantes: 0,
      tiempoEspera: Math.ceil(rateLimits.api.windowMs / 60000) + ' minutos'
    });
  }
});

/**
 * Rate limiter para carga de archivos
 * Previene abuso de almacenamiento
 */
const uploadLimiter = rateLimit({
  windowMs: rateLimits.upload.windowMs,
  max: rateLimits.upload.max,
  message: {
    success: false,
    mensaje: rateLimits.upload.message
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      mensaje: rateLimits.upload.message,
      intentosRestantes: 0,
      tiempoEspera: Math.ceil(rateLimits.upload.windowMs / 60000) + ' minutos'
    });
  }
});

/**
 * Rate limiter estricto para registro de usuarios
 * Previene creación masiva de cuentas falsas
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 registros por hora
  message: {
    success: false,
    mensaje: 'Demasiados intentos de registro. Intente nuevamente en 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      mensaje: 'Demasiados intentos de registro. Intente nuevamente en 1 hora.',
      intentosRestantes: 0,
      tiempoEspera: '1 hora'
    });
  }
});

/**
 * Rate limiter para recuperación de contraseña
 * Previene spam de emails de recuperación
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 intentos por hora
  message: {
    success: false,
    mensaje: 'Demasiados intentos de recuperación de contraseña. Intente nuevamente en 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      mensaje: 'Demasiados intentos de recuperación de contraseña. Intente nuevamente en 1 hora.',
      intentosRestantes: 0
    });
  }
});

/**
 * Rate limiter personalizado para endpoints específicos
 */
const createCustomLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      mensaje: message
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

module.exports = {
  loginLimiter,
  twoFactorLimiter,
  apiLimiter,
  uploadLimiter,
  registerLimiter,
  passwordResetLimiter,
  createCustomLimiter
};
