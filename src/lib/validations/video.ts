import { z } from "zod";

export const videoSchema = z.object({
  collectionId: z.string().min(1),
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

export const videoUpdateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional().nullable(),
  url: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});