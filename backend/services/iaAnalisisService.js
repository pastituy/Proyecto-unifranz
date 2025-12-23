const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { callOpenRouter } = require('./openRouterService');


/**
 * Analiza un PDF de informe social y retorna puntajes de vulnerabilidad
 * @param {string} pdfPath - Ruta al archivo PDF
 * @returns {Promise<Object>} - Objeto con los puntajes calculados
 */
async function analizarInformeSocial(pdfPath) {
  try {
    console.log('=== INICIO ANÁLISIS IA DEL INFORME SOCIAL ===');
    console.log('Archivo PDF:', pdfPath);
    console.log('pdfParse disponible:', typeof pdfParse);

    // 1. Leer y extraer texto del PDF
    const dataBuffer = fs.readFileSync(pdfPath);
    console.log('✅ Buffer PDF leído, tamaño:', dataBuffer.length, 'bytes');
    console.log('Llamando a pdfParse...');
    const pdfData = await pdfParse(dataBuffer);
    console.log('✅ PDF parseado exitosamente');
    const textoInforme = pdfData.text;

    console.log('Texto extraído del PDF (primeros 500 caracteres):');
    console.log(textoInforme.substring(0, 500));
    console.log('...');

    // 2. Preparar el prompt para la IA
    const prompt = `Eres un experto en evaluación de vulnerabilidad social. Analiza el siguiente informe social de un paciente oncológico pediátrico y calcula los puntajes de vulnerabilidad.

INFORME SOCIAL:
${textoInforme}

INSTRUCCIONES CRÍTICAS:
Considera que este es un caso de ONCOLOGÍA PEDIÁTRICA, lo que automáticamente implica alta vulnerabilidad.
Lee cuidadosamente TODO el informe y clasifica según seis áreas:

1. INGRESO FAMILIAR (0-20 puntos):
   - 20 pts = Sin ingresos, desempleo total, dependencia de terceros
   - 18 pts = Ingresos ocasionales muy inestables (venta ambulante, trabajos eventuales)
   - 15 pts = Trabajo informal inestable (comercio pequeño, costura ocasional)
   - 12 pts = Trabajo informal estable pero muy bajo ingreso
   - 8 pts = Trabajo estable pero insuficiente para cubrir necesidades básicas
   - 5 pts = Trabajo estable que apenas cubre lo básico
   - 2 pts = Trabajo estable con ingresos adecuados
   - 0 pts = Buena estabilidad económica

2. PERSONAS EN EL HOGAR (0-15 puntos):
   - 15 pts = Más de 6 personas dependientes
   - 12 pts = 5-6 personas dependientes
   - 10 pts = 4 personas dependientes
   - 7 pts = 3 personas dependientes
   - 5 pts = 2 personas dependientes
   - 2 pts = 1 persona dependiente
   - 0 pts = Sin dependientes

3. TIPO DE VIVIENDA (0-15 puntos):
   - 15 pts = Sin vivienda propia, situación de calle o albergue
   - 12 pts = Vivienda compartida, hacinamiento, condiciones muy precarias
   - 10 pts = Vivienda precaria (anticrético, cuarto alquilado, sin servicios completos)
   - 7 pts = Vivienda modesta alquilada con servicios básicos
   - 4 pts = Vivienda propia modesta con servicios básicos
   - 0 pts = Vivienda en buenas condiciones

4. SITUACIÓN LABORAL PADRES (0-20 puntos):
   - 20 pts = Ambos padres desempleados o uno solo sustenta sin trabajo estable
   - 18 pts = Trabajos informales muy inestables (vendedor ambulante, trabajos ocasionales)
   - 15 pts = Trabajo informal inestable (comercio pequeño, oficios eventuales)
   - 12 pts = Trabajo informal estable (costura, venta en terminal, etc.)
   - 8 pts = Trabajo formal precario o solo uno trabaja formalmente
   - 5 pts = Trabajo formal pero salario bajo
   - 0 pts = Ambos con trabajo formal estable

5. ACCESO A SALUD (0-15 puntos):
   - 15 pts = Sin seguro, solo atención de emergencia
   - 12 pts = Solo hospital público con largas esperas y recursos limitados
   - 10 pts = Atención pública limitada, sin cobertura para medicamentos
   - 7 pts = Atención pública regular pero sin cobertura completa
   - 4 pts = Seguro básico con algunas limitaciones
   - 0 pts = Buen acceso a servicios de salud con cobertura

6. GASTOS MÉDICOS MENSUALES (0-15 puntos):
   - 15 pts = Gastos superiores a 500 Bs, medicamentos costosos que no pueden cubrir
   - 12 pts = Gastos entre 300-500 Bs que comprometen gravemente el presupuesto
   - 10 pts = Gastos entre 200-300 Bs que afectan significativamente la economía familiar
   - 7 pts = Gastos entre 100-200 Bs manejables con dificultad
   - 4 pts = Gastos moderados cubiertos parcialmente
   - 0 pts = Gastos médicos bajos o totalmente cubiertos

CRITERIOS DE ANÁLISIS ESTRICTOS - APLICA ESTOS CRITERIOS OBLIGATORIAMENTE:

1. TRABAJO Y EMPLEO:
   - "trabajo esporádico", "trabajos ocasionales", "no tiene trabajo fijo" → Situación Laboral = 18 puntos (muy inestable)
   - "costura ocasional", "venta ambulante", "comercio pequeño" → Situación Laboral = 15 puntos
   - "madre que cuida hijos", "no puede trabajar por cuidar al paciente" → Situación Laboral = 20 puntos
   - Si solo uno trabaja informalmente → Situación Laboral = mínimo 15 puntos
   - Si menciona "pensión alimenticia" (significa separación/divorcio) → Situación Laboral = mínimo 15 puntos

2. COMPOSICIÓN FAMILIAR:
   - "madre de 4 hijos" o "familia de 4-5 miembros" → Personas en Hogar = 10-12 puntos
   - Si menciona "hijos de otro matrimonio", "familia reconstituida" → Personas en Hogar = 12 puntos
   - Si hay varios dependientes (niños, enfermos) → Personas en Hogar = 12-15 puntos
   - Familia numerosa con un solo sustento → Personas en Hogar = 15 puntos

3. SALUD FAMILIAR:
   - Si menciona "madre enferma", "padre enfermo", "persona con discapacidad" → Acceso a Salud = 12 puntos
   - "solo atiende en hospital público" → Acceso a Salud = 12 puntos
   - Si hay otro familiar enfermo además del paciente → Gastos Médicos = 15 puntos
   - Cualquier mención de "Diabetes avanzada" u otra enfermedad crónica → Gastos Médicos = 15 puntos

4. MEDICAMENTOS Y GASTOS:
   - Si solicita medicamento específico con precio alto (ej: L-Asparaginasa Pegilada) → Gastos Médicos = 15 puntos
   - Si menciona que "no pueden cubrir" o "familia no tiene posibilidad" → Gastos Médicos = 15 puntos
   - Si menciona precio específico del medicamento → Gastos Médicos = 15 puntos
   - Cualquier solicitud de "apoyo económico para medicamentos" → Gastos Médicos = 15 puntos

5. INGRESOS:
   - "recursos económicos insuficientes" → Ingreso Familiar = 18-20 puntos
   - Trabajo esporádico/ocasional → Ingreso Familiar = 18 puntos
   - Solo trabajo informal → Ingreso Familiar = 15 puntos
   - Si menciona que trabaja en terminal, mercado, costura → Ingreso Familiar = 15-18 puntos

6. VIVIENDA:
   - "anticrético", "cuarto alquilado" → Tipo de Vivienda = 10 puntos
   - "vivienda compartida", "vive con familiares" → Tipo de Vivienda = 10-12 puntos
   - No menciona vivienda propia → Tipo de Vivienda = mínimo 7 puntos

REGLA CRÍTICA:
- TODOS los casos oncológicos pediátricos tienen vulnerabilidad ALTA o MEDIA (nunca BAJA)
- El puntaje total MÍNIMO para casos oncológicos debe ser 50 puntos
- Si el informe solicita apoyo económico para medicamentos → el puntaje DEBE ser mínimo 65 puntos (ALTA vulnerabilidad)

RESPONDE ÚNICAMENTE CON UN OBJETO JSON en este formato exacto:
{
  "ingresoFamiliar": número,
  "numPersonasHogar": número,
  "tipoVivienda": número,
  "situacionLaboralPadres": número,
  "accesoSalud": número,
  "gastosMedicosMensuales": número,
  "observaciones": "Resumen ejecutivo del caso: [Nombre paciente], [edad], [diagnóstico]. Situación familiar: [composición familiar y roles]. Situación económica: [descripción de ingresos y trabajo]. Necesidad principal: [qué solicita y por qué]. Vulnerabilidad identificada: [factores críticos que justifican los puntajes altos].",
  "puntajeTotal": suma de todos los puntajes,
  "nivelVulnerabilidad": "ALTA" (si puntajeTotal >= 60), "MEDIA" (si 30-59), o "BAJA" (si < 30)
}`;

    // 3. Llamar a la API de OpenRouter
    console.log('\nLlamando a OpenRouter API...');

    const { ok, data } = await callOpenRouter({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente experto en análisis de vulnerabilidad social. Analizas informes sociales y produces evaluaciones objetivas basadas en criterios específicos. Siempre respondes con JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      xTitle: 'Fundación OncoFeliz - Análisis Social'
    });

    if (!ok) {
      throw new Error(`Error from OpenRouter API: ${data.error?.message || 'Unknown error'}`);
    }

    console.log('\nRespuesta de OpenRouter recibida');

    // 4. Extraer y parsear la respuesta
    const contenidoIA = data.choices[0].message.content;
    console.log('Contenido IA:', contenidoIA);

    // Limpiar la respuesta para obtener solo el JSON
    let jsonStr = contenidoIA.trim();

    // Remover markdown si existe
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '');
    }

    const analisis = JSON.parse(jsonStr);

    // 5. Validar que los puntajes estén en rangos correctos
    const puntajesValidados = {
      ingresoFamiliar: Math.min(20, Math.max(0, analisis.ingresoFamiliar)),
      numPersonasHogar: Math.min(15, Math.max(0, analisis.numPersonasHogar)),
      tipoVivienda: Math.min(15, Math.max(0, analisis.tipoVivienda)),
      situacionLaboralPadres: Math.min(20, Math.max(0, analisis.situacionLaboralPadres)),
      accesoSalud: Math.min(15, Math.max(0, analisis.accesoSalud)),
      gastosMedicosMensuales: Math.min(15, Math.max(0, analisis.gastosMedicosMensuales)),
      observaciones: analisis.observaciones || 'Análisis automático completado',
    };

    // Calcular puntaje total
    puntajesValidados.puntajeTotal =
      puntajesValidados.ingresoFamiliar +
      puntajesValidados.numPersonasHogar +
      puntajesValidados.tipoVivienda +
      puntajesValidados.situacionLaboralPadres +
      puntajesValidados.accesoSalud +
      puntajesValidados.gastosMedicosMensuales;

    // Determinar nivel de vulnerabilidad
    if (puntajesValidados.puntajeTotal >= 60) {
      puntajesValidados.nivelVulnerabilidad = 'ALTA';
    } else if (puntajesValidados.puntajeTotal >= 30) {
      puntajesValidados.nivelVulnerabilidad = 'MEDIA';
    } else {
      puntajesValidados.nivelVulnerabilidad = 'BAJA';
    }

    console.log('\n=== ANÁLISIS COMPLETADO ===');
    console.log('Puntajes:', puntajesValidados);
    console.log('Puntaje Total:', puntajesValidados.puntajeTotal);
    console.log('Nivel de Vulnerabilidad:', puntajesValidados.nivelVulnerabilidad);

    return {
      success: true,
      data: puntajesValidados,
      textoExtraido: textoInforme.substring(0, 1000) + '...' // Primeros 1000 caracteres para referencia
    };

  } catch (error) {
    console.error('Error en análisis IA:', error);

    return {
      success: false,
      error: error.message,
      // Valores por defecto en caso de error
      data: {
        ingresoFamiliar: 10,
        numPersonasHogar: 7,
        tipoVivienda: 7,
        situacionLaboralPadres: 10,
        accesoSalud: 7,
        gastosMedicosMensuales: 7,
        puntajeTotal: 48,
        nivelVulnerabilidad: 'MEDIA',
        observaciones: 'Error en análisis automático. Por favor, revisa y ajusta los puntajes manualmente.'
      }
    };
  }
}

/**
 * Genera un resumen ejecutivo del caso para administradores
 * @param {string} pdfPath - Ruta al archivo PDF
 * @returns {Promise<Object>} - Objeto con el resumen del caso
 */
async function generarResumenCaso(pdfPath) {
  try {
    console.log('=== GENERANDO RESUMEN DEL CASO (ADMINISTRADOR) ===');
    console.log('Archivo PDF:', pdfPath);

    // 1. Leer y extraer texto del PDF
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    const textoInforme = pdfData.text;

    console.log('Texto extraído del PDF (primeros 500 caracteres):');
    console.log(textoInforme.substring(0, 500));

    // 2. Preparar el prompt para el resumen
    const prompt = `Eres un experto analista de casos sociales. Lee el siguiente informe social de un paciente oncológico pediátrico y genera un resumen ejecutivo completo.

INFORME SOCIAL:
${textoInforme}

GENERA UN RESUMEN ESTRUCTURADO EN FORMATO JSON con la siguiente información:

{
  "datosDelPaciente": {
    "nombreCompleto": "Nombre del paciente",
    "edad": número,
    "diagnostico": "Diagnóstico médico completo",
    "tratamiento": "Descripción del tratamiento actual",
    "hospital": "Nombre del hospital donde se atiende"
  },
  "composicionFamiliar": {
    "numeroMiembros": número,
    "descripcion": "Descripción de la composición familiar (padres, hermanos, otros)",
    "relacionFamiliar": "Descripción de las relaciones y dinámica familiar"
  },
  "situacionEconomica": {
    "ingresosPrincipales": "Descripción de las fuentes de ingreso",
    "trabajoPadre": "Descripción del trabajo del padre o tutor principal",
    "trabajoMadre": "Descripción del trabajo de la madre",
    "nivelEconomico": "BAJO | MEDIO-BAJO | MEDIO | MEDIO-ALTO | ALTO"
  },
  "situacionVivienda": {
    "tipo": "PROPIA | ALQUILADA | ANTICRÉTICO | PRESTADA | COMPARTIDA",
    "condiciones": "Descripción de las condiciones de la vivienda",
    "serviciosBasicos": ["agua", "luz", "gas", "internet"] o lista vacía
  },
  "necesidadPrincipal": {
    "solicitud": "Qué está solicitando la familia específicamente",
    "monto": "Monto si aplica, o null",
    "justificacion": "Por qué lo necesita y urgencia del caso"
  },
  "factoresDeRiesgo": [
    "Lista de factores de riesgo o vulnerabilidad identificados"
  ],
  "fortalezasFamiliares": [
    "Lista de fortalezas o recursos positivos de la familia"
  ],
  "recomendaciones": "Recomendaciones para el equipo de la fundación",
  "resumenEjecutivo": "Resumen de 2-3 párrafos que sintetice el caso completo, la situación actual y las necesidades identificadas"
}

INSTRUCCIONES:
- Sé objetivo y profesional
- Incluye TODOS los detalles importantes del informe
- Si no encuentras alguna información en el informe, usa null
- El resumen ejecutivo debe ser comprensivo pero conciso`;

    // 3. Llamar a la API de OpenRouter
    console.log('\nLlamando a OpenRouter API para generar resumen...');

    const { ok, data } = await callOpenRouter({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente experto en análisis de casos sociales. Generas resúmenes ejecutivos claros y estructurados. Siempre respondes con JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      xTitle: 'Fundación OncoFeliz - Resumen de Caso'
    });

    if (!ok) {
      throw new Error(`Error from OpenRouter API: ${data.error?.message || 'Unknown error'}`);
    }

    console.log('\nRespuesta de OpenRouter recibida');

    // 4. Extraer y parsear la respuesta
    const contenidoIA = data.choices[0].message.content;
    console.log('Contenido IA:', contenidoIA);

    // Limpiar la respuesta para obtener solo el JSON
    let jsonStr = contenidoIA.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '');
    }

    const resumen = JSON.parse(jsonStr);

    console.log('\n=== RESUMEN GENERADO ===');
    console.log(JSON.stringify(resumen, null, 2));

    return {
      success: true,
      data: resumen,
      textoExtraido: textoInforme.substring(0, 1000) + '...'
    };

  } catch (error) {
    console.error('Error al generar resumen:', error);

    return {
      success: false,
      error: error.message,
      data: {
        resumenEjecutivo: 'Error al generar resumen automático. Por favor, revisa el documento manualmente.',
        datosDelPaciente: null,
        necesidadPrincipal: null
      }
    };
  }
}

module.exports = {
  analizarInformeSocial,
  generarResumenCaso
};
