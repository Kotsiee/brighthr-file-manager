function toDate(value: Date | string | undefined): Date | null {
  if (value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function formatDate(value: Date | string | undefined): string {
  const date = toDate(value);
  if (!date) return "";
  return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`;
}

export function toISODate(
  value: Date | string | undefined,
): string | undefined {
  return toDate(value)?.toISOString().slice(0, 10);
}
