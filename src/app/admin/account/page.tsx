import { AdminCategoriesShortcut } from "@/components/admin/AdminCategoriesShortcut";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export default function AdminAccountPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 ui-eyebrow">
            Account
          </p>
          <h1 className="text-4xl font-medium">Change password</h1>
          <p className="mt-3 text-muted">
            Update the password used to sign in to the admin dashboard.
          </p>
        </div>
        <AdminCategoriesShortcut />
      </div>
      <ChangePasswordForm />
    </div>
  );
}