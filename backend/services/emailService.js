const nodemailer = require('nodemailer');

// Configuración del servicio de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Envía un código de verificación 2FA por correo electrónico
 * @param {string} email - Email del destinatario
 * @param {string} codigo - Código de verificación de 6 dígitos
 * @returns {Promise<boolean>} - True si el email se envió correctamente
 */
async function enviarCodigoVerificacion(email, codigo) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'Fundación OncoFeliz <noreply@oncofeliz.org>',
      to: email,
      subject: '🔒 Código de Verificación - Fundación OncoFeliz',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f7f6;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #FF6347 0%, #FF8C00 100%);
              padding: 30px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .code-container {
              background-color: #f8f9fa;
              border: 2px dashed #FF6347;
              border-radius: 8px;
              padding: 25px;
              margin: 30px 0;
            }
            .code {
              font-size: 42px;
              font-weight: bold;
              color: #FF6347;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .message {
              color: #666;
              font-size: 16px;
              line-height: 1.6;
              margin: 20px 0;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              text-align: left;
            }
            .warning p {
              margin: 5px 0;
              color: #856404;
              font-size: 14px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            .icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">🔐</div>
              <h1>Código de Verificación</h1>
            </div>

            <div class="content">
              <p class="message">
                Hemos recibido una solicitud de inicio de sesión en tu cuenta de administrador de
                <strong>Fundación OncoFeliz</strong>.
              </p>

              <p class="message">
                Para completar el acceso, ingresa el siguiente código de verificación:
              </p>

              <div class="code-container">
                <div class="code">${codigo}</div>
              </div>

              <p class="message">
                Este código es válido por <strong>10 minutos</strong>.
              </p>

              <div class="warning">
                <p><strong>⚠️ Seguridad:</strong></p>
                <p>• Si no intentaste iniciar sesión, ignora este correo</p>
                <p>• Nunca compartas este código con nadie</p>
                <p>• El equipo de OncoFeliz jamás te pedirá este código</p>
              </div>
            </div>

            <div class="footer">
              <p>Este es un correo automático, por favor no responder.</p>
              <p>&copy; ${new Date().getFullYear()} Fundación OncoFeliz. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Código de verificación enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error al enviar código de verificación:', error);
    return false;
  }
}

/**
 * Envía un correo de agradecimiento por la donación
 * @param {string} email - Email del donante
 * @param {string} nombreDonante - Nombre del donante
 * @param {number} monto - Monto donado
 * @returns {Promise<boolean>} - True si el email se envió correctamente
 */
async function enviarAgradecimientoDonacion(email, nombreDonante, monto) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'Fundación OncoFeliz <noreply@oncofeliz.org>',
      to: email,
      subject: '❤️ Gracias por tu Donación - Fundación OncoFeliz',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f7f6;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #FF6347 0%, #FF8C00 100%);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 600;
            }
            .header .icon {
              font-size: 60px;
              margin-bottom: 10px;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .greeting {
              font-size: 20px;
              color: #333;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .message {
              color: #666;
              font-size: 16px;
              line-height: 1.8;
              margin: 20px 0;
              text-align: left;
            }
            .amount-box {
              background: linear-gradient(135deg, #fff4f2 0%, #ffe8e5 100%);
              border: 2px solid #FF6347;
              border-radius: 12px;
              padding: 25px;
              margin: 30px 0;
            }
            .amount-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .amount-value {
              font-size: 42px;
              font-weight: bold;
              color: #FF6347;
              margin: 0;
            }
            .impact-section {
              background-color: #f8f9fa;
              border-radius: 8px;
              padding: 25px;
              margin: 30px 0;
              text-align: left;
            }
            .impact-section h3 {
              color: #FF6347;
              font-size: 18px;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .impact-list {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            .impact-list li {
              padding: 10px 0;
              padding-left: 30px;
              position: relative;
              color: #666;
              font-size: 15px;
              line-height: 1.6;
            }
            .impact-list li:before {
              content: "❤️";
              position: absolute;
              left: 0;
              top: 10px;
            }
            .signature {
              margin-top: 40px;
              padding-top: 30px;
              border-top: 2px solid #eee;
              font-size: 15px;
              color: #666;
              line-height: 1.6;
            }
            .signature strong {
              color: #FF6347;
              display: block;
              margin-top: 15px;
              font-size: 16px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 30px;
              text-align: center;
              color: #666;
              font-size: 13px;
              line-height: 1.6;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-links a {
              display: inline-block;
              margin: 0 10px;
              color: #FF6347;
              text-decoration: none;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">❤️</div>
              <h1>¡Gracias por tu Generosidad!</h1>
            </div>

            <div class="content">
              <p class="greeting">Estimado/a ${nombreDonante},</p>

              <div class="amount-box">
                <div class="amount-label">Tu Donación</div>
                <div class="amount-value">${monto} Bs</div>
              </div>

              <p class="message">
                Agradecemos de corazón a todos nuestros donantes. Su generosidad hace posible que sigamos
                apoyando a pacientes y familias que luchan contra el cáncer, brindándoles esperanza,
                atención y acompañamiento.
              </p>

              <p class="message">
                Gracias por confiar en nuestra misión y por ser parte fundamental de cada paso que damos.
                <strong style="color: #FF6347; display: block; margin-top: 10px;">
                  Su apoyo transforma vidas.
                </strong>
              </p>

              <div class="impact-section">
                <h3>Tu donación ayuda a:</h3>
                <ul class="impact-list">
                  <li>Proporcionar tratamientos médicos a niños con cáncer</li>
                  <li>Ofrecer apoyo psicológico a pacientes y familias</li>
                  <li>Brindar acompañamiento integral durante el tratamiento</li>
                  <li>Dar esperanza a quienes más lo necesitan</li>
                </ul>
              </div>

              <div class="signature">
                Cada donación, sin importar su tamaño, marca una diferencia real en la vida de nuestros
                beneficiarios. Juntos estamos construyendo un futuro más esperanzador para las familias
                afectadas por el cáncer.
                <strong>Con gratitud infinita,<br>Fundación OncoFeliz</strong>
              </div>
            </div>

            <div class="footer">
              <p>Este es un correo automático de confirmación de donación.</p>
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              <div class="social-links">
                <a href="#">Facebook</a> |
                <a href="#">Instagram</a> |
                <a href="#">Website</a>
              </div>
              <p>&copy; ${new Date().getFullYear()} Fundación OncoFeliz. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo de agradecimiento enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error al enviar correo de agradecimiento:', error);
    return false;
  }
}

module.exports = {
  enviarCodigoVerificacion,
  enviarAgradecimientoDonacion
};
