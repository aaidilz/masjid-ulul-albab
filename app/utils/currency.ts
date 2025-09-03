// Currency utility functions
export function parseCurrency(value: string): number {
  if (!value || value.trim() === "" || value === "0") return 0;
  const cleanValue = value
    .replace(/Rp\s*/g, "")
    .replace(/\./g, "")
    .replace(/,/g, "")
    .trim();
  return parseInt(cleanValue) || 0;
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseDate(dateStr: string): Date {
  if (!dateStr || dateStr.trim() === "") return new Date();
  const ddmmyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = dateStr.match(ddmmyyyyPattern);
  if (match) {
    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    const year = parseInt(match[3]);
    return new Date(year, month - 1, day);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}
