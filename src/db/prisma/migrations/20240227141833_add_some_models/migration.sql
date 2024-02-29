/*
  Warnings:

  - You are about to drop the column `userSettingId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `UserSetting` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[writingSettingId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BadgeCondition" AS ENUM ('firstWritingUploaded', 'partialCompleted25', 'partialCompleted50', 'partialCompleted75', 'completed', 'failed');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_userSettingId_fkey";

-- DropIndex
DROP INDEX "User_userSettingId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userSettingId",
ADD COLUMN     "writingSettingId" TEXT;

-- DropTable
DROP TABLE "UserSetting";

-- CreateTable
CREATE TABLE "WritingSetting" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "page" INTEGER NOT NULL,
    "startAt" TEXT NOT NULL,
    "writingHours" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritingSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Writing" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Writing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "condition" "BadgeCondition" NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_writingSettingId_key" ON "User"("writingSettingId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_writingSettingId_fkey" FOREIGN KEY ("writingSettingId") REFERENCES "WritingSetting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
