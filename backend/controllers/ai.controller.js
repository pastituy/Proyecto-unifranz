/**
 * Controlador de IA (OpenRouter)
 * Maneja las peticiones a servicios de IA para generación de contenido
 */

const fetch = require('node-fetch');

/**
 * Genera contenido usando OpenRouter AI
 * @route POST /api/ai/generate
 */
const generateContent = async (req, res) => {
  try {
    const { messages, model = "anthropic/claude-3.5-sonnet" } = req.body;

    // Validar que se envíen mensajes
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        mensaje: "Se requiere un array de mensajes"
      });
    }

    // Verificar que la API key esté configurada
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY no está configurada en .env");
      return res.status(500).json({
        success: false,
        mensaje: "Servicio de IA no configurado. Contacta al administrador."
      });
    }

    // Llamar a OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.ALLOWED_ORIGINS?.split(',')[0] || "http://localhost:5173",
        "X-Title": "OncoFeliz - Fundación"
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1200
      })
    });

    const data = await response.json();

    // Si hay error de OpenRouter
    if (!response.ok) {
      console.error("Error de OpenRouter:", data);

      // Error 401 - API key inválida o expirada
      if (response.status === 401) {
        return res.status(503).json({
          success: false,
          mensaje: "La API key de IA expiró o es inválida. Contacta al administrador.",
          error: "API_KEY_INVALID"
        });
      }

      // Error 429 - Rate limit excedido
      if (response.status === 429) {
        return res.status(429).json({
          success: false,
          mensaje: "Demasiadas peticiones. Intenta nuevamente en unos minutos.",
          error: "RATE_LIMIT"
        });
      }

      return res.status(response.status).json({
        success: false,
        mensaje: data.error?.message || "Error al generar contenido",
        error: data.error
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      data: {
        content: data.choices[0]?.message?.content || "",
        model: data.model,
        usage: data.usage
      }
    });

  } catch (error) {
    console.error("Error en generateContent:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor al generar contenido"
    });
  }
};

/**
 * Genera chat de noticias sobre cáncer
 * @route POST /api/ai/chat
 */
const chatCancer = async (req, res) => {
  try {
    const { question, conversationHistory = [] } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({
        success: false,
        mensaje: "La pregunta es requerida"
      });
    }

    // Construir mensajes para el chat
    const messages = [
      {
        role: "system",
        content: `Eres un asistente experto en información sobre cáncer y oncología.
Tu objetivo es proporcionar información precisa, actualizada y comprensible sobre:
- Tipos de cáncer
- Tratamientos oncológicos
- Prevención y detección temprana
- Apoyo psicológico para pacientes
- Nutrición durante el tratamiento
- Efectos secundarios y su manejo

IMPORTANTE:
- Proporciona información educativa, no diagnósticos médicos
- Recomienda consultar con profesionales de salud para casos específicos
- Sé empático y comprensivo
- Usa lenguaje claro y accesible
- Cita fuentes confiables cuando sea posible`
      },
      ...conversationHistory,
      {
        role: "user",
        content: question
      }
    ];

    // Reutilizar la función de generación
    req.body.messages = messages;
    req.body.model = "anthropic/claude-3.5-sonnet";

    return await generateContent(req, res);

  } catch (error) {
    console.error("Error en chatCancer:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error al procesar la pregunta"
    });
  }
};

module.exports = {
  generateContent,
  chatCancer
};
