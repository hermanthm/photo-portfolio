import { z } from "zod";

const optionalUrl = z
  .string()
  .url()
  .optional()
  .nullable()
  .or(z.literal("").transform(() => null));

export const siteSettingsSchema = z.object({
  siteTitle: z.string().min(1).max(80),
  bio: z.string().max(500).optional().nullable(),
  footerTagline: z.string().max(160).optional().nullable(),
  contactBlurb: z.string().max(300).optional().nullable(),
  contactEmail: z
    .string()
    .email()
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  instagram: optionalUrl,
  vimeo: optionalUrl,
  youtube: optionalUrl,
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;