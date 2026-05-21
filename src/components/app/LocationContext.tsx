"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BANGALORE_CENTER, type LatLng } from "@/lib/geo";

type Status = "idle" | "prompting" | "granted" | "denied" | "unavailable";

interface LocationState {
  coords: LatLng;
  accuracyMeters?: number;
  status: Status;
  isFallback: boolean;
  request: () => void;
  startWatch: () => void;
  stopWatch: () => void;
  watching: boolean;
  lastUpdate?: number;
}

const Ctx = createContext<LocationState | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<LatLng>(BANGALORE_CENTER);
  const [accuracyMeters, setAccuracyMeters] = useState<number | undefined>();
  const [status, setStatus] = useState<Status>("idle");
  const [watching, setWatching] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number | undefined>();
  const watchId = useRef<number | null>(null);

  const apply = useCallback((pos: GeolocationPosition) => {
    setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    setAccuracyMeters(pos.coords.accuracy);
    setLastUpdate(Date.now());
    setStatus("granted");
  }, []);

  const request = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }
    setStatus("prompting");
    navigator.geolocation.getCurrentPosition(
      apply,
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 }
    );
  }, [apply]);

  const startWatch = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }
    if (watchId.current !== null) return;
    watchId.current = navigator.geolocation.watchPosition(
      apply,
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 }
    );
    setWatching(true);
  }, [apply]);

  const stopWatch = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setWatching(false);
  }, []);

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const value = useMemo<LocationState>(
    () => ({
      coords,
      accuracyMeters,
      status,
      isFallback: status !== "granted",
      request,
      startWatch,
      stopWatch,
      watching,
      lastUpdate,
    }),
    [coords, accuracyMeters, status, request, startWatch, stopWatch, watching, lastUpdate]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocation(): LocationState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLocation must be used inside <LocationProvider>");
  return v;
}
