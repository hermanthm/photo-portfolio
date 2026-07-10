import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminCategoriesShortcut } from "@/components/admin/AdminCategoriesShortcut";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { getCollectionById } from "@/lib/admin";
import { isCloudinaryConfigured } from "@/lib/cloudinary";

type PhotosPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CollectionPhotosPage({ params }: PhotosPageProps) {
  const { id } = await params;
  const collection = await getCollectionById(id);

  if (!collection) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <p className="mb-2 ui-eyebrow">
          {collection.title}
        </p>
        <h1 className="text-4xl font-medium">Photos</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <AdminCategoriesShortcut />
          <Link
            href={`/admin/collections/${collection.id}/edit`}
            className="text-muted transition hover:text-foreground"
          >
            Back to edit
          </Link>
          <Link
            href={`/admin/collections/${collection.id}/videos`}
            className="text-muted transition hover:text-foreground"
          >
            Manage videos
          </Link>
        </div>
      </div>

      <PhotoManager
        collectionId={collection.id}
        initialPhotos={collection.photos}
        cloudinaryConfigured={isCloudinaryConfigured()}
        coverPhotoId={collection.coverPhotoId}
      />
    </div>
  );
}