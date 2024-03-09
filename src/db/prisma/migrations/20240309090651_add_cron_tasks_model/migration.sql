-- CreateTable
CREATE TABLE "CronTasks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "expression" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CronTasks_pkey" PRIMARY KEY ("id")
);
