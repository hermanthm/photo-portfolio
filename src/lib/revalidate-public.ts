import { revalidatePath } from "next/cache";

export function revalidatePublicCollectionPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/photography");
  revalidatePath("/video");
  if (slug) {
    revalidatePath(`/work/${slug}`);
  }
}