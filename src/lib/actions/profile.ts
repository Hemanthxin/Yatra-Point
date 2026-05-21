"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const profileSchema = z.object({
  name: z.string().trim().max(120).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(255)
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof profileSchema>;

export async function updateProfile(input: UpdateProfileInput) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Not signed in" };
  }

  const name = parsed.data.name?.trim() || null;
  const email = parsed.data.email?.trim() || null;

  await db
    .update(users)
    .set({
      name,
      email,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
