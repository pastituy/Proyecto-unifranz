# 🚀 Inicio Rápido - Seguridad OncoFeliz

## ⚡ Configuración en 5 Minutos

### 1️⃣ Copiar y Configurar Variables de Entorno

```bash
cd backend
cp .env.example .env
```

### 2️⃣ Generar Secrets Seguros

Ejecutar estos comandos y copiar los resultados a `.env`:

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3️⃣ Editar `.env`

```env
# Pegar los secrets generados arriba
JWT_SECRET="<secret-generado-1>"
SESSION_SECRET="<secret-generado-2>"
ENCRYPTION_KEY="<secret-generado-3>"

# Configurar base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/onco"

# Configurar CORS (frontend URL)
ALLOWED_ORIGINS="http://localhost:5173"

# Entorno
NODE_ENV="development"
```

### 4️⃣ Instalar Dependencias

```bash
npm install
```

### 5️⃣ Iniciar Servidor

```bash
npm run dev
```

Deberías ver:

```
🚀 Servidor OncoFeliz iniciado correctamente

📍 Información del servidor:
   - Entorno:      development
   - Puerto:       3000
   - Local:        http://localhost:3000

🔒 Seguridad:
   ✓ JWT Authentication
   ✓ RBAC Authorization
   ✓ Rate Limiting
   ✓ Input Validation
   ✓ Helmet (Security Headers)
   ✓ CORS Configured
```

---

## 🔐 Uso Básico de Seguridad

### Proteger una Ruta

```javascript
// routes/mi-ruta.js
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validateId } = require('../middleware/validator');

// Solo usuarios autenticados
router.get('/datos',
  authenticateToken,
  controller.getDatos
);

// Solo administradores
router.delete('/usuarios/:id',
  authenticateToken,
  requireRole('admin'),
  validateId,
  controller.deleteUsuario
);

// Múltiples roles
router.post('/pacientes',
  authenticateToken,
  requireRole(['admin', 'trabajador_social']),
  validatePatient,
  controller.createPaciente
);
```

---

## 🛡️ Middlewares Disponibles

### Autenticación
```javascript
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Requerido
router.get('/private', authenticateToken, handler);

// Opcional
router.get('/public', optionalAuth, handler);
```

### Autorización (RBAC)
```javascript
const {
  requireRole,
  requireAdmin,
  requireProfessional,
  requireOwnership
} = require('../middleware/rbac');

// Rol específico
router.get('/data', authenticateToken, requireRole('admin'), handler);

// Solo admin
router.delete('/user', authenticateToken, requireAdmin, handler);

// Profesionales
router.get('/patients', authenticateToken, requireProfessional, handler);

// Ownership (solo sus datos)
router.get('/me/:id', authenticateToken, requireOwnership('id'), handler);
```

### Rate Limiting
```javascript
const {
  loginLimiter,
  apiLimiter,
  uploadLimiter,
  registerLimiter
} = require('../middleware/rateLimiter');

router.post('/login', loginLimiter, handler);
router.post('/register', registerLimiter, handler);
router.post('/upload', uploadLimiter, handler);
router.get('/data', apiLimiter, handler);
```

### Validación
```javascript
const {
  validateLogin,
  validateRegister,
  validateDonation,
  validatePatient,
  validateId
} = require('../middleware/validator');

router.post('/login', validateLogin, handler);
router.post('/register', validateRegister, handler);
router.post('/donaciones', validateDonation, handler);
router.put('/paciente/:id', validateId, validatePatient, handler);
```

---

## 📝 Ejemplo Completo de Ruta Segura

```javascript
// routes/pacientes.routes.js
const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { apiLimiter } = require('../middleware/rateLimiter');
const { validatePatient, validateId } = require('../middleware/validator');

// GET /api/pacientes - Listar pacientes (solo profesionales)
router.get('/',
  authenticateToken,                              // 1. Verificar JWT
  requireRole(['admin', 'psicologo', 'trabajador_social']), // 2. Verificar rol
  apiLimiter,                                     // 3. Rate limiting
  async (req, res) => {                           // 4. Handler
    try {
      const pacientes = await prisma.paciente.findMany();
      res.json({ success: true, data: pacientes });
    } catch (error) {
      res.status(500).json({ success: false, mensaje: error.message });
    }
  }
);

// POST /api/pacientes - Crear paciente (admin o trabajador social)
router.post('/',
  authenticateToken,
  requireRole(['admin', 'trabajador_social']),
  validatePatient,                                // Validar datos
  apiLimiter,
  async (req, res) => {
    try {
      const paciente = await prisma.paciente.create({
        data: req.body
      });
      res.status(201).json({ success: true, data: paciente });
    } catch (error) {
      res.status(400).json({ success: false, mensaje: error.message });
    }
  }
);

// DELETE /api/pacientes/:id - Eliminar paciente (solo admin)
router.delete('/:id',
  authenticateToken,
  requireRole('admin'),                           // Solo admin
  validateId,                                     // Validar ID
  async (req, res) => {
    try {
      await prisma.paciente.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ success: true, mensaje: 'Paciente eliminado' });
    } catch (error) {
      res.status(404).json({ success: false, mensaje: 'Paciente no encontrado' });
    }
  }
);

module.exports = router;
```

---

## 🔑 Roles Disponibles

| Rol | Código | Permisos |
|-----|--------|----------|
| Administrador | `admin` | Acceso completo |
| Psicólogo | `psicologo` | Pacientes, evaluaciones psicológicas |
| Trabajador Social | `trabajador_social` | Pacientes, evaluaciones sociales, ayudas |
| Beneficiario | `beneficiario` | Solo sus propios datos |
| Usuario | `usuario` | Donaciones, eventos públicos |

---

## 📊 Configuración de Rate Limits

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| Login | 5 intentos | 15 minutos |
| 2FA | 3 intentos | 15 minutos |
| Registro | 3 registros | 1 hora |
| API General | 100 requests | 15 minutos |
| Uploads | 10 archivos | 1 hora |

Modificar en `config/security.js` → `rateLimits`

---

## 🚨 Acciones Urgentes

### ⚠️ ANTES DE PRODUCCIÓN:

1. **Revocar credenciales expuestas en `.env`**:
   - Twitter API Keys
   - Gmail credentials
   - Facebook tokens

2. **Generar nuevas credenciales**

3. **Configurar HTTPS**:
   ```javascript
   // En producción, usar HTTPS
   const https = require('https');
   const fs = require('fs');

   const options = {
     key: fs.readFileSync('private-key.pem'),
     cert: fs.readFileSync('certificate.pem')
   };

   https.createServer(options, app).listen(443);
   ```

4. **Actualizar CORS** con dominio real:
   ```env
   ALLOWED_ORIGINS="https://oncofeliz.org"
   ```

---

## 📚 Más Información

Ver documentación completa en [`SECURITY.md`](./SECURITY.md)

---

## ❓ FAQ

**P: ¿Cómo obtengo el token JWT?**
```javascript
// POST /api/auth/login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token } = await response.json();

// Usar en requests
fetch('/api/protected', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**P: ¿Cómo agregar un nuevo rol?**
Editar `config/security.js`:
```javascript
roles: {
  // ... existentes
  NUEVO_ROL: 'nuevo_rol'
},
permissions: {
  nuevo_rol: [
    'recurso:read',
    'recurso:write'
  ]
}
```

**P: ¿Cómo personalizar rate limits?**
Editar `config/security.js` → `rateLimits`:
```javascript
login: {
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 5,                     // 5 intentos
  message: 'Mensaje personalizado'
}
```

---

✅ **¡Listo!** Tu backend ahora tiene protocolos de seguridad profesionales implementados.
