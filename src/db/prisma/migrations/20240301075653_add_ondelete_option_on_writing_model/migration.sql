-- DropForeignKey
ALTER TABLE "Writing" DROP CONSTRAINT "Writing_writingSessionId_fkey";

-- AddForeignKey
ALTER TABLE "Writing" ADD CONSTRAINT "Writing_writingSessionId_fkey" FOREIGN KEY ("writingSessionId") REFERENCES "WritingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
