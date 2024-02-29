/*
  Warnings:

  - You are about to drop the column `writingSettingId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `writingSettingId` on the `Writing` table. All the data in the column will be lost.
  - You are about to drop the `WritingSetting` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[writingSessionId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "WritingSessionStatus" AS ENUM ('onProcess', 'aborted', 'completed');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_writingSettingId_fkey";

-- DropForeignKey
ALTER TABLE "Writing" DROP CONSTRAINT "Writing_writingSettingId_fkey";

-- DropIndex
DROP INDEX "User_writingSettingId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "writingSettingId",
ADD COLUMN     "writingSessionId" TEXT;

-- AlterTable
ALTER TABLE "Writing" DROP COLUMN "writingSettingId",
ADD COLUMN     "writingSessionId" TEXT;

-- DropTable
DROP TABLE "WritingSetting";

-- CreateTable
CREATE TABLE "WritingSession" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "page" INTEGER NOT NULL,
    "startAt" TEXT NOT NULL,
    "writingHours" INTEGER NOT NULL,
    "status" "WritingSessionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userBadge" (
    "id" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_writingSessionId_key" ON "User"("writingSessionId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_writingSessionId_fkey" FOREIGN KEY ("writingSessionId") REFERENCES "WritingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Writing" ADD CONSTRAINT "Writing_writingSessionId_fkey" FOREIGN KEY ("writingSessionId") REFERENCES "WritingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userBadge" ADD CONSTRAINT "userBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userBadge" ADD CONSTRAINT "userBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
