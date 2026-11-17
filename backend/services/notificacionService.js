const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Mustache = require('mustache');

/**
 * Servicio para enviar notificaciones de WhatsApp mediante factura.com.bo
 * Utilizado para notificar a beneficiarios sobre el estado de su caso
 */

/**
 * Formatea el número de teléfono al formato requerido por la API
 * @param {string} telefono - Número de teléfono (puede incluir o no el prefijo +591)
 * @returns {string} - Número formateado con prefijo +591
 */
const formatearTelefono = (telefono) => {
  if (!telefono) {
    throw new Error('El número de teléfono es requerido');
  }

  // Remover espacios y caracteres especiales
  let numeroLimpio = telefono.toString().replace(/[\s\-()]/g, '');

  // Si ya tiene el prefijo +591, retornarlo
  if (numeroLimpio.startsWith('+591')) {
    return numeroLimpio;
  }

  // Si tiene 591 sin el +, agregarlo
  if (numeroLimpio.startsWith('591')) {
    return '+' + numeroLimpio;
  }

  // Si no tiene prefijo, agregarlo
  return '+591' + numeroLimpio;
};

/**
 * Genera el mensaje personalizado según el estado del caso
 * @param {string} nombre - Nombre completo del beneficiario
 * @param {string} estado - Código del template a utilizar (ej: "BIENVENIDA", "RECHAZO")
 * @returns {Promise<string>} - Mensaje formateado
 */
const generarMensaje = async (nombre, estado) => {
  try {
    const codigoTemplate = estado === 'BENEFICIARIO_ACTIVO' || estado === 'ACEPTADO'
      ? 'BIENVENIDA_BENEFICIARIO'
      : 'RECHAZO_BENEFICIARIO';

    const template = await prisma.whatsappTemplate.findUnique({
      where: { codigo: codigoTemplate },
    });

    if (!template) {
      throw new Error(`No se encontró el template de WhatsApp con código: ${codigoTemplate}`);
    }

    const datos = {
      nombre: nombre.trim(),
    };

    return Mustache.render(template.plantilla, datos);
  } catch (error) {
    console.error("Error al generar mensaje desde template:", error);
    // Fallback a un mensaje genérico en caso de error
    return `Hola ${nombre.trim()}, te informamos que ha habido una actualización en tu caso. Contacta a la fundación para más detalles.`;
  }
};

/**
 * Envía un mensaje de WhatsApp mediante la API de factura.com.bo
 * @param {string} nombre - Nombre completo del beneficiario
 * @param {string} estado - Estado del caso (BENEFICIARIO_ACTIVO o CASO_RECHAZADO)
 * @param {string} telefono - Número de teléfono del beneficiario
 * @returns {Promise<Object>} - Respuesta de la API
 */
const enviarWhatsApp = async (nombre, estado, telefono) => {
  try {
    console.log('=== NOTIFICACIÓN WHATSAPP: Iniciando envío ===');
    console.log('📱 Destinatario:', nombre);
    console.log('📊 Estado:', estado);
    console.log('📞 Teléfono original:', telefono);

    // Validar que exista el API key
    const apiKey = process.env.WHATSAPP_API_KEY;
    if (!apiKey) {
      throw new Error('WHATSAPP_API_KEY no está configurado en las variables de entorno');
    }

    // WHATSAPP_TEST_MODE=true (default) fuerza el envío a WHATSAPP_TEST_PHONE en vez
    // del teléfono real, útil para no notificar a beneficiarios reales en desarrollo.
    const testMode = process.env.WHATSAPP_TEST_MODE !== 'false';
    const telefonoFormateado = testMode
      ? (process.env.WHATSAPP_TEST_PHONE || '+59179397462')
      : formatearTelefono(telefono);

    if (testMode) {
      console.log('⚠️ MODO PRUEBA: Enviando a número de prueba:', telefonoFormateado);
      console.log('📞 (Teléfono real que se usaría en producción:', telefono + ')');
    } else {
      console.log('📞 Teléfono formateado:', telefonoFormateado);
    }

    // Generar mensaje desde la plantilla
    console.log('📝 Generando mensaje desde template...');
    const mensaje = await generarMensaje(nombre, estado);
    console.log('💬 Mensaje generado:', mensaje.substring(0, 80) + '...');

    // Preparar payload
    const payload = {
      number: telefonoFormateado,
      text: mensaje
    };

    // Agregar número de origen si está configurado
    if (process.env.WHATSAPP_FROM_NUMBER) {
      payload.from = process.env.WHATSAPP_FROM_NUMBER;
      console.log('📞 Número de origen:', payload.from);
    }

    console.log('📤 Enviando a API de factura.com.bo...');
    console.log('📋 Payload completo:', JSON.stringify(payload, null, 2));

    // Realizar petición a la API
    const response = await axios.post(
      process.env.WHATSAPP_API_URL || 'https://901.factura.com.bo/as/whatsapp/send',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        timeout: 10000 // 10 segundos de timeout
      }
    );

    console.log('✅ WhatsApp enviado exitosamente');
    console.log('📨 Respuesta API:', response.data);

    return {
      success: true,
      data: response.data,
      mensaje: 'Notificación de WhatsApp enviada correctamente'
    };

  } catch (error) {
    console.error('❌ ERROR al enviar WhatsApp:', error.message);

    // Manejar diferentes tipos de errores
    if (error.response) {
      // Error de respuesta de la API (4xx, 5xx)
      console.error('📛 Error de API:', error.response.status, error.response.data);
      return {
        success: false,
        error: 'Error en la API de WhatsApp',
        details: error.response.data,
        statusCode: error.response.status
      };
    } else if (error.request) {
      // Error de red (sin respuesta)
      console.error('🌐 Error de red: No se recibió respuesta de la API');
      return {
        success: false,
        error: 'No se pudo conectar con la API de WhatsApp',
        details: 'Timeout o error de red'
      };
    } else {
      // Error de validación u otro
      console.error('⚠️ Error de validación:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

/**
 * Envía notificación de aceptación de caso.
 * @param {Object} beneficiario - Datos del beneficiario, debe contener `nombreCompleto` y `telefono`.
 * @returns {Promise<Object>} - El resultado del envío de la notificación.
 */
const notificarAceptacion = async (beneficiario) => {
  const { nombreCompleto, telefono } = beneficiario;
  return await enviarWhatsApp(nombreCompleto, 'BENEFICIARIO_ACTIVO', telefono);
};

/**
 * Envía notificación de rechazo de caso
 * @param {Object} beneficiario - Datos del beneficiario
 * @returns {Promise<Object>}
 */
const notificarRechazo = async (beneficiario) => {
  const { nombreCompleto, telefono } = beneficiario;
  return await enviarWhatsApp(nombreCompleto, 'CASO_RECHAZADO', telefono);
};

module.exports = {
  enviarWhatsApp,
  notificarAceptacion,
  notificarRechazo,
  formatearTelefono,
  generarMensaje
};
