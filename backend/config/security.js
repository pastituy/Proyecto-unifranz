/**
 * Configuración de Seguridad
 * Centraliza todas las configuraciones de seguridad del sistema
 */

module.exports = {
  // JWT Configuration
  jwt: {
    // Secret debe ser una cadena aleatoria de 256+ bits
    // En producción: usar variable de entorno
    secret: process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION_MIN_32_CHARS_RANDOM',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: process.env.JWT_ISSUER || 'OncoFeliz-API',
    audience: process.env.JWT_AUDIENCE || 'OncoFeliz-App'
  },

  // Password Policy
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    // Contraseñas comunes prohibidas
    blacklist: [
      'password', 'Password123', '123456789', 'qwerty',
      'admin123', 'oncofeliz', 'OncoFeliz123'
    ]
  },

  // Rate Limiting
  rateLimits: {
    // Login endpoints
    login: {
      windowMs: 15 * 60 * 1000,  // 15 minutos
      max: 5,                     // 5 intentos
      message: 'Demasiados intentos de inicio de sesión. Intente nuevamente en 15 minutos.'
    },
    // 2FA verification
    twoFactor: {
      windowMs: 15 * 60 * 1000,  // 15 minutos
      max: 3,                     // 3 intentos
      message: 'Demasiados intentos de verificación. Intente nuevamente en 15 minutos.'
    },
    // General API
    api: {
      windowMs: 15 * 60 * 1000,  // 15 minutos
      max: 200,                   // 100 requests
      message: 'Demasiadas solicitudes. Intente nuevamente más tarde.'
    },
    // File uploads
    upload: {
      windowMs: 60 * 60 * 1000,  // 1 hora
      max: 10,                    // 10 uploads
      message: 'Límite de carga de archivos alcanzado. Intente nuevamente en 1 hora.'
    }
  },

  // CORS Configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400 // 24 horas
  },

  // Helmet Configuration
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,      // 1 año
      includeSubDomains: true,
      preload: true
    }
  },

  // File Upload Security
  fileUpload: {
    maxSize: 5 * 1024 * 1024,  // 5MB
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ],
    uploadDir: './uploads',
    // Directorio seguro (fuera de public)
    secureUploadDir: './uploads/secure'
  },

  // Session Configuration
  session: {
    name: 'oncofeliz.sid',
    secret: process.env.SESSION_SECRET || 'CHANGE_THIS_SESSION_SECRET_MIN_32_CHARS',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
  },

  // Roles y Permisos
  // IMPORTANTE: estos valores deben coincidir exactamente con el enum `Rol` de prisma/schema.prisma
  roles: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMINISTRADOR',
    PSICOLOGO: 'PSICOLOGO',
    TRABAJADOR_SOCIAL: 'TRABAJADOR_SOCIAL',
    ASISTENTE: 'ASISTENTE',
    BENEFICIARIO: 'BENEFICIARIO'
  },

  // Definición de permisos por rol
  permissions: {
    SUPER_ADMIN: ['*'], // Todos los permisos, sin restricciones
    ADMINISTRADOR: [
      'caso:read',
      'caso:write',
      'usuario:read',
      'usuario:write',
      'evento:read',
      'evento:write',
      'campana:read',
      'campana:write',
      'donacion:read',
      'redes_sociales:write',
      'whatsapp_template:read',
      'whatsapp_template:write'
    ],
    PSICOLOGO: [
      'paciente:read',
      'paciente:write',
      'evaluacion_psicologica:read',
      'evaluacion_psicologica:write'
    ],
    TRABAJADOR_SOCIAL: [
      'paciente:read',
      'paciente:write',
      'evaluacion_social:read',
      'evaluacion_social:write',
      'ayuda:read',
      'ayuda:write'
    ],
    ASISTENTE: [
      'solicitud:read',
      'solicitud:write',
      'reporte:read'
    ],
    BENEFICIARIO: [
      'paciente:read_own',
      'solicitud:read_own',
      'solicitud:write'
    ]
  },

  // Encryption
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltLength: 64,
    tagLength: 16
  },

  // 2FA Configuration
  twoFactor: {
    codeLength: parseInt(process.env.TWO_FACTOR_CODE_LENGTH, 10) || 6,
    expiryMinutes: parseInt(process.env.TWO_FACTOR_EXPIRY_MINUTES, 10) || 10,
    maxAttempts: parseInt(process.env.TWO_FACTOR_MAX_ATTEMPTS, 10) || 3
  }
};
