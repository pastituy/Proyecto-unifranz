# Arquitectura general

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express |
| Base de datos | SQLite en desarrollo local (`backend/prisma/dev.db`), pensado originalmente para PostgreSQL |
| ORM | Prisma |
| Frontend | React 19 + Vite + Styled Components |
| Mobile | React Native / Expo (solo para el rol Beneficiario) |
| IA | Cualquier proveedor compatible con la API de chat completions de OpenAI (hoy: Gemini), configurado 100% por ENV |
| Pagos | Banco Nacional de Bolivia (BNB), vía QR — con modo simulado para desarrollo |
| Redes sociales | Facebook (vía webhook de Zapier), Twitter/X (API oficial), TikTok (preparación manual por email) |
| Notificaciones | Email (Gmail SMTP vía Nodemailer), WhatsApp (API de factura.com.bo) |

## Carpetas principales

```
Proyecto-unifranz/
├── backend/
│   ├── index.js              # Punto de entrada, monta TODAS las rutas
│   ├── controllers/          # Lógica de negocio (mezcla de legacy y MVC nuevo)
│   ├── routes/                # Rutas "nuevas" con seguridad completa (auth, ai, whatsapp-templates, contact)
│   ├── middleware/            # auth (JWT), rbac (roles/permisos), rateLimiter, validator
│   ├── services/               # aiService, emailService, notificacionService (WhatsApp), iaAnalisisService
│   ├── config/security.js     # Configuración centralizada (JWT, roles, permisos, rate limits, 2FA)
│   └── prisma/schema.prisma   # Modelo de datos
├── frontend/
│   └── src/
│       ├── pages/public/      # Login, registro, landing, contacto
│       ├── pages/private/     # Dashboards por rol (bajo /dasboard/*)
│       ├── components/        # Sidebar, ProtectedRoute, ChatWidget, etc.
│       └── context/userContext.jsx  # Estado de sesión (user, token) en localStorage
└── mobile/                    # App para Beneficiarios
```

## Dos sistemas de datos conviviendo en el mismo schema

Esto es importante para no confundirse leyendo el código: el `schema.prisma` tiene **dos modelos de datos distintos que no se comunican entre sí**:

1. **Sistema legacy**: `Padre` → `Paciente` → `Tratamiento` / `Recuperados`. Usado por `controllers/paciente.js`, `controllers/padre.js`, `controllers/psicologo.js`, `controllers/trabajdoraSocial.js`, y probablemente por secciones públicas como "Casos Recuperados".
2. **Sistema actual (el que importa)**: `PacienteRegistro` → `EvaluacionSocial` → `Beneficiario` → `SolicitudAyuda` / `Ayuda` / `SesionQuimioterapia`. Es el flujo real de evaluación y gestión de casos, documentado en [03-flujo-beneficiarios.md](./03-flujo-beneficiarios.md).

Cuando algo no cuadra (por ejemplo, `controllers/psicologo.js` consultando un modelo `Paciente` que no aparece en ningún lado del flujo de beneficiarios), es porque pertenece al sistema legacy.

## Cómo levantar el proyecto

Desde la raíz del repo:

```bash
bun run dev
```

Esto levanta backend (`:3000`, con `nodemon`) y frontend (`:5173`, con `vite`) en paralelo vía `concurrently`. Ver [08-configuracion-env.md](./08-configuracion-env.md) para las variables necesarias en `backend/.env`.
