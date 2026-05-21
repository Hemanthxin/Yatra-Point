"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { CATEGORIES } from "@/lib/catalog/categories";

interface PlannerFormProps {
  initial: {
    budget?: number;
    days?: number;
    travellers?: number;
    category?: string;
  };
}

export function PlannerForm({ initial }: PlannerFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [budget, setBudget] = useState(initial.budget?.toString() ?? "");
  const [days, setDays] = useState(initial.days?.toString() ?? "");
  const [travellers, setTravellers] = useState(
    initial.travellers?.toString() ?? "2"
  );
  const [category, setCategory] = useState(initial.category ?? "");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(searchParams.toString());
    if (budget) next.set("budget", budget);
    else next.delete("budget");
    if (days) next.set("days", days);
    else next.delete("days");
    if (travellers) next.set("travellers", travellers);
    else next.delete("travellers");
    if (category) next.set("category", category);
    else next.delete("category");
    startTransition(() => router.push(`/budget-planner?${next.toString()}`));
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Total budget (₹)" hint="Whole trip, all travellers">
          <input
            type="number"
            inputMode="numeric"
            min={500}
            step={500}
            placeholder="20000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          />
        </Field>
        <Field label="Days">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={60}
            placeholder="5"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          />
        </Field>
        <Field label="Travellers">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            value={travellers}
            onChange={(e) => setTravellers(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          />
        </Field>
        <Field label="Category" hint="Optional vibe filter">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">Any category</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60"
        >
          {isPending ? "Matching…" : "Find matching trips"}
        </button>
        <p className="text-xs text-slate-500">
          Budgets are mid-range estimates (stay + food + local transport + sightseeing).
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}
