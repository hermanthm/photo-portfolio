import { Suspense } from "react";

import { LoginForm } from "@/components/admin/LoginForm";
import { getSiteSettings } from "@/lib/site";

export default async function AdminLoginPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-[#111111] p-8">
        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#C8A97E]">
          {settings.siteTitle}
        </p>
        <h1 className="mb-2 text-3xl font-medium text-[#F5F5F7]">Sign in</h1>
        <p className="mb-8 text-[#A1A1A6]">
          {settings.footerTagline ??
            "Sign in to manage collections, photos, and videos."}
        </p>
        <Suspense fallback={<p className="text-[#A1A1A6]">Loading...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}