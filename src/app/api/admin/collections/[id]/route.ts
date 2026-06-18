import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { collectionSchema } from "@/lib/validations/collection";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;
  const collection = await db.collection.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      videos: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  return NextResponse.json(collection);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = collectionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await db.collection.findFirst({
    where: { slug: parsed.data.slug, id: { not: id } },
  });

  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  try {
    const collection = await db.collection.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(collection);
  } catch {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    await db.collection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }
}