import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminCategoriesShortcut } from "@/components/admin/AdminCategoriesShortcut";
import { VideoManager } from "@/components/admin/VideoManager";
import { getCollectionById } from "@/lib/admin";

type VideosPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CollectionVideosPage({ params }: VideosPageProps) {
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
        <h1 className="text-4xl font-medium">Videos</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <AdminCategoriesShortcut />
          <Link
            href={`/admin/collections/${collection.id}/edit`}
            className="text-muted transition hover:text-foreground"
          >
            Back to edit
          </Link>
          <Link
            href={`/admin/collections/${collection.id}/photos`}
            className="text-muted transition hover:text-foreground"
          >
            Manage photos
          </Link>
        </div>
      </div>

      <VideoManager
        collectionId={collection.id}
        initialVideos={collection.videos}
        coverVideoId={collection.coverVideoId}
      />
    </div>
  );
}