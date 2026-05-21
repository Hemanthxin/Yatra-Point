"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Save } from "lucide-react";
import type { Destination } from "@/lib/db/schema";
import { DestinationCard } from "@/components/app/DestinationCard";
import { formatINR } from "@/lib/format";
import { saveTripPlan } from "@/lib/actions/trip-plans";

interface PlannerResultsProps {
  matches: Destination[];
  favIds: Set<string>;
  summary: {
    totalBudget: number;
    days: number;
    travellers: number;
    category?: string;
    perPersonPerDay: number;
  };
}

export function PlannerResults({ matches, favIds, summary }: PlannerResultsProps) {
  const router = useRouter();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [planName, setPlanName] = useState(
    `Trip · ${summary.days} day${summary.days > 1 ? "s" : ""}`
  );
  const [isSaving, startSave] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    const next = new Set(picked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPicked(next);
  }

  function onSave() {
    setError(null);
    startSave(async () => {
      const res = await saveTripPlan({
        name: planName.trim() || "Untitled trip",
        totalBudget: summary.totalBudget,
        days: summary.days,
        travellers: summary.travellers,
        category: summary.category,
        destinationIds: Array.from(picked),
      });
      if (!res.ok) {
        setError(res.error ?? "Could not save the trip");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <section className="mt-8">
      <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total budget" value={formatINR(summary.totalBudget)} />
          <Stat label="Per person / day" value={formatINR(summary.perPersonPerDay)} />
          <Stat label="Days" value={summary.days.toString()} />
          <Stat label="Travellers" value={summary.travellers.toString()} />
        </div>
        <p className="mt-3 text-xs text-emerald-900/70">
          Showing destinations where the mid-range daily budget fits within{" "}
          {formatINR(summary.perPersonPerDay)} per person.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm font-medium text-slate-700">
            Nothing fits within {formatINR(summary.perPersonPerDay)} per person per day.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Try more days, fewer travellers, or a higher total budget.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              {matches.length} matching {matches.length === 1 ? "destination" : "destinations"}
            </h2>
            <p className="text-xs text-slate-500">
              Tap to pick the ones you want to save into a trip plan.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((d) => {
              const isPicked = picked.has(d.id);
              return (
                <div key={d.id} className="relative">
                  <button
                    type="button"
                    onClick={() => toggle(d.id)}
                    aria-pressed={isPicked}
                    className={`absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold shadow-md transition ${
                      isPicked
                        ? "bg-emerald-500 text-white"
                        : "bg-white/90 text-slate-700 hover:bg-white"
                    }`}
                  >
                    {isPicked ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Picked
                      </>
                    ) : (
                      "Pick"
                    )}
                  </button>
                  <DestinationCard destination={d} favored={favIds.has(d.id)} />
                </div>
              );
            })}
          </div>

          {picked.size > 0 && (
            <div className="sticky bottom-4 mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[12rem]">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Save as
                  </label>
                  <input
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <p className="text-sm text-slate-600">
                  {picked.size} {picked.size === 1 ? "place" : "places"} selected
                </p>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 transition hover:bg-emerald-600 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving…" : saved ? "Saved" : "Save trip"}
                </button>
              </div>
              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
              {saved && (
                <p className="mt-2 text-xs text-emerald-700">
                  Saved. Your trip plan is now in the database — check{" "}
                  <a className="underline" href="/profile">
                    your profile
                  </a>
                  .
                </p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-emerald-800/70">{label}</p>
      <p className="text-lg font-bold text-emerald-900">{value}</p>
    </div>
  );
}
