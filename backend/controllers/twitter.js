const { TwitterApi } = require('twitter-api-v2');
const express = require("express");
const schedule = require("node-schedule");
const router = express.Router();

class TwitterController {
  constructor() {
    // Cargar credenciales desde variables de entorno
    this.apiKey = process.env.TWITTER_API_KEY || '';
    this.apiSecret = process.env.TWITTER_API_SECRET || '';
    this.accessToken = process.env.TWITTER_ACCESS_TOKEN || '';
    this.accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET || '';

    // Inicializar cliente de Twitter solo si hay credenciales
    if (this.apiKey && this.apiSecret && this.accessToken && this.accessTokenSecret) {
      this.client = new TwitterApi({
        appKey: this.apiKey,
        appSecret: this.apiSecret,
        accessToken: this.accessToken,
        accessSecret: this.accessTokenSecret,
      });
      this.rwClient = this.client.readWrite;
      console.log('✅ Twitter API inicializada');
    } else {
      console.warn('⚠️ Credenciales de Twitter no configuradas en .env');
    }

    // Almacén de tweets programados (en memoria)
    this.scheduledTweets = new Map();
    this.tweetIdCounter = 1;
  }

  // Método interno para publicar en Twitter
  async sendToTwitter(data) {
    if (!this.rwClient) {
      throw new Error('Cliente de Twitter no configurado. Verifica las credenciales en .env');
    }

    const { message } = data;

    // Validar longitud del tweet (280 caracteres)
    if (message.length > 280) {
      throw new Error(`El tweet excede el límite de 280 caracteres (actual: ${message.length})`);
    }

    // Publicar tweet
    const tweet = await this.rwClient.v2.tweet(message);

    return tweet;
  }

  async publishToTwitter(req, res) {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: "El mensaje es requerido",
        });
      }

      if (message.length > 280) {
        return res.status(400).json({
          success: false,
          error: `El tweet excede el límite de 280 caracteres (actual: ${message.length})`,
        });
      }

      const result = await this.sendToTwitter({ message });

      return res.status(200).json({
        success: true,
        message: "Tweet publicado exitosamente",
        tweetId: result.data.id,
        text: result.data.text,
      });
    } catch (error) {
      console.error("Error al publicar en Twitter:", error);

      return res.status(500).json({
        success: false,
        error: "Error al publicar en Twitter",
        details: error.message,
      });
    }
  }

  async testConnection(req, res) {
    try {
      if (!this.rwClient) {
        return res.status(500).json({
          success: false,
          error: "API de Twitter no configurada",
          hint: "Agrega las credenciales de Twitter en el archivo .env"
        });
      }

      // Obtener información del usuario autenticado
      const user = await this.rwClient.v2.me();

      return res.status(200).json({
        success: true,
        message: "Conexión con Twitter exitosa",
        user: {
          id: user.data.id,
          username: user.data.username,
          name: user.data.name
        }
      });
    } catch (error) {
      console.error("Error al probar conexión con Twitter:", error);

      return res.status(500).json({
        success: false,
        error: "No se pudo conectar con Twitter",
        details: error.message,
      });
    }
  }

  // Método para tweets programados con node-schedule
  async scheduleTweet(req, res) {
    try {
      const { message, scheduleDate } = req.body;

      if (!message || !scheduleDate) {
        return res.status(400).json({
          success: false,
          error: "Mensaje y fecha de programación son requeridos",
        });
      }

      if (message.length > 280) {
        return res.status(400).json({
          success: false,
          error: `El tweet excede el límite de 280 caracteres (actual: ${message.length})`,
        });
      }

      const scheduledTime = new Date(scheduleDate);
      const now = new Date();

      if (scheduledTime <= now) {
        return res.status(400).json({
          success: false,
          error: "La fecha de programación debe ser futura",
        });
      }

      const tweetId = this.tweetIdCounter++;
      const tweetData = {
        id: tweetId,
        message,
        scheduledTime,
        status: "pending",
        createdAt: new Date(),
      };

      // Programar el tweet con node-schedule
      const job = schedule.scheduleJob(scheduledTime, async () => {
        console.log(`[${new Date().toISOString()}] Ejecutando tweet programado ID: ${tweetId}`);

        try {
          await this.sendToTwitter({ message });
          tweetData.status = "published";
          tweetData.publishedAt = new Date();
          console.log(`[${new Date().toISOString()}] Tweet ID: ${tweetId} publicado exitosamente`);
        } catch (error) {
          tweetData.status = "error";
          tweetData.error = error.message;
          console.error(`[${new Date().toISOString()}] Error en tweet ID: ${tweetId}:`, error.message);
        }
      });

      this.scheduledTweets.set(tweetId, {
        job,
        data: tweetData,
      });

      console.log(`[${new Date().toISOString()}] Tweet programado ID: ${tweetId} para ${scheduledTime.toISOString()}`);

      return res.status(200).json({
        success: true,
        message: "Tweet programado exitosamente",
        tweetId,
        scheduledFor: scheduledTime.toISOString(),
        data: {
          message: tweetData.message,
        },
      });
    } catch (error) {
      console.error("Error al programar tweet:", error);

      return res.status(500).json({
        success: false,
        error: "Error al programar tweet",
        details: error.message,
      });
    }
  }

  // Obtener lista de tweets programados
  async getScheduledTweets(req, res) {
    try {
      const tweets = [];

      this.scheduledTweets.forEach((value, key) => {
        tweets.push({
          id: key,
          message: value.data.message,
          scheduledTime: value.data.scheduledTime,
          status: value.data.status,
          createdAt: value.data.createdAt,
          publishedAt: value.data.publishedAt || null,
          error: value.data.error || null,
        });
      });

      tweets.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));

      return res.status(200).json({
        success: true,
        count: tweets.length,
        posts: tweets, // Usar "posts" para consistencia con el frontend
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Error al obtener tweets programados",
        details: error.message,
      });
    }
  }

  // Cancelar un tweet programado
  async cancelScheduledTweet(req, res) {
    try {
      const { id } = req.params;
      const tweetId = parseInt(id);

      if (!this.scheduledTweets.has(tweetId)) {
        return res.status(404).json({
          success: false,
          error: "Tweet programado no encontrado",
        });
      }

      const scheduled = this.scheduledTweets.get(tweetId);

      if (scheduled.data.status !== "pending") {
        return res.status(400).json({
          success: false,
          error: `No se puede cancelar. Estado actual: ${scheduled.data.status}`,
        });
      }

      scheduled.job.cancel();
      scheduled.data.status = "cancelled";

      console.log(`[${new Date().toISOString()}] Tweet programado ID: ${tweetId} cancelado`);

      return res.status(200).json({
        success: true,
        message: "Tweet cancelado exitosamente",
        tweetId,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Error al cancelar tweet",
        details: error.message,
      });
    }
  }
}

// Crear una instancia de la clase
const twitterController = new TwitterController();

// Definir las rutas
router.post("/publish", twitterController.publishToTwitter.bind(twitterController));
router.get("/test", twitterController.testConnection.bind(twitterController));
router.post("/schedule", twitterController.scheduleTweet.bind(twitterController));
router.get("/scheduled", twitterController.getScheduledTweets.bind(twitterController));
router.delete("/scheduled/:id", twitterController.cancelScheduledTweet.bind(twitterController));

module.exports = router;
