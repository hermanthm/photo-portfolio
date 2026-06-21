import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { revalidatePublicCategoryPages } from "@/lib/revalidate-public";
import { workCategoryUpdateSchema } from "@/lib/validations/work-category";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = workCategoryUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.slug) {
    const existing = await db.workCategory.findFirst({
      where: { slug: parsed.data.slug, id: { not: id } },
    });

    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
  }

  try {
    const category = await db.workCategory.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePublicCategoryPages();

    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  const category = await db.workCategory.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  await db.workCategory.delete({ where: { id } });
  revalidatePublicCategoryPages();

  return NextResponse.json({ success: true });
}