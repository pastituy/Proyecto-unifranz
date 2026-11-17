# Variables de entorno

Archivo real: `backend/.env` (copiar desde `backend/.env.example`). Ninguna de estas variables se usa en el frontend (el frontend hoy tiene URLs de backend hardcodeadas a `http://localhost:3000`).

## Base de datos

| Variable | Para qué sirve |
|---|---|
| `DATABASE_URL` | Cadena de conexión de Prisma. En este entorno local usa SQLite (`file:./dev.db`); el schema original está pensado para PostgreSQL. |

## Seguridad / JWT / Sesión

| Variable | Para qué sirve | Default |
|---|---|---|
| `JWT_SECRET` | Firma los tokens JWT | — (obligatorio) |
| `JWT_ACCESS_EXPIRY` | Duración del access token | `15m` |
| `JWT_REFRESH_EXPIRY` | Duración del refresh token | `7d` |
| `JWT_ISSUER` / `JWT_AUDIENCE` | Metadatos del token | `OncoFeliz-API` / `OncoFeliz-App` |
| `SESSION_SECRET` | Firma de sesión (Express session, uso limitado) | — |
| `NODE_ENV` | `development` / `production` | `development` |
| `ALLOWED_ORIGINS` | Orígenes permitidos por CORS, separados por coma | `localhost:5173,localhost:3000` |
| `TWO_FACTOR_CODE_LENGTH` | Dígitos del código 2FA | `6` |
| `TWO_FACTOR_EXPIRY_MINUTES` | Minutos de validez del código 2FA | `10` |
| `TWO_FACTOR_MAX_ATTEMPTS` | Declarado pero **no aplicado** en ningún lado todavía | `3` |
| `ENCRYPTION_KEY` | Declarada para cifrar datos sensibles, uso real no confirmado en el código revisado | — |

## Inteligencia Artificial

| Variable | Para qué sirve |
|---|---|
| `AI_BASE_URL` | Endpoint de chat completions del proveedor (ver ejemplos en [07-ia.md](./07-ia.md)) |
| `AI_API_KEY` | Key del proveedor |
| `AI_MODEL` | Modelo a usar por defecto |

## Email

| Variable | Para qué sirve |
|---|---|
| `EMAIL_SERVICE` | Servicio de Nodemailer (`gmail`, etc.) |
| `EMAIL_USER` | Cuenta que envía los correos |
| `EMAIL_PASSWORD` **y** `EMAIL_PASS` | ⚠️ Deben tener **el mismo valor**. El código real (`emailService.js`) lee `EMAIL_PASS`; `EMAIL_PASSWORD` solo lo usa un script de verificación (`verificar-seguridad.js`). Es una contraseña de aplicación de Gmail, no la contraseña normal de la cuenta. |
| `EMAIL_FROM` | Remitente que se muestra en los correos |
| `CONTACT_EMAIL` | Quién recibe el formulario de contacto público |
| `EMAIL_RECIPIENT` | Quién recibe el contenido preparado para TikTok |

## Redes sociales y WhatsApp

| Variable | Para qué sirve |
|---|---|
| `ZAPIER_FACEBOOK_WEBHOOK_URL` | Webhook de Zapier que efectivamente publica en Facebook |
| `FACEBOOK_PAGE_ID`, `FACEBOOK_ACCESS_TOKEN` | Declaradas pero **no usadas** por ningún código (Facebook publica vía Zapier, no Graph API) |
| `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET` | Credenciales reales de la API de Twitter/X, sí se usan |
| `TWITTER_BEARER_TOKEN` | Declarada, no se usa directamente en el código revisado |
| `TIKTOK_USERNAME` | Declarada, no se usa (TikTok es 100% manual) |
| `WHATSAPP_API_URL` | Endpoint de la API de factura.com.bo |
| `WHATSAPP_API_KEY` | Key de esa API |
| `WHATSAPP_FROM_NUMBER` | Número remitente (opcional) |
| `WHATSAPP_TEST_MODE` | `true` (default) = todos los mensajes van al número de prueba, no al real |
| `WHATSAPP_TEST_PHONE` | Número de prueba usado mientras `WHATSAPP_TEST_MODE=true` |

## Pagos (BNB)

| Variable declarada en `.env.example` | Variable que el código realmente lee |
|---|---|
| `BNB_API_KEY` | `BNB_ACCOUNT_ID` |
| `BNB_MERCHANT_ID` | `BNB_AUTHORIZATION_ID` |
| `BNB_CALLBACK_URL` | (no se usa; el webhook es una ruta fija `/api/bnb/webhook`) |

⚠️ Esto es un mismatch real — ver [09-problemas-conocidos.md](./09-problemas-conocidos.md). Sin `BNB_ACCOUNT_ID`/`BNB_AUTHORIZATION_ID` reales, el sistema simplemente usa el modo simulado (no rompe nada, pero tampoco cobra donaciones reales).

## Servidor y archivos

| Variable | Para qué sirve | Default |
|---|---|---|
| `PORT` | Puerto del backend | `3000` |
| `HOST` | Host de bind | `0.0.0.0` |
| `BACKEND_URL` / `FRONTEND_URL` | Referencia informativa, usadas en algunos mensajes/CORS | — |
| `UPLOAD_DIR` | Carpeta de archivos subidos | `./uploads` |
| `MAX_FILE_SIZE` | Límite de tamaño de archivo (bytes) | `5242880` (5MB) |
| `LOG_LEVEL` / `LOG_DIR` | Declaradas, sin un sistema de logging centralizado que las use en el código revisado | — |
