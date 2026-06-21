import type { CollectionCoverSource } from "@/lib/collection-cover";

export type GroupedCollection = CollectionCoverSource & {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  sortOrder: number;
  category: {
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
  } | null;
};

export type CollectionCategoryGroup = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  collections: GroupedCollection[];
};

const UNCATEGORIZED_ID = "__uncategorized__";

export function groupCollectionsByCategory(
  collections: GroupedCollection[],
): CollectionCategoryGroup[] {
  const buckets = new Map<string, CollectionCategoryGroup>();

  for (const collection of collections) {
    const category = collection.category;
    const key = category?.id ?? UNCATEGORIZED_ID;

    if (!buckets.has(key)) {
      buckets.set(key, {
        id: key,
        name: category?.name ?? "Other",
        slug: category?.slug ?? "other",
        sortOrder: category?.sortOrder ?? 9999,
        collections: [],
      });
    }

    buckets.get(key)!.collections.push(collection);
  }

  return Array.from(buckets.values())
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .map((group) => ({
      ...group,
      collections: [...group.collections].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title),
      ),
    }));
}