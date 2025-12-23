#!/usr/bin/env node
/**
 * Script de Verificación de Seguridad
 * Verifica que las configuraciones de seguridad estén correctas
 */

require('dotenv').config();

console.log('\n🔍 Verificando Configuración de Seguridad...\n');

let errores = 0;
let advertencias = 0;

// 1. Verificar JWT_SECRET
console.log('📋 Verificando JWT_SECRET...');
if (!process.env.JWT_SECRET) {
  console.log('   ❌ ERROR: JWT_SECRET no está configurado');
  errores++;
} else if (process.env.JWT_SECRET.length < 32) {
  console.log('   ⚠️  ADVERTENCIA: JWT_SECRET es muy corto (mínimo 32 caracteres)');
  advertencias++;
} else if (process.env.JWT_SECRET === 'cunu' || process.env.JWT_SECRET === 'cuno') {
  console.log('   ❌ ERROR: JWT_SECRET sigue siendo el valor inseguro por defecto');
  errores++;
} else {
  console.log('   ✅ JWT_SECRET configurado correctamente (' + process.env.JWT_SECRET.length + ' caracteres)');
}

// 2. Verificar SESSION_SECRET
console.log('\n📋 Verificando SESSION_SECRET...');
if (!process.env.SESSION_SECRET) {
  console.log('   ⚠️  ADVERTENCIA: SESSION_SECRET no está configurado');
  advertencias++;
} else if (process.env.SESSION_SECRET.length < 32) {
  console.log('   ⚠️  ADVERTENCIA: SESSION_SECRET es muy corto');
  advertencias++;
} else {
  console.log('   ✅ SESSION_SECRET configurado correctamente');
}

// 3. Verificar ENCRYPTION_KEY
console.log('\n📋 Verificando ENCRYPTION_KEY...');
if (!process.env.ENCRYPTION_KEY) {
  console.log('   ⚠️  ADVERTENCIA: ENCRYPTION_KEY no está configurado');
  advertencias++;
} else if (process.env.ENCRYPTION_KEY.length < 32) {
  console.log('   ⚠️  ADVERTENCIA: ENCRYPTION_KEY es muy corto');
  advertencias++;
} else {
  console.log('   ✅ ENCRYPTION_KEY configurado correctamente');
}

// 4. Verificar DATABASE_URL
console.log('\n📋 Verificando DATABASE_URL...');
if (!process.env.DATABASE_URL) {
  console.log('   ❌ ERROR: DATABASE_URL no está configurado');
  errores++;
} else if (process.env.DATABASE_URL.includes('password')) {
  console.log('   ⚠️  ADVERTENCIA: La contraseña de la BD parece ser "password" (muy insegura)');
  advertencias++;
} else {
  console.log('   ✅ DATABASE_URL configurado');
}

// 5. Verificar ALLOWED_ORIGINS
console.log('\n📋 Verificando ALLOWED_ORIGINS...');
if (!process.env.ALLOWED_ORIGINS) {
  console.log('   ⚠️  ADVERTENCIA: ALLOWED_ORIGINS no está configurado (se usará default)');
  advertencias++;
} else {
  console.log('   ✅ ALLOWED_ORIGINS: ' + process.env.ALLOWED_ORIGINS);
}

// 6. Verificar NODE_ENV
console.log('\n📋 Verificando NODE_ENV...');
if (!process.env.NODE_ENV) {
  console.log('   ⚠️  ADVERTENCIA: NODE_ENV no está configurado (se usará "development")');
  advertencias++;
} else {
  console.log('   ✅ NODE_ENV: ' + process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'production') {
    console.log('   ⚠️  RECORDATORIO: En producción, asegurar HTTPS habilitado');
  }
}

// 7. Verificar credenciales de Email
console.log('\n📋 Verificando Credenciales de Email...');
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.log('   ⚠️  ADVERTENCIA: Credenciales de email no configuradas');
  advertencias++;
} else {
  console.log('   ✅ Email configurado: ' + process.env.EMAIL_USER);
}

// 8. Verificar credenciales de Twitter
console.log('\n📋 Verificando Credenciales de Twitter...');
if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
  console.log('   ⚠️  ADVERTENCIA: Credenciales de Twitter no configuradas');
  advertencias++;
} else {
  console.log('   ✅ Twitter API configurada');
}

// Resumen final
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMEN DE VERIFICACIÓN');
console.log('='.repeat(50));

if (errores === 0 && advertencias === 0) {
  console.log('\n✅ ¡Perfecto! Todas las configuraciones están correctas.\n');
  process.exit(0);
} else {
  console.log('\n❌ Errores encontrados: ' + errores);
  console.log('⚠️  Advertencias: ' + advertencias);

  if (errores > 0) {
    console.log('\n🔴 ACCIÓN REQUERIDA:');
    console.log('   1. Revisa los errores marcados arriba');
    console.log('   2. Actualiza tu archivo .env');
    console.log('   3. Vuelve a ejecutar: node verificar-seguridad.js\n');
    process.exit(1);
  } else {
    console.log('\n🟡 Recomendaciones:');
    console.log('   - Corrige las advertencias para mayor seguridad');
    console.log('   - Revisa CONFIGURACION_RAPIDA.md para detalles\n');
    process.exit(0);
  }
}
