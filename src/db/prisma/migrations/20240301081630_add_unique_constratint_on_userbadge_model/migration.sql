/*
  Warnings:

  - A unique constraint covering the columns `[userId,badgeId]` on the table `userBadge` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "userBadge_userId_badgeId_key" ON "userBadge"("userId", "badgeId");
