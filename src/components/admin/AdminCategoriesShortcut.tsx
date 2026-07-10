import Link from "next/link";

import { ui } from "@/lib/ui";

type AdminCategoriesShortcutProps = {
  variant?: "primary" | "secondary";
};

export function AdminCategoriesShortcut({
  variant = "secondary",
}: AdminCategoriesShortcutProps) {
  const className =
    variant === "primary" ? ui.btnSecondaryLg : ui.btnSecondary;

  return (
    <Link href="/admin/categories" className={className}>
      Categories
    </Link>
  );
}