ALTER TABLE "Collection" ALTER COLUMN "protectPhotos" SET DEFAULT true;
UPDATE "Collection" SET "protectPhotos" = true WHERE "protectPhotos" = false;