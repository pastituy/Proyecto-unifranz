/**
 * Rutas de IA (OpenRouter)
 * Endpoints para generación de contenido con IA
 */

const express = require('express');
const router = express.Router();

// Middleware
const { authenticateToken } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// Controladores
const { generateContent, chatCancer } = require('../controllers/ai.controller');

/**
 * POST /api/ai/generate
 * Genera contenido usando IA
 * Requiere autenticación
 */
router.post('/generate',
  authenticateToken,
  apiLimiter,
  generateContent
);

/**
 * POST /api/ai/chat
 * Chat especializado en información sobre cáncer
 * Requiere autenticación
 */
router.post('/chat',
  authenticateToken,
  apiLimiter,
  chatCancer
);

module.exports = router;
