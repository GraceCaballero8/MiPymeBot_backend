/*
  Warnings:

  - You are about to drop the column `company_id` on the `product_groups` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `units_of_measure` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `product_groups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `units_of_measure` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "product_groups" DROP CONSTRAINT "product_groups_company_id_fkey";

-- DropForeignKey
ALTER TABLE "units_of_measure" DROP CONSTRAINT "units_of_measure_company_id_fkey";

-- DropIndex
DROP INDEX "product_groups_name_company_id_key";

-- DropIndex
DROP INDEX "units_of_measure_name_company_id_key";

-- AlterTable
ALTER TABLE "product_groups" DROP COLUMN "company_id";

-- AlterTable
ALTER TABLE "units_of_measure" DROP COLUMN "company_id";

-- CreateIndex
CREATE UNIQUE INDEX "product_groups_name_key" ON "product_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "units_of_measure_name_key" ON "units_of_measure"("name");
