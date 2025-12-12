# 🌱 Instrucciones para Poblar la Base de Datos

## Descripción

Este documento explica cómo usar el script de seed para poblar la base de datos con datos iniciales de prueba para la Fundación OncoFeliz.

## Datos que se Crean

### 👥 Usuarios (5 usuarios)
1. **ADMINISTRADOR**
   - Nombre: Dr. Carlos Mendoza
   - Email: `admin@oncofeliz.org`
   - Password: `Password123!`

2. **TRABAJADORES SOCIALES** (2)
   - Lic. María Fernández - `maria.fernandez@oncofeliz.org`
   - Lic. Ana Gutiérrez - `ana.gutierrez@oncofeliz.org`

3. **PSICÓLOGO**
   - Psic. Roberto Chávez - `roberto.chavez@oncofeliz.org`

4. **ASISTENTE**
   - Patricia Ríos - `patricia.rios@oncofeliz.org`

**Todos los usuarios tienen la misma contraseña:** `Password123!`

### 👶 Beneficiarios (20 registros completos)
- Códigos: B001 a B020
- Edades: 0-15 años
- Diagnósticos variados de cáncer pediátrico:
  - Leucemia Linfoblástica Aguda (LLA)
  - Leucemia Mieloide Aguda (LMA)
  - Linfoma de Hodgkin
  - Linfoma No Hodgkin
  - Tumores cerebrales
  - Neuroblastoma
  - Tumor de Wilms
  - Osteosarcoma
  - Rabdomiosarcoma
  - Retinoblastoma

### 📋 Evaluaciones
- 20 evaluaciones sociales (con puntajes de vulnerabilidad)
- 20 evaluaciones psicológicas

### 📄 Solicitudes de Ayuda (32 solicitudes)
- Tipos: MEDICAMENTOS, QUIMIOTERAPIA, ANALISIS_EXAMENES, OTRO
- Estados: PENDIENTE, RECEPCIONADO, ENTREGADO
- Prioridades: BAJA, MEDIA, ALTA, URGENTE
- Costos reales entre Bs. 200 y Bs. 1700

### 💰 Donaciones (18 registros)
- Montos entre Bs. 50 y Bs. 5000
- Métodos de pago: Transferencia Bancaria, QR, Efectivo, Tarjeta
- Fechas distribuidas en los últimos 6 meses

## Cómo Ejecutar el Script

### Opción 1: Ejecutar directamente
```bash
cd backend
node prisma/seed-datos-iniciales.js
```

### Opción 2: Usar el comando de Prisma (si está configurado en package.json)
```bash
cd backend
npm run seed
```

## Verificar los Datos Creados

Para verificar que los datos se crearon correctamente:

```bash
cd backend
node verificar-seed.js
```

Este script mostrará:
- Lista de usuarios creados
- Primeros 5 beneficiarios con sus solicitudes
- Primeras 5 donaciones
- Totales de todos los registros
- Solicitudes con monto real asignado

## ⚠️ ADVERTENCIA

**El script elimina todos los datos existentes antes de crear los nuevos datos.**

Si ya tienes datos en la base de datos que deseas conservar:
1. Haz un backup de tu base de datos
2. O comenta las líneas de limpieza en el archivo `seed-datos-iniciales.js` (líneas 98-106)

```javascript
// Comentar estas líneas si no deseas borrar los datos existentes:
// await prisma.notificacion.deleteMany({});
// await prisma.solicitudAyuda.deleteMany({});
// ... etc.
```

## Acceso al Sistema

Una vez ejecutado el seed, puedes acceder al sistema con estas credenciales:

### Administrador
- **Email:** admin@oncofeliz.org
- **Password:** Password123!

### Trabajador Social
- **Email:** maria.fernandez@oncofeliz.org
- **Password:** Password123!

### Psicólogo
- **Email:** roberto.chavez@oncofeliz.org
- **Password:** Password123!

### Asistente
- **Email:** patricia.rios@oncofeliz.org
- **Password:** Password123!

## Datos Generados

### Características de los Datos

1. **Nombres y Apellidos Bolivianos:** Los nombres son comunes en Bolivia
2. **Edades Realistas:** Entre 0 y 15 años (rango de pediatría)
3. **Diagnósticos Reales:** Tipos de cáncer pediátrico más comunes
4. **Ciudades Bolivianas:** La Paz, El Alto, Cochabamba, Santa Cruz, etc.
5. **Números de Teléfono:** Formato boliviano (7XXXXXXXX o 6XXXXXXXX)
6. **CI Boliviano:** Formato de cédula de identidad boliviana
7. **Fechas Distribuidas:** Registros creados en los últimos 6-8 meses

### Datos de Vulnerabilidad

Las evaluaciones sociales incluyen:
- Ingreso familiar (1000-4000 Bs)
- Número de personas en el hogar (3-8)
- Puntajes de vulnerabilidad
- Niveles: BAJO, MEDIO, ALTO

### Solicitudes con Montos

Aproximadamente 25% de las solicitudes tienen estado "ENTREGADO" con:
- Costo estimado
- Costo real (80-110% del estimado)
- Proveedor
- Fecha de entrega
- Lugar de entrega

## Troubleshooting

### Error: "Cannot find module '@prisma/client'"
```bash
cd backend
npm install
```

### Error: "Cannot find module 'bcrypt'"
```bash
cd backend
npm install bcrypt
```

### Error de conexión a la base de datos
Verifica que el archivo `.env` tenga la configuración correcta:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_bd"
```

### La base de datos no existe
```bash
cd backend
npx prisma migrate dev
```

## Personalización del Script

Si deseas modificar los datos generados:

1. **Cambiar cantidad de beneficiarios:** Modifica el bucle en la línea 174
   ```javascript
   for (let i = 0; i < 20; i++) {  // Cambiar 20 por el número deseado
   ```

2. **Cambiar cantidad de donaciones:** Modifica el bucle en la línea 155
   ```javascript
   for (let i = 0; i < 18; i++) {  // Cambiar 18 por el número deseado
   ```

3. **Cambiar diagnósticos:** Modifica el array `diagnosticos` (línea 17)

4. **Cambiar ciudades:** Modifica el array `ciudades` (línea 29)

## Contacto

Para más información sobre el sistema de la Fundación OncoFeliz, contactar al equipo de desarrollo.
