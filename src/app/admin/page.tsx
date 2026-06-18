import Link from "next/link";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AdminDashboardPage() {
  const session = await auth();

  const [collectionCount, photoCount, videoCount] = await Promise.all([
    db.collection.count(),
    db.photo.count(),
    db.video.count(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#C8A97E]">
        Dashboard
      </p>
      <h1 className="mb-2 text-4xl font-medium">Welcome back</h1>
      <p className="mb-10 text-[#A1A1A6]">
        Signed in as {session?.user?.email ?? "admin"}.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard label="Collections" value={collectionCount} />
        <StatCard label="Photos" value={photoCount} />
        <StatCard label="Videos" value={videoCount} />
      </div>

      <div className="mt-12 rounded-3xl border border-neutral-800 bg-[#111111] p-8">
        <h2 className="mb-3 text-2xl font-medium">Phase 2 ready</h2>
        <p className="mb-6 max-w-2xl text-[#A1A1A6]">
          Manage collections, upload photos to Cloudinary, and add videos from
          YouTube or Vimeo. Mosaic and slideshow views arrive in Phase 3.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href="/admin/collections"
            className="rounded-full border border-[#C8A97E] px-5 py-2 text-[#F5F5F7] transition hover:bg-[#C8A97E] hover:text-black"
          >
            Manage collections
          </Link>
          <Link
            href="/admin/collections/new"
            className="rounded-full border border-neutral-700 px-5 py-2 text-[#A1A1A6] transition hover:text-[#F5F5F7]"
          >
            New collection
          </Link>
          <Link
            href="/"
            className="rounded-full border border-neutral-700 px-5 py-2 text-[#A1A1A6] transition hover:text-[#F5F5F7]"
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
    <div className="rounded-3xl border border-neutral-800 bg-[#111111] p-6">
      <p className="mb-2 text-sm text-[#A1A1A6]">{label}</p>
      <p className="text-4xl font-medium text-[#C8A97E]">{value}</p>
    </div>
  );
}