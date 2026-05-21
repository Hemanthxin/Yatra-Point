import type { NextAuthConfig } from "next-auth";

// Edge-safe NextAuth config. This file MUST NOT import anything that pulls
// in Node.js APIs (crypto, bcrypt, the DB adapter, jose) because the
// middleware loads it under the Edge Runtime.
//
// All providers live in auth.ts (Node runtime). The middleware only needs
// JWT validity, which NextAuth handles via AUTH_SECRET.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  // Providers are added by ./auth.ts in the Node runtime; leaving this empty
  // means the Edge runtime never tries to require provider modules.
  providers: [],
  callbacks: {},
} satisfies NextAuthConfig;
