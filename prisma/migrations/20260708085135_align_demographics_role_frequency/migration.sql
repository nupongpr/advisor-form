/*
  Warnings:

  - You are about to drop the column `ageBand` on the `Response` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `Response` table. All the data in the column will be lost.
  - You are about to drop the column `field` on the `Response` table. All the data in the column will be lost.
  - Added the required column `frequency` to the `Response` table without a default value. This is only possible if the table has no rows.

*/
-- AlterTable
ALTER TABLE "Response" DROP COLUMN "ageBand",
DROP COLUMN "experience",
DROP COLUMN "field",
ADD COLUMN     "frequency" TEXT NOT NULL;
