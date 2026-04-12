import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "Price unavailable";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(price);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function calculateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200);
}

export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const due = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function weeksPregnant(dueDateStr: string | null | undefined): number | null {
  if (!dueDateStr) return null;
  const dueDate = new Date(dueDateStr);
  const now = new Date();
  const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  const weeksPregnant = Math.round(40 - daysUntilDue / 7);
  return Math.max(1, Math.min(42, weeksPregnant));
}
