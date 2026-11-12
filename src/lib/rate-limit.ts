import { db } from "@/lib/db";

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

export function getClientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "local";
}

export async function assertLoginAllowed(keys: string[]) {
  const now = new Date();

  const rows = await db.loginAttempt.findMany({
    where: { key: { in: keys } },
  });

  const blocked = rows.some(
    (row) => row.resetAt > now && row.count >= MAX_ATTEMPTS,
  );

  if (blocked) {
    return false;
  }

  return true;
}

export async function recordLoginFailure(keys: string[]) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + WINDOW_MS);

  await Promise.all(
    keys.map(async (key) => {
      const row = await db.loginAttempt.findUnique({ where: { key } });

      if (!row || row.resetAt <= now) {
        await db.loginAttempt.upsert({
          where: { key },
          create: { key, count: 1, resetAt },
          update: { count: 1, resetAt },
        });
        return;
      }

      await db.loginAttempt.update({
        where: { key },
        data: { count: { increment: 1 } },
      });
    }),
  );
}

export async function clearLoginAttempts(keys: string[]) {
  await db.loginAttempt.deleteMany({
    where: { key: { in: keys } },
  });
}
