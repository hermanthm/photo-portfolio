import Link from "next/link";
import { notFound } from "next/navigation";

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
        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#C8A97E]">
          {collection.title}
        </p>
        <h1 className="text-4xl font-medium">Photos</h1>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link
            href={`/admin/collections/${collection.id}/edit`}
            className="text-[#A1A1A6] transition hover:text-[#F5F5F7]"
          >
            Back to edit
          </Link>
          <Link
            href={`/admin/collections/${collection.id}/videos`}
            className="text-[#A1A1A6] transition hover:text-[#F5F5F7]"
          >
            Manage videos
          </Link>
        </div>
      </div>

      <PhotoManager
        collectionId={collection.id}
        initialPhotos={collection.photos}
        cloudinaryConfigured={isCloudinaryConfigured()}
      />
    </div>
  );
}