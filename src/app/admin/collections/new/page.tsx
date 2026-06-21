import Link from "next/link";

import { AdminCategoriesShortcut } from "@/components/admin/AdminCategoriesShortcut";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { getWorkCategoriesForSelect } from "@/lib/work-category";

export default async function NewCollectionPage() {
  const categories = await getWorkCategoriesForSelect();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#C8A97E]">
            Collections
          </p>
          <h1 className="text-4xl font-medium">New collection</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <AdminCategoriesShortcut />
          <Link
            href="/admin/collections"
            className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-[#A1A1A6] transition hover:text-[#F5F5F7]"
          >
            All collections
          </Link>
        </div>
      </div>
      <CollectionForm mode="create" categories={categories} />
    </div>
  );
}