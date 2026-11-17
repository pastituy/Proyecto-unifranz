-- CreateEnum
CREATE TYPE "EstadoDerivacion" AS ENUM ('PENDIENTE', 'COMPLETADA');

-- CreateTable
CREATE TABLE "derivaciones_psicologicas" (
    "id" SERIAL NOT NULL,
    "pacienteRegistroId" INTEGER NOT NULL,
    "derivadoPorId" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" "EstadoDerivacion" NOT NULL DEFAULT 'PENDIENTE',
    "psicologoId" INTEGER,
    "informePdf" TEXT,
    "observaciones" TEXT,
    "fechaDerivacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaInforme" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "derivaciones_psicologicas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "derivaciones_psicologicas_pacienteRegistroId_idx" ON "derivaciones_psicologicas"("pacienteRegistroId");

-- CreateIndex
CREATE INDEX "derivaciones_psicologicas_estado_idx" ON "derivaciones_psicologicas"("estado");

-- AddForeignKey
ALTER TABLE "derivaciones_psicologicas" ADD CONSTRAINT "derivaciones_psicologicas_pacienteRegistroId_fkey" FOREIGN KEY ("pacienteRegistroId") REFERENCES "pacientes_registro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "derivaciones_psicologicas" ADD CONSTRAINT "derivaciones_psicologicas_derivadoPorId_fkey" FOREIGN KEY ("derivadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "derivaciones_psicologicas" ADD CONSTRAINT "derivaciones_psicologicas_psicologoId_fkey" FOREIGN KEY ("psicologoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

