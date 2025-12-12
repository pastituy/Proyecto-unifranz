-- Actualizar los primeros 2 beneficiarios para asignarlos al asistente (ID: 10)
UPDATE "Beneficiario"
SET "asignadoAId" = 10
WHERE "id" IN (
  SELECT "id" FROM "Beneficiario"
  WHERE "estadoBeneficiario" = 'ACTIVO'
  ORDER BY "id"
  LIMIT 2
);
