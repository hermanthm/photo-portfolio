import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { AdminCategoriesShortcut } from "@/components/admin/AdminCategoriesShortcut";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { auth } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, settings, headersList] = await Promise.all([
    auth(),
    getSiteSettings(),
    headers(),
  ]);

  const pathname = headersList.get("x-pathname") ?? "";
  const isLoginPage = pathname === "/admin/login";

  if (!session && pathname && !isLoginPage) {
    notFound();
  }

  return (
    <SessionProvider session={session}>
      <div className="ui-admin-shell">
        {session ? (
          <header className="ui-admin-header">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-6">
                <Link href="/admin" className="font-medium text-accent">
                  {settings.siteTitle} Admin
                </Link>
                <nav className="flex gap-4 ui-label">
                  <Link href="/admin" className="hover:text-foreground">
                    Dashboard
                  </Link>
                  <Link href="/admin/collections" className="hover:text-foreground">
                    Collections
                  </Link>
                  <Link href="/admin/categories" className="hover:text-foreground">
                    Categories
                  </Link>
                  <Link href="/admin/settings" className="hover:text-foreground">
                    Settings
                  </Link>
                  <Link href="/admin/account" className="hover:text-foreground">
                    Account
                  </Link>
                  <Link href="/" className="hover:text-foreground">
                    View site
                  </Link>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <AdminCategoriesShortcut />
                <p className="hidden ui-label sm:block">
                  {session.user?.email}
                </p>
                <SignOutButton />
              </div>
            </div>
          </header>
        ) : null}
        <main>{children}</main>
      </div>
    </SessionProvider>
  );
}