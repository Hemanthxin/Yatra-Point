import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app/AppShell";
import { RevealGrid } from "@/components/app/RevealGrid";
import { CATEGORIES, CATEGORY_GRADIENT, type CategorySlug } from "@/lib/catalog/categories";
import { countsByCategory } from "@/lib/queries/destinations";

export default async function TripCategoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  const u = session.user;

  const counts = await countsByCategory();
  const byCat = Object.fromEntries(counts.map((c) => [c.category, c.total]));

  return (
    <AppShell userLabel={u.name || u.email || u.phone || "Traveller"} userImage={u.image}>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Trip Categories</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pick the kind of trip you're in the mood for.
        </p>
      </header>

      <RevealGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/destinations?category=${c.slug}`}
            className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div
              className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${
                CATEGORY_GRADIENT[c.slug as CategorySlug]
              }`}
            >
              <span className="text-7xl drop-shadow">{c.emoji}</span>
              <div className="absolute inset-0 bg-black/5 transition group-hover:bg-black/0" />
            </div>
            <div className="p-5">
              <p className="text-lg font-bold text-slate-900 group-hover:text-emerald-700">
                {c.label}
              </p>
              <p className="text-sm text-slate-500">
                {byCat[c.slug] ?? 0} destinations
              </p>
            </div>
          </Link>
        ))}
      </RevealGrid>
    </AppShell>
  );
}
