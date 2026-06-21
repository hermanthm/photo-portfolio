import { z } from "zod";

export const collectionSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(["photo", "video", "mixed"]),
  defaultView: z.enum(["slideshow"]).default("slideshow"),
  published: z.boolean(),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0),
  categoryId: z.string().cuid().nullable().optional(),
});

export type CollectionInput = z.infer<typeof collectionSchema>;

export const collectionCoverSchema = z
  .object({
    photoId: z.string().cuid().nullable().optional(),
    videoId: z.string().cuid().nullable().optional(),
  })
  .refine(
    (data) => {
      const hasPhoto = data.photoId != null && data.photoId !== undefined;
      const hasVideo = data.videoId != null && data.videoId !== undefined;
      return !(hasPhoto && hasVideo);
    },
    { message: "Set either photoId or videoId, not both" },
  );

export type CollectionCoverInput = z.infer<typeof collectionCoverSchema>;