# 🚀 Fundación OncoFeliz - Production Setup Guide

Sistema completo de gestión para Fundación OncoFeliz con análisis de IA.

## 📋 Componentes del Sistema

- **Backend** - API REST con Node.js, Express, Prisma, PostgreSQL
- **Frontend** - React + Vite
- **Mobile** - React Native + Expo
- **IA** - Análisis de documentos con OpenRouter API

## ⚙️ Configuración de Producción

### 1. Backend

```bash
cd backend
cp .env.example .env
```

**Variables críticas en `.env`:**

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"

# Security (generar nuevos secrets)
JWT_SECRET="..."
SESSION_SECRET="..."
ENCRYPTION_KEY="..."

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-app-password

# OpenRouter AI
OPENROUTER_API_KEY=sk-or-v1-...

# Twitter (opcional)
TWITTER_API_KEY=...
TWITTER_API_SECRET=...

# Server
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS="https://your-frontend-domain.com"
```

**Generar secrets seguros:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Frontend

Actualizar `frontend/src/config/api.js`:

```javascript
export const API_URL = process.env.VITE_API_URL || 'https://api.your-domain.com';
```

### 3. Mobile

```bash
cd mobile
cp .env.example .env
```

Configurar en `.env`:

```env
API_URL=https://api.your-domain.com
```

### 4. Base de Datos

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
node prisma/seed.js
```

## 🔒 Seguridad en Producción

### ✅ Checklist de Seguridad

- [ ] Cambiar TODOS los secrets (JWT, SESSION, ENCRYPTION)
- [ ] Usar HTTPS en producción
- [ ] Configurar CORS correctamente
- [ ] Habilitar rate limiting
- [ ] Configurar firewall
- [ ] Backups automáticos de base de datos
- [ ] Monitoreo de logs
- [ ] Actualizar dependencias regularmente

### 🚫 NUNCA Subir a Git

- `.env` con credenciales reales
- Keystores (`.keystore`, `.jks`)
- Certificados privados
- `node_modules/`
- Archivos de usuarios (`uploads/`)
- Backups de base de datos

## 📦 Deployment

### Backend (Railway/Heroku/DigitalOcean)

```bash
# Build
npm install
npx prisma generate

# Start
npm start
```

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm install
npm run build
```

### Mobile (Expo EAS)

```bash
cd mobile
npm install
eas build --platform android
eas build --platform ios
```

## 🔑 Credenciales de Prueba

**Usuarios del sistema:**

- **Administrador**: admin@oncofeliz.com | 123456
- **Trabajador Social**: trabajador@oncofeliz.com | 123456
- **Psicólogo**: psicologo@oncofeliz.com | 123456
- **Asistente**: asistente@oncofeliz.com | 123456

**⚠️ IMPORTANTE**: Cambiar estas contraseñas en producción.

## 📊 Monitoreo

### Logs Importantes

```bash
# Backend logs
tail -f backend/logs/app.log

# Database queries
tail -f backend/logs/queries.log

# Errors
tail -f backend/logs/error.log
```

### Health Checks

- Backend: `GET /health`
- Database: `GET /db/health`

## 🆘 Troubleshooting

### Error: Database connection failed

```bash
# Verificar PostgreSQL
psql -U postgres -h localhost -d onco

# Verificar .env
cat backend/.env | grep DATABASE_URL
```

### Error: OpenRouter API

```bash
# Verificar API key
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" https://openrouter.ai/api/v1/models
```

## 📞 Soporte

Para problemas en producción, contactar al equipo de desarrollo.

## 📄 Licencia

Propiedad de Fundación OncoFeliz - Todos los derechos reservados.
