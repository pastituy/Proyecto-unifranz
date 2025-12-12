/*
  Warnings:

  - A unique constraint covering the columns `[ci]` on the table `Padre` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Padre" ADD COLUMN     "password" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Padre_ci_key" ON "Padre"("ci");
