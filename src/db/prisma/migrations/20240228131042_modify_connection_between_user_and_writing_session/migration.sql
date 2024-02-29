/*
  Warnings:

  - You are about to drop the column `writingSessionId` on the `User` table. All the data in the column will be lost.
  - Added the required column `userId` to the `WritingSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_writingSessionId_fkey";

-- DropIndex
DROP INDEX "User_writingSessionId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "writingSessionId";

-- AlterTable
ALTER TABLE "WritingSession" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "WritingSession" ADD CONSTRAINT "WritingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
