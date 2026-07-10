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
      <div className="flex flex-col gap-4 ui-card-padded sm:flex-row sm:items-end sm:justify-between">
        <label className="block min-w-[220px] flex-1 space-y-2">
          <span className="ui-label">Filter by category</span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="ui-input"
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
          <p className="ui-label">
            {filteredCollections.length} of {initialCollections.length} collections
          </p>
        ) : null}
      </div>

      {filteredCollections.length === 0 ? (
        <div className="ui-card-padded-lg text-muted">
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
                className="flex flex-col gap-4 ui-card-padded md:flex-row md:items-center md:justify-between"
              >
                {coverUrl ? (
                  <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-2xl bg-media">
                    <Image
                      src={coverUrl}
                      alt={collection.title}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-2xl bg-media ui-helper">
                    No cover
                  </div>
                )}
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-medium text-foreground">
                      {collection.title}
                    </h2>
                    <span className="rounded-full border border-border-strong px-3 py-1 text-xs uppercase tracking-[0.15em] text-muted">
                      {collection.type}
                    </span>
                    {collection.category ? (
                      <span className="rounded-full border border-accent/30 px-3 py-1 text-xs text-accent">
                        {collection.category.name}
                      </span>
                    ) : null}
                    {collection.published ? (
                      <span className="rounded-full border border-emerald-500/30 px-3 py-1 text-xs text-emerald-300">
                        Published
                      </span>
                    ) : (
                      <span className="rounded-full border border-border-strong px-3 py-1 ui-helper">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-muted">{collection.description}</p>
                  <p className="mt-2 ui-label">
                    {collection._count.photos} photos · {collection._count.videos} videos
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  <Link
                    href={`/admin/collections/${collection.id}/edit`}
                    className="rounded-full border border-accent px-4 py-2 text-foreground transition hover:bg-accent hover:text-inverse"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/collections/${collection.id}/photos`}
                    className="rounded-full border border-border-strong px-4 py-2 text-muted transition hover:text-foreground"
                  >
                    Photos
                  </Link>
                  <Link
                    href={`/admin/collections/${collection.id}/videos`}
                    className="rounded-full border border-border-strong px-4 py-2 text-muted transition hover:text-foreground"
                  >
                    Videos
                  </Link>
                  <Link
                    href={`/work/${collection.slug}`}
                    className="rounded-full border border-border-strong px-4 py-2 text-muted transition hover:text-foreground"
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