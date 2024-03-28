-- DropForeignKey
ALTER TABLE "WritingSession" DROP CONSTRAINT "WritingSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "userBadge" DROP CONSTRAINT "userBadge_userId_fkey";

-- AddForeignKey
ALTER TABLE "WritingSession" ADD CONSTRAINT "WritingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userBadge" ADD CONSTRAINT "userBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
