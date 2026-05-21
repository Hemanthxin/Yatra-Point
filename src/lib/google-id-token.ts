// Verifies a Google Identity Services ID token against Google's public JWKs.
// Uses the GIS / "Sign in with Google" flow, which does NOT require a client
// secret — Google signs the token on its side and we verify with their
// rotating public keys.
//
// Docs: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

// Both forms appear in tokens depending on Google's mood.
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

export interface GoogleIdTokenClaims extends JWTPayload {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  hd?: string; // Google Workspace domain, if any
}

export async function verifyGoogleIdToken(
  idToken: string
): Promise<GoogleIdTokenClaims | null> {
  const audience = process.env.AUTH_GOOGLE_ID;
  if (!audience) return null;

  try {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: GOOGLE_ISSUERS,
      audience,
    });
    if (!payload.sub || typeof payload.email !== "string") return null;
    return payload as GoogleIdTokenClaims;
  } catch {
    // Any verification failure (bad signature, expired, wrong audience) =>
    // treat as invalid; the caller will return null and login will fail.
    return null;
  }
}
