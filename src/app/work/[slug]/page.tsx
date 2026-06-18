import Image from "next/image";
import { notFound } from "next/navigation";

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
        {collection.type} · default {collection.defaultView}
      </p>
      <h1 className="mt-3 text-5xl font-medium tracking-[-0.04em] text-[#F5F5F7] md:text-6xl">
        {collection.title}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-[#A1A1A6]">
        {collection.description}
      </p>

      {collection.photos.length > 0 ? (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-medium text-[#F5F5F7]">Photos</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {collection.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#111111]"
              >
                <Image
                  src={photo.url}
                  alt={photo.alt ?? collection.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {collection.videos.length > 0 ? (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-medium text-[#F5F5F7]">Videos</h2>
          <div className="space-y-8">
            {collection.videos.map((video) => (
              <article key={video.id}>
                <h3 className="mb-3 text-xl font-medium text-[#F5F5F7]">
                  {video.title}
                </h3>
                <div className="aspect-video overflow-hidden rounded-2xl bg-[#111111]">
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}