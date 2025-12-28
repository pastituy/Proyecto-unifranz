// Script de prueba para WhatsApp
require('dotenv').config();
const { enviarWhatsApp } = require('./services/notificacionService');

async function probarWhatsApp() {
  console.log('=== TEST WHATSAPP ===');
  console.log('API Key configurado:', process.env.WHATSAPP_API_KEY ? 'SÍ' : 'NO');
  console.log('API Key:', process.env.WHATSAPP_API_KEY);

  try {
    const resultado = await enviarWhatsApp(
      'Juan Pérez (Prueba)',
      'BENEFICIARIO_ACTIVO',
      '79397462'
    );

    console.log('\n=== RESULTADO ===');
    console.log(JSON.stringify(resultado, null, 2));
  } catch (error) {
    console.error('\n=== ERROR ===');
    console.error(error);
  }
}

probarWhatsApp();
