import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { AppShell } from "@/components/app/AppShell";
import { LocationBanner } from "@/components/app/LocationBanner";
import { getNearbyBySlug } from "@/lib/queries/nearby";
import { TripDetail } from "./TripDetail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function NearbyDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/");
  const u = session.user;

  const { slug } = await params;
  const trip = await getNearbyBySlug(slug);
  if (!trip) notFound();

  return (
    <AppShell userLabel={u.name || u.email || u.phone || "Traveller"} userImage={u.image}>
      <Link
        href="/one-day-trips"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> All one-day trips
      </Link>
      <LocationBanner />
      <TripDetail trip={trip} />
    </AppShell>
  );
}
