"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { slugify } from "@/lib/slug";

type WorkCategoryRow = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  _count: { collections: number };
};

type CategoryManagerProps = {
  initialCategories: WorkCategoryRow[];
};

type FormValues = {
  name: string;
  slug: string;
  sortOrder: number;
};

const emptyForm: FormValues = {
  name: "",
  slug: "",
  sortOrder: 0,
};

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const categories = initialCategories;
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setForm(emptyForm);
    setSlugTouched(false);
    setEditingId(null);
    setError(null);
  }

  function startEdit(category: WorkCategoryRow) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      sortOrder: category.sortOrder,
    });
    setSlugTouched(true);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch(
      editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Failed to save category.");
      return;
    }

    resetForm();
    router.refresh();
  }

  async function handleDelete(category: WorkCategoryRow) {
    if (
      !confirm(
        `Delete "${category.name}"? ${category._count.collections} collection(s) will become uncategorized.`,
      )
    ) {
      return;
    }

    const response = await fetch(`/api/admin/categories/${category.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Failed to delete category.");
      return;
    }

    if (editingId === category.id) {
      resetForm();
    }
    router.refresh();
  }

  async function moveCategory(categoryId: string, direction: "up" | "down") {
    const index = categories.findIndex((category) => category.id === categoryId);
    if (index === -1) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= categories.length) return;

    const current = categories[index];
    const swap = categories[swapIndex];

    const responses = await Promise.all([
      fetch(`/api/admin/categories/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: swap.sortOrder }),
      }),
      fetch(`/api/admin/categories/${swap.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: current.sortOrder }),
      }),
    ]);

    if (responses.some((response) => !response.ok)) {
      alert("Failed to reorder categories.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-10">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-neutral-800 bg-[#111111] p-6 space-y-6"
      >
        <h2 className="text-xl font-medium text-[#F5F5F7]">
          {editingId ? "Edit category" : "Add category"}
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          <label className="block space-y-2 md:col-span-1">
            <span className="text-sm text-[#A1A1A6]">Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => {
                const name = event.target.value;
                setForm((current) => ({
                  ...current,
                  name,
                  slug: slugTouched ? current.slug : slugify(name),
                }));
              }}
              required
              className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
            />
          </label>

          <label className="block space-y-2 md:col-span-1">
            <span className="text-sm text-[#A1A1A6]">Slug</span>
            <input
              type="text"
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                setForm((current) => ({
                  ...current,
                  slug: slugify(event.target.value),
                }));
              }}
              required
              className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
            />
          </label>

          <label className="block space-y-2 md:col-span-1">
            <span className="text-sm text-[#A1A1A6]">Sort order</span>
            <input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sortOrder: Number(event.target.value),
                }))
              }
              className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
            />
          </label>
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl border border-[#C8A97E] px-6 py-3 font-medium text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black disabled:opacity-60"
          >
            {loading ? "Saving..." : editingId ? "Save changes" : "Add category"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-neutral-700 px-6 py-3 text-[#A1A1A6] transition hover:text-[#F5F5F7]"
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      {categories.length === 0 ? (
        <div className="rounded-3xl border border-neutral-800 bg-[#111111] p-8 text-[#A1A1A6]">
          No categories yet. Add Event, Product, Advertising, Portrait, or any labels you use.
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="flex flex-col gap-4 rounded-3xl border border-neutral-800 bg-[#111111] p-6 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-4">
                <ReorderButtons
                  onMoveUp={() => moveCategory(category.id, "up")}
                  onMoveDown={() => moveCategory(category.id, "down")}
                  disableUp={index === 0}
                  disableDown={index === categories.length - 1}
                />
                <div>
                  <h3 className="text-2xl font-medium text-[#F5F5F7]">{category.name}</h3>
                  <p className="mt-2 text-sm text-[#A1A1A6]">
                    /{category.slug} · {category._count.collections} collection(s)
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => startEdit(category)}
                  className="rounded-full border border-[#C8A97E] px-4 py-2 text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category)}
                  className="rounded-full border border-red-500/40 px-4 py-2 text-red-300 transition hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}