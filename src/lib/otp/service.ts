import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { otpCodes } from "@/lib/db/schema";
import { sendOtpViaProvider } from "./provider";

const OTP_LENGTH = Number(process.env.OTP_LENGTH ?? 6);
const OTP_EXPIRY_SECONDS = Number(process.env.OTP_EXPIRY_SECONDS ?? 180);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS ?? 5);
const RESEND_COOLDOWN_SECONDS = 30;

function generateNumericCode(length: number): string {
  // crypto.randomInt avoids modulo bias of Math.random
  let out = "";
  for (let i = 0; i < length; i++) out += randomInt(0, 10).toString();
  return out;
}

export type SendResult =
  | { ok: true; expiresAt: Date }
  | { ok: false; reason: "cooldown"; retryAfterSeconds: number };

export async function sendOtp(phone: string): Promise<SendResult> {
  // Cooldown: don't allow re-sends within RESEND_COOLDOWN_SECONDS.
  const cooldownStart = new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000);
  const [recent] = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.phone, phone), gt(otpCodes.createdAt, cooldownStart)))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (recent) {
    const retryAfterSeconds = Math.max(
      1,
      RESEND_COOLDOWN_SECONDS -
        Math.floor((Date.now() - recent.createdAt.getTime()) / 1000)
    );
    return { ok: false, reason: "cooldown", retryAfterSeconds };
  }

  const code = generateNumericCode(OTP_LENGTH);
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);

  await db.insert(otpCodes).values({ phone, codeHash, expiresAt });
  await sendOtpViaProvider(phone, code);

  return { ok: true, expiresAt };
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "no_code" | "expired" | "too_many_attempts" | "mismatch" };

export async function verifyOtp(phone: string, code: string): Promise<VerifyResult> {
  const [row] = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.phone, phone), eq(otpCodes.consumed, false)))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (!row) return { ok: false, reason: "no_code" };
  if (row.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, reason: "too_many_attempts" };
  }

  const matches = await bcrypt.compare(code, row.codeHash);
  if (!matches) {
    await db
      .update(otpCodes)
      .set({ attempts: row.attempts + 1 })
      .where(eq(otpCodes.id, row.id));
    return { ok: false, reason: "mismatch" };
  }

  await db
    .update(otpCodes)
    .set({ consumed: true })
    .where(eq(otpCodes.id, row.id));

  return { ok: true };
}
