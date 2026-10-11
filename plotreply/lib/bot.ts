import { SEED_LISTINGS } from "./seed";
import type { Intent, Listing, Session } from "./types";
import { websiteLine } from "./website";

const naira = (n: number) =>
  "₦" + n.toLocaleString("en-NG");

function detectIntent(text: string): Intent | undefined {
  const t = text.toLowerCase();
  if (/(short.?let|airbnb|weekend|per night|nights?)/.test(t)) return "shortlet";
  if (/(buy|sale|selling|outright|title|c of o)/.test(t)) return "sale";
  if (/(rent|yearly|per annum|let|tenant)/.test(t)) return "rent";
  return undefined;
}

function detectCity(text: string): string | undefined {
  const t = text.toLowerCase();
  if (/(lagos|lekki|ajah|ikeja|vi\b|victoria island|ikoyi|yaba)/.test(t)) return "Lagos";
  if (/(abuja|gwarinpa|wuse|maitama|kubwa|jabi)/.test(t)) return "Abuja";
  if (/(port harcourt|\bph\b|trans amadi|rumuokoro|gra ph)/.test(t)) return "Port Harcourt";
  return undefined;
}

function detectBudget(text: string): number | undefined {
  const t = text.replace(/,/g, "").toLowerCase();
  const m = t.match(/(\d+(?:\.\d+)?)\s*(m|million)?/);
  if (!m) return undefined;
  const n = parseFloat(m[1]);
  if (m[2] || n <= 500) return Math.round(n * 1_000_000);
  return Math.round(n);
}

function matchListings(s: Session): Listing[] {
  return SEED_LISTINGS.filter((l) => {
    if (s.intent && l.intent !== s.intent) return false;
    if (s.city && l.city !== s.city) return false;
    if (s.budget && l.intent !== "shortlet" && l.priceNgn > s.budget * 1.15) return false;
    return true;
  }).slice(0, 3);
}

function card(l: Listing) {
  const unit = l.intent === "shortlet" ? "/night" : l.intent === "rent" ? "/year" : "";
  return `• ${l.title} — ${l.area}, ${l.city}\n  ${naira(l.priceNgn)}${unit}\n  ${l.notes}`;
}

export function reply(userText: string, session: Session): { text: string; session: Session } {
  const intent = detectIntent(userText) ?? session.intent;
  const city = detectCity(userText) ?? session.city;
  const budget = detectBudget(userText) ?? session.budget;
  const next: Session = { ...session, intent, city, budget };

  const t = userText.toLowerCase();
  const site = next.websiteUrl;

  if (/(website|your site|catalogue|catalog|listings page|property site)/.test(t) && site) {
    return {
      session: next,
      text: `Open the agency website, pick what you want, then come back with area + budget (or paste the listing link).\n${site}`,
    };
  }

  if (/https?:\/\//i.test(userText) && !/(pay|transfer)/.test(t)) {
    return {
      session: next,
      text:
        "Got the listing link. Tell me: rent, buy, or short-let — plus your budget and when you can inspect (or stay dates)." +
        websiteLine(site),
    };
  }

  if (/(pay|transfer|pos|account number|send money)/.test(t)) {
    return {
      session: next,
      text: "Do not pay anyone in this chat. PlotReply never collects rent, caution, or holding fees. Inspect or check in with the agent first.",
    };
  }

  if (/(hi|hello|hey|good morning|good evening)/.test(t) && t.length < 24) {
    return {
      session: next,
      text:
        "Hello — this is PlotReply for the agent.\nRent, buy, or short-let? Send city/area and budget (e.g. “2-bed Lekki rent 4m” or “VI weekend 2 nights”)." +
        websiteLine(site),
    };
  }

  if (!next.intent) {
    return {
      session: next,
      text: "Are you looking to rent (yearly), buy, or book a short-let?",
    };
  }

  if (!next.city) {
    return {
      session: next,
      text: "Which city or area? (Lagos, Abuja, Port Harcourt, or an estate name.)",
    };
  }

  const hits = matchListings(next);
  if (!hits.length) {
    return {
      session: next,
      text:
        `No live match for ${next.intent} in ${next.city} yet. I can take your request and the agent will hunt. Send beds + budget + when you want to move (or dates for short-let).` +
        websiteLine(site),
    };
  }

  const book =
    next.intent === "shortlet"
      ? "\n\nTo hold dates, send nights + guest count. The host confirms. No payment in this chat."
      : "\n\nTo book an inspection, send a day (e.g. Saturday 1pm). Bring ID. No payment before you see the house.";

  return {
    session: next,
    text: `Here is what is live:\n\n${hits.map(card).join("\n\n")}${book}${websiteLine(site)}`,
  };
}
