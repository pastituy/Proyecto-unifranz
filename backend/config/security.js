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
    accessTokenExpiry: '15m',      // 15 minutos
    refreshTokenExpiry: '7d',       // 7 días
    issuer: 'OncoFeliz-API',
    audience: 'OncoFeliz-App'
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
      max: 100,                   // 100 requests
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
  roles: {
    ADMIN: 'admin',
    PSICOLOGO: 'psicologo',
    TRABAJADOR_SOCIAL: 'trabajador_social',
    BENEFICIARIO: 'beneficiario',
    USUARIO: 'usuario'
  },

  // Definición de permisos por rol
  permissions: {
    admin: ['*'], // Todos los permisos
    psicologo: [
      'paciente:read',
      'paciente:write',
      'evaluacion_psicologica:read',
      'evaluacion_psicologica:write'
    ],
    trabajador_social: [
      'paciente:read',
      'paciente:write',
      'evaluacion_social:read',
      'evaluacion_social:write',
      'ayuda:read',
      'ayuda:write'
    ],
    beneficiario: [
      'paciente:read_own',
      'solicitud:read_own',
      'solicitud:write'
    ],
    usuario: [
      'donacion:write',
      'evento:read',
      'blog:read'
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
    codeLength: 6,
    expiryMinutes: 10,
    maxAttempts: 3
  }
};
