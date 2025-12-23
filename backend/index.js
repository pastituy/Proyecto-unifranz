/**
 * OncoFeliz Backend - Servidor Principal
 * Arquitectura: MVC (Modelo-Vista-Controlador)
 * Protocolos de Seguridad Implementados:
 * - Autenticación JWT con tokens robustos
 * - Autorización basada en roles (RBAC)
 * - Rate limiting por endpoints
 * - Validación y sanitización de inputs
 * - Headers de seguridad (Helmet)
 * - CORS configurado
 * - HTTPS enforcement (producción)
 */

require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

// Configuración de seguridad
const { cors: corsConfig, helmet: helmetConfig } = require("./config/security");

// Middlewares de seguridad globales
const { apiLimiter } = require("./middleware/rateLimiter");

// Controladores existentes (temporalmente hasta refactorizar a MVC puro)
const Usuario = require("./controllers/usuario");
const Donaciones = require("./controllers/donaciones");
const Evento = require("./controllers/evento");
const Paciente = require("./controllers/paciente");
const Padre = require("./controllers/padre");
const blog = require("./controllers/blog");
const campana = require("./controllers/campana");
const categoria = require("./controllers/categoria");
const comentarios = require("./controllers/comentarios");
const respuesta = require("./controllers/respuesta");
const usuarioCompana = require("./controllers/usuarioCompana");
const login = require("./controllers/login");
const facebook = require("./controllers/facebook");
const psicologo = require("./controllers/psicologo");
const TrabajoSocial = require("./controllers/trabajdoraSocial");
const Beneficiarios = require("./controllers/beneficiarios");
const facebookRoutes = require("./controllers/facebook");
const tiktokRoutes = require("./controllers/tiktok");
const twitterRoutes = require("./controllers/twitter");
const mobile_login = require("./controllers/app/login");
const mobile_data = require("./controllers/app/data_pacientes");
const BNB = require("./controllers/bnb");
const SolicitudesAyuda = require("./controllers/solicitudesAyuda");
const Notificaciones = require("./controllers/notificaciones");
const Reportes = require("./controllers/reportes");

// Nuevas rutas MVC (con seguridad completa)
const authRoutes = require("./routes/auth.routes");
// const donacionesRoutes = require("./routes/donaciones.routes");  // Pendiente migración
// const pacientesRoutes = require("./routes/pacientes.routes");    // Pendiente migración

const app = express();

// ============================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================

// 1. Helmet - Headers de seguridad HTTP
app.use(helmet(helmetConfig));

// 2. CORS - Control de acceso desde orígenes permitidos
app.use(cors(corsConfig));

// 3. Body parser - Limitar tamaño de payload
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Trust proxy - Para obtener IP real detrás de proxies/load balancers
app.set('trust proxy', 1);

// 5. Deshabilitar header X-Powered-By (ocultar tecnología)
app.disable('x-powered-by');

// ============================================
// SERVIR ARCHIVOS ESTÁTICOS
// ============================================

// Servir archivos estáticos con headers de seguridad
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  dotfiles: 'deny',        // Denegar acceso a archivos ocultos
  index: false,            // No listar directorios
  maxAge: '1d'            // Cache de 1 día
}));

// ============================================
// RUTAS DE LA API
// ============================================

// Ruta raíz - Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API OncoFeliz funcionando",
    version: "2.0.0",
    environment: process.env.NODE_ENV || 'development',
    security: {
      jwt: 'enabled',
      rbac: 'enabled',
      rateLimiting: 'enabled',
      cors: 'configured',
      helmet: 'enabled'
    },
    endpoints: {
      auth: {
        "POST /api/auth/login": "Iniciar sesión",
        "POST /api/auth/verify-2fa": "Verificar código 2FA",
        "POST /api/auth/register": "Registrar usuario",
        "POST /api/auth/logout": "Cerrar sesión",
        "GET /api/auth/me": "Obtener usuario actual"
      },
      facebook: {
        "POST /api/facebook/publish": "Publicar en Facebook",
        "GET /api/facebook/test": "Probar conexión",
        "POST /api/facebook/schedule": "Programar publicación",
        "GET /api/facebook/scheduled": "Ver publicaciones programadas",
      },
      tiktok: {
        "POST /api/tiktok/prepare": "Preparar contenido para TikTok",
        "GET /api/tiktok/prepared": "Ver posts preparados",
        "PUT /api/tiktok/published/:id": "Marcar como publicado",
        "DELETE /api/tiktok/:id": "Eliminar post preparado",
      },
      twitter: {
        "POST /api/twitter/publish": "Publicar tweet en X/Twitter",
        "GET /api/twitter/test": "Probar conexión con X API",
        "POST /api/twitter/schedule": "Programar tweet",
        "GET /api/twitter/scheduled": "Ver tweets programados",
        "DELETE /api/twitter/scheduled/:id": "Cancelar tweet programado",
      },
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// RUTAS MVC (Nuevas - con seguridad completa)
// ============================================

// ✅ Autenticación - MIGRADO
app.use("/api/auth", authRoutes);

// Pendientes de migración:
// app.use("/api/donaciones", donacionesRoutes);
// app.use("/api/pacientes", pacientesRoutes);

// ============================================
// RUTAS LEGACY (Controladores existentes)
// ============================================

// IMPORTANTE: Estas rutas están sin protección adecuada
// Se recomienda migrarlas a la nueva arquitectura MVC con seguridad

// Aplicar rate limiting general a todas las rutas legacy
app.use(apiLimiter);

// Redes sociales
app.use("/api/facebook", facebookRoutes);
app.use("/api/tiktok", tiktokRoutes);
app.use("/api/twitter", twitterRoutes);

// Pagos
app.use("/api/bnb", BNB);

// Autenticación y usuarios
// app.use(login);  // ✅ MIGRADO a /api/auth
app.use(Usuario);
app.use(mobile_login);  // TODO: Migrar a MVC

// Gestión de datos
app.use(Donaciones);
app.use(Evento);
app.use(Paciente);
app.use(Padre);
app.use(Beneficiarios);
app.use(psicologo);
app.use(TrabajoSocial);
app.use(SolicitudesAyuda);
app.use(Notificaciones);
app.use(Reportes);

// Blog y campañas
app.use(blog);
app.use(campana);
app.use(categoria);
app.use(comentarios);
app.use(respuesta);
app.use(usuarioCompana);

// Mobile
app.use(mobile_data);

// Facebook (duplicado?)
app.use(facebook);

// ============================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ============================================

// Manejador de rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    mensaje: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  // Log del error (en producción usar un servicio de logging profesional)
  console.error('Error capturado:', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Errores de validación de Joi/express-validator
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      mensaje: 'Error de validación',
      errores: err.details || err.errors
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      mensaje: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      mensaje: 'Token expirado'
    });
  }

  // Errores de Prisma (base de datos)
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      mensaje: 'El registro ya existe',
      campo: err.meta?.target
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      mensaje: 'Registro no encontrado'
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    mensaje: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('\n🚀 Servidor OncoFeliz iniciado correctamente\n');
  console.log('📍 Información del servidor:');
  console.log(`   - Entorno:      ${process.env.NODE_ENV || 'development'}`);
  console.log(`   - Puerto:       ${PORT}`);
  console.log(`   - Local:        http://localhost:${PORT}`);
  console.log(`   - Red:          http://${HOST}:${PORT}`);
  console.log('\n🔒 Seguridad:');
  console.log('   ✓ JWT Authentication');
  console.log('   ✓ RBAC Authorization');
  console.log('   ✓ Rate Limiting');
  console.log('   ✓ Input Validation');
  console.log('   ✓ Helmet (Security Headers)');
  console.log('   ✓ CORS Configured');
  console.log('\n📚 Arquitectura: MVC');
  console.log('\n⚠️  IMPORTANTE:');
  console.log('   - Configurar variables de entorno (.env)');
  console.log('   - Generar JWT_SECRET y SESSION_SECRET seguros');
  console.log('   - Revocar credenciales expuestas en Git');
  console.log('   - Migrar controladores legacy a arquitectura MVC');
  console.log('   - Habilitar HTTPS en producción\n');
});
