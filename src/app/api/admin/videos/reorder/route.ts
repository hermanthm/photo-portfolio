import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-guard";
import { reorderVideos } from "@/lib/reorder";
import { videoReorderSchema } from "@/lib/validations/reorder";

export async function PATCH(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = videoReorderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await reorderVideos(
    parsed.data.collectionId,
    parsed.data.videoIds,
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}