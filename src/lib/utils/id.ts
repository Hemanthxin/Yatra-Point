import { randomBytes } from "crypto";

// URL-safe, short, non-sequential id (~22 chars). Good enough for users/otp rows.
export function createId(size = 16): string {
  return randomBytes(size).toString("base64url");
}
