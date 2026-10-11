import type { Listing } from "./types";

export const LISTINGS_KEY = "pr_listings";

export function loadExtraListings(): Listing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LISTINGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Listing[];
    return Array.isArray(parsed) ? parsed.filter((l) => l && l.id && l.title) : [];
  } catch {
    return [];
  }
}

export function saveListing(listing: Listing) {
  const next = [listing, ...loadExtraListings().filter((l) => l.id !== listing.id)];
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(next));
}
