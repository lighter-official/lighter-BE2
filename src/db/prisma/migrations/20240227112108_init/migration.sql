-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nickname" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userSettingId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSetting" (
    "id" TEXT NOT NULL,

    CONSTRAINT "UserSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userSettingId_key" ON "User"("userSettingId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userSettingId_fkey" FOREIGN KEY ("userSettingId") REFERENCES "UserSetting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
