import { z } from "zod";

export const photoReorderSchema = z.object({
  collectionId: z.string().min(1),
  photoIds: z.array(z.string().min(1)).min(1),
});

export const videoReorderSchema = z.object({
  collectionId: z.string().min(1),
  videoIds: z.array(z.string().min(1)).min(1),
});

export const categoryReorderSchema = z.object({
  categoryIds: z.array(z.string().min(1)).min(1),
});