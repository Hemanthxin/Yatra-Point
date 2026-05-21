import Link from "next/link";
import { Logo } from "./Logo";

const links = [
  { href: "/destinations", label: "Destinations" },
  { href: "/trip-planner", label: "Trip Planner" },
  { href: "/packages", label: "Packages" },
  { href: "/about", label: "About Us" },
  { href: "/help", label: "Help" },
];

export function Nav({ rightSlot }: { rightSlot?: React.ReactNode }) {
  return (
    <header className="absolute inset-x-0 top-0 z-20 px-6 py-5 md:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" aria-label="Explore World home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-white/90 transition hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center">{rightSlot}</div>
      </div>
    </header>
  );
}
