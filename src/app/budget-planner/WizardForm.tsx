"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  User,
  Heart,
  Users,
  UsersRound,
  Bus,
  Car,
  TrainFront,
  Bike,
  CheckCircle2,
  CalendarDays,
  MapPinned,
  ArrowRight,
} from "lucide-react";

const STEPS = ["Trip Details", "Preferences", "Travel Style", "Generate Plan"];
const DAY_OPTIONS = ["1 Day", "2 Days", "3 Days", "4 Days", "5+ Days"];
const TRAVELLER_OPTIONS = ["1", "2", "3", "4", "5+"];

const TRIP_TYPES = [
  { key: "Solo", icon: User },
  { key: "Couple", icon: Heart },
  { key: "Family", icon: Users },
  { key: "Friends", icon: UsersRound },
];

const TRANSPORT = [
  { key: "Any", icon: null },
  { key: "Bus", icon: Bus },
  { key: "Car", icon: Car },
  { key: "Train", icon: TrainFront },
  { key: "Bike", icon: Bike },
];

const FOOD = ["Any", "Veg", "Non-Veg", "Jain", "Eggetarian"];

interface WizardFormProps {
  initial: { budget?: number; days?: number; travellers?: number };
}

export function WizardForm({ initial }: WizardFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [budget, setBudget] = useState(initial.budget ?? 5000);
  const [days, setDays] = useState(initial.days ? `${initial.days} Days` : "2 Days");
  const [travellers, setTravellers] = useState(initial.travellers?.toString() ?? "2");
  const [tripType, setTripType] = useState("Family");
  const [transport, setTransport] = useState("Any");
  const [food, setFood] = useState("Any");

  const daysNum = days === "5+ Days" ? 5 : parseInt(days, 10) || 2;
  const travellersNum = travellers === "5+" ? 5 : parseInt(travellers, 10) || 2;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(searchParams.toString());
    next.set("budget", String(budget));
    next.set("days", String(daysNum));
    next.set("travellers", String(travellersNum));
    startTransition(() => router.push(`/budget-planner?${next.toString()}`));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-100 via-emerald-50 to-teal-100 p-6 md:p-8">
        <div className="relative z-10 max-w-lg">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Budget Planner</h1>
          <p className="mt-2 text-sm text-slate-600">
            Plan your perfect trip within your budget.
            <br />
            Tell us your preferences and we&apos;ll handle the rest!
          </p>
        </div>
        <div className="pointer-events-none absolute -right-4 bottom-0 hidden text-7xl md:block">
          🧳
        </div>
      </div>

      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
        {STEPS.map((s, i) => {
          const active = i === 0;
          return (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                  active ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {i + 1}
              </span>
              <span className={`text-sm font-medium ${active ? "text-slate-900" : "text-slate-400"}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <span className="mx-1 hidden h-px w-8 bg-slate-200 sm:inline-block" />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form column */}
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* 1. Budget */}
            <Card title="1. Your Budget" icon="💰">
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center rounded-lg border border-slate-300 px-3 py-2">
                  <span className="mr-1 text-slate-500">₹</span>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                  />
                </div>
                <span className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600">
                  INR
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={50000}
                step={500}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="mt-3 w-full accent-emerald-600"
              />
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>₹1K</span>
                <span>₹5K</span>
                <span>₹10K</span>
                <span>₹20K</span>
                <span>₹50K+</span>
              </div>
            </Card>

            {/* 2. Days */}
            <Card title="2. Number of Days" icon="📅">
              <div className="flex flex-wrap gap-2">
                {DAY_OPTIONS.map((d) => (
                  <Chip key={d} active={days === d} onClick={() => setDays(d)}>
                    {d}
                  </Chip>
                ))}
              </div>
            </Card>

            {/* 3. Travellers */}
            <Card title="3. Number of Travelers" icon="👥">
              <div className="flex flex-wrap gap-2">
                {TRAVELLER_OPTIONS.map((t) => (
                  <Chip key={t} active={travellers === t} onClick={() => setTravellers(t)} square>
                    {t}
                  </Chip>
                ))}
              </div>
            </Card>

            {/* 4. Trip Type */}
            <Card title="4. Trip Type" icon="🏷️">
              <div className="grid grid-cols-4 gap-2">
                {TRIP_TYPES.map(({ key, icon: Icon }) => {
                  const active = tripType === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTripType(key)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition ${
                        active
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-200 text-slate-600 hover:border-emerald-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {key}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* 5. Transport */}
            <Card title="5. Preferred Transport" optional icon="🚌">
              <div className="flex flex-wrap gap-2">
                {TRANSPORT.map(({ key, icon: Icon }) => (
                  <Chip key={key} active={transport === key} onClick={() => setTransport(key)}>
                    <span className="flex items-center gap-1">
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {key}
                    </span>
                  </Chip>
                ))}
              </div>
            </Card>

            {/* 6. Food */}
            <Card title="6. Preferred Food" optional icon="🍽️">
              <div className="flex flex-wrap gap-2">
                {FOOD.map((f) => (
                  <Chip key={f} active={food === f} onClick={() => setFood(f)}>
                    {f}
                  </Chip>
                ))}
              </div>
            </Card>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {isPending ? "Generating…" : "Continue to Preferences"}
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="rounded-xl bg-sky-50 px-4 py-3 text-xs text-slate-600">
            💡 <span className="font-semibold">Tip:</span> The more details you provide, the
            better and more personalized your trip plan will be.
          </div>
        </div>

        {/* Sidebar column */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="flex items-center gap-2 font-bold text-slate-900">
              <span className="text-emerald-600">✦</span> Why use Budget Planner?
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {[
                "Best places within your budget",
                "Day-wise itinerary with activities",
                "Estimated cost breakdown",
                "Smart travel suggestions",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-bold text-emerald-700">Quick Preview</p>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" /> {days} Trip
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" /> {travellersNum} Travelers
              </li>
              <li className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-slate-400" /> Budget: ₹ {budget.toLocaleString("en-IN")}
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-xs text-slate-600">
            <span className="font-medium">Next: Customize your preferences for a better plan</span>
            <span className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-400 text-white">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}

function Card({
  title,
  icon,
  optional,
  children,
}: {
  title: string;
  icon: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
        <span>{icon}</span>
        {title}
        {optional && <span className="text-xs font-normal text-slate-400">(Optional)</span>}
      </p>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  square,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  square?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border text-sm font-medium transition ${
        square ? "h-9 w-10" : "px-3 py-1.5"
      } ${
        active
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-slate-200 text-slate-600 hover:border-emerald-300"
      }`}
    >
      {children}
    </button>
  );
}
