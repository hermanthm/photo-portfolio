import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { detectVideoProvider, toEmbedUrl } from "@/lib/video";
import { videoUpdateSchema } from "@/lib/validations/video";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = videoUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data: {
    title?: string;
    description?: string | null;
    embedUrl?: string;
    provider?: "youtube" | "vimeo" | "other";
    thumbnailUrl?: string | null;
    sortOrder?: number;
  } = {};

  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.description !== undefined) data.description = parsed.data.description;
  if (parsed.data.thumbnailUrl !== undefined) data.thumbnailUrl = parsed.data.thumbnailUrl;
  if (parsed.data.sortOrder !== undefined) data.sortOrder = parsed.data.sortOrder;

  if (parsed.data.url) {
    data.embedUrl = toEmbedUrl(parsed.data.url);
    data.provider = detectVideoProvider(parsed.data.url);
  }

  try {
    const video = await db.video.update({ where: { id }, data });
    return NextResponse.json(video);
  } catch {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  try {
    await db.video.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }
}