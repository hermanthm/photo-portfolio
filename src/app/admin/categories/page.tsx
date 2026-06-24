import Link from "next/link";

import { CategoryManager } from "@/components/admin/CategoryManager";
import { getAllWorkCategories } from "@/lib/work-category";

export default async function AdminCategoriesPage() {
  const categories = await getAllWorkCategories();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#C8A97E]">
            Work categories
          </p>
          <h1 className="text-4xl font-medium">Manage categories</h1>
          <p className="mt-3 max-w-2xl text-[#A1A1A6]">
            Group collections on the Photography and Video pages under labels like
            Event, Product, Advertising, and Portrait. Mark each category for
            Photography, Video, or both.
          </p>
        </div>
        <Link
          href="/admin/collections"
          className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-[#A1A1A6] transition hover:text-[#F5F5F7]"
        >
          Collections
        </Link>
      </div>

      <CategoryManager
        key={categories.map((category) => `${category.id}:${category.sortOrder}`).join(",")}
        initialCategories={categories}
      />
    </div>
  );
}