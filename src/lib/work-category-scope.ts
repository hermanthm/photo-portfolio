export const WORK_CATEGORY_SCOPES = ["photography", "video", "both"] as const;

export type WorkCategoryScope = (typeof WORK_CATEGORY_SCOPES)[number];

export type WorkCategoryPage = "photography" | "video";

export function categoryScopeAppliesToPage(
  scope: WorkCategoryScope,
  page: WorkCategoryPage,
): boolean {
  return scope === "both" || scope === page;
}

export function scopeLabel(scope: WorkCategoryScope): string {
  switch (scope) {
    case "photography":
      return "Photography";
    case "video":
      return "Video";
    case "both":
      return "Both";
  }
}

export function categoriesForCollectionType(
  scope: WorkCategoryScope,
  collectionType: "photo" | "video" | "mixed",
): boolean {
  if (collectionType === "mixed") {
    return true;
  }

  if (collectionType === "photo") {
    return scope === "photography" || scope === "both";
  }

  return scope === "video" || scope === "both";
}