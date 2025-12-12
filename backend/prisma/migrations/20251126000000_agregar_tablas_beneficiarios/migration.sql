-- CreateEnum para estados y niveles (si no existen)
DO $$ BEGIN
 CREATE TYPE "EstadoRegistro" AS ENUM ('REGISTRO_INICIAL', 'PENDIENTE_EVALUACION_PSICOLOGICA', 'EN_EVALUACION_ADMINISTRADOR', 'BENEFICIARIO_ACTIVO', 'CASO_RECHAZADO');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "EstadoBeneficiario" AS ENUM ('ACTIVO', 'INACTIVO', 'RECUPERADO', 'FALLECIDO');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "EstadoMedico" AS ENUM ('EN_TRATAMIENTO', 'VIGILANCIA', 'PALIATIVO', 'ABANDONO', 'FALLECIDO');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "FaseTratamiento" AS ENUM ('INDUCCION', 'CONSOLIDACION', 'INTENSIFICACION', 'MANTENIMIENTO', 'POST_TRATAMIENTO');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "EstadoSesionQuimio" AS ENUM ('PROGRAMADA', 'REALIZADA', 'REPROGRAMADA', 'NO_ASISTIO');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "TipoAyuda" AS ENUM ('MEDICAMENTOS', 'ANALISIS_EXAMENES', 'QUIMIOTERAPIA', 'TRANSPORTE', 'ALIMENTACION', 'OTRO');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "PrioridadSolicitud" AS ENUM ('NORMAL', 'ALTA', 'URGENTE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'LISTA_PARA_RECOGER', 'ENTREGADA', 'RECHAZADA');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable pacientes_registro
CREATE TABLE IF NOT EXISTS "pacientes_registro" (
    "id" SERIAL NOT NULL,
    "nombreCompletoNino" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "edad" INTEGER NOT NULL,
    "ciNino" TEXT,
    "diagnostico" TEXT NOT NULL,
    "nombreCompletoTutor" TEXT NOT NULL,
    "ciTutor" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "telefonoTutor" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "emailTutor" TEXT,
    "estado" "EstadoRegistro" NOT NULL DEFAULT 'REGISTRO_INICIAL',
    "creadoPorId" INTEGER NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pacientes_registro_pkey" PRIMARY KEY ("id")
);

-- CreateTable evaluaciones_sociales
CREATE TABLE IF NOT EXISTS "evaluaciones_sociales" (
    "id" SERIAL NOT NULL,
    "pacienteRegistroId" INTEGER NOT NULL,
    "ingresoFamiliar" INTEGER NOT NULL,
    "numPersonasHogar" INTEGER NOT NULL,
    "tipoVivienda" INTEGER NOT NULL,
    "situacionLaboralPadres" INTEGER NOT NULL,
    "accesoSalud" INTEGER NOT NULL,
    "gastosMedicosMensuales" INTEGER NOT NULL,
    "puntajeTotal" INTEGER NOT NULL,
    "nivelVulnerabilidad" "NivelVulnerabilidad" NOT NULL,
    "informeSocialPdf" TEXT,
    "trabajadorSocialId" INTEGER NOT NULL,
    "fechaEvaluacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluaciones_sociales_pkey" PRIMARY KEY ("id")
);

-- CreateTable evaluaciones_psicologicas
CREATE TABLE IF NOT EXISTS "evaluaciones_psicologicas" (
    "id" SERIAL NOT NULL,
    "pacienteRegistroId" INTEGER NOT NULL,
    "informePsicologicoPdf" TEXT,
    "observaciones" TEXT,
    "psicologoId" INTEGER NOT NULL,
    "fechaEvaluacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluaciones_psicologicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable beneficiarios
CREATE TABLE IF NOT EXISTS "beneficiarios" (
    "id" SERIAL NOT NULL,
    "pacienteRegistroId" INTEGER NOT NULL,
    "codigoBeneficiario" TEXT NOT NULL,
    "estadoBeneficiario" "EstadoBeneficiario" NOT NULL DEFAULT 'ACTIVO',
    "estadoMedico" "EstadoMedico" NOT NULL DEFAULT 'EN_TRATAMIENTO',
    "fechaAceptacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aceptadoPorId" INTEGER NOT NULL,
    "asignadoAId" INTEGER,
    "historiaClinica" TEXT,
    "fechaPrimerContacto" TIMESTAMP(3),
    "nombreMedicoTratante" TEXT,
    "especialidadMedico" TEXT,
    "telefonoMedico" TEXT,
    "institucionMedica" TEXT,
    "faseTratamiento" "FaseTratamiento",
    "semanaProtocolo" INTEGER,
    "esquemaTratamiento" TEXT,
    "ultimaFechaControl" TIMESTAMP(3),
    "proximaFechaControl" TIMESTAMP(3),
    "frecuenciaControl" TEXT,
    "fechaInicioVigilancia" TIMESTAMP(3),
    "tiempoVigilanciaAnios" INTEGER,
    "fechaUltimaAsistencia" TIMESTAMP(3),
    "motivoAbandono" TEXT,
    "notificadoDefensoria" BOOLEAN NOT NULL DEFAULT false,
    "fechaNotificacionDefensoria" TIMESTAMP(3),
    "fechaFallecimiento" TIMESTAMP(3),
    "causaFallecimiento" TEXT,
    "alergiasMedicamentos" TEXT,
    "complicaciones" TEXT,
    "observacionesMedicas" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beneficiarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable ayudas
CREATE TABLE IF NOT EXISTS "ayudas" (
    "id" SERIAL NOT NULL,
    "beneficiarioId" INTEGER NOT NULL,
    "fechaAyuda" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "medicamentos" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "analisisExamenes" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "quimioterapia" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "transporte" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "alimentacion" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "otros" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalAyuda" DECIMAL(65,30) NOT NULL,
    "observaciones" TEXT,
    "registradoPorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ayudas_pkey" PRIMARY KEY ("id")
);

-- CreateTable sesiones_quimioterapia
CREATE TABLE IF NOT EXISTS "sesiones_quimioterapia" (
    "id" SERIAL NOT NULL,
    "beneficiarioId" INTEGER NOT NULL,
    "numeroSesion" INTEGER NOT NULL,
    "fechaProgramada" TIMESTAMP(3) NOT NULL,
    "fechaRealizada" TIMESTAMP(3),
    "estado" "EstadoSesionQuimio" NOT NULL DEFAULT 'PROGRAMADA',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesiones_quimioterapia_pkey" PRIMARY KEY ("id")
);

-- CreateTable solicitudes_ayuda
CREATE TABLE IF NOT EXISTS "solicitudes_ayuda" (
    "id" SERIAL NOT NULL,
    "codigoSolicitud" TEXT NOT NULL,
    "beneficiarioId" INTEGER NOT NULL,
    "solicitadoPorId" INTEGER NOT NULL,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prioridad" "PrioridadSolicitud" NOT NULL DEFAULT 'NORMAL',
    "tipoAyuda" "TipoAyuda" NOT NULL,
    "numeroReceta" TEXT,
    "fechaReceta" TIMESTAMP(3),
    "medicoPrescriptor" TEXT,
    "recetaPdf" TEXT,
    "detalleSolicitud" TEXT NOT NULL,
    "costoEstimado" DECIMAL(65,30),
    "observaciones" TEXT,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "revisadoPorId" INTEGER,
    "fechaRevision" TIMESTAMP(3),
    "motivoRechazo" TEXT,
    "fechaEntrega" TIMESTAMP(3),
    "lugarEntrega" TEXT,
    "costoReal" DECIMAL(65,30),
    "proveedor" TEXT,
    "facturaPdf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_ayuda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "evaluaciones_sociales_pacienteRegistroId_key" ON "evaluaciones_sociales"("pacienteRegistroId");
CREATE UNIQUE INDEX IF NOT EXISTS "evaluaciones_psicologicas_pacienteRegistroId_key" ON "evaluaciones_psicologicas"("pacienteRegistroId");
CREATE UNIQUE INDEX IF NOT EXISTS "beneficiarios_pacienteRegistroId_key" ON "beneficiarios"("pacienteRegistroId");
CREATE UNIQUE INDEX IF NOT EXISTS "beneficiarios_codigoBeneficiario_key" ON "beneficiarios"("codigoBeneficiario");
CREATE UNIQUE INDEX IF NOT EXISTS "beneficiarios_historiaClinica_key" ON "beneficiarios"("historiaClinica");
CREATE UNIQUE INDEX IF NOT EXISTS "solicitudes_ayuda_codigoSolicitud_key" ON "solicitudes_ayuda"("codigoSolicitud");

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "pacientes_registro" ADD CONSTRAINT "pacientes_registro_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "evaluaciones_sociales" ADD CONSTRAINT "evaluaciones_sociales_pacienteRegistroId_fkey" FOREIGN KEY ("pacienteRegistroId") REFERENCES "pacientes_registro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "evaluaciones_sociales" ADD CONSTRAINT "evaluaciones_sociales_trabajadorSocialId_fkey" FOREIGN KEY ("trabajadorSocialId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "evaluaciones_psicologicas" ADD CONSTRAINT "evaluaciones_psicologicas_pacienteRegistroId_fkey" FOREIGN KEY ("pacienteRegistroId") REFERENCES "pacientes_registro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "evaluaciones_psicologicas" ADD CONSTRAINT "evaluaciones_psicologicas_psicologoId_fkey" FOREIGN KEY ("psicologoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "beneficiarios" ADD CONSTRAINT "beneficiarios_pacienteRegistroId_fkey" FOREIGN KEY ("pacienteRegistroId") REFERENCES "pacientes_registro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "beneficiarios" ADD CONSTRAINT "beneficiarios_aceptadoPorId_fkey" FOREIGN KEY ("aceptadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "beneficiarios" ADD CONSTRAINT "beneficiarios_asignadoAId_fkey" FOREIGN KEY ("asignadoAId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "ayudas" ADD CONSTRAINT "ayudas_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "beneficiarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "ayudas" ADD CONSTRAINT "ayudas_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "sesiones_quimioterapia" ADD CONSTRAINT "sesiones_quimioterapia_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "beneficiarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "solicitudes_ayuda" ADD CONSTRAINT "solicitudes_ayuda_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "beneficiarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "solicitudes_ayuda" ADD CONSTRAINT "solicitudes_ayuda_solicitadoPorId_fkey" FOREIGN KEY ("solicitadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "solicitudes_ayuda" ADD CONSTRAINT "solicitudes_ayuda_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
