import { z } from "zod";

// Indian phone: 10 digits, starts 6-9. Stored as +91XXXXXXXXXX.
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/u, "Enter a valid 10-digit Indian mobile number");

export const e164PhoneSchema = z
  .string()
  .regex(/^\+91[6-9]\d{9}$/u, "Phone must be in +91XXXXXXXXXX format");

export const otpSchema = z
  .string()
  .regex(/^\d{6}$/u, "OTP must be 6 digits");

export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: otpSchema,
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export function toE164(localPhone: string): string {
  return `+91${localPhone}`;
}
