# Prompt: Conexión a API de Banco Económico para Generación de QR

## Objetivo
Conectarse a la API del Banco Económico, autenticarse y generar un código QR para pagos.

## Datos de Acceso

```
URL Base API: https://apimktdesa.baneco.com.bo/ApiGateway
Usuario: 1649710
Contraseña: 1234
Clave AES: 6F09E3167E1D40829207B01041A65B12
```

## Flujo de Integración

### Paso 1: Encriptar la Contraseña

Antes de autenticarse, es necesario encriptar la contraseña usando el endpoint de encriptación del banco.

**Endpoint:** `GET /api/authentication/encrypt`

**Parámetros:**
- `text`: La contraseña en texto plano (1234)
- `aesKey`: La clave AES proporcionada (6F09E3167E1D40829207B01041A65B12)

**Ejemplo de Request:**
```http
GET https://apimktdesa.baneco.com.bo/ApiGateway/api/authentication/encrypt?text=1234&aesKey=6F09E3167E1D40829207B01041A65B12
```

**Respuesta esperada:**
```json
"<contraseña_encriptada>"
```

**Nota:** Guardar la contraseña encriptada para usarla en el siguiente paso.

---

### Paso 2: Autenticación

Una vez obtenida la contraseña encriptada, realizar la autenticación para obtener el token de acceso.

**Endpoint:** `POST /api/authentication/authenticate`

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "userName": "1649710",
  "password": "<contraseña_encriptada_del_paso_1>"
}
```

**Ejemplo de Request:**
```http
POST https://apimktdesa.baneco.com.bo/ApiGateway/api/authentication/authenticate
Content-Type: application/json

{
  "userName": "1649710",
  "password": "<contraseña_encriptada>"
}
```

**Respuesta esperada:**
```json
{
  "token": "<token_de_autenticacion>"
}
```

**Nota:** Guardar el token de autenticación para usarlo en las siguientes peticiones.

---

### Paso 3: Encriptar el Número de Cuenta (Opcional pero Recomendado)

Si se necesita especificar una cuenta de crédito, también debe ser encriptada.

**Endpoint:** `GET /api/authentication/encrypt`

**Parámetros:**
- `text`: Número de cuenta (ejemplo: 1041070599)
- `aesKey`: La clave AES proporcionada (6F09E3167E1D40829207B01041A65B12)

**Ejemplo de Request:**
```http
GET https://apimktdesa.baneco.com.bo/ApiGateway/api/authentication/encrypt?text=1041070599&aesKey=6F09E3167E1D40829207B01041A65B12
```

**Respuesta esperada:**
```json
"<cuenta_encriptada>"
```

---

### Paso 4: Generar Código QR

Con el token de autenticación y la cuenta encriptada, se puede generar el código QR.

**Endpoint:** `POST /api/qrsimple/generateQR`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token_del_paso_2>
```

**Body:**
```json
{
  "transactionId": "123456789",
  "accountCredit": "<cuenta_encriptada_del_paso_3>",
  "currency": "BOB",
  "amount": 1.2,
  "description": "Ejemplo",
  "dueDate": "2025-12-31",
  "singleUse": true,
  "modifyAmount": false,
  "branchCode": "E0001"
}
```

**Ejemplo de Request:**
```http
POST https://apimktdesa.baneco.com.bo/ApiGateway/api/qrsimple/generateQR
Content-Type: application/json
Authorization: Bearer <token>

{
  "transactionId": "123456789",
  "accountCredit": "<cuenta_encriptada>",
  "currency": "BOB",
  "amount": 1.2,
  "description": "Pago de servicio",
  "dueDate": "2025-12-31",
  "singleUse": true,
  "modifyAmount": false,
  "branchCode": "E0001"
}
```

**Respuesta esperada:**
```json
{
  "qrId": "21061401016000000003",
  "qrImage": "<imagen_qr_en_base64>",
  "qrString": "<cadena_qr>",
  "status": "PENDING"
}
```

---

## Parámetros del QR

### Campos Obligatorios:
- **transactionId**: ID único de la transacción (generado por el comercio)
- **accountCredit**: Cuenta de crédito encriptada donde se depositará el pago
- **currency**: Moneda (BOB, USD)
- **amount**: Monto del pago
- **description**: Descripción del pago
- **dueDate**: Fecha de vencimiento (formato: YYYY-MM-DD)
- **singleUse**: Si el QR es de un solo uso (true/false)
- **modifyAmount**: Si se permite modificar el monto (true/false)
- **branchCode**: Código de sucursal

### Campos Opcionales:
- Consultar la documentación completa de la API para campos adicionales

---

## Resumen del Flujo Completo

1. **Encriptar contraseña** → Obtener `passwordEnc`
2. **Autenticarse** con usuario y `passwordEnc` → Obtener `token`
3. **Encriptar cuenta** (si es necesario) → Obtener `accountCreditEnc`
4. **Generar QR** con `token` y `accountCreditEnc` → Obtener datos del QR

---

## Notas Importantes

- Todos los datos sensibles (contraseñas, cuentas) deben ser encriptados usando el endpoint `/api/authentication/encrypt` con la clave AES proporcionada.
- El token de autenticación debe incluirse en el header `Authorization: Bearer <token>` para todas las peticiones protegidas.
- El ambiente de desarrollo (DESA) está en: `https://apimktdesa.baneco.com.bo/ApiGateway`
- Mantener el token seguro y renovarlo según las políticas de expiración del banco.

---

## Ejemplo de Implementación en Python

```python
import requests
import json

# Configuración
BASE_URL = "https://apimktdesa.baneco.com.bo/ApiGateway"
USERNAME = "1649710"
PASSWORD = "1234"
AES_KEY = "6F09E3167E1D40829207B01041A65B12"
ACCOUNT = "1041070599"

# Paso 1: Encriptar contraseña
def encrypt_text(text):
    url = f"{BASE_URL}/api/authentication/encrypt"
    params = {"text": text, "aesKey": AES_KEY}
    response = requests.get(url, params=params)
    return response.json()

# Paso 2: Autenticación
def authenticate(username, password_enc):
    url = f"{BASE_URL}/api/authentication/authenticate"
    headers = {"Content-Type": "application/json"}
    body = {"userName": username, "password": password_enc}
    response = requests.post(url, headers=headers, json=body)
    return response.json()["token"]

# Paso 3: Generar QR
def generate_qr(token, account_enc):
    url = f"{BASE_URL}/api/qrsimple/generateQR"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    body = {
        "transactionId": "123456789",
        "accountCredit": account_enc,
        "currency": "BOB",
        "amount": 1.2,
        "description": "Pago de ejemplo",
        "dueDate": "2025-12-31",
        "singleUse": True,
        "modifyAmount": False,
        "branchCode": "E0001"
    }
    response = requests.post(url, headers=headers, json=body)
    return response.json()

# Flujo completo
password_enc = encrypt_text(PASSWORD)
print(f"Contraseña encriptada: {password_enc}")

token = authenticate(USERNAME, password_enc)
print(f"Token obtenido: {token}")

account_enc = encrypt_text(ACCOUNT)
print(f"Cuenta encriptada: {account_enc}")

qr_data = generate_qr(token, account_enc)
print(f"QR generado: {json.dumps(qr_data, indent=2)}")
```

---

## Referencias

- Colección Postman: `baneco_postman.json`
- Versión de API: v1.3.0
- Documentación completa: Consultar con el Banco Económico
