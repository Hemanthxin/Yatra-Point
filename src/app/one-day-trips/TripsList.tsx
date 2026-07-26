"use client";

import { useMemo, useState } from "react";
import type { NearbyDestination } from "@/lib/db/schema";
import { useLocation } from "@/components/app/LocationContext";
import { sortByUserDistance } from "@/lib/nearby-utils";
import { NearbyTripCard } from "@/components/app/NearbyTripCard";
import { RevealGrid } from "@/components/app/RevealGrid";
import { CATEGORIES } from "@/lib/catalog/categories";

interface TripsListProps {
  trips: NearbyDestination[];
}

export function TripsList({ trips }: TripsListProps) {
  const { coords } = useLocation();
  const [category, setCategory] = useState<string>("");
  const [maxDistance, setMaxDistance] = useState<number>(0);

  const sorted = useMemo(() => sortByUserDistance(trips, coords), [trips, coords]);
  const filtered = useMemo(
    () =>
      sorted.filter((d) => {
        if (category && d.category !== category) return false;
        if (maxDistance > 0 && d.userDistanceKm > maxDistance) return false;
        return true;
      }),
    [sorted, category, maxDistance]
  );

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip active={!category} onClick={() => setCategory("")}>
          All
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip
            key={c.slug}
            active={category === c.slug}
            onClick={() => setCategory(c.slug)}
          >
            {c.emoji} {c.label}
          </Chip>
        ))}
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-slate-500">Within</span>
          <select
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value={0}>Any distance</option>
            <option value={30}>30 km</option>
            <option value={60}>60 km</option>
            <option value={100}>100 km</option>
            <option value={150}>150 km</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">
            No places match those filters. Try removing one.
          </p>
        </div>
      ) : (
        <RevealGrid
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          resetKey={`${category}|${maxDistance}|${filtered.length}`}
        >
          {filtered.map((d) => (
            <NearbyTripCard
              key={d.id}
              destination={d}
              userDistanceKm={d.userDistanceKm}
            />
          ))}
        </RevealGrid>
      )}
    </>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-emerald-500 bg-emerald-500 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
