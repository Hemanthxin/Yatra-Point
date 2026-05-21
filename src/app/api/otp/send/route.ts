import { NextRequest, NextResponse } from "next/server";
import { sendOtpSchema } from "@/lib/validators";
import { sendOtp } from "@/lib/otp/service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = sendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const result = await sendOtp(parsed.data.phone);
  if (!result.ok) {
    return NextResponse.json(
      {
        error: "Please wait before requesting another OTP",
        retryAfterSeconds: result.retryAfterSeconds,
      },
      { status: 429 }
    );
  }

  return NextResponse.json({
    ok: true,
    expiresAt: result.expiresAt.toISOString(),
    expiresInSeconds: Math.round(
      (result.expiresAt.getTime() - Date.now()) / 1000
    ),
  });
}
