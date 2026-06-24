"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { slugify } from "@/lib/slug";
import {
  scopeLabel,
  WORK_CATEGORY_SCOPES,
  type WorkCategoryScope,
} from "@/lib/work-category-scope";

type WorkCategoryRow = {
  id: string;
  name: string;
  slug: string;
  scope: WorkCategoryScope;
  sortOrder: number;
  _count: { collections: number };
};

type CategoryManagerProps = {
  initialCategories: WorkCategoryRow[];
};

type FormValues = {
  name: string;
  slug: string;
  scope: WorkCategoryScope;
  sortOrder: number;
};

const emptyForm: FormValues = {
  name: "",
  slug: "",
  scope: "both",
  sortOrder: 0,
};

function ScopeBadge({ scope }: { scope: WorkCategoryScope }) {
  const photography = scope === "photography" || scope === "both";
  const video = scope === "video" || scope === "both";

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {photography ? (
        <span className="rounded-full border border-[#C8A97E]/40 bg-[#C8A97E]/10 px-2.5 py-0.5 text-xs text-[#C8A97E]">
          Photography
        </span>
      ) : null}
      {video ? (
        <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-xs text-sky-300">
          Video
        </span>
      ) : null}
      {scope === "both" ? (
        <span className="rounded-full border border-neutral-700 px-2.5 py-0.5 text-xs text-[#A1A1A6]">
          Shared
        </span>
      ) : null}
    </div>
  );
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reordering, setReordering] = useState(false);

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
      scope: category.scope,
      sortOrder: category.sortOrder,
    });
    setSlugTouched(true);
    setError(null);
  }

  async function persistCategoryOrder(nextCategories: WorkCategoryRow[]) {
    const previous = categories;
    const normalized = nextCategories.map((category, index) => ({
      ...category,
      sortOrder: index,
    }));

    setCategories(normalized);
    setReordering(true);
    setError(null);

    const response = await fetch("/api/admin/categories/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryIds: normalized.map((category) => category.id),
      }),
    });

    setReordering(false);

    if (!response.ok) {
      setCategories(previous);
      setError("Failed to reorder categories.");
      return false;
    }

    router.refresh();
    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (editingId) {
      const response = await fetch(`/api/admin/categories/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          scope: form.scope,
        }),
      });

      if (!response.ok) {
        setLoading(false);
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Failed to save category.");
        return;
      }

      const updatedCategory = (await response.json()) as WorkCategoryRow;
      const others = categories.filter((category) => category.id !== editingId);
      const insertAt = Math.min(Math.max(0, form.sortOrder), others.length);
      const nextCategories = [
        ...others.slice(0, insertAt),
        {
          ...updatedCategory,
          _count: categories.find((category) => category.id === editingId)?._count ?? {
            collections: 0,
          },
        },
        ...others.slice(insertAt),
      ];

      const reordered = await persistCategoryOrder(nextCategories);
      setLoading(false);

      if (!reordered) {
        return;
      }

      resetForm();
      return;
    }

    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

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
    if (reordering) return;

    const index = categories.findIndex((category) => category.id === categoryId);
    if (index === -1) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= categories.length) return;

    const nextCategories = [...categories];
    [nextCategories[index], nextCategories[swapIndex]] = [
      nextCategories[swapIndex],
      nextCategories[index],
    ];

    await persistCategoryOrder(nextCategories);
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

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
            <span className="text-sm text-[#A1A1A6]">Shows on</span>
            <select
              value={form.scope}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  scope: event.target.value as WorkCategoryScope,
                }))
              }
              className="w-full rounded-xl border border-neutral-800 bg-[#0F0F0F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#C8A97E]"
            >
              {WORK_CATEGORY_SCOPES.map((scope) => (
                <option key={scope} value={scope}>
                  {scopeLabel(scope)}
                </option>
              ))}
            </select>
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
                  disableUp={index === 0 || reordering}
                  disableDown={index === categories.length - 1 || reordering}
                />
                <div>
                  <h3 className="text-2xl font-medium text-[#F5F5F7]">{category.name}</h3>
                  <p className="mt-2 text-sm text-[#A1A1A6]">
                    /{category.slug} · {category._count.collections} collection(s)
                  </p>
                  <ScopeBadge scope={category.scope} />
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