import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-guard";
import { reorderCategories } from "@/lib/reorder";
import { revalidatePublicCategoryPages } from "@/lib/revalidate-public";
import { categoryReorderSchema } from "@/lib/validations/reorder";

export async function PATCH(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = categoryReorderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await reorderCategories(parsed.data.categoryIds);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidatePublicCategoryPages();

  return NextResponse.json({ success: true });
}