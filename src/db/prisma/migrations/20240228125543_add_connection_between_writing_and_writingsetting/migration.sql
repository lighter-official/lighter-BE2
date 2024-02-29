-- AlterTable
ALTER TABLE "Writing" ADD COLUMN     "writingSettingId" TEXT;

-- AddForeignKey
ALTER TABLE "Writing" ADD CONSTRAINT "Writing_writingSettingId_fkey" FOREIGN KEY ("writingSettingId") REFERENCES "WritingSetting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
