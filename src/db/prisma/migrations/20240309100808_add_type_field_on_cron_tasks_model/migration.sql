/*
  Warnings:

  - Added the required column `type` to the `CronTasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CronTasks" ADD COLUMN     "type" TEXT NOT NULL;
