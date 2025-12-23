# 🏗️ Arquitectura Backend - OncoFeliz

## 📋 Resumen

Backend de OncoFeliz implementado con **arquitectura MVC** y **protocolos de seguridad profesionales**.

### Stack Tecnológico
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Seguridad**: Helmet, CORS, Rate Limiting, Express Validator

---

## 📁 Estructura de Directorios

```
backend/
│
├── config/                      # Configuraciones centralizadas
│   └── security.js             # Configuración de seguridad (JWT, CORS, etc.)
│
├── middleware/                  # Middlewares de seguridad
│   ├── auth.js                 # Autenticación JWT
│   ├── rbac.js                 # Autorización basada en roles
│   ├── rateLimiter.js          # Rate limiting por endpoints
│   └── validator.js            # Validación de inputs
│
├── routes/                      # Rutas MVC (ejemplos implementados)
│   ├── auth.routes.js          # Rutas de autenticación
│   ├── donaciones.routes.js    # Rutas de donaciones
│   └── pacientes.routes.js     # Rutas de pacientes
│
├── controllers/                 # Controladores (lógica de negocio)
│   ├── login.js                # Autenticación
│   ├── usuario.js              # Gestión de usuarios
│   ├── donaciones.js           # Gestión de donaciones
│   ├── paciente.js             # Gestión de pacientes
│   ├── beneficiarios.js        # Gestión de beneficiarios
│   ├── psicologo.js            # Módulo psicológico
│   ├── trabajdoraSocial.js     # Módulo trabajo social
│   └── ... (otros módulos)
│
├── prisma/                      # Configuración de Prisma ORM
│   ├── schema.prisma           # Esquema de base de datos
│   └── migrations/             # Migraciones de BD
│
├── uploads/                     # Archivos subidos
│   ├── informes/               # Informes PDF
│   └── secure/                 # Archivos protegidos
│
├── utils/                       # Utilidades
│
├── services/                    # Servicios externos
│
├── .env.example                # Plantilla de variables de entorno
├── .gitignore                  # Archivos ignorados por Git
├── index.js                    # Punto de entrada del servidor
├── package.json                # Dependencias
│
└── DOCS/                       # Documentación
    ├── SECURITY.md             # Guía completa de seguridad
    ├── QUICKSTART_SECURITY.md  # Inicio rápido
    └── README_ARCHITECTURE.md  # Este archivo
```

---

## 🔄 Flujo de Request (Arquitectura MVC)

```
┌─────────────────┐
│   Cliente       │
│  (Frontend)     │
└────────┬────────┘
         │ HTTP Request
         ▼
┌─────────────────────────────────────────┐
│         SERVIDOR EXPRESS                │
├─────────────────────────────────────────┤
│  1. Middleware Global                   │
│     - Helmet (headers seguridad)        │
│     - CORS                              │
│     - Body parser                       │
│     - Rate limiting (general)           │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  2. RUTAS (routes/)                     │
│     - Definir endpoint                  │
│     - Aplicar middleware específico     │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  3. MIDDLEWARE DE SEGURIDAD             │
│     a. Rate Limiting (por endpoint)     │
│     b. Autenticación (JWT)              │
│     c. Autorización (RBAC)              │
│     d. Validación (express-validator)   │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  4. CONTROLADOR (controllers/)          │
│     - Lógica de negocio                 │
│     - Interacción con servicios         │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  5. MODELO (Prisma ORM)                 │
│     - Consultas a base de datos         │
│     - Validaciones de esquema           │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  6. BASE DE DATOS (PostgreSQL)          │
└─────────────────────────────────────────┘
         │
         ▼ Response
┌─────────────────┐
│   Cliente       │
│  (Frontend)     │
└─────────────────┘
```

---

## 🔐 Capas de Seguridad

### 1. **Headers HTTP** (Helmet)
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

### 2. **CORS**
- Whitelist de orígenes
- Credentials habilitados
- Métodos específicos

### 3. **Rate Limiting**
- Por IP
- Por usuario autenticado
- Límites personalizados por endpoint

### 4. **Autenticación**
- JWT con secrets robustos
- Access tokens (15 min)
- Refresh tokens (7 días)

### 5. **Autorización**
- RBAC (5 roles)
- Permisos granulares
- Verificación de ownership

### 6. **Validación**
- Express Validator
- Sanitización anti-XSS
- Política de contraseñas

---

## 👥 Roles y Permisos

### Jerarquía de Roles

```
┌─────────────────────────────────────────┐
│          ADMIN (Superusuario)           │
│  - Acceso completo                      │
│  - Gestión de usuarios                  │
│  - Configuración del sistema            │
└─────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼──────┐      ┌───────▼──────────┐
│  PSICÓLOGO   │      │ TRABAJADOR SOCIAL│
│  - Pacientes │      │  - Pacientes     │
│  - Eval Psic │      │  - Eval Social   │
└──────────────┘      │  - Ayudas        │
                      └──────────────────┘
                               │
                      ┌────────▼──────────┐
                      │   BENEFICIARIO    │
                      │  - Solo sus datos │
                      │  - Solicitudes    │
                      └───────────────────┘
                               │
                      ┌────────▼──────────┐
                      │     USUARIO       │
                      │  - Donaciones     │
                      │  - Eventos        │
                      └───────────────────┘
```

### Matriz de Permisos

| Recurso | Admin | Psicólogo | Trabajador Social | Beneficiario | Usuario |
|---------|-------|-----------|-------------------|--------------|---------|
| Usuarios | CRUD | - | - | Read (own) | - |
| Pacientes | CRUD | Read/Update (assigned) | CRUD | Read (own) | - |
| Eval. Psicológica | CRUD | CRUD (assigned) | Read | Read (own) | - |
| Eval. Social | CRUD | Read | CRUD (assigned) | Read (own) | - |
| Solicitudes Ayuda | CRUD | Read | CRUD | CRUD (own) | - |
| Donaciones | CRUD | - | - | Read (own) | Create/Read (own) |
| Eventos | CRUD | Read | Read | Read | Read |
| Blog | CRUD | - | - | - | Read |

---

## 🚀 Endpoints Principales

### Autenticación (`/api/auth`)
```
POST   /login           - Iniciar sesión
POST   /verify-2fa      - Verificar código 2FA
POST   /register        - Registrar usuario
POST   /logout          - Cerrar sesión
GET    /me              - Usuario actual
POST   /refresh-token   - Renovar token
```

### Usuarios (`/api/usuarios`)
```
GET    /                - Listar usuarios (admin)
GET    /:id             - Obtener usuario (admin o owner)
POST   /                - Crear usuario (admin)
PUT    /:id             - Actualizar usuario (admin o owner)
DELETE /:id             - Eliminar usuario (admin)
```

### Pacientes (`/api/pacientes`)
```
GET    /                - Listar pacientes (profesionales)
GET    /:id             - Obtener paciente (profesionales o owner)
POST   /                - Crear paciente (admin, trabajador social)
PUT    /:id             - Actualizar paciente (profesionales o owner)
DELETE /:id             - Eliminar paciente (admin)
```

### Donaciones (`/api/donaciones`)
```
GET    /                - Listar todas (admin)
GET    /mis-donaciones  - Mis donaciones (autenticado)
POST   /                - Crear donación (público/autenticado)
GET    /stats           - Estadísticas públicas
```

---

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
# Seguridad
JWT_SECRET=<secret-256-bits>
SESSION_SECRET=<secret-256-bits>
ENCRYPTION_KEY=<key-256-bits>

# Base de Datos
DATABASE_URL=<postgresql-connection-string>

# CORS
ALLOWED_ORIGINS=<comma-separated-origins>

# Entorno
NODE_ENV=<development|production>

# Servidor
PORT=3000
HOST=0.0.0.0
```

Ver [.env.example](/.env.example) para todas las variables.

---

## 📦 Dependencias Principales

### Producción
```json
{
  "express": "^4.21.2",          // Framework web
  "jsonwebtoken": "^9.0.2",      // Autenticación JWT
  "bcrypt": "^5.1.1",            // Encriptación passwords
  "helmet": "latest",            // Security headers
  "cors": "^2.8.5",              // CORS
  "express-rate-limit": "latest",// Rate limiting
  "express-validator": "latest", // Validación
  "@prisma/client": "^6.19.0",   // ORM
  "dotenv": "^16.4.7",          // Variables entorno
  "nodemailer": "^7.0.11",      // Envío emails
  "multer": "^2.0.2"            // Upload archivos
}
```

### Desarrollo
```json
{
  "nodemon": "^3.1.11",         // Auto-reload
  "prisma": "^6.19.0"           // Prisma CLI
}
```

---

## 🧪 Scripts Disponibles

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start

# Ejecutar seeds de base de datos
npm run seed

# Verificar datos
npm run verify

# Resumen de datos
npm run resumen
```

---

## 📊 Estado de Migración a MVC

### ✅ Implementado
- [x] Estructura de carpetas MVC
- [x] Middleware de autenticación
- [x] Middleware de autorización (RBAC)
- [x] Middleware de rate limiting
- [x] Middleware de validación
- [x] Configuración de seguridad centralizada
- [x] Ejemplos de rutas seguras (auth, donaciones, pacientes)
- [x] Documentación completa

### ⚠️ Pendiente (Controladores Legacy)
- [ ] Refactorizar `controllers/login.js` → exportar funciones
- [ ] Refactorizar `controllers/usuario.js` → exportar funciones
- [ ] Refactorizar `controllers/donaciones.js` → exportar funciones
- [ ] Refactorizar `controllers/paciente.js` → exportar funciones
- [ ] Refactorizar `controllers/beneficiarios.js` → exportar funciones
- [ ] Crear rutas seguras para todos los módulos
- [ ] Aplicar autenticación a endpoints legacy
- [ ] Aplicar RBAC a endpoints legacy

---

## 🔄 Plan de Migración

### Fase 1: Seguridad Base (✅ COMPLETADO)
1. Implementar middleware de seguridad
2. Configurar CORS, Helmet, Rate Limiting
3. Crear ejemplos de rutas MVC

### Fase 2: Migración de Módulos (🚧 EN PROGRESO)
Para cada controlador:
1. Refactorizar controlador para exportar funciones
2. Crear archivo de rutas en `routes/`
3. Aplicar middleware de seguridad
4. Actualizar `index.js` para usar nuevas rutas
5. Probar endpoints
6. Documentar

### Fase 3: Testing y Hardening (⏳ PENDIENTE)
1. Tests unitarios de seguridad
2. Tests de integración
3. Penetration testing
4. Corrección de vulnerabilidades
5. Optimización de performance

---

## 🛡️ Mejores Prácticas Implementadas

### Código
- ✅ Separación de responsabilidades (MVC)
- ✅ DRY (Don't Repeat Yourself)
- ✅ Middleware reutilizables
- ✅ Validación centralizada
- ✅ Manejo de errores consistente

### Seguridad
- ✅ Secrets en variables de entorno
- ✅ Principio de mínimo privilegio (RBAC)
- ✅ Validación de todos los inputs
- ✅ Sanitización anti-XSS
- ✅ Rate limiting contra ataques
- ✅ Headers de seguridad (Helmet)
- ✅ CORS configurado

### Base de Datos
- ✅ Prisma ORM (previene SQL injection)
- ✅ Migraciones versionadas
- ✅ Validación a nivel de esquema

---

## 📚 Documentación Adicional

- **[SECURITY.md](./SECURITY.md)** - Guía completa de seguridad
- **[QUICKSTART_SECURITY.md](./QUICKSTART_SECURITY.md)** - Inicio rápido
- **[.env.example](./.env.example)** - Variables de entorno

---

## 🤝 Contribuir

### Al agregar nuevas funcionalidades:

1. **Crear ruta en `routes/`**
   ```javascript
   // routes/mi-modulo.routes.js
   const router = express.Router();
   router.get('/', authenticateToken, requireRole(...), handler);
   module.exports = router;
   ```

2. **Aplicar seguridad apropiada**
   - Autenticación (si es privado)
   - Autorización (roles apropiados)
   - Rate limiting
   - Validación de inputs

3. **Registrar en `index.js`**
   ```javascript
   const miModuloRoutes = require('./routes/mi-modulo.routes');
   app.use('/api/mi-modulo', miModuloRoutes);
   ```

4. **Documentar**
   - Agregar endpoint a README
   - Documentar permisos requeridos
   - Actualizar matriz de permisos si es necesario

---

## 📞 Soporte

Para preguntas sobre arquitectura o seguridad:
- **Email**: dev@oncofeliz.org
- **Vulnerabilidades**: security@oncofeliz.org

---

**Versión**: 2.0.0
**Última actualización**: 2025-01-22
**Arquitectura**: MVC con Seguridad Avanzada
