# Documentación del sistema OncoFeliz

Esta carpeta explica **cómo funciona realmente el sistema hoy**, basado en el código actual (no en la aspiración original del README principal). Cada archivo cubre un área específica con diagramas Mermaid pequeños (divididos a propósito para que no rompan el visor).

## Índice

1. [Arquitectura general](./01-arquitectura.md) — stack, carpetas, cómo se levanta el proyecto.
2. [Roles y permisos](./02-roles-y-permisos.md) — qué puede hacer cada rol, en frontend y backend.
3. [Flujo de beneficiarios](./03-flujo-beneficiarios.md) — el proceso central: de registro a caso activo.
4. [Autenticación y 2FA](./04-autenticacion.md) — login, verificación en dos pasos, tokens.
5. [Donaciones y pagos (BNB)](./05-donaciones-pagos.md) — QR de donación y confirmación.
6. [Redes sociales y WhatsApp](./06-redes-sociales-whatsapp.md) — publicaciones y notificaciones.
7. [Inteligencia Artificial](./07-ia.md) — chat, análisis de informes, configuración por ENV.
8. [Variables de entorno](./08-configuracion-env.md) — tabla completa de todo lo configurable.
9. [Problemas conocidos](./09-problemas-conocidos.md) — huecos y inconsistencias reales encontradas en el código, para que no sorprendan a nadie.
10. [Flujo general de la aplicación](./10-flujo-general-aplicacion.md) — vista de conjunto de todos los roles y qué hace cada uno, con diagramas chicos por rol.

## Cómo leer los diagramas

Los diagramas Mermaid están deliberadamente cortos (una etapa del flujo por diagrama). Si necesitás ver el panorama completo de una sección, leé los diagramas de ese archivo en orden — juntos arman el flujo completo sin sobrecargar un solo gráfico.
