/*
  Warnings:

  - Added the required column `providerType` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('kakao', 'google', 'test');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "providerType" "ProviderType" NOT NULL;
