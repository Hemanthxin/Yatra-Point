import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getNearbyBySlug } from "@/lib/queries/nearby";
import { LiveTracker } from "./LiveTracker";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LiveTrackingPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const { slug } = await params;
  const trip = await getNearbyBySlug(slug);
  if (!trip) notFound();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-3 backdrop-blur">
        <Link
          href={`/one-day-trips/${trip.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to plan
        </Link>
        <p className="text-sm font-semibold text-white">Live · {trip.name}</p>
        <span className="w-12" />
      </header>
      <LiveTracker trip={trip} />
    </div>
  );
}
