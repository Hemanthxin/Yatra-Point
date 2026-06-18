import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app/AppShell";
import { WizardForm } from "./WizardForm";
import { PlannerResults } from "./PlannerResults";
import { listDestinations, listFavoriteIds } from "@/lib/queries/destinations";
import { CATEGORIES } from "@/lib/catalog/categories";

interface PageProps {
  searchParams: Promise<{
    budget?: string;
    days?: string;
    travellers?: string;
    category?: string;
    destination?: string;
  }>;
}

export default async function BudgetPlannerPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/");
  const u = session.user;
  const sp = await searchParams;

  const budget = sp.budget ? Number(sp.budget) : undefined;
  const days = sp.days ? Number(sp.days) : undefined;
  const travellers = sp.travellers ? Number(sp.travellers) : 2;
  const validCat = CATEGORIES.find((c) => c.slug === sp.category)?.slug;

  const hasInputs =
    Number.isFinite(budget) && Number.isFinite(days) && budget! > 0 && days! > 0;

  let perPersonPerDay = 0;
  let matches = [] as Awaited<ReturnType<typeof listDestinations>>;
  let favIds: Set<string> = new Set();

  if (hasInputs) {
    perPersonPerDay = Math.floor(budget! / travellers / days!);
    [matches, favIds] = await Promise.all([
      listDestinations({
        category: validCat,
        maxBudgetPerDay: perPersonPerDay,
        limit: 30,
      }),
      listFavoriteIds(u.id),
    ]);
  }

  return (
    <AppShell userLabel={u.name || u.email || u.phone || "Traveller"} userImage={u.image}>
      <WizardForm
        initial={{
          budget: budget,
          days: days,
          travellers: travellers,
        }}
      />

      {hasInputs && (
        <div className="mt-8">
          <PlannerResults
            matches={matches}
            favIds={favIds}
            summary={{
              totalBudget: budget!,
              days: days!,
              travellers,
              category: validCat,
              perPersonPerDay,
            }}
          />
        </div>
      )}
    </AppShell>
  );
}
