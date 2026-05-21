import { redirect } from "next/navigation";
import { Route as RouteIcon } from "lucide-react";
import { auth } from "@/auth";
import { AppShell } from "@/components/app/AppShell";
import { LocationBanner } from "@/components/app/LocationBanner";
import { TripsTabs } from "@/components/app/TripsTabs";
import { MultiStopPlanner } from "./MultiStopPlanner";

export default async function MultiStopPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  const u = session.user;

  return (
    <AppShell userLabel={u.name || u.email || u.phone || "Traveller"} userImage={u.image}>
      <TripsTabs />
      <header className="mb-4 flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <RouteIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mixed-category trip planner</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pick a budget, hours, and what you feel like — we'll fit as many places as we can,
            ordered optimally, with real driving distances and live OSM data.
          </p>
        </div>
      </header>

      <LocationBanner />
      <MultiStopPlanner />
    </AppShell>
  );
}
