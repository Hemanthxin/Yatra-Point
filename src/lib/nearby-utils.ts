// Pure sort helper — kept free of any DB imports so it can be bundled into
// client components. Uses a structural type so it works for both
// `Destination` and `NearbyDestination` rows (both have lat/lng strings).
import { haversineKm, type LatLng } from "@/lib/geo";

export interface HasCoords {
  latitude: string | null;
  longitude: string | null;
}

export function sortByUserDistance<T extends HasCoords>(
  items: T[],
  userCoords: LatLng
): Array<T & { userDistanceKm: number }> {
  return items
    .map((d) => ({
      ...d,
      userDistanceKm: haversineKm(userCoords, {
        lat: Number(d.latitude ?? 0),
        lng: Number(d.longitude ?? 0),
      }),
    }))
    .sort((a, b) => a.userDistanceKm - b.userDistanceKm);
}
