import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-safe NextAuth config. This file MUST NOT import anything that pulls
// in Node.js APIs (crypto, bcrypt, the DB adapter) because the middleware
// loads it under the Edge Runtime.
//
// The DB adapter and the phone-OTP credentials provider live in auth.ts,
// which is only used by API routes and server components running on the
// Node runtime.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  // No `callbacks.jwt` / `callbacks.session` here — those need DB access and
  // are defined in auth.ts. The middleware only needs token validity, which
  // NextAuth handles with the AUTH_SECRET it already has.
  callbacks: {},
} satisfies NextAuthConfig;
