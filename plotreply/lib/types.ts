export type Intent = "rent" | "sale" | "shortlet";

export type Listing = {
  id: string;
  title: string;
  city: string;
  area: string;
  intent: Intent;
  beds: number;
  priceNgn: number;
  notes: string;
};

export type ChatTurn = { role: "user" | "bot"; text: string };

export type Session = {
  intent?: Intent;
  city?: string;
  budget?: number;
  beds?: number;
  nights?: number;
  inspectionHeld?: string;
  websiteUrl?: string;
  agencyName?: string;
  extraListings?: Listing[];
};
