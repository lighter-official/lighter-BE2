/*
  Warnings:

  - You are about to drop the `CronTasks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CronTasks";

-- CreateTable
CREATE TABLE "CronTask" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expression" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CronTask_pkey" PRIMARY KEY ("id")
);
