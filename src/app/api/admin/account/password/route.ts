import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { changePasswordSchema } from "@/lib/validations/account";

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return NextResponse.json(
      { error: "New password must be different from the current password" },
      { status: 400 },
    );
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );

  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ success: true });
}