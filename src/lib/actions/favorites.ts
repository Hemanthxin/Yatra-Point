"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { favorites } from "@/lib/db/schema";

export async function toggleFavorite(destinationId: string): Promise<{
  ok: boolean;
  favored: boolean;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, favored: false, error: "Not signed in" };
  }
  const userId = session.user.id;

  const existing = await db
    .select()
    .from(favorites)
    .where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.destinationId, destinationId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.destinationId, destinationId)
        )
      );
    revalidatePath("/destinations");
    revalidatePath("/dashboard");
    return { ok: true, favored: false };
  }

  await db.insert(favorites).values({ userId, destinationId });
  revalidatePath("/destinations");
  revalidatePath("/dashboard");
  return { ok: true, favored: true };
}
