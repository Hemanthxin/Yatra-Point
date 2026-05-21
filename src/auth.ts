import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";
import { verifyOtpSchema, toE164 } from "@/lib/validators";
import { verifyOtp } from "@/lib/otp/service";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone?: string | null;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // JWT sessions let us mix OAuth and Credentials providers cleanly.
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
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
      if (user) {
        token.id = user.id;
      }
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
