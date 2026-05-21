"use client";

import Link from "next/link";
import { Clock, MapPin, Navigation, Wallet } from "lucide-react";
import type { NearbyDestination } from "@/lib/db/schema";
import {
  CATEGORY_BY_SLUG,
  CATEGORY_CHIP,
  CATEGORY_GRADIENT,
  type CategorySlug,
} from "@/lib/catalog/categories";
import { formatINR } from "@/lib/format";
import { formatKm, formatMinutes } from "@/lib/geo";

interface NearbyTripCardProps {
  destination: NearbyDestination;
  userDistanceKm: number;
}

export function NearbyTripCard({ destination, userDistanceKm }: NearbyTripCardProps) {
  const cat = CATEGORY_BY_SLUG[destination.category as CategorySlug];
  const gradient =
    CATEGORY_GRADIENT[destination.category as CategorySlug] ??
    "from-slate-400 to-slate-600";
  const chip =
    CATEGORY_CHIP[destination.category as CategorySlug] ??
    "bg-slate-100 text-slate-800";

  // Quick estimate: round-trip + time at place + lunch buffer.
  const totalMinutes =
    destination.drivingMinutes * 2 +
    destination.idealHoursAtPlace * 60 +
    60; // food / breaks

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/one-day-trips/${destination.slug}`} className="relative">
        <div
          className={`relative grid h-36 w-full place-items-center bg-gradient-to-br ${gradient}`}
        >
          <span className="text-5xl drop-shadow-sm">{cat?.emoji ?? "📍"}</span>
          <div className="absolute inset-0 bg-black/5" />
          <span
            className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${chip}`}
          >
            {cat?.emoji} {cat?.label ?? destination.category}
          </span>
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
            <Navigation className="h-3 w-3" />
            {formatKm(userDistanceKm)}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link
            href={`/one-day-trips/${destination.slug}`}
            className="block truncate font-semibold text-slate-900 hover:text-emerald-700"
          >
            {destination.name}
          </Link>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            from {destination.baseCity} · {destination.distanceKm} km
          </p>
        </div>

        <p className="line-clamp-2 text-sm text-slate-600">
          {destination.shortDescription}
        </p>

        <div className="mt-auto flex items-center justify-between text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-emerald-600" />
            {formatMinutes(totalMinutes)} round trip
          </span>
          <span className="inline-flex items-center gap-1">
            <Wallet className="h-3.5 w-3.5 text-emerald-600" />
            {destination.entryFeePerPerson > 0
              ? `${formatINR(destination.entryFeePerPerson)} entry`
              : "Free entry"}
          </span>
        </div>
      </div>
    </article>
  );
}
