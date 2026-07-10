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
        <span className="rounded-full border border-accent/40 bg-foreground/5 px-2.5 py-0.5 text-xs text-accent">
          Photography
        </span>
      ) : null}
      {video ? (
        <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-xs text-sky-300">
          Video
        </span>
      ) : null}
      {scope === "both" ? (
        <span className="rounded-full border border-border-strong px-2.5 py-0.5 ui-helper">
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
        className="ui-card-padded space-y-6"
      >
        <h2 className="text-xl font-medium text-foreground">
          {editingId ? "Edit category" : "Add category"}
        </h2>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <label className="block space-y-2 md:col-span-1">
            <span className="ui-label">Name</span>
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
              className="ui-input"
            />
          </label>

          <label className="block space-y-2 md:col-span-1">
            <span className="ui-label">Slug</span>
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
              className="ui-input"
            />
          </label>

          <label className="block space-y-2 md:col-span-1">
            <span className="ui-label">Shows on</span>
            <select
              value={form.scope}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  scope: event.target.value as WorkCategoryScope,
                }))
              }
              className="ui-input"
            >
              {WORK_CATEGORY_SCOPES.map((scope) => (
                <option key={scope} value={scope}>
                  {scopeLabel(scope)}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 md:col-span-1">
            <span className="ui-label">Sort order</span>
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
              className="ui-input"
            />
          </label>
        </div>

        {error ? <p className="ui-error">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="ui-btn-primary"
          >
            {loading ? "Saving..." : editingId ? "Save changes" : "Add category"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="ui-btn-ghost-lg"
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      {categories.length === 0 ? (
        <div className="ui-card-padded-lg text-muted">
          No categories yet. Add Event, Product, Advertising, Portrait, or any labels you use.
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="flex flex-col gap-4 ui-card-padded md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-4">
                <ReorderButtons
                  onMoveUp={() => moveCategory(category.id, "up")}
                  onMoveDown={() => moveCategory(category.id, "down")}
                  disableUp={index === 0 || reordering}
                  disableDown={index === categories.length - 1 || reordering}
                />
                <div>
                  <h3 className="text-2xl font-medium text-foreground">{category.name}</h3>
                  <p className="mt-2 ui-label">
                    /{category.slug} · {category._count.collections} collection(s)
                  </p>
                  <ScopeBadge scope={category.scope} />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => startEdit(category)}
                  className="rounded-full border border-accent px-4 py-2 text-foreground transition hover:bg-accent hover:text-inverse"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category)}
                  className="ui-btn-danger"
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