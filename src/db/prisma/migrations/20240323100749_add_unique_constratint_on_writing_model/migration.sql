/*
  Warnings:

  - A unique constraint covering the columns `[writingSessionId,step]` on the table `Writing` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Writing" ADD COLUMN     "step" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WritingSession" ADD COLUMN     "progressStep" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Writing_writingSessionId_step_key" ON "Writing"("writingSessionId", "step");
