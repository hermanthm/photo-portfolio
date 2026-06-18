import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { collectionSchema } from "@/lib/validations/collection";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const collections = await db.collection.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { photos: true, videos: true } },
    },
  });

  return NextResponse.json(collections);
}

export async function POST(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = collectionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await db.collection.findUnique({
    where: { slug: parsed.data.slug },
  });

  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const collection = await db.collection.create({ data: parsed.data });
  return NextResponse.json(collection, { status: 201 });
}