"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { tripPlans, tripPlanItems } from "@/lib/db/schema";

const saveTripSchema = z.object({
  name: z.string().min(1).max(140),
  totalBudget: z.number().int().min(500).max(10_000_000),
  days: z.number().int().min(1).max(60),
  travellers: z.number().int().min(1).max(20),
  category: z.string().optional(),
  destinationIds: z.array(z.string()).min(1).max(20),
});

export type SaveTripInput = z.infer<typeof saveTripSchema>;

export async function saveTripPlan(input: SaveTripInput) {
  const parsed = saveTripSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Not signed in" };
  }

  const [plan] = await db
    .insert(tripPlans)
    .values({
      userId: session.user.id,
      name: parsed.data.name,
      totalBudget: parsed.data.totalBudget,
      days: parsed.data.days,
      travellers: parsed.data.travellers,
      category: parsed.data.category ?? null,
      status: "draft",
    })
    .returning();

  await db.insert(tripPlanItems).values(
    parsed.data.destinationIds.map((id, idx) => ({
      tripPlanId: plan.id,
      destinationId: id,
      position: idx,
    }))
  );

  revalidatePath("/dashboard");
  revalidatePath("/budget-planner");
  return { ok: true as const, id: plan.id };
}
