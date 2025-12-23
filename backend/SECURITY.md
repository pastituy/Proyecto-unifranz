# 🔒 Guía de Seguridad - OncoFeliz Backend

## Índice
1. [Protocolos de Seguridad Implementados](#protocolos-de-seguridad-implementados)
2. [Arquitectura MVC](#arquitectura-mvc)
3. [Configuración Inicial](#configuración-inicial)
4. [Autenticación y Autorización](#autenticación-y-autorización)
5. [Protección de Endpoints](#protección-de-endpoints)
6. [Mejores Prácticas](#mejores-prácticas)
7. [Migrando Controladores Legacy](#migrando-controladores-legacy)
8. [Checklist de Seguridad](#checklist-de-seguridad)

---

## Protocolos de Seguridad Implementados

### ✅ 1. Autenticación JWT Robusta
- **Secret Keys**: 256+ bits almacenados en variables de entorno
- **Access Tokens**: Corta duración (15 minutos)
- **Refresh Tokens**: Larga duración (7 días)
- **Validación**: Issuer y Audience para prevenir replay attacks

**Archivos**:
- `middleware/auth.js` - Middleware de autenticación
- `config/security.js` - Configuración de JWT

### ✅ 2. Autorización Basada en Roles (RBAC)
- **Roles**: Admin, Psicólogo, Trabajador Social, Beneficiario, Usuario
- **Permisos**: Granulares por recurso y acción
- **Ownership**: Usuarios solo acceden a sus propios datos

**Archivos**:
- `middleware/rbac.js` - Control de acceso por roles

### ✅ 3. Rate Limiting
Protección contra ataques de fuerza bruta y abuso de API:
- **Login**: 5 intentos / 15 minutos
- **2FA**: 3 intentos / 15 minutos
- **API General**: 100 requests / 15 minutos
- **Uploads**: 10 archivos / 1 hora
- **Registro**: 3 registros / 1 hora

**Archivos**:
- `middleware/rateLimiter.js` - Rate limiters configurados

### ✅ 4. Validación de Inputs
- Validación con `express-validator`
- Sanitización contra XSS
- Política estricta de contraseñas
- Validación de tipos de datos

**Archivos**:
- `middleware/validator.js` - Validadores reutilizables

### ✅ 5. Headers de Seguridad (Helmet)
- Content Security Policy (CSP)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### ✅ 6. CORS Configurado
- Whitelist de orígenes permitidos
- Credentials habilitados
- Métodos HTTP específicos

### ✅ 7. Manejo de Errores Seguro
- No expone información sensible en producción
- Logging estructurado
- Mensajes genéricos para usuarios

---

## Arquitectura MVC

```
backend/
├── config/              # Configuraciones centralizadas
│   └── security.js      # Configuración de seguridad
│
├── middleware/          # Middlewares de seguridad
│   ├── auth.js         # Autenticación JWT
│   ├── rbac.js         # Autorización por roles
│   ├── rateLimiter.js  # Rate limiting
│   └── validator.js    # Validación de inputs
│
├── routes/             # Rutas (Router layer)
│   ├── auth.routes.js
│   ├── donaciones.routes.js
│   └── pacientes.routes.js
│
├── controllers/        # Lógica de negocio
│   └── (legacy files - a refactorizar)
│
├── models/            # Modelos de datos (Prisma)
│   └── prisma/schema.prisma
│
└── index.js           # Punto de entrada con seguridad
```

### Separación de Responsabilidades

#### **Rutas** (routes/)
- Definir endpoints
- Aplicar middleware de seguridad
- Validar inputs
- Delegar a controladores

#### **Controladores** (controllers/)
- Lógica de negocio
- Interactuar con modelos
- Retornar respuestas

#### **Middleware** (middleware/)
- Autenticación
- Autorización
- Validación
- Rate limiting

---

## Configuración Inicial

### 1. Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

```bash
cp .env.example .env
```

### 2. Generar Secrets Seguros

```bash
# Generar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Configurar `.env`

```env
# Secrets (generados arriba)
JWT_SECRET="tu-secret-generado-aqui"
SESSION_SECRET="tu-secret-generado-aqui"
ENCRYPTION_KEY="tu-encryption-key-aqui"

# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/onco"

# CORS
ALLOWED_ORIGINS="http://localhost:5173,https://tu-dominio.com"

# Entorno
NODE_ENV="production"
```

### 4. Instalar Dependencias

```bash
npm install
```

### 5. Iniciar Servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

---

## Autenticación y Autorización

### Flujo de Autenticación

1. **Login**
   ```
   POST /api/auth/login
   Body: { email, password }
   → Retorna: { token, refreshToken, user }
   ```

2. **Verificación 2FA** (si está habilitado)
   ```
   POST /api/auth/verify-2fa
   Body: { email, codigo }
   → Retorna: { token, user }
   ```

3. **Uso del Token**
   ```
   Header: Authorization: Bearer <token>
   ```

### Ejemplo de Uso en Rutas

```javascript
const { authenticateToken } = require('../middleware/auth');
const { requireRole, requireAdmin } = require('../middleware/rbac');

// Ruta protegida - Solo usuarios autenticados
router.get('/protected', authenticateToken, controller.method);

// Ruta solo para admins
router.delete('/users/:id', authenticateToken, requireAdmin, controller.delete);

// Ruta para múltiples roles
router.get('/patients',
  authenticateToken,
  requireRole(['admin', 'psicologo', 'trabajador_social']),
  controller.getPatients
);
```

---

## Protección de Endpoints

### Niveles de Protección

#### 🟢 Público (Sin autenticación)
```javascript
router.post('/donaciones',
  apiLimiter,           // Rate limiting
  optionalAuth,         // Autenticación opcional
  validateDonation,     // Validación
  controller.create
);
```

#### 🟡 Autenticado (Requiere login)
```javascript
router.get('/mis-datos',
  authenticateToken,    // JWT requerido
  validateId,
  controller.getMyData
);
```

#### 🟠 Rol Específico
```javascript
router.post('/pacientes',
  authenticateToken,
  requireRole(['admin', 'trabajador_social']),
  validatePatient,
  controller.createPatient
);
```

#### 🔴 Solo Admin
```javascript
router.delete('/users/:id',
  authenticateToken,
  requireAdmin,         // Solo admin
  validateId,
  controller.deleteUser
);
```

#### 🔵 Ownership (Propios datos)
```javascript
router.put('/users/:id',
  authenticateToken,
  requireRoleOrOwnership(['admin'], 'id'), // Admin o dueño
  validateUser,
  controller.updateUser
);
```

---

## Mejores Prácticas

### 1. Nunca Exponer Secretos
❌ **MAL**:
```javascript
const SECRET_KEY = "cunu";
```

✅ **BIEN**:
```javascript
const SECRET_KEY = process.env.JWT_SECRET;
```

### 2. Validar SIEMPRE los Inputs
❌ **MAL**:
```javascript
router.post('/users', controller.create); // Sin validación
```

✅ **BIEN**:
```javascript
router.post('/users', validateUser, controller.create);
```

### 3. Aplicar Rate Limiting
❌ **MAL**:
```javascript
router.post('/login', controller.login); // Sin límite
```

✅ **BIEN**:
```javascript
router.post('/login', loginLimiter, validateLogin, controller.login);
```

### 4. Proteger Rutas Sensibles
❌ **MAL**:
```javascript
router.get('/users', controller.getAll); // Sin autenticación
```

✅ **BIEN**:
```javascript
router.get('/users', authenticateToken, requireAdmin, controller.getAll);
```

### 5. Sanitizar Outputs
```javascript
// No retornar passwords
const user = await prisma.user.findUnique({
  select: {
    id: true,
    email: true,
    nombre: true,
    // NO incluir: password
  }
});
```

---

## Migrando Controladores Legacy

### Paso 1: Refactorizar Controlador

**Antes** (`controllers/usuario.js`):
```javascript
const app = express.Router();

app.get("/usuario", async (req, res) => {
  // Lógica aquí
});

module.exports = app;
```

**Después**:
```javascript
// controllers/usuario.controller.js
const getUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.json({ success: true, data: usuarios });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: error.message });
  }
};

module.exports = { getUsuarios };
```

### Paso 2: Crear Rutas Seguras

```javascript
// routes/usuario.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { getUsuarios } = require('../controllers/usuario.controller');

router.get('/',
  authenticateToken,    // Autenticación
  requireAdmin,         // Solo admin
  getUsuarios
);

module.exports = router;
```

### Paso 3: Registrar Rutas en index.js

```javascript
// index.js
const usuarioRoutes = require('./routes/usuario.routes');
app.use('/api/usuarios', usuarioRoutes);
```

---

## Checklist de Seguridad

### Antes de Producción

- [ ] **Variables de Entorno**
  - [ ] JWT_SECRET generado (256+ bits)
  - [ ] SESSION_SECRET generado
  - [ ] ENCRYPTION_KEY generado
  - [ ] DATABASE_URL configurada
  - [ ] ALLOWED_ORIGINS configurado

- [ ] **Secretos Expuestos**
  - [ ] Eliminar `.env` del repositorio
  - [ ] Agregar `.env` al `.gitignore`
  - [ ] Revocar credenciales expuestas (Twitter, Gmail, etc.)
  - [ ] Regenerar API keys comprometidas

- [ ] **HTTPS**
  - [ ] Certificado SSL configurado
  - [ ] Redirección HTTP → HTTPS
  - [ ] HSTS headers habilitados

- [ ] **Base de Datos**
  - [ ] Password fuerte de PostgreSQL
  - [ ] Usuario específico (no postgres)
  - [ ] Conexión encriptada (SSL/TLS)

- [ ] **Rate Limiting**
  - [ ] Configurado en todos los endpoints críticos
  - [ ] Límites apropiados por endpoint

- [ ] **Logging**
  - [ ] No loggear passwords/tokens
  - [ ] Logs almacenados de forma segura
  - [ ] Rotación de logs configurada

- [ ] **Validación**
  - [ ] Todos los inputs validados
  - [ ] Sanitización contra XSS
  - [ ] Validación de archivos subidos

- [ ] **Autenticación**
  - [ ] Todos los endpoints protegidos apropiadamente
  - [ ] Tokens con expiración
  - [ ] Refresh tokens implementados

- [ ] **Autorización**
  - [ ] RBAC aplicado correctamente
  - [ ] Ownership verificado
  - [ ] Permisos por rol configurados

- [ ] **Testing**
  - [ ] Tests de seguridad ejecutados
  - [ ] Penetration testing realizado
  - [ ] Vulnerabilidades corregidas

---

## Contacto y Soporte

Para reportar vulnerabilidades de seguridad:
- **Email**: security@oncofeliz.org
- **No publicar** vulnerabilidades en issues públicos

---

## Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Helmet.js Documentation](https://helmetjs.github.io/)

---

**Última actualización**: 2025-01-22
**Versión**: 2.0.0
