-- CreateEnum
CREATE TYPE "TipoSesion" AS ENUM ('INDIVIDUAL', 'GRUPAL', 'FAMILIAR');

-- CreateEnum
CREATE TYPE "EstadoSesion" AS ENUM ('PROGRAMADA', 'COMPLETADA', 'CANCELADA', 'PENDIENTE');

-- CreateEnum
CREATE TYPE "EstadoTratamiento" AS ENUM ('EN_TRATAMIENTO', 'COMPLETADO', 'SUSPENDIDO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "TipoCita" AS ENUM ('CONSULTA', 'SEGUIMIENTO', 'EVALUACION');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('PROGRAMADA', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'PENDIENTE');

-- CreateEnum
CREATE TYPE "TipoRecordatorio" AS ENUM ('RECORDATORIO_24H', 'RECORDATORIO_1H', 'LLAMAR_CONFIRMAR', 'SIN_RECORDATORIO');

-- CreateEnum
CREATE TYPE "NivelVulnerabilidad" AS ENUM ('BAJO', 'MEDIO', 'ALTO');

-- CreateEnum
CREATE TYPE "TipoVisita" AS ENUM ('DOMICILIARIA', 'SEGUIMIENTO', 'ENTREVISTA', 'EVALUACION');

-- CreateEnum
CREATE TYPE "EstadoVisita" AS ENUM ('PROGRAMADA', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoDerivacion" AS ENUM ('PENDIENTE', 'COMPLETADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "gastos_medicos" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "concepto" TEXT NOT NULL,
    "montoTotal" DECIMAL(65,30) NOT NULL,
    "montoCubierto" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "montoFamilia" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,

    CONSTRAINT "gastos_medicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expedientes_sociales" (
    "id" SERIAL NOT NULL,
    "beneficiarioId" INTEGER NOT NULL,
    "composicionFamiliar" INTEGER NOT NULL,
    "ingresosFamiliares" DECIMAL(65,30) NOT NULL,
    "condicionesVivienda" TEXT,
    "observacionesSocioeco" TEXT,
    "nivelVulnerabilidad" "NivelVulnerabilidad" NOT NULL DEFAULT 'BAJO',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expedientes_sociales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitas" (
    "id" SERIAL NOT NULL,
    "beneficiarioId" INTEGER NOT NULL,
    "fechaVisita" TIMESTAMP(3) NOT NULL,
    "tipoVisita" "TipoVisita" NOT NULL,
    "objetivo" TEXT NOT NULL,
    "observacionesEntorno" TEXT,
    "estado" "EstadoVisita" NOT NULL DEFAULT 'PROGRAMADA',
    "proximaVisita" TIMESTAMP(3),
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluaciones_vulnerabilidad" (
    "id" SERIAL NOT NULL,
    "beneficiarioId" INTEGER NOT NULL,
    "situacionEconomica" INTEGER NOT NULL,
    "condicionesVivienda" INTEGER NOT NULL,
    "saludFamiliar" INTEGER NOT NULL,
    "educacionDesarrollo" INTEGER NOT NULL,
    "puntajeTotal" INTEGER NOT NULL,
    "nivel" "NivelVulnerabilidad" NOT NULL,
    "factoresRiesgo" TEXT,
    "recomendaciones" TEXT,
    "fechaEvaluacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluaciones_vulnerabilidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profesionales" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "especialidad" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profesionales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "derivaciones" (
    "id" SERIAL NOT NULL,
    "beneficiarioId" INTEGER NOT NULL,
    "profesionalDestinoId" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "observaciones" TEXT,
    "fechaDerivacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaSeguimiento" TIMESTAMP(3),
    "estado" "EstadoDerivacion" NOT NULL DEFAULT 'PENDIENTE',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "profesionalId" INTEGER,
    "usuarioId" INTEGER,

    CONSTRAINT "derivaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora" TEXT NOT NULL,
    "tipo" "TipoSesion" NOT NULL,
    "estado" "EstadoSesion" NOT NULL,
    "duracion" INTEGER NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historiales_clinicos" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "diagnostico" TEXT NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "sesiones" INTEGER NOT NULL DEFAULT 0,
    "estado" "EstadoTratamiento" NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historiales_clinicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citas" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora" TEXT NOT NULL,
    "tipo" "TipoCita" NOT NULL,
    "estado" "EstadoCita" NOT NULL,
    "recordatorio" "TipoRecordatorio" NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "gastos_medicos" ADD CONSTRAINT "gastos_medicos_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expedientes_sociales" ADD CONSTRAINT "expedientes_sociales_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitas" ADD CONSTRAINT "visitas_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_vulnerabilidad" ADD CONSTRAINT "evaluaciones_vulnerabilidad_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "derivaciones" ADD CONSTRAINT "derivaciones_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "derivaciones" ADD CONSTRAINT "derivaciones_profesionalDestinoId_fkey" FOREIGN KEY ("profesionalDestinoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "derivaciones" ADD CONSTRAINT "derivaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historiales_clinicos" ADD CONSTRAINT "historiales_clinicos_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
