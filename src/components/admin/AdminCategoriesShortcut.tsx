import Link from "next/link";

type AdminCategoriesShortcutProps = {
  variant?: "primary" | "secondary";
};

export function AdminCategoriesShortcut({
  variant = "secondary",
}: AdminCategoriesShortcutProps) {
  const className =
    variant === "primary"
      ? "rounded-full border border-[#C8A97E] px-5 py-2 text-sm text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black"
      : "rounded-full border border-neutral-700 px-4 py-2 text-sm text-[#A1A1A6] transition hover:text-[#F5F5F7]";

  return (
    <Link href="/admin/categories" className={className}>
      Categories
    </Link>
  );
}