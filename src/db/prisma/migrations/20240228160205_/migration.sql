/*
  Warnings:

  - The `writingSessionId` column on the `Writing` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `WritingSession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `WritingSession` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `startAt` on the `WritingSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Writing" DROP CONSTRAINT "Writing_writingSessionId_fkey";

-- AlterTable
CREATE SEQUENCE badge_id_seq;
ALTER TABLE "Badge" ALTER COLUMN "id" SET DEFAULT nextval('badge_id_seq');
ALTER SEQUENCE badge_id_seq OWNED BY "Badge"."id";

-- AlterTable
CREATE SEQUENCE writing_id_seq;
ALTER TABLE "Writing" ALTER COLUMN "id" SET DEFAULT nextval('writing_id_seq'),
DROP COLUMN "writingSessionId",
ADD COLUMN     "writingSessionId" INTEGER;
ALTER SEQUENCE writing_id_seq OWNED BY "Writing"."id";

-- AlterTable
ALTER TABLE "WritingSession" DROP CONSTRAINT "WritingSession_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "startAt",
ADD COLUMN     "startAt" JSONB NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'onProcess',
ADD CONSTRAINT "WritingSession_pkey" PRIMARY KEY ("id");

-- AlterTable
CREATE SEQUENCE userbadge_id_seq;
ALTER TABLE "userBadge" ALTER COLUMN "id" SET DEFAULT nextval('userbadge_id_seq');
ALTER SEQUENCE userbadge_id_seq OWNED BY "userBadge"."id";

-- AddForeignKey
ALTER TABLE "Writing" ADD CONSTRAINT "Writing_writingSessionId_fkey" FOREIGN KEY ("writingSessionId") REFERENCES "WritingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
