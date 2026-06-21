import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { revalidatePublicCategoryPages } from "@/lib/revalidate-public";
import { workCategorySchema } from "@/lib/validations/work-category";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const categories = await db.workCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { collections: true } },
    },
  });

  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = workCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await db.workCategory.findUnique({
    where: { slug: parsed.data.slug },
  });

  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const category = await db.workCategory.create({ data: parsed.data });
  revalidatePublicCategoryPages();

  return NextResponse.json(category, { status: 201 });
}