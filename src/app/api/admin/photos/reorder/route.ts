import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-guard";
import { reorderPhotos } from "@/lib/reorder";
import { photoReorderSchema } from "@/lib/validations/reorder";

export async function PATCH(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = photoReorderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await reorderPhotos(
    parsed.data.collectionId,
    parsed.data.photoIds,
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}