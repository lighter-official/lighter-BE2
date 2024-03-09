/*
  Warnings:

  - You are about to drop the column `finishedAt` on the `WritingSession` table. All the data in the column will be lost.
  - You are about to drop the column `nearestEndDate` on the `WritingSession` table. All the data in the column will be lost.
  - You are about to drop the column `nearestStartDate` on the `WritingSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WritingSession" DROP COLUMN "finishedAt",
DROP COLUMN "nearestEndDate",
DROP COLUMN "nearestStartDate",
ADD COLUMN     "finishDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);
