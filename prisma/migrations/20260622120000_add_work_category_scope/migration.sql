-- CreateEnum
CREATE TYPE "WorkCategoryScope" AS ENUM ('photography', 'video', 'both');

-- AlterTable
ALTER TABLE "WorkCategory" ADD COLUMN "scope" "WorkCategoryScope" NOT NULL DEFAULT 'both';