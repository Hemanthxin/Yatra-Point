import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  destinations,
  tripPlanItems,
  tripPlans,
  type Destination,
  type TripPlan,
} from "@/lib/db/schema";

export interface TripPlanWithItems extends TripPlan {
  items: Destination[];
}

export async function listUserTripPlans(
  userId: string
): Promise<TripPlanWithItems[]> {
  const plans = await db
    .select()
    .from(tripPlans)
    .where(eq(tripPlans.userId, userId))
    .orderBy(desc(tripPlans.createdAt));

  if (plans.length === 0) return [];

  // Fetch items for all plans in one go.
  const rows = await db
    .select({
      tripPlanId: tripPlanItems.tripPlanId,
      position: tripPlanItems.position,
      destination: destinations,
    })
    .from(tripPlanItems)
    .innerJoin(destinations, eq(tripPlanItems.destinationId, destinations.id));

  const byPlan = new Map<string, Destination[]>();
  for (const r of rows.sort((a, b) => a.position - b.position)) {
    const arr = byPlan.get(r.tripPlanId) ?? [];
    arr.push(r.destination);
    byPlan.set(r.tripPlanId, arr);
  }

  return plans.map((p) => ({ ...p, items: byPlan.get(p.id) ?? [] }));
}
