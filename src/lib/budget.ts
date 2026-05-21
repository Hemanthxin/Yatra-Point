// Real-time trip budget estimator. Numbers are mid-range Indian assumptions
// in INR; tweak `defaultBudgetParams` to taste.

export type VehicleKind = "bike" | "small_car" | "sedan" | "suv" | "cab";

interface VehicleProfile {
  label: string;
  // Fuel cost per km in INR (incl. fuel + minor wear).
  costPerKm: number;
  // Typical seating excluding driver — used to suggest cost-per-person.
  seats: number;
  emoji: string;
}

export const VEHICLES: Record<VehicleKind, VehicleProfile> = {
  bike: { label: "Bike", costPerKm: 2.5, seats: 1, emoji: "🏍️" },
  small_car: { label: "Hatchback", costPerKm: 7, seats: 4, emoji: "🚗" },
  sedan: { label: "Sedan", costPerKm: 9, seats: 4, emoji: "🚙" },
  suv: { label: "SUV", costPerKm: 12, seats: 6, emoji: "🚐" },
  cab: { label: "Cab (Ola/Uber)", costPerKm: 18, seats: 4, emoji: "🚕" },
};

export interface BudgetInput {
  distanceKm: number; // one-way
  vehicle: VehicleKind;
  people: number;
  entryFeePerPerson: number;
  foodPerPerson: number; // typical: 350
  parkingFee?: number;
  miscPerPerson?: number; // souvenirs, tea stops, etc.
}

export interface BudgetBreakdown {
  fuelTotal: number;
  entryTotal: number;
  foodTotal: number;
  parking: number;
  miscTotal: number;
  total: number;
  perPerson: number;
  roundTripKm: number;
}

export function calcBudget(input: BudgetInput): BudgetBreakdown {
  const v = VEHICLES[input.vehicle];
  const roundTripKm = input.distanceKm * 2;
  const fuelTotal = Math.round(roundTripKm * v.costPerKm);
  const entryTotal = input.entryFeePerPerson * input.people;
  const foodTotal = (input.foodPerPerson || 0) * input.people;
  const parking = input.parkingFee ?? 0;
  const miscTotal = (input.miscPerPerson ?? 0) * input.people;
  const total = fuelTotal + entryTotal + foodTotal + parking + miscTotal;
  const perPerson = Math.round(total / Math.max(1, input.people));
  return {
    fuelTotal,
    entryTotal,
    foodTotal,
    parking,
    miscTotal,
    total,
    perPerson,
    roundTripKm,
  };
}

export const defaultBudgetParams = {
  vehicle: "small_car" as VehicleKind,
  people: 2,
  foodPerPerson: 350,
  miscPerPerson: 100,
  parkingFee: 50,
};
