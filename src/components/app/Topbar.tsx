"use client";

import { Menu, Search, MapPin, Bell, ChevronDown } from "lucide-react";

interface TopbarProps {
  userLabel: string;
  userImage?: string | null;
  location?: string;
  onMenu: () => void;
}

export function Topbar({ userLabel, userImage, location = "Bengaluru, India", onMenu }: TopbarProps) {
  const firstName = userLabel.split(" ")[0] || userLabel;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md md:px-6">
      <button
        onClick={onMenu}
        className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <button
        onClick={onMenu}
        className="hidden h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:grid"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Explore more places..."
          className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-4">
        <span className="hidden items-center gap-1.5 text-sm font-medium text-slate-600 sm:flex">
          <MapPin className="h-4 w-4 text-emerald-600" />
          {location}
        </span>

        <button
          className="relative grid h-9 w-9 place-items-center rounded-full text-slate-600 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </button>

        <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-slate-100">
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userImage} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="hidden text-sm font-semibold text-slate-700 sm:inline">
            Hi, {firstName}
          </span>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:inline" />
        </button>
      </div>
    </header>
  );
}
