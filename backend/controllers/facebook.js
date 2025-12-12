const axios = require("axios");
const express = require("express");
const schedule = require("node-schedule");
const router = express.Router();

class FacebookZapierController {
  constructor() {
    this.zapierWebhookURL =
      "https://hooks.zapier.com/hooks/catch/24344172/uzglyqj/";
    // Almacén de publicaciones programadas (en memoria)
    this.scheduledPosts = new Map();
    this.postIdCounter = 1;
  }

  // Método interno para enviar a Zapier
  async sendToZapier(data) {
    const zapierData = {
      Message: data.message,
      Photo: data.photo || "",
      Link: data.link || "",
    };

    const response = await axios.post(this.zapierWebhookURL, zapierData, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    return response;
  }

  async publishToFacebook(req, res) {
    try {
      const { message, photo, imageUrl, link } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: "El mensaje es requerido",
        });
      }

      const zapierData = {
        Message: message,
        Photo: photo || imageUrl || "",
        Link: link || "",
      };

      const zapierResponse = await axios.post(
        this.zapierWebhookURL,
        zapierData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      return res.status(200).json({
        success: true,
        message: "Publicación enviada a Facebook exitosamente",
        zapierResponse: zapierResponse.data,
        data: zapierData,
      });
    } catch (error) {
      console.error("Error al publicar en Facebook via Zapier:", error);

      if (error.code === "ECONNABORTED") {
        return res.status(408).json({
          success: false,
          error: "Timeout: Zapier no respondió a tiempo",
        });
      }

      if (error.response) {
        return res.status(error.response.status).json({
          success: false,
          error: "Error en Zapier",
          details: error.response.data,
        });
      }

      return res.status(500).json({
        success: false,
        error: "Error interno del servidor",
        details: error.message,
      });
    }
  }

  async testConnection(req, res) {
    try {
      const testData = {
        test: true,
        message: "Prueba de conexión desde Express",
        timestamp: new Date().toISOString(),
      };

      const response = await axios.post(this.zapierWebhookURL, testData, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
      });

      return res.status(200).json({
        success: true,
        message: "Conexión con Zapier exitosa",
        response: response.data,
      });
    } catch (error) {
      console.error("Error al probar conexión con Zapier:", error);

      return res.status(500).json({
        success: false,
        error: "No se pudo conectar con Zapier",
        details: error.message,
      });
    }
  }

  // Método para publicaciones programadas con node-schedule
  async schedulePost(req, res) {
    try {
      const { message, photo, imageUrl, link, scheduleDate } = req.body;

      if (!message || !scheduleDate) {
        return res.status(400).json({
          success: false,
          error: "Mensaje y fecha de programación son requeridos",
        });
      }

      const scheduledTime = new Date(scheduleDate);
      const now = new Date();

      // Verificar que la fecha sea futura
      if (scheduledTime <= now) {
        return res.status(400).json({
          success: false,
          error: "La fecha de programación debe ser futura",
        });
      }

      const postId = this.postIdCounter++;
      const postData = {
        id: postId,
        message,
        photo: photo || imageUrl || "",
        link: link || "",
        scheduledTime,
        status: "pending",
        createdAt: new Date(),
      };

      // Programar el job con node-schedule
      const job = schedule.scheduleJob(scheduledTime, async () => {
        console.log(`[${new Date().toISOString()}] Ejecutando publicación programada ID: ${postId}`);

        try {
          await this.sendToZapier(postData);
          postData.status = "published";
          postData.publishedAt = new Date();
          console.log(`[${new Date().toISOString()}] Publicación ID: ${postId} enviada exitosamente`);
        } catch (error) {
          postData.status = "error";
          postData.error = error.message;
          console.error(`[${new Date().toISOString()}] Error en publicación ID: ${postId}:`, error.message);
        }
      });

      // Guardar referencia al job y datos
      this.scheduledPosts.set(postId, {
        job,
        data: postData,
      });

      console.log(`[${new Date().toISOString()}] Publicación programada ID: ${postId} para ${scheduledTime.toISOString()}`);

      return res.status(200).json({
        success: true,
        message: "Publicación programada exitosamente",
        postId,
        scheduledFor: scheduledTime.toISOString(),
        data: {
          message: postData.message,
          photo: postData.photo,
          link: postData.link,
        },
      });
    } catch (error) {
      console.error("Error al programar publicación:", error);

      return res.status(500).json({
        success: false,
        error: "Error al programar publicación",
        details: error.message,
      });
    }
  }

  // Obtener lista de publicaciones programadas
  async getScheduledPosts(req, res) {
    try {
      const posts = [];

      this.scheduledPosts.forEach((value, key) => {
        posts.push({
          id: key,
          message: value.data.message,
          photo: value.data.photo,
          link: value.data.link,
          scheduledTime: value.data.scheduledTime,
          status: value.data.status,
          createdAt: value.data.createdAt,
          publishedAt: value.data.publishedAt || null,
          error: value.data.error || null,
        });
      });

      // Ordenar por fecha programada
      posts.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));

      return res.status(200).json({
        success: true,
        count: posts.length,
        posts,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Error al obtener publicaciones programadas",
        details: error.message,
      });
    }
  }

  // Cancelar una publicación programada
  async cancelScheduledPost(req, res) {
    try {
      const { id } = req.params;
      const postId = parseInt(id);

      if (!this.scheduledPosts.has(postId)) {
        return res.status(404).json({
          success: false,
          error: "Publicación programada no encontrada",
        });
      }

      const scheduled = this.scheduledPosts.get(postId);

      // Solo cancelar si está pendiente
      if (scheduled.data.status !== "pending") {
        return res.status(400).json({
          success: false,
          error: `No se puede cancelar. Estado actual: ${scheduled.data.status}`,
        });
      }

      // Cancelar el job
      scheduled.job.cancel();
      scheduled.data.status = "cancelled";

      console.log(`[${new Date().toISOString()}] Publicación programada ID: ${postId} cancelada`);

      return res.status(200).json({
        success: true,
        message: "Publicación cancelada exitosamente",
        postId,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Error al cancelar publicación",
        details: error.message,
      });
    }
  }
}

// Crear una instancia de la clase
const facebookController = new FacebookZapierController();

// Definir las rutas
router.post("/publish", facebookController.publishToFacebook.bind(facebookController));
router.get("/test", facebookController.testConnection.bind(facebookController));
router.post("/schedule", facebookController.schedulePost.bind(facebookController));
router.get("/scheduled", facebookController.getScheduledPosts.bind(facebookController));
router.delete("/scheduled/:id", facebookController.cancelScheduledPost.bind(facebookController));

module.exports = router;
