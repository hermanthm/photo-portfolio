import Image from "next/image";
import Link from "next/link";

import { getAllCollections } from "@/lib/admin";
import { getCollectionCoverUrl } from "@/lib/collection-cover";

export default async function AdminCollectionsPage() {
  const collections = await getAllCollections();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#C8A97E]">
            Collections
          </p>
          <h1 className="text-4xl font-medium">Manage collections</h1>
        </div>
        <Link
          href="/admin/collections/new"
          className="rounded-full border border-[#C8A97E] px-5 py-2 text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black"
        >
          New collection
        </Link>
      </div>

      {collections.length === 0 ? (
        <div className="rounded-3xl border border-neutral-800 bg-[#111111] p-8 text-[#A1A1A6]">
          No collections yet. Create your first collection to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {collections.map((collection) => {
            const coverUrl = getCollectionCoverUrl(collection);

            return (
            <div
              key={collection.id}
              className="flex flex-col gap-4 rounded-3xl border border-neutral-800 bg-[#111111] p-6 md:flex-row md:items-center md:justify-between"
            >
              {coverUrl ? (
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-2xl bg-[#1A1A1A]">
                  <Image
                    src={coverUrl}
                    alt={collection.title}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-2xl bg-[#1A1A1A] text-xs text-[#A1A1A6]">
                  No cover
                </div>
              )}
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-medium text-[#F5F5F7]">
                    {collection.title}
                  </h2>
                  <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs uppercase tracking-[0.15em] text-[#A1A1A6]">
                    {collection.type}
                  </span>
                  {collection.category ? (
                    <span className="rounded-full border border-[#C8A97E]/30 px-3 py-1 text-xs text-[#C8A97E]">
                      {collection.category.name}
                    </span>
                  ) : null}
                  {collection.published ? (
                    <span className="rounded-full border border-emerald-500/30 px-3 py-1 text-xs text-emerald-300">
                      Published
                    </span>
                  ) : (
                    <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-[#A1A1A6]">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-[#A1A1A6]">{collection.description}</p>
                <p className="mt-2 text-sm text-[#A1A1A6]">
                  {collection._count.photos} photos · {collection._count.videos} videos
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <Link
                  href={`/admin/collections/${collection.id}/edit`}
                  className="rounded-full border border-[#C8A97E] px-4 py-2 text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black"
                >
                  Edit
                </Link>
                <Link
                  href={`/admin/collections/${collection.id}/photos`}
                  className="rounded-full border border-neutral-700 px-4 py-2 text-[#A1A1A6] transition hover:text-[#F5F5F7]"
                >
                  Photos
                </Link>
                <Link
                  href={`/admin/collections/${collection.id}/videos`}
                  className="rounded-full border border-neutral-700 px-4 py-2 text-[#A1A1A6] transition hover:text-[#F5F5F7]"
                >
                  Videos
                </Link>
                <Link
                  href={`/work/${collection.slug}`}
                  className="rounded-full border border-neutral-700 px-4 py-2 text-[#A1A1A6] transition hover:text-[#F5F5F7]"
                >
                  View
                </Link>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}