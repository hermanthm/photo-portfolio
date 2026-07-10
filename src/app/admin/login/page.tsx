import { Suspense } from "react";

import { LoginForm } from "@/components/admin/LoginForm";
import { getSiteSettings } from "@/lib/site";

export default async function AdminLoginPage() {
  const settings = await getSiteSettings();

  return (
    <div className="ui-login-shell">
      <div className="ui-login-card">
        <p className="mb-2 ui-eyebrow">
          {settings.siteTitle}
        </p>
        <h1 className="mb-2 text-3xl font-medium text-foreground">Sign in</h1>
        <p className="mb-8 text-muted">
          {settings.footerTagline ??
            "Sign in to manage collections, photos, and videos."}
        </p>
        <Suspense fallback={<p className="text-muted">Loading...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}