import bcrypt from "bcryptjs";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { authConfig } from "@/lib/auth.config";
import { db } from "@/lib/db";
import {
  assertLoginAllowed,
  clearLoginAttempts,
  getClientIp,
  recordLoginFailure,
} from "@/lib/rate-limit";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const DUMMY_PASSWORD_HASH =
  "$2b$12$iWSZRfh0aXPTrZ4c2YPx6u2cpsA8MNLYIcdIVxLSre575Ow5iFn9m";

class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const ipKey = `ip:${getClientIp(request)}`;
        if (!(await assertLoginAllowed([ipKey]))) {
          throw new RateLimitedError();
        }

        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          await recordLoginFailure([ipKey]);
          return null;
        }

        const email = parsed.data.email.toLowerCase();
        const emailKey = `email:${email}`;
        if (!(await assertLoginAllowed([emailKey]))) {
          throw new RateLimitedError();
        }

        const user = await db.user.findUnique({
          where: { email },
        });

        const valid = await bcrypt.compare(
          parsed.data.password,
          user?.passwordHash ?? DUMMY_PASSWORD_HASH,
        );

        if (!user || !valid) {
          await recordLoginFailure([ipKey, emailKey]);
          return null;
        }

        await clearLoginAttempts([ipKey, emailKey]);

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sessionVersion = user.sessionVersion;
        return token;
      }

      if (!token.id || typeof token.sessionVersion !== "number") {
        return null;
      }

      const current = await db.user.findUnique({
        where: { id: token.id as string },
        select: { sessionVersion: true },
      });

      if (!current || current.sessionVersion !== token.sessionVersion) {
        return null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
