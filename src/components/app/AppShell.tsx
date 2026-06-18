"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  userLabel: string;
  userImage?: string | null;
  location?: string;
  children: React.ReactNode;
}

export function AppShell({ userLabel, userImage, location, children }: AppShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="lg:pl-64">
        <Topbar
          userLabel={userLabel}
          userImage={userImage}
          location={location}
          onMenu={() => setOpen((v) => !v)}
        />
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
