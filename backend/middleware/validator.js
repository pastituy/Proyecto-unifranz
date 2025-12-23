/**
 * Middleware de Validación de Inputs
 * Valida y sanitiza datos de entrada para prevenir inyecciones
 */

const { body, param, query, validationResult } = require('express-validator');
const { password: passwordPolicy } = require('../config/security');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      mensaje: 'Errores de validación',
      errores: errors.array().map(err => ({
        campo: err.path || err.param,
        mensaje: err.msg,
        valor: err.value
      }))
    });
  }

  next();
};

/**
 * Validaciones para Login
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),

  handleValidationErrors
];

/**
 * Validaciones para Registro de Usuario
 */
const validateRegister = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),

  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('El email es demasiado largo'),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: passwordPolicy.minLength })
    .withMessage(`La contraseña debe tener al menos ${passwordPolicy.minLength} caracteres`)
    .custom((value) => {
      // Validar política de contraseñas
      if (passwordPolicy.requireUppercase && !/[A-Z]/.test(value)) {
        throw new Error('La contraseña debe contener al menos una letra mayúscula');
      }
      if (passwordPolicy.requireLowercase && !/[a-z]/.test(value)) {
        throw new Error('La contraseña debe contener al menos una letra minúscula');
      }
      if (passwordPolicy.requireNumbers && !/\d/.test(value)) {
        throw new Error('La contraseña debe contener al menos un número');
      }
      if (passwordPolicy.requireSpecialChars) {
        const specialChars = passwordPolicy.specialChars;
        const regex = new RegExp(`[${specialChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`);
        if (!regex.test(value)) {
          throw new Error('La contraseña debe contener al menos un carácter especial');
        }
      }
      // Verificar contraseñas en blacklist
      if (passwordPolicy.blacklist.some(banned => value.toLowerCase().includes(banned.toLowerCase()))) {
        throw new Error('La contraseña es demasiado común. Use una más segura');
      }
      return true;
    }),

  body('telefono')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-()]{7,20}$/).withMessage('Formato de teléfono inválido'),

  handleValidationErrors
];

/**
 * Validaciones para Donaciones
 */
const validateDonation = [
  body('monto')
    .notEmpty().withMessage('El monto es requerido')
    .isFloat({ min: 1 }).withMessage('El monto debe ser mayor a 0')
    .toFloat(),

  body('metodoPago')
    .notEmpty().withMessage('El método de pago es requerido')
    .isIn(['QR', 'transferencia', 'efectivo', 'tarjeta']).withMessage('Método de pago inválido'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('nombre')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('El nombre es demasiado largo')
    .escape(),

  body('mensaje')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('El mensaje es demasiado largo')
    .escape(),

  handleValidationErrors
];

/**
 * Validaciones para Paciente
 */
const validatePatient = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),

  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo puede contener letras'),

  body('ci')
    .trim()
    .notEmpty().withMessage('El CI es requerido')
    .matches(/^[\d-]+$/).withMessage('El CI solo puede contener números y guiones')
    .isLength({ min: 5, max: 20 }).withMessage('El CI debe tener entre 5 y 20 caracteres'),

  body('fechaNacimiento')
    .notEmpty().withMessage('La fecha de nacimiento es requerida')
    .isISO8601().withMessage('Formato de fecha inválido')
    .toDate()
    .custom((value) => {
      const today = new Date();
      const birthDate = new Date(value);
      if (birthDate > today) {
        throw new Error('La fecha de nacimiento no puede ser futura');
      }
      return true;
    }),

  body('telefono')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-()]{7,20}$/).withMessage('Formato de teléfono inválido'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),

  handleValidationErrors
];

/**
 * Validaciones para Evento
 */
const validateEvent = [
  body('titulo')
    .trim()
    .notEmpty().withMessage('El título es requerido')
    .isLength({ min: 5, max: 200 }).withMessage('El título debe tener entre 5 y 200 caracteres'),

  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 2000 }).withMessage('La descripción debe tener entre 10 y 2000 caracteres'),

  body('fecha')
    .notEmpty().withMessage('La fecha es requerida')
    .isISO8601().withMessage('Formato de fecha inválido')
    .toDate()
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(value);
      eventDate.setHours(0, 0, 0, 0);
      if (eventDate < today) {
        throw new Error('La fecha del evento no puede ser pasada');
      }
      return true;
    }),

  body('lugar')
    .trim()
    .notEmpty().withMessage('El lugar es requerido')
    .isLength({ min: 3, max: 200 }).withMessage('El lugar debe tener entre 3 y 200 caracteres'),

  handleValidationErrors
];

/**
 * Validación de ID en parámetros
 */
const validateId = [
  param('id')
    .notEmpty().withMessage('El ID es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    .toInt(),

  handleValidationErrors
];

/**
 * Validación de código 2FA
 */
const validate2FACode = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('codigo')
    .notEmpty().withMessage('El código es requerido')
    .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos')
    .isNumeric().withMessage('El código debe ser numérico'),

  handleValidationErrors
];

/**
 * Validación de archivo subido
 */
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      mensaje: 'No se ha proporcionado ningún archivo'
    });
  }

  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      mensaje: 'Tipo de archivo no permitido. Solo se permiten PDF, JPG y PNG'
    });
  }

  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      mensaje: 'El archivo es demasiado grande. Tamaño máximo: 5MB'
    });
  }

  next();
};

/**
 * Validación para búsqueda (query params)
 */
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('El término de búsqueda es demasiado largo')
    .escape(),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un número entero positivo')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100')
    .toInt(),

  handleValidationErrors
];

/**
 * Sanitización general para prevenir XSS
 */
const sanitizeBody = (fields) => {
  return fields.map(field =>
    body(field).trim().escape()
  );
};

module.exports = {
  handleValidationErrors,
  validateLogin,
  validateRegister,
  validateDonation,
  validatePatient,
  validateEvent,
  validateId,
  validate2FACode,
  validateFileUpload,
  validateSearch,
  sanitizeBody
};
