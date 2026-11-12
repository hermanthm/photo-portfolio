import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { SessionProvider } from "@/components/providers/SessionProvider";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, headersList] = await Promise.all([auth(), headers()]);

  const pathname = headersList.get("x-pathname") ?? "";
  const isLoginPage = pathname === "/admin/login";

  if (!session && pathname && !isLoginPage) {
    notFound();
  }

  return (
    <SessionProvider session={session}>
      <div className="ui-admin-shell">
        <main className={session ? "pt-16 md:pt-20" : undefined}>{children}</main>
      </div>
    </SessionProvider>
  );
}
