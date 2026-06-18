import { notFound } from "next/navigation";

import { CollectionGallery } from "@/components/gallery/CollectionGallery";
import { db } from "@/lib/db";

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: WorkPageProps) {
  const { slug } = await params;
  const collection = await db.collection.findUnique({ where: { slug } });
  return { title: collection?.title ?? "Collection" };
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { slug } = await params;

  const collection = await db.collection.findUnique({
    where: { slug, published: true },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      videos: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!collection) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 pt-32 pb-24">
      <p className="text-sm uppercase tracking-[0.2em] text-[#C8A97E]">
        {collection.type}
      </p>
      <h1 className="mt-3 text-5xl font-medium tracking-[-0.04em] text-[#F5F5F7] md:text-6xl">
        {collection.title}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-[#A1A1A6]">
        {collection.description}
      </p>

      <CollectionGallery
        photos={collection.photos}
        videos={collection.videos}
        collectionTitle={collection.title}
      />
    </main>
  );
}