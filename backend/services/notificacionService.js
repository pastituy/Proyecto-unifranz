const axios = require('axios');

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
 * @param {string} estado - Estado del caso (BENEFICIARIO_ACTIVO o CASO_RECHAZADO)
 * @returns {string} - Mensaje formateado
 */
const generarMensaje = (nombre, estado) => {
  const nombreCapitalizado = nombre.trim();

  if (estado === 'BENEFICIARIO_ACTIVO' || estado === 'ACEPTADO') {
    return `🎗️ *Fundación OncoFeliz*\n\n¡Hola ${nombreCapitalizado}!\n\nNos complace informarte que tu solicitud ha sido *ACEPTADA* ✅\n\nAhora eres parte de nuestra familia OncoFeliz. Pronto nos pondremos en contacto contigo para coordinar los siguientes pasos del apoyo.\n\n¡Estamos contigo en este camino! 💪💙`;
  } else if (estado === 'CASO_RECHAZADO' || estado === 'RECHAZADO') {
    return `🎗️ *Fundación OncoFeliz*\n\nHola ${nombreCapitalizado},\n\nLamentamos informarte que tu solicitud no ha podido ser aceptada en este momento ❌\n\nEsto puede deberse a diversos factores evaluados en el análisis de tu caso. Si tienes dudas o deseas más información, puedes comunicarte con nosotros.\n\nGracias por tu comprensión.\n\nFundación OncoFeliz`;
  } else {
    throw new Error(`Estado de caso no válido: ${estado}`);
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

    // TEMPORAL: Enviar siempre al número de prueba
    const telefonoFormateado = '+59179397462';
    console.log('⚠️ MODO PRUEBA: Enviando a número de prueba:', telefonoFormateado);
    console.log('📞 (Teléfono real que se usaría en producción:', telefono + ')');
    console.log('📞 Teléfono formateado:', telefonoFormateado);

    // Generar mensaje
    const mensaje = generarMensaje(nombre, estado);
    console.log('💬 Mensaje generado:', mensaje.substring(0, 50) + '...');

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
      'https://901.factura.com.bo/as/whatsapp/send',
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
 * Envía notificación de aceptación de caso
 * @param {Object} beneficiario - Datos del beneficiario
 * @returns {Promise<Object>}
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
