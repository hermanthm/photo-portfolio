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
          <p className="mb-2 ui-eyebrow">
            Collections
          </p>
          <h1 className="text-4xl font-medium">New collection</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <AdminCategoriesShortcut />
          <Link
            href="/admin/collections"
            className="ui-btn-secondary"
          >
            All collections
          </Link>
        </div>
      </div>
      <CollectionForm mode="create" categories={categories} />
    </div>
  );
}