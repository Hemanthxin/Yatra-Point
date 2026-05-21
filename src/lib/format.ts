// Indian Rupee formatting — no decimals, ₹ symbol, lakh/crore aware.
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDays(days: number): string {
  if (days === 1) return "1 day";
  return `${days} days`;
}

const MONTH_ORDER = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Compress "Oct,Nov,Dec,Jan,Feb,Mar" into "Oct–Mar" when contiguous; otherwise
// return as-is. Wraps around year-end.
export function formatBestMonths(csv?: string | null): string {
  if (!csv) return "Year-round";
  const months = csv.split(",").map((m) => m.trim()).filter(Boolean);
  if (months.length === 0) return "Year-round";
  if (months.length === 12) return "Year-round";

  const indices = months
    .map((m) => MONTH_ORDER.indexOf(m))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b);

  // Detect a single contiguous span (possibly wrapped). We try both linear
  // and wrap-around interpretations and pick the cleanest description.
  const linearContiguous = indices.every(
    (v, i) => i === 0 || v - indices[i - 1] === 1
  );
  if (linearContiguous) {
    return `${MONTH_ORDER[indices[0]]} – ${
      MONTH_ORDER[indices[indices.length - 1]]
    }`;
  }

  // Try wrap-around: rotate so the gap is at the front.
  for (let i = 0; i < indices.length; i++) {
    const rotated = [...indices.slice(i), ...indices.slice(0, i).map((v) => v + 12)];
    const contig = rotated.every(
      (v, j) => j === 0 || v - rotated[j - 1] === 1
    );
    if (contig) {
      return `${MONTH_ORDER[rotated[0] % 12]} – ${
        MONTH_ORDER[rotated[rotated.length - 1] % 12]
      }`;
    }
  }
  return months.join(", ");
}
