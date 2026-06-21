-- AlterTable
ALTER TABLE "Collection" ADD COLUMN "coverPhotoId" TEXT;
ALTER TABLE "Collection" ADD COLUMN "coverVideoId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Collection_coverPhotoId_key" ON "Collection"("coverPhotoId");
CREATE UNIQUE INDEX "Collection_coverVideoId_key" ON "Collection"("coverVideoId");

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_coverPhotoId_fkey" FOREIGN KEY ("coverPhotoId") REFERENCES "Photo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_coverVideoId_fkey" FOREIGN KEY ("coverVideoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;