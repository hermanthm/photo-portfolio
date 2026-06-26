import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { revalidatePublicCollectionPages } from "@/lib/revalidate-public";
import { collectionCoverFrameSchema } from "@/lib/validations/collection";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = collectionCoverFrameSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const collection = await db.collection.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  const updated = await db.collection.update({
    where: { id },
    data: parsed.data,
    select: {
      coverAspectRatio: true,
      coverFocalX: true,
      coverFocalY: true,
    },
  });

  revalidatePublicCollectionPages(collection.slug);

  return NextResponse.json(updated);
}