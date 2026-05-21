import Link from "next/link";
import { MapPin, Calendar, Wallet, Sparkles } from "lucide-react";
import type { Destination } from "@/lib/db/schema";
import {
  CATEGORY_BY_SLUG,
  CATEGORY_CHIP,
  CATEGORY_GRADIENT,
  type CategorySlug,
} from "@/lib/catalog/categories";
import { formatINR, formatDays } from "@/lib/format";
import { FavoriteButton } from "./FavoriteButton";

interface DestinationCardProps {
  destination: Destination;
  favored?: boolean;
}

export function DestinationCard({ destination, favored }: DestinationCardProps) {
  const cat = CATEGORY_BY_SLUG[destination.category as CategorySlug];
  const gradient =
    CATEGORY_GRADIENT[destination.category as CategorySlug] ??
    "from-slate-400 to-slate-600";
  const chip =
    CATEGORY_CHIP[destination.category as CategorySlug] ??
    "bg-slate-100 text-slate-800";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/destinations/${destination.slug}`} className="relative">
        {destination.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="h-44 w-full object-cover"
          />
        ) : (
          <div
            className={`relative grid h-44 w-full place-items-center bg-gradient-to-br ${gradient}`}
          >
            <span className="text-5xl drop-shadow-sm">{cat?.emoji ?? "📍"}</span>
            <div className="absolute inset-0 bg-black/5" />
          </div>
        )}
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${chip}`}
        >
          {cat?.emoji} {cat?.label ?? destination.category}
        </span>
        {destination.isHidden && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
            <Sparkles className="h-3 w-3" /> Hidden gem
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/destinations/${destination.slug}`}
              className="block truncate font-semibold text-slate-900 hover:text-emerald-700"
            >
              {destination.name}
            </Link>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3" />
              {destination.district
                ? `${destination.district}, ${destination.state}`
                : destination.state}
            </p>
          </div>
          <FavoriteButton
            destinationId={destination.id}
            initialFavored={!!favored}
          />
        </div>

        <p className="line-clamp-2 text-sm text-slate-600">
          {destination.shortDescription}
        </p>

        <div className="mt-auto flex items-center justify-between text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <Wallet className="h-3.5 w-3.5 text-emerald-600" />
            {formatINR(destination.budgetPerDay)}/day
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
            {formatDays(destination.recommendedDays)}
          </span>
        </div>
      </div>
    </article>
  );
}
