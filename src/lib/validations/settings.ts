import { z } from "zod";

export const BIO_MAX_LENGTH = 500;
export const ABOUT_CONTENT_MAX_LENGTH = 2500;

const optionalUrl = z
  .string()
  .url()
  .optional()
  .nullable()
  .or(z.literal("").transform(() => null));

export const siteSettingsSchema = z.object({
  siteTitle: z.string().min(1).max(80),
  bio: z.string().max(BIO_MAX_LENGTH).optional().nullable(),
  aboutContent: z
    .string()
    .max(ABOUT_CONTENT_MAX_LENGTH)
    .optional()
    .nullable(),
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