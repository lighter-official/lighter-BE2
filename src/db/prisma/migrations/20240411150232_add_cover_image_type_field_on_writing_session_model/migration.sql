-- AlterEnum
ALTER TYPE "WritingSessionStatus" ADD VALUE 'published';

-- AlterTable
ALTER TABLE "WritingSession" ADD COLUMN     "coverImageType" INTEGER;
