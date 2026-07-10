import Link from "next/link";

import { AdminCategoriesShortcut } from "@/components/admin/AdminCategoriesShortcut";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/site";

export default async function AdminDashboardPage() {
  const [session, settings, collectionCount, photoCount, videoCount, publishedCount] =
    await Promise.all([
      auth(),
      getSiteSettings(),
      db.collection.count(),
      db.photo.count(),
      db.video.count(),
      db.collection.count({ where: { published: true } }),
    ]);

  const displayName = session?.user?.name ?? session?.user?.email ?? "Admin";
  const summary =
    settings.footerTagline ??
    settings.bio ??
    "Manage collections, upload photos, add videos, and edit site settings.";

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="mb-2 ui-eyebrow">
        Dashboard
      </p>
      <h1 className="mb-2 text-4xl font-medium">Welcome back, {displayName}</h1>
      <p className="mb-10 text-muted">
        Managing <span className="text-foreground">{settings.siteTitle}</span>
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard label="Collections" value={collectionCount} />
        <StatCard label="Photos" value={photoCount} />
        <StatCard label="Videos" value={videoCount} />
      </div>

      <div className="mt-12 ui-card-padded-lg">
        <h2 className="mb-3 text-2xl font-medium">{settings.siteTitle}</h2>
        <p className="mb-2 max-w-2xl text-muted">{summary}</p>
        <p className="mb-6 ui-label">
          {publishedCount} of {collectionCount} collections published
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href="/admin/collections"
            className="rounded-full border border-accent px-5 py-2 text-foreground transition hover:bg-accent hover:text-inverse"
          >
            Manage collections
          </Link>
          <AdminCategoriesShortcut />
          <Link
            href="/admin/settings"
            className="rounded-full border border-border-strong px-5 py-2 text-muted transition hover:text-foreground"
          >
            Site settings
          </Link>
          <Link
            href="/admin/account"
            className="rounded-full border border-border-strong px-5 py-2 text-muted transition hover:text-foreground"
          >
            Account
          </Link>
          <Link
            href="/admin/collections/new"
            className="rounded-full border border-border-strong px-5 py-2 text-muted transition hover:text-foreground"
          >
            New collection
          </Link>
          <Link
            href="/"
            className="rounded-full border border-border-strong px-5 py-2 text-muted transition hover:text-foreground"
          >
            View public site
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="ui-card-padded">
      <p className="mb-2 ui-label">{label}</p>
      <p className="text-4xl font-medium text-accent">{value}</p>
    </div>
  );
}