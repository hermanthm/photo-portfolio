import { CategoryManager } from "@/components/admin/CategoryManager";
import { getAllWorkCategories } from "@/lib/work-category";

export default async function AdminCategoriesPage() {
  const categories = await getAllWorkCategories();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#C8A97E]">
        Work categories
      </p>
      <h1 className="mb-3 text-4xl font-medium">Manage categories</h1>
      <p className="mb-10 max-w-2xl text-[#A1A1A6]">
        Group collections on the Photography and Video pages under labels like
        Event, Product, Advertising, and Portrait.
      </p>

      <CategoryManager initialCategories={categories} />
    </div>
  );
}