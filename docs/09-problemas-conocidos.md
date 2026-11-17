# Problemas conocidos

Cosas encontradas revisando el código real, que vale la pena tener presentes. No son opiniones — son comportamientos verificables hoy en el repo.

## Seguridad

- **`POST /usuario` (registro público) permite auto-asignarse el rol `ADMINISTRADOR`.** Cualquiera que llame a este endpoint sin estar logueado puede crear una cuenta de administrador con solo mandar `rol: "ADMINISTRADOR"` en el body. No hay ninguna validación de que el que registra ya sea admin.
- **`POST /mobile-login` (`controllers/app/login.js`) firma el JWT con una clave hardcodeada en el código (`"cuno"`)**, no con `JWT_SECRET` del `.env`. Autentica contra el modelo legacy `Padre`, no contra `PacienteRegistro`/`Beneficiario`. No queda claro si la app móvil actual todavía lo usa (el login "real" parece ser `POST /mobile-beneficiario-login` en `controllers/usuario.js`), pero el endpoint sigue activo y accesible.
- **La mayoría de los endpoints "legacy"** (`Usuario`, `Beneficiarios`, `Donaciones`, `Evento`, `Padre`, `Paciente`, montados directo con `app.use(Controller)` en `index.js`) **no requieren token ni verifican rol**. Solo un puñado de rutas nuevas (`/api/auth`, `/api/ai`, `/api/whatsapp-templates`, `/api/contact`) tienen middleware de seguridad.
- El sistema RBAC más fino (`middleware/rbac.js`, con `requireRole`/`requirePermission`) existe y está bien armado, pero **no está conectado a ninguna ruta activa** — las rutas que lo usan (`pacientes.routes.js`, `donaciones.routes.js`) están comentadas en `index.js`.

## Sesión

- **No hay renovación automática de sesión.** El access token dura 15 minutos y el backend sí tiene `POST /api/auth/refresh-token`, pero **el frontend nunca lo llama**. Cualquier pantalla abierta por más de 15 minutos empieza a fallar con "Token expirado" en la próxima acción.

## Flujo de evaluación de casos

- **El rol Psicólogo quedó "colgado" de un flujo viejo.** Los endpoints `PUT /solicitar-evaluacion-psicologica/:id`, `GET /casos-pendientes-psicologia` y `POST /evaluacion-psicologica` están comentados/deshabilitados a propósito en `beneficiarios.js` (nota en el código: *"el psicólogo ya no participa en el flujo de evaluación"*). Pero `pages/private/psicologo/index.jsx` **sigue llamando a esos endpoints** — la pantalla del psicólogo hoy tira 404 al cargar. Pendiente de decisión de producto: qué debería hacer ese rol ahora.
- Hay **dos rutas activas para aceptar un caso**: `POST /aceptar-caso/:id` (la que usa el frontend real) y `PUT /aceptar-caso/:id` (definida más abajo en el mismo archivo, aparenta ser una versión vieja que quedó sin borrar). No rompen nada porque son métodos HTTP distintos, pero es código duplicado a limpiar.

## Variables de entorno mal alineadas con el código

Encontramos varios casos donde `.env.example` documenta un nombre de variable, pero el código lee otro distinto (si cambiás la documentada y no la real, "no pasa nada" silenciosamente):

| Área | Doc dice | Código lee |
|---|---|---|
| Email | `EMAIL_PASSWORD` | `EMAIL_PASS` (hay que definir ambas con el mismo valor) |
| BNB | `BNB_API_KEY`, `BNB_MERCHANT_ID` | `BNB_ACCOUNT_ID`, `BNB_AUTHORIZATION_ID` |

Ya corregido durante esta sesión: 2FA (`TWO_FACTOR_*` ahora sí se leen), roles/permisos (`config/security.js` ya coincide con el enum de Prisma), Facebook (webhook de Zapier ahora es `ZAPIER_FACEBOOK_WEBHOOK_URL`), WhatsApp (URL y modo prueba configurables).

## Dos sistemas de datos en paralelo

`Padre`/`Paciente`/`Tratamiento` (legacy) y `PacienteRegistro`/`Beneficiario` (actual) conviven en el mismo `schema.prisma` sin relación entre sí. Antes de tocar algo relacionado a "pacientes", conviene confirmar primero cuál de los dos sistemas está en juego (ver [01-arquitectura.md](./01-arquitectura.md)).

## Variables de entorno declaradas pero sin uso

`FACEBOOK_PAGE_ID`, `FACEBOOK_ACCESS_TOKEN`, `TIKTOK_USERNAME`, `TWITTER_BEARER_TOKEN` están en `.env.example` pero ningún archivo del backend las lee. Probablemente quedaron de un plan de integración directa con esas APIs que nunca se completó.
