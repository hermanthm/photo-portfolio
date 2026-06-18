import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export default function AdminAccountPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#C8A97E]">
        Account
      </p>
      <h1 className="text-4xl font-medium">Change password</h1>
      <p className="mt-3 mb-8 text-[#A1A1A6]">
        Update the password used to sign in to the admin dashboard.
      </p>
      <ChangePasswordForm />
    </div>
  );
}