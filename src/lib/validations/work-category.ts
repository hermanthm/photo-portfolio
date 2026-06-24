import { z } from "zod";

import { WORK_CATEGORY_SCOPES } from "@/lib/work-category-scope";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const workCategorySchema = z.object({
  name: z.string().min(1).max(80),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(slugPattern, "Slug must be lowercase letters, numbers, and hyphens"),
  scope: z.enum(WORK_CATEGORY_SCOPES).default("both"),
  sortOrder: z.number().int().min(0),
});

export const workCategoryUpdateSchema = workCategorySchema.partial();

export type WorkCategoryInput = z.infer<typeof workCategorySchema>;