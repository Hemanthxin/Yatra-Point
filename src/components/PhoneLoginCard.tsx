"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ChevronDown, Lock, Phone } from "lucide-react";
import { signIn } from "next-auth/react";
import { z } from "zod";

import { phoneSchema } from "@/lib/validators";

const schema = z.object({ phone: phoneSchema });
type FormValues = z.infer<typeof schema>;

export function PhoneLoginCard() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: values.phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Could not send OTP. Try again.");
        return;
      }
      router.push(`/verify-otp?phone=${encodeURIComponent(values.phone)}`);
    } catch {
      setServerError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
      <h2 className="text-center text-2xl font-bold text-slate-900">
        Welcome Back!
      </h2>
      <p className="mt-1 text-center text-sm text-slate-500">
        Login to continue your journey
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Enter Mobile Number
          </label>
          <div
            className={`flex items-stretch overflow-hidden rounded-xl border ${
              errors.phone ? "border-red-400" : "border-slate-300"
            } focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/30`}
          >
            <div className="flex items-center gap-1 border-r border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
              +91
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
            <div className="relative flex flex-1 items-center">
              <Phone className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                id="phone"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                placeholder="Enter mobile number"
                className="w-full bg-transparent py-3 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400"
                {...register("phone")}
              />
            </div>
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
          )}
          {serverError && (
            <p className="mt-1 text-xs text-red-500">{serverError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || isSubmitting}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Sending OTP..." : "Continue"}
          {!submitting && (
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          )}
        </button>

        <div className="flex items-center gap-3 py-1 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          OR
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <GoogleMark className="h-5 w-5" />
          Continue with Google
        </button>

        <p className="flex items-center justify-center gap-1 pt-1 text-center text-xs text-slate-500">
          <Lock className="h-3 w-3" />
          We never share your number with anyone.
        </p>
        <p className="text-center text-xs text-slate-500">
          View our{" "}
          <a href="/privacy" className="font-medium text-brand-green underline">
            Privacy Policy
          </a>
        </p>
      </form>
    </div>
  );
}

function GoogleMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 16.3 3 9.6 7.6 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.2 36 26.7 37 24 37c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 40.4 16.2 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.5-4.5 5.9l6.2 5.2c-.4.4 6.9-5 6.9-15.1 0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
