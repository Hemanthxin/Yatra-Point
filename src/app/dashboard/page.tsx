import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Compass,
  Heart,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";

import { auth } from "@/auth";
import { AppShell } from "@/components/app/AppShell";
import { DestinationCard } from "@/components/app/DestinationCard";
import {
  countsByCategory,
  listDestinations,
  listFavoriteIds,
  listFavoritedDestinations,
} from "@/lib/queries/destinations";
import { CATEGORIES } from "@/lib/catalog/categories";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  const u = session.user;
  const displayName = u.name || u.email || u.phone || "Traveller";

  const [featured, hidden, favIds, favorited, catCounts] = await Promise.all([
    listDestinations({ isHidden: false, limit: 6 }),
    listDestinations({ isHidden: true, limit: 3 }),
    listFavoriteIds(u.id),
    listFavoritedDestinations(u.id),
    countsByCategory(),
  ]);

  const totalDestinations = catCounts.reduce((s, c) => s + c.total, 0);
  const stats = [
    {
      label: "Destinations",
      value: totalDestinations,
      icon: <MapPin className="h-4 w-4" />,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Saved",
      value: favorited.length,
      icon: <Heart className="h-4 w-4" />,
      tone: "bg-rose-50 text-rose-700",
    },
    {
      label: "Categories",
      value: CATEGORIES.length,
      icon: <Compass className="h-4 w-4" />,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "Hidden gems",
      value: catCounts.length ? hidden.length + 1 : hidden.length,
      icon: <Sparkles className="h-4 w-4" />,
      tone: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <AppShell userLabel={displayName} userImage={u.image}>
      <section className="relative overflow-hidden rounded-3xl">
        <div className="relative h-56 w-full md:h-72">
          <Image
            src="/66242.jpg"
            alt="Indian temples, waterfall and a houseboat at sunset"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 80vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <p className="text-sm font-medium text-white/80">
            Welcome back, {displayName}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white md:text-4xl">
            Where to next?
          </h1>
          <p className="mt-1 max-w-md text-sm text-white/80">
            Browse {totalDestinations} curated destinations across India, or
            let the trip planner pick the right one for your budget.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/one-day-trips"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
            >
              <Compass className="h-4 w-4" /> One-day trips near me
            </Link>
            <Link
              href="/budget-planner"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <Wallet className="h-4 w-4" /> Plan within budget
            </Link>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Browse <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className={`grid h-9 w-9 place-items-center rounded-full ${s.tone}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Explore by category
            </h2>
            <p className="text-sm text-slate-500">
              Pick a vibe — pilgrimage, adventure, beach and more.
            </p>
          </div>
          <Link
            href="/trip-categories"
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => {
            const total = catCounts.find((cc) => cc.category === c.slug)?.total ?? 0;
            return (
              <Link
                key={c.slug}
                href={`/destinations?category=${c.slug}`}
                className="group flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                <span className="text-3xl">{c.emoji}</span>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
                  {c.label}
                </p>
                <p className="text-xs text-slate-500">{total} places</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Featured destinations
            </h2>
            <p className="text-sm text-slate-500">
              India's most-loved picks.
            </p>
          </div>
          <Link
            href="/destinations"
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((d) => (
            <DestinationCard
              key={d.id}
              destination={d}
              favored={favIds.has(d.id)}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Hidden gems
            </h2>
            <p className="text-sm text-slate-500">
              Offbeat picks curated for the road less travelled.
            </p>
          </div>
          <Link
            href="/hidden-places"
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            See all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hidden.map((d) => (
            <DestinationCard
              key={d.id}
              destination={d}
              favored={favIds.has(d.id)}
            />
          ))}
        </div>
      </section>

      {favorited.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Your saved places</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorited.slice(0, 6).map((d) => (
              <DestinationCard key={d.id} destination={d} favored />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Your account</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Row label="Name" value={u.name || "—"} />
          <Row label="Email" value={u.email || "—"} />
          <Row label="Phone" value={u.phone || "—"} />
          <Row label="User ID" value={u.id} mono />
        </dl>
        <Link
          href="/profile"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
        >
          Edit profile <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </AppShell>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd
        className={`mt-0.5 font-medium text-slate-900 ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
