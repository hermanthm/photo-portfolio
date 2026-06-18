import { z } from "zod";

export const photoUpdateSchema = z.object({
  alt: z.string().max(200).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});