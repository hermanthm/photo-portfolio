import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { detectVideoProvider, toEmbedUrl } from "@/lib/video";
import { videoSchema } from "@/lib/validations/video";

export async function POST(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = videoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const collection = await db.collection.findUnique({
    where: { id: parsed.data.collectionId },
    include: { videos: { select: { sortOrder: true } } },
  });

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  const embedUrl = toEmbedUrl(parsed.data.url);
  const provider = detectVideoProvider(parsed.data.url);
  const nextSortOrder =
    parsed.data.sortOrder ??
    collection.videos.reduce((max, video) => Math.max(max, video.sortOrder), -1) + 1;

  const video = await db.video.create({
    data: {
      collectionId: parsed.data.collectionId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      embedUrl,
      provider,
      thumbnailUrl: parsed.data.thumbnailUrl ?? null,
      sortOrder: nextSortOrder,
    },
  });

  return NextResponse.json(video, { status: 201 });
}