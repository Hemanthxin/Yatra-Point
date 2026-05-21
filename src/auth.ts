import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";

import { authConfig } from "./auth.config";
import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";
import { verifyOtpSchema, toE164 } from "@/lib/validators";
import { verifyOtp } from "@/lib/otp/service";
import { verifyGoogleIdToken } from "@/lib/google-id-token";

// Full NextAuth config — DB adapter + phone-OTP + Google Identity Services
// (ID-token flow, no client secret required). Used by API routes and server
// components. The Edge middleware uses ./auth.config directly.

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone?: string | null;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    // ── Google Identity Services (ID-token flow, no client secret) ──
    Credentials({
      id: "google-id-token",
      name: "Google",
      credentials: {
        credential: { label: "ID Token", type: "text" },
      },
      async authorize(raw) {
        if (
          !raw ||
          typeof raw.credential !== "string" ||
          raw.credential.length === 0
        ) {
          return null;
        }

        const claims = await verifyGoogleIdToken(raw.credential);
        if (!claims) return null;

        const email = claims.email;
        const now = new Date();

        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existing[0]) {
          await db
            .update(users)
            .set({
              name: existing[0].name ?? claims.name ?? null,
              image: existing[0].image ?? claims.picture ?? null,
              emailVerified: claims.email_verified
                ? existing[0].emailVerified ?? now
                : existing[0].emailVerified,
              updatedAt: now,
            })
            .where(eq(users.id, existing[0].id));
          return {
            id: existing[0].id,
            name: existing[0].name ?? claims.name ?? undefined,
            email: existing[0].email ?? email,
            image: existing[0].image ?? claims.picture ?? undefined,
          };
        }

        const [created] = await db
          .insert(users)
          .values({
            name: claims.name ?? null,
            email,
            image: claims.picture ?? null,
            emailVerified: claims.email_verified ? now : null,
          })
          .returning();

        return {
          id: created.id,
          name: created.name ?? undefined,
          email: created.email ?? undefined,
          image: created.image ?? undefined,
        };
      },
    }),

    // ── Phone + OTP credentials ──
    Credentials({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "OTP", type: "text" },
      },
      async authorize(raw) {
        const parsed = verifyOtpSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { phone, code } = parsed.data;

        const result = await verifyOtp(phone, code);
        if (!result.ok) return null;

        const e164 = toE164(phone);
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.phone, e164))
          .limit(1);

        const now = new Date();
        if (existing[0]) {
          await db
            .update(users)
            .set({ phoneVerified: now, updatedAt: now })
            .where(eq(users.id, existing[0].id));
          return {
            id: existing[0].id,
            name: existing[0].name ?? undefined,
            email: existing[0].email ?? undefined,
            image: existing[0].image ?? undefined,
          };
        }

        const [created] = await db
          .insert(users)
          .values({ phone: e164, phoneVerified: now })
          .returning();

        return { id: created.id };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      // Hydrate phone lazily so it survives across requests.
      if (token.id && !token.phone) {
        const [row] = await db
          .select({ phone: users.phone })
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1);
        if (row?.phone) token.phone = row.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.phone) session.user.phone = token.phone as string;
      return session;
    },
  },
});
