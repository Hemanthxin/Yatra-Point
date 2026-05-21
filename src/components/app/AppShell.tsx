import { AppHeader } from "./AppHeader";

interface AppShellProps {
  userLabel: string;
  userImage?: string | null;
  children: React.ReactNode;
}

export function AppShell({ userLabel, userImage, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <AppHeader userLabel={userLabel} userImage={userImage} />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      <footer className="mx-auto max-w-7xl px-6 pb-10 pt-2 text-center text-xs text-slate-400">
        Explore World · Discover places. Plan smart. Travel more.
      </footer>
    </div>
  );
}
