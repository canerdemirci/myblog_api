/*
  Warnings:

  - You are about to alter the column `description` on the `Post` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(160)`.

*/
-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "description" SET DATA TYPE VARCHAR(160);
