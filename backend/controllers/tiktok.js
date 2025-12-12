const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

class TikTokController {
  constructor() {
    // Almacén de posts preparados para TikTok (en memoria)
    this.preparedPosts = new Map();
    this.postIdCounter = 1;

    // Configurar transportador de email
    this.emailTransporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Enviar email con contenido de TikTok
  async sendEmailNotification(postData) {
    try {
      const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #000000 0%, #434343 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
    .caption-box { background: white; border-left: 4px solid #000; padding: 15px; margin: 20px 0; font-size: 16px; white-space: pre-wrap; }
    .steps { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .step { margin: 10px 0; padding-left: 25px; position: relative; }
    .step::before { content: "✓"; position: absolute; left: 0; color: #000; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .emoji { font-size: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="emoji">🎵</span>
      <h1>Contenido listo para TikTok</h1>
    </div>
    <div class="content">
      <h2>📱 Tu publicación está preparada</h2>
      <p>Hola! Tu contenido para TikTok está listo. Aquí está todo lo que necesitas:</p>

      <h3>📝 Caption/Descripción:</h3>
      <div class="caption-box">${postData.message}</div>

      ${postData.imageUrl ? `<p><strong>🖼️ Imagen:</strong> <a href="${postData.imageUrl}">${postData.imageUrl}</a></p>` : ''}
      ${postData.videoUrl ? `<p><strong>🎥 Video:</strong> <a href="${postData.videoUrl}">${postData.videoUrl}</a></p>` : ''}

      <div class="steps">
        <h3>📲 Pasos para publicar:</h3>
        <div class="step">Abre la app de TikTok en tu celular</div>
        <div class="step">Toca el botón "+" para crear un nuevo video</div>
        <div class="step">Selecciona o graba tu contenido</div>
        <div class="step">Copia el caption de arriba y pégalo en la descripción</div>
        <div class="step">Ajusta la configuración de privacidad si es necesario</div>
        <div class="step">¡Toca "Publicar"! 🎉</div>
      </div>

      <p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px;">
        <strong>💡 Consejo:</strong> Puedes copiar el caption directamente desde este email y pegarlo en TikTok.
      </p>
    </div>
    <div class="footer">
      <p>Fundación OncoFeliz - Sistema de Gestión de Redes Sociales</p>
      <p>Este es un email automático. Preparado el ${new Date(postData.createdAt).toLocaleString('es-ES')}</p>
    </div>
  </div>
</body>
</html>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_RECIPIENT,
        subject: `🎵 Contenido listo para TikTok - ${new Date().toLocaleDateString('es-ES')}`,
        html: emailContent,
        text: `
CONTENIDO PARA TIKTOK
=====================

📝 Caption:
${postData.message}

${postData.imageUrl ? `🖼️ Imagen: ${postData.imageUrl}\n` : ''}
${postData.videoUrl ? `🎥 Video: ${postData.videoUrl}\n` : ''}

📲 Pasos para publicar:
1. Abre TikTok en tu celular
2. Toca el botón "+" para crear
3. Selecciona tu contenido
4. Copia y pega el caption
5. ¡Publica!

Preparado el ${new Date(postData.createdAt).toLocaleString('es-ES')}
        `,
      };

      const info = await this.emailTransporter.sendMail(mailOptions);
      console.log(`[TikTok] Email enviado: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("[TikTok] Error enviando email:", error);
      return { success: false, error: error.message };
    }
  }

  // Guardar un post preparado para TikTok y enviar email
  async preparePost(req, res) {
    try {
      const { message, imageUrl, videoUrl, createdAt } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: "El mensaje/caption es requerido",
        });
      }

      const postId = this.postIdCounter++;
      const postData = {
        id: postId,
        message,
        imageUrl: imageUrl || "",
        videoUrl: videoUrl || "",
        createdAt: createdAt || new Date().toISOString(),
        status: "pending", // pending, published
        publishedAt: null,
      };

      this.preparedPosts.set(postId, postData);

      console.log(`[TikTok] Post preparado #${postId}:`, postData.message.substring(0, 50));

      // Enviar email con el contenido
      let emailResult = null;
      if (process.env.EMAIL_USER && process.env.EMAIL_RECIPIENT) {
        console.log("[TikTok] Enviando email...");
        emailResult = await this.sendEmailNotification(postData);
      } else {
        console.log("[TikTok] Email no configurado, omitiendo envío");
      }

      return res.status(201).json({
        success: true,
        message: emailResult && emailResult.success
          ? "Post preparado y email enviado"
          : "Post preparado (email no configurado)",
        postId,
        data: postData,
        emailSent: emailResult ? emailResult.success : false,
      });
    } catch (error) {
      console.error("[TikTok] Error al preparar post:", error);
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor",
        details: error.message,
      });
    }
  }

  // Obtener todos los posts preparados
  async getPreparedPosts(req, res) {
    try {
      const posts = Array.from(this.preparedPosts.values())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json({
        success: true,
        count: posts.length,
        posts,
      });
    } catch (error) {
      console.error("[TikTok] Error al obtener posts:", error);
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  }

  // Marcar un post como publicado
  async markAsPublished(req, res) {
    try {
      const { id } = req.params;
      const postId = parseInt(id);

      if (!this.preparedPosts.has(postId)) {
        return res.status(404).json({
          success: false,
          error: "Post no encontrado",
        });
      }

      const post = this.preparedPosts.get(postId);
      post.status = "published";
      post.publishedAt = new Date().toISOString();

      console.log(`[TikTok] Post #${postId} marcado como publicado`);

      return res.status(200).json({
        success: true,
        message: "Post marcado como publicado",
        post,
      });
    } catch (error) {
      console.error("[TikTok] Error:", error);
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  }

  // Eliminar un post preparado
  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const postId = parseInt(id);

      if (!this.preparedPosts.has(postId)) {
        return res.status(404).json({
          success: false,
          error: "Post no encontrado",
        });
      }

      this.preparedPosts.delete(postId);
      console.log(`[TikTok] Post #${postId} eliminado`);

      return res.status(200).json({
        success: true,
        message: "Post eliminado",
      });
    } catch (error) {
      console.error("[TikTok] Error:", error);
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  }
}

// Crear instancia del controlador
const tiktokController = new TikTokController();

// Definir rutas
router.post("/prepare", tiktokController.preparePost.bind(tiktokController));
router.get("/prepared", tiktokController.getPreparedPosts.bind(tiktokController));
router.put("/published/:id", tiktokController.markAsPublished.bind(tiktokController));
router.delete("/:id", tiktokController.deletePost.bind(tiktokController));

module.exports = router;
