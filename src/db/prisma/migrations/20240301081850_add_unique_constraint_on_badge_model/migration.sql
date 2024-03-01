/*
  Warnings:

  - A unique constraint covering the columns `[condition]` on the table `Badge` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Badge_condition_key" ON "Badge"("condition");
