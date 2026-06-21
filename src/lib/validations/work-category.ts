import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const workCategorySchema = z.object({
  name: z.string().min(1).max(80),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(slugPattern, "Slug must be lowercase letters, numbers, and hyphens"),
  sortOrder: z.number().int().min(0),
});

export const workCategoryUpdateSchema = workCategorySchema.partial();

export type WorkCategoryInput = z.infer<typeof workCategorySchema>;