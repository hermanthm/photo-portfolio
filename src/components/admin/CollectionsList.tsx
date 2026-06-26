"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { getCollectionCoverUrl } from "@/lib/collection-cover";
import type { WorkCategoryScope } from "@/lib/work-category-scope";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  scope: WorkCategoryScope;
};

type CollectionRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  published: boolean;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  coverPhoto: { url: string } | null;
  coverVideo: { thumbnailUrl: string | null } | null;
  photos: { url: string }[];
  videos: { thumbnailUrl: string | null }[];
  _count: { photos: number; videos: number };
};

type CollectionsListProps = {
  initialCollections: CollectionRow[];
  categories: CategoryOption[];
};

type CategoryFilter = "all" | "uncategorized" | string;

export function CollectionsList({
  initialCollections,
  categories,
}: CollectionsListProps) {
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const filteredCollections = useMemo(() => {
    if (filter === "all") {
      return initialCollections;
    }

    if (filter === "uncategorized") {
      return initialCollections.filter((collection) => !collection.categoryId);
    }

    return initialCollections.filter((collection) => collection.categoryId === filter);
  }, [filter, initialCollections]);

  const isFiltered = filter !== "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-neutral-800 bg-[#111111] p-6 sm:flex-row sm:items-end sm:justify-between">
        <label className="block min-w-[220px] flex-1 space-y-2">
          <span className="text-sm text-[#A1A1A6]">Filter by category</span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
          >
            <option value="all">All categories</option>
            <option value="uncategorized">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        {isFiltered ? (
          <p className="text-sm text-[#A1A1A6]">
            {filteredCollections.length} of {initialCollections.length} collections
          </p>
        ) : null}
      </div>

      {filteredCollections.length === 0 ? (
        <div className="rounded-3xl border border-neutral-800 bg-[#111111] p-8 text-[#A1A1A6]">
          {isFiltered
            ? "No collections in this category."
            : "No collections yet. Create your first collection to get started."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCollections.map((collection) => {
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