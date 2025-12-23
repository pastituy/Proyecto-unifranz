/**
 * Controlador de IA (OpenRouter)
 * Maneja las peticiones a servicios de IA para generación de contenido
 */

const { callOpenRouter } = require('../services/openRouterService');

/**
 * Genera contenido usando OpenRouter AI
 * @route POST /api/ai/generate
 */
const generateContent = async (req, res) => {
  try {
    const { messages, model = "moonshotai/kimi-k2" } = req.body;

    // Validar que se envíen mensajes
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        mensaje: "Se requiere un array de mensajes"
      });
    }

    try {
      const { ok, status, data } = await callOpenRouter({
        model,
        messages,
        max_tokens: 1200,
        xTitle: 'OncoFeliz - Fundación'
      });

      if (!ok) {
        if (status === 401) {
          return res.status(503).json({
            success: false,
            mensaje: "La API key de IA expiró o es inválida. Contacta al administrador.",
            error: "API_KEY_INVALID"
          });
        }

        if (status === 429) {
          return res.status(429).json({
            success: false,
            mensaje: "Demasiadas peticiones. Intenta nuevamente en unos minutos.",
            error: "RATE_LIMIT"
          });
        }

        return res.status(status).json({
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
    req.body.model = "moonshotai/kimi-k2";

    return await generateContent(req, res);

  } catch (error) {
    console.error("Error en chatCancer:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error al procesar la pregunta"
    });
  }
};

const completion = async (req, res) => {
  try {
    const { model, messages, stream, max_tokens } = req.body;

    // 1. Validación de Entrada
    if (!model || !messages) {
      return res.status(400).json({
        success: false,
        error: "Los parámetros 'model' y 'messages' son requeridos."
      });
    }

    const { ok, status, data } = await callOpenRouter({
      model,
      messages,
      max_tokens: max_tokens || 1024,
      xTitle: 'Baneco Chatbot'
    });

    if (!ok) {
      return res.status(status).json({
        success: false,
        error: `Error del servicio de IA: ${data.error?.message || 'Unknown error'}`,
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Error en el controlador de completion:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor."
    });
  }
};

module.exports = {
  generateContent,
  chatCancer,
  completion
};
