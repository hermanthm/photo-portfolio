-- CreateEnum
CREATE TYPE "CoverAspectRatio" AS ENUM ('ratio_16_10', 'ratio_4_3', 'ratio_3_2', 'ratio_1_1', 'ratio_21_9');

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN "coverAspectRatio" "CoverAspectRatio" NOT NULL DEFAULT 'ratio_16_10';
ALTER TABLE "Collection" ADD COLUMN "coverFocalX" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "Collection" ADD COLUMN "coverFocalY" INTEGER NOT NULL DEFAULT 50;