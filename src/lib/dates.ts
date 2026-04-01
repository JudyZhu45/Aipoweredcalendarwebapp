/**
 * Naive ("floating") datetime utilities.
 *
 * Philosophy: BeaverAI is a personal single-user calendar where "5am" always
 * means "5am on your clock", regardless of timezone. We store wall-clock time
 * literally in the ISO string (the `Z` suffix is just a format requirement, not
 * a true UTC marker). This matches how iOS Calendar and Apple Reminders work.
 *
 *   Stored:  "2024-01-15T05:00:00.000Z"  ← the numbers ARE the user's local time
 *   Display: always shows 5am           ← no UTC offset applied
 *   Lambda:  regex extracts "05:00"     ← same number, no conversion needed
 */

/**
 * Parse a naive ISO string as LOCAL wall-clock time.
 * Extracts the date/time components with regex and constructs a local Date,
 * bypassing JavaScript's UTC interpretation of the `Z` suffix.
 *
 * @example fromNaiveISO("2024-01-15T05:00:00.000Z") → new Date(2024, 0, 15, 5, 0)
 */
export function fromNaiveISO(str: string | null | undefined): Date {
  if (!str) return new Date(NaN);
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return new Date(str); // graceful fallback for unexpected formats
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
}

/**
 * Format a local Date as a naive ISO string.
 * Uses local hours/minutes directly — no UTC conversion.
 *
 * @example toNaiveISO(new Date(2024, 0, 15, 5, 0)) → "2024-01-15T05:00:00.000Z"
 */
export function toNaiveISO(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00.000Z`
  );
}
