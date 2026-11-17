/**
 * Ruta pública de contacto
 * Envía el mensaje del formulario de contacto usando el SMTP del backend
 */

const express = require('express');
const router = express.Router();

const { createCustomLimiter } = require('../middleware/rateLimiter');
const { validateContacto } = require('../middleware/validator');
const { enviarContacto } = require('../controllers/contact.controller');

const contactLimiter = createCustomLimiter(
  15 * 60 * 1000, // 15 minutos
  5, // 5 mensajes por IP
  'Demasiados mensajes enviados. Intenta nuevamente en 15 minutos.'
);

/**
 * POST /api/contact
 * Envía un mensaje de contacto (público, sin autenticación)
 */
router.post('/',
  contactLimiter,
  validateContacto,
  enviarContacto
);

module.exports = router;
