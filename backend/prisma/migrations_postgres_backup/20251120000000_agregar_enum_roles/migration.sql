-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMINISTRADOR', 'PSICOLOGO', 'TRABAJADOR_SOCIAL', 'ASISTENTE', 'BENEFICIARIO');

-- AlterTable
-- Primero agregamos una columna temporal para el nuevo tipo
ALTER TABLE "Usuario" ADD COLUMN "rol_new" "Rol";

-- Migramos los datos existentes al nuevo enum
UPDATE "Usuario"
SET "rol_new" = CASE
  WHEN LOWER(rol) = 'admin' OR LOWER(rol) = 'administrador' THEN 'ADMINISTRADOR'::"Rol"
  WHEN LOWER(rol) = 'psicologo' THEN 'PSICOLOGO'::"Rol"
  WHEN LOWER(rol) = 'trabajadorsocial' OR LOWER(rol) = 'trabajador social' THEN 'TRABAJADOR_SOCIAL'::"Rol"
  ELSE 'BENEFICIARIO'::"Rol"
END
WHERE rol IS NOT NULL;

-- Para los registros que tienen rol NULL, asignamos BENEFICIARIO
UPDATE "Usuario"
SET "rol_new" = 'BENEFICIARIO'::"Rol"
WHERE rol IS NULL;

-- Eliminamos la columna antigua
ALTER TABLE "Usuario" DROP COLUMN "rol";

-- Renombramos la columna nueva
ALTER TABLE "Usuario" RENAME COLUMN "rol_new" TO "rol";

-- Hacemos que la columna sea NOT NULL y agregamos el default
ALTER TABLE "Usuario" ALTER COLUMN "rol" SET NOT NULL;
ALTER TABLE "Usuario" ALTER COLUMN "rol" SET DEFAULT 'BENEFICIARIO'::"Rol";
