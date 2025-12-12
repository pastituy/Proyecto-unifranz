const { Router } = require("express");
const axios = require("axios");
const QRCode = require("qrcode");

const router = Router();

// Configuración BNB desde variables de entorno
const BNB_BASE_URL = "https://www.bnb.com.bo";
const BNB_ACCOUNT_ID = process.env.BNB_ACCOUNT_ID;
const BNB_AUTHORIZATION_ID = process.env.BNB_AUTHORIZATION_ID;

// Modo de desarrollo: simular BNB si no hay credenciales
const DEV_MODE = !BNB_ACCOUNT_ID || BNB_ACCOUNT_ID === 'tu_account_id_aqui' ||
                 !BNB_AUTHORIZATION_ID || BNB_AUTHORIZATION_ID === 'tu_authorization_id_aqui';

// Variable para almacenar el token de autenticación
let authToken = null;
let tokenExpiration = null;

// Almacenar QRs simulados en desarrollo
const simulatedQRs = new Map();

/**
 * Obtener token de autenticación del BNB
 */
async function getBNBToken() {
  try {
    // Si tenemos un token válido, retornarlo
    if (authToken && tokenExpiration && new Date() < tokenExpiration) {
      return authToken;
    }

    console.log("[BNB] Generando nuevo token de autenticación...");

    const response = await axios.post(
      `${BNB_BASE_URL}/api/v1/auth/token`,
      {
        accountId: BNB_ACCOUNT_ID,
        authorizationId: BNB_AUTHORIZATION_ID,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.token) {
      authToken = response.data.token;
      // Asumir que el token expira en 1 hora (ajustar según BNB)
      tokenExpiration = new Date(Date.now() + 60 * 60 * 1000);
      console.log("[BNB] Token generado exitosamente");
      return authToken;
    } else {
      throw new Error("No se recibió token del BNB");
    }
  } catch (error) {
    console.error("[BNB] Error al obtener token:", error.response?.data || error.message);
    throw new Error("Error al autenticar con BNB: " + (error.response?.data?.message || error.message));
  }
}

/**
 * POST /api/bnb/generate-qr
 * Genera un código QR para pagos usando el BNB
 */
router.post("/generate-qr", async (req, res) => {
  try {
    const { amount, donor, description } = req.body;

    // Validar parámetros requeridos
    if (!amount || !donor) {
      return res.status(400).json({
        success: false,
        message: "Faltan parámetros requeridos: amount, donor",
      });
    }

    // Generar ID de transacción único
    const txId = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // MODO DESARROLLO: Simular BNB sin credenciales
    if (DEV_MODE) {
      console.log("[BNB DEV MODE] Simulando generación de QR...");

      const qrId = `QR-DEV-${Date.now()}`;
      const expirationDate = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      // Datos que irán en el QR
      const qrPayload = {
        qrId: qrId,
        transactionId: txId,
        amount: parseFloat(amount),
        currency: 'BOB',
        donor: donor,
        description: description || `Donación de ${donor}`,
        timestamp: new Date().toISOString(),
        bank: 'BNB (Simulado)',
        type: 'donation'
      };

      // Generar QR local con los datos
      const qrDataString = JSON.stringify(qrPayload);
      const qrImageDataUrl = await QRCode.toDataURL(qrDataString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Guardar QR simulado con estado pendiente
      simulatedQRs.set(qrId, {
        qrId: qrId,
        transactionId: txId,
        statusId: 1, // 1 = Pendiente
        amount: parseFloat(amount),
        donor: donor,
        expirationDate: expirationDate,
        createdAt: new Date().toISOString()
      });

      // Convertir data URL a base64 puro
      const base64Image = qrImageDataUrl.replace(/^data:image\/png;base64,/, '');

      console.log("[BNB DEV MODE] QR simulado generado:", qrId);

      return res.status(200).json({
        success: true,
        data: {
          qrId: qrId,
          qrImage: base64Image,
          transactionId: txId,
          expirationDate: expirationDate,
          amount: amount,
          donor: donor,
        },
        message: "QR generado exitosamente (MODO DESARROLLO)",
      });
    }

    // MODO PRODUCCIÓN: Usar API real del BNB
    // Obtener token de autenticación
    const token = await getBNBToken();

    // Preparar datos para el QR
    const qrData = {
      currency: "BOB", // Bolivianos
      gloss: description || `Donación de ${donor}`,
      amount: parseFloat(amount),
      singleUse: true, // QR de un solo uso
      expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      additionalData: JSON.stringify({
        transactionId: txId,
        donor: donor,
        type: "donation",
        timestamp: new Date().toISOString(),
      }),
      destinationAccountId: BNB_ACCOUNT_ID,
    };

    console.log("[BNB] Generando QR con datos:", qrData);

    // Llamar a la API del BNB para generar el QR
    const response = await axios.post(
      `${BNB_BASE_URL}/api/v1/main/getQRWithImageAsync`,
      qrData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.success) {
      console.log("[BNB] QR generado exitosamente, ID:", response.data.id);

      return res.status(200).json({
        success: true,
        data: {
          qrId: response.data.id,
          qrImage: response.data.qr, // Base64 image
          transactionId: txId,
          expirationDate: qrData.expirationDate,
          amount: amount,
          donor: donor,
        },
        message: "QR generado exitosamente",
      });
    } else {
      throw new Error(response.data?.message || "Error al generar QR");
    }
  } catch (error) {
    console.error("[BNB] Error al generar QR:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Error al generar código QR: " + (error.response?.data?.message || error.message),
    });
  }
});

/**
 * GET /api/bnb/check-status/:qrId
 * Verifica el estado de un pago QR
 */
router.get("/check-status/:qrId", async (req, res) => {
  try {
    const { qrId } = req.params;

    if (!qrId) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el ID del QR",
      });
    }

    // MODO DESARROLLO: Verificar QR simulado
    if (DEV_MODE) {
      console.log("[BNB DEV MODE] Verificando estado del QR simulado:", qrId);

      const qrData = simulatedQRs.get(qrId);

      if (!qrData) {
        return res.status(404).json({
          success: false,
          message: "QR no encontrado",
        });
      }

      // Verificar si expiró
      const now = new Date();
      const expiration = new Date(qrData.expirationDate);
      if (now > expiration) {
        qrData.statusId = 3; // Expirado
        simulatedQRs.set(qrId, qrData);
      }

      let status = "pending";
      let paid = false;

      if (qrData.statusId === 2) {
        status = "paid";
        paid = true;
      } else if (qrData.statusId === 3) {
        status = "expired";
      }

      console.log("[BNB DEV MODE] Estado del QR:", status);

      return res.status(200).json({
        success: true,
        data: {
          qrId: qrData.qrId,
          status: status,
          paid: paid,
          statusId: qrData.statusId,
          voucherId: qrData.voucherId || null,
          expirationDate: qrData.expirationDate,
        },
      });
    }

    // MODO PRODUCCIÓN: Usar API real del BNB
    // Obtener token de autenticación
    const token = await getBNBToken();

    console.log("[BNB] Verificando estado del QR:", qrId);

    // Llamar a la API del BNB para verificar el estado
    const response = await axios.post(
      `${BNB_BASE_URL}/api/v1/main/getQRStatusAsync`,
      { qrId: qrId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data) {
      console.log("[BNB] Estado del QR:", response.data);

      // statusId: 1 = Pendiente, 2 = Pagado, 3 = Expirado
      let status = "pending";
      let paid = false;

      if (response.data.statusId === 2) {
        status = "paid";
        paid = true;
      } else if (response.data.statusId === 3) {
        status = "expired";
      }

      return res.status(200).json({
        success: true,
        data: {
          qrId: response.data.id,
          status: status,
          paid: paid,
          statusId: response.data.statusId,
          voucherId: response.data.voucherId,
          expirationDate: response.data.expirationDate,
        },
      });
    } else {
      throw new Error("No se recibió respuesta del BNB");
    }
  } catch (error) {
    console.error("[BNB] Error al verificar estado:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Error al verificar estado del pago: " + (error.response?.data?.message || error.message),
    });
  }
});

/**
 * POST /api/bnb/webhook
 * Webhook para recibir notificaciones de pago del BNB
 */
router.post("/webhook", async (req, res) => {
  try {
    const notification = req.body;
    console.log("[BNB Webhook] Notificación recibida:", notification);

    // Extraer información de la notificación
    const {
      QRId,
      Gloss,
      sourceBankId,
      originName,
      VoucherId,
      TransactionDateTime,
    } = notification;

    // Aquí puedes:
    // 1. Actualizar el estado del pago en tu base de datos
    // 2. Enviar notificaciones al frontend (usando WebSockets, Server-Sent Events, etc.)
    // 3. Enviar email de confirmación al donante
    // 4. Disparar eventos para otros procesos

    // Por ahora solo registramos la notificación
    console.log("[BNB Webhook] Pago confirmado:", {
      qrId: QRId,
      voucherId: VoucherId,
      donor: originName,
      date: TransactionDateTime,
    });

    // Emitir evento global para que el frontend lo escuche
    // (En producción, usar WebSockets o similar)
    global.paymentNotifications = global.paymentNotifications || [];
    global.paymentNotifications.push({
      qrId: QRId,
      voucherId: VoucherId,
      donor: originName,
      timestamp: new Date().toISOString(),
    });

    // Responder al BNB que recibimos la notificación
    return res.status(200).json({
      success: true,
      message: "Notificación recibida correctamente",
    });
  } catch (error) {
    console.error("[BNB Webhook] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar notificación",
    });
  }
});

/**
 * GET /api/bnb/pending-notifications
 * Endpoint para que el frontend consulte notificaciones pendientes
 */
router.get("/pending-notifications", (req, res) => {
  try {
    const notifications = global.paymentNotifications || [];
    // Limpiar notificaciones después de enviarlas
    global.paymentNotifications = [];

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("[BNB] Error al obtener notificaciones:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener notificaciones",
    });
  }
});

/**
 * POST /api/bnb/simulate-payment/:qrId
 * SOLO MODO DESARROLLO: Simula un pago exitoso
 */
router.post("/simulate-payment/:qrId", async (req, res) => {
  try {
    if (!DEV_MODE) {
      return res.status(403).json({
        success: false,
        message: "Este endpoint solo está disponible en modo desarrollo",
      });
    }

    const { qrId } = req.params;
    const { success = true } = req.body; // Por defecto simula éxito

    console.log("[BNB DEV MODE] Simulando pago para QR:", qrId, success ? "EXITOSO" : "FALLIDO");

    const qrData = simulatedQRs.get(qrId);

    if (!qrData) {
      return res.status(404).json({
        success: false,
        message: "QR no encontrado",
      });
    }

    // Actualizar estado del QR
    if (success) {
      qrData.statusId = 2; // Pagado
      qrData.voucherId = `VOUCHER-DEV-${Date.now()}`;
      qrData.paidAt = new Date().toISOString();
    } else {
      qrData.statusId = 3; // Rechazado/Expirado
    }

    simulatedQRs.set(qrId, qrData);

    console.log("[BNB DEV MODE] Pago simulado exitosamente");

    return res.status(200).json({
      success: true,
      data: {
        qrId: qrData.qrId,
        statusId: qrData.statusId,
        voucherId: qrData.voucherId,
        message: success ? "Pago simulado exitosamente" : "Pago rechazado (simulado)",
      },
    });
  } catch (error) {
    console.error("[BNB DEV MODE] Error al simular pago:", error);
    return res.status(500).json({
      success: false,
      message: "Error al simular pago",
    });
  }
});

/**
 * GET /api/bnb/dev-info
 * Muestra información sobre el modo de desarrollo
 */
router.get("/dev-info", (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      devMode: DEV_MODE,
      message: DEV_MODE
        ? "⚠️ MODO DESARROLLO ACTIVO - Los QR se simulan localmente"
        : "✅ MODO PRODUCCIÓN - Usando API real del BNB",
      hasCredentials: !!(BNB_ACCOUNT_ID && BNB_AUTHORIZATION_ID),
      simulatedQRsCount: simulatedQRs.size,
      endpoints: {
        generateQR: "POST /api/bnb/generate-qr",
        checkStatus: "GET /api/bnb/check-status/:qrId",
        simulatePayment: DEV_MODE ? "POST /api/bnb/simulate-payment/:qrId (solo dev)" : "No disponible",
      }
    },
  });
});

module.exports = router;
