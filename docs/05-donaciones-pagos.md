# Donaciones y pagos (BNB)

El sistema genera códigos QR de pago dinámicos usando la API del Banco Nacional de Bolivia. `controllers/bnb.js` tiene un **modo desarrollo (simulado)** que se activa automáticamente si no hay credenciales reales configuradas.

## Flujo de una donación

```mermaid
sequenceDiagram
    participant D as Donante (web)
    participant B as Backend
    participant BNB as API del BNB
    D->>B: POST /api/bnb/generate-qr (monto)
    B->>BNB: Solicita QR dinámico
    BNB-->>B: Imagen QR (base64)
    B-->>D: Muestra el QR
    D->>D: Escanea y paga desde su banco
    BNB->>B: POST /api/bnb/webhook (confirmación)
    B->>B: Registra la donación
```

## Modo desarrollo vs. producción

```mermaid
flowchart LR
    A{BNB_ACCOUNT_ID y<br/>BNB_AUTHORIZATION_ID<br/>configurados?} -->|No| B[DEV_MODE = true<br/>QR simulado en memoria]
    A -->|Sí| C[DEV_MODE = false<br/>Llama a la API real del BNB]
```

- En **modo desarrollo**, `POST /api/bnb/generate-qr` genera un QR falso (con `qrId: QR-DEV-...`) y guarda su estado en memoria (`Map`, se pierde al reiniciar el servidor). Se puede simular el pago manualmente con `POST /api/bnb/simulate-payment/:qrId` — útil para probar el flujo sin cuenta real del BNB. Hay un simulador dedicado en el frontend: `/banco-simulador` (`BankSimulator.jsx`), accesible sin login.
- `GET /api/bnb/dev-info` dice en qué modo está corriendo el sistema y qué credenciales faltan.
- En **modo producción**, se necesita `BNB_ACCOUNT_ID` y `BNB_AUTHORIZATION_ID` reales del banco.

⚠️ Las variables documentadas en `.env.example` (`BNB_API_KEY`, `BNB_MERCHANT_ID`, `BNB_CALLBACK_URL`) **no son las que el código realmente lee**. Ver [09-problemas-conocidos.md](./09-problemas-conocidos.md).
