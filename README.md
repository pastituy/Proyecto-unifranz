# 🎗️ Sistema Multiplataforma - Fundación OncoFeliz

> Sistema integral de gestión para fundación oncológica pediátrica con análisis de vulnerabilidad mediante IA, pasarela de pagos y automatización de redes sociales.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5+-blue.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()

## 📋 Descripción del Proyecto

Sistema multiplataforma desarrollado como proyecto de grado que digitaliza y optimiza los procesos de la Fundación OncoFeliz, una organización dedicada al apoyo de niños con cáncer en Bolivia. El sistema integra inteligencia artificial para análisis de casos sociales, pasarela de pagos con el Banco Nacional de Bolivia (BNB) y automatización de comunicaciones en redes sociales.

### 🎯 Problemática

La Fundación OncoFeliz procesaba manualmente:
- 📄 Análisis de informes sociales (2-3 horas por caso)
- 💰 Donaciones mediante transferencias manuales
- 📱 Publicaciones en redes sociales una por una
- 📊 Reportes y seguimiento en hojas de cálculo

### ✨ Solución

Sistema integral que reduce tiempos de procesamiento en un **85%** mediante:
- 🤖 **IA para análisis automático** de casos sociales
- 💳 **Pasarela de pagos QR** integrada con BNB
- 📲 **Publicación automática** en redes sociales
- 📈 **Dashboard en tiempo real** con métricas

## 🛠️ Stack Tecnológico

### Backend
- **Node.js 18+** - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL 15** - Base de datos relacional
- **Prisma ORM** - Object-Relational Mapping
- **JWT** - Autenticación y autorización
- **OpenRouter AI** - Análisis de documentos con IA

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Build tool y dev server
- **Styled Components** - CSS-in-JS
- **React Router** - Navegación SPA
- **Axios** - Cliente HTTP

### Mobile
- **React Native** - Framework multiplataforma
- **Expo** - Toolchain y plataforma de desarrollo
- **TypeScript** - Tipado estático

### Integraciones
- **Banco Nacional de Bolivia (BNB)** - Pasarela de pagos QR
- **Twitter/X API v2** - Publicación automática
- **Gmail SMTP** - Notificaciones por email
- **OpenRouter (Kimi-K2)** - Modelo de IA para análisis

## 🚀 Funcionalidades Principales

### 1. 🤖 Análisis de Vulnerabilidad con IA

El sistema utiliza IA para analizar informes sociales en PDF y generar automáticamente:

```json
{
  "datosDelPaciente": {...},
  "composicionFamiliar": {...},
  "situacionEconomica": {...},
  "factoresDeRiesgo": [...],
  "fortalezasFamiliares": [...],
  "recomendaciones": "...",
  "resumenEjecutivo": "..."
}
```

**Beneficios:**
- ⏱️ Reduce tiempo de análisis de 2-3 horas a **2 minutos**
- 📊 Estandariza formato de evaluación
- 🎯 Identifica factores de riesgo automáticamente

### 2. 💳 Pasarela de Pagos BNB

Generación de QR dinámicos para donaciones mediante Webhooks:

- Códigos QR únicos por transacción
- Confirmación automática de pagos
- Registro en base de datos en tiempo real
- Notificaciones automáticas

### 3. 📱 Automatización de Redes Sociales

Publicación simultánea en múltiples plataformas:

- Twitter/X mediante API v2
- Programación de publicaciones
- Gestión de campañas de difusión

### 4. 👥 Gestión de Beneficiarios

- Registro de pacientes oncológicos
- Evaluación social con puntajes
- Seguimiento de tratamientos
- Historial de ayudas otorgadas

### 5. 📊 Dashboard y Reportes

- Métricas en tiempo real
- Reportes de donaciones
- Estadísticas de beneficiarios
- Análisis de vulnerabilidad

## 📦 Instalación y Configuración

### Prerrequisitos

- Node.js 18 o superior
- PostgreSQL 15 o superior
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone https://github.com/pastituy/Proyecto-unifranz.git
cd Proyecto-unifranz
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Copiar variables de entorno
cp .env.example .env
```

**Editar `.env` con tus credenciales:**

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/onco"
JWT_SECRET="tu-secret-generado"
OPENROUTER_API_KEY="sk-or-v1-..."
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASSWORD="tu-app-password"
```

**Generar secrets seguros:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Configurar Base de Datos

```bash
# Ejecutar migraciones
npx prisma migrate dev

# Generar cliente de Prisma
npx prisma generate

# Cargar datos de prueba
node prisma/seed.js
```

### 4. Configurar Frontend

```bash
cd ../frontend
npm install
```

### 5. Iniciar el Sistema

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Mobile (opcional):**
```bash
cd mobile
npm start
```

### 6. Acceder al Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Mobile**: Escanear QR con Expo Go

## 👤 Usuarios de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Administrador | admin@oncofeliz.com | 123456 |
| Trabajador Social | trabajador@oncofeliz.com | 123456 |
| Psicólogo | psicologo@oncofeliz.com | 123456 |
| Asistente | asistente@oncofeliz.com | 123456 |

## 📁 Estructura del Proyecto

```
Proyecto-unifranz/
├── backend/                 # API REST con Node.js
│   ├── controllers/         # Lógica de negocio
│   ├── middleware/          # Auth, RBAC, Rate Limiting
│   ├── routes/              # Definición de endpoints
│   ├── services/            # Servicios (IA, Email, etc.)
│   ├── prisma/              # ORM y migraciones
│   └── uploads/             # Archivos subidos
├── frontend/                # SPA con React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── context/         # Estado global
│   │   └── styles/          # Estilos globales
│   └── public/              # Assets estáticos
├── mobile/                  # App móvil React Native
│   ├── app/                 # Screens (Expo Router)
│   ├── assets/              # Imágenes y fuentes
│   └── config/              # Configuración
└── docs/                    # Documentación del proyecto
```

## 🔒 Seguridad

El sistema implementa múltiples capas de seguridad:

- ✅ **Autenticación JWT** con refresh tokens
- ✅ **RBAC** (Role-Based Access Control)
- ✅ **Rate Limiting** para prevenir ataques
- ✅ **Helmet.js** para headers de seguridad
- ✅ **Validación de inputs** con middlewares
- ✅ **Encriptación** de datos sensibles
- ✅ **CORS** configurado correctamente

## 📊 Arquitectura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  PostgreSQL │
│   (React)   │     │  (Node.js)  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
              ┌─────▼────┐  ┌────▼─────┐
              │ OpenRouter│  │   BNB    │
              │    AI     │  │  Pagos   │
              └──────────┘  └──────────┘
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📈 Métricas del Proyecto

- **Tiempo de desarrollo**: 6 meses
- **Líneas de código**: ~15,000
- **Reducción de tiempo**: 85%
- **Endpoints API**: 45+
- **Modelos de base de datos**: 12

## 🤝 Contribución

Este es un proyecto de grado. Para sugerencias o consultas:

- **Autor**: Jhoselin Diana Cespedes Braulio
- **Institución**: Universidad Franz Tamayo (UNIFRANZ)
- **Año**: 2025

## 📄 Licencia

Este proyecto es propiedad de la Fundación OncoFeliz. Todos los derechos reservados.

## 🙏 Agradecimientos

- Fundación OncoFeliz por la oportunidad
- Universidad Franz Tamayo (UNIFRANZ)
- OpenRouter AI por la API de análisis
- Banco Nacional de Bolivia por la integración

## 📞 Contacto

Para más información sobre el proyecto:

- **Email**: cbbe.jhoselindiana.cespedes.br@unifranz.edu.bo
- **GitHub**: [@pastituy](https://github.com/pastituy)

---

⭐ Si este proyecto te resultó útil, considera darle una estrella en GitHub

**Desarrollado con ❤️ para la Fundación OncoFeliz**
