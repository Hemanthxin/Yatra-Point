// Geographic helpers — kept pure (no React, no DOM) so they run on the server
// for sorting + on the client for live distance updates.

export interface LatLng {
  lat: number;
  lng: number;
}

// Bangalore city centre — used as a fallback when geolocation is denied.
export const BANGALORE_CENTER: LatLng = { lat: 12.9716, lng: 77.5946 };

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// Haversine great-circle distance, in km. Accurate to ~0.5% over short hops.
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function formatMinutes(mins: number): string {
  const m = Math.round(mins);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h} h` : `${h} h ${rem} min`;
}

// Add minutes to a Date and return HH:MM in 24h local time.
export function addMinutes(start: Date, mins: number): Date {
  return new Date(start.getTime() + mins * 60_000);
}

export function formatClock(d: Date): string {
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
