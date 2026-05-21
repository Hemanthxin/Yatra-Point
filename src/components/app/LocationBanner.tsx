"use client";

import { useEffect } from "react";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { useLocation } from "./LocationContext";

// Inline status banner — appears above pages that depend on the user's
// coordinates. Auto-requests on mount.
export function LocationBanner({
  autoRequest = true,
}: {
  autoRequest?: boolean;
}) {
  const loc = useLocation();

  useEffect(() => {
    if (autoRequest && loc.status === "idle") loc.request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRequest]);

  if (loc.status === "granted") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm">
        <span className="inline-flex items-center gap-2 text-emerald-800">
          <MapPin className="h-4 w-4" />
          Using your live location
          {loc.accuracyMeters && (
            <span className="text-xs text-emerald-700/70">
              (±{Math.round(loc.accuracyMeters)} m)
            </span>
          )}
        </span>
        <span className="text-xs text-emerald-700/70">
          {loc.coords.lat.toFixed(4)}, {loc.coords.lng.toFixed(4)}
        </span>
      </div>
    );
  }

  if (loc.status === "prompting") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Requesting your location…
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm">
      <span className="inline-flex items-center gap-2 text-amber-900">
        <AlertCircle className="h-4 w-4" />
        {loc.status === "denied"
          ? "Location denied — using Bangalore centre as a fallback."
          : loc.status === "unavailable"
          ? "Location unavailable on this device — using Bangalore centre."
          : "We need your location to sort places by distance."}
      </span>
      <button
        type="button"
        onClick={loc.request}
        className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
      >
        {loc.status === "denied" ? "Try again" : "Use my location"}
      </button>
    </div>
  );
}
