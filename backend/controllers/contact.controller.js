const { enviarMensajeContacto } = require('../services/emailService');

/**
 * Recibe el formulario de contacto público y lo envía por email
 * usando el servidor SMTP ya configurado en el backend.
 * @route POST /api/contact
 */
const enviarContacto = async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;

    const enviado = await enviarMensajeContacto(nombre, email, mensaje);

    if (!enviado) {
      return res.status(500).json({
        success: false,
        mensaje: 'No se pudo enviar el mensaje. Intenta nuevamente más tarde.'
      });
    }

    return res.status(200).json({
      success: true,
      mensaje: 'Mensaje enviado correctamente'
    });
  } catch (error) {
    console.error('Error en enviarContacto:', error);
    return res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor al enviar el mensaje'
    });
  }
};

module.exports = {
  enviarContacto
};
