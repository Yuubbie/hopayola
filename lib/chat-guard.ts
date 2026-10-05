export const HOPAYOLA_SUPPORT_EMAIL = "support@hopayola.com";
export const HOPAYOLA_WHATSAPP = "+2348105173313";
export const HOPAYOLA_WHATSAPP_LINK =
  "https://wa.me/2348105173313";

const PATTERNS: { name: string; re: RegExp }[] = [
  { name: "phone", re: /\+?234[\s-]?\d{8,11}\b/i },
  { name: "phone", re: /\b0\d{10}\b/ },
  { name: "phone", re: /\b\d{4}[\s.-]\d{3}[\s.-]\d{4}\b/ },
  { name: "email", re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
  { name: "whatsapp", re: /\b(whats?\s*app|wa\.me|whatsapp)\b/i },
  { name: "social", re: /\b(instagram|insta|\big\b|snapchat|snap\b|tiktok|telegram|t\.me|facebook|fb\.com|twitter|x\.com)\b/i },
  { name: "handle", re: /(^|\s)@[\w.]{3,}\b/ },
  { name: "ask-contact", re: /\b(call me|text me|dm me|my number|phone number|send (me )?your (number|contact)|drop your (number|digits))\b/i },
];

export function scanChatMessage(raw: string) {
  const text = raw.trim();
  const hits: string[] = [];
  for (const p of PATTERNS) {
    if (p.re.test(text) && !hits.includes(p.name)) hits.push(p.name);
  }
  return {
    blocked: hits.length > 0,
    hits,
    officialHint: `Do not share numbers or socials here. Contact Hopayola on ${HOPAYOLA_SUPPORT_EMAIL} or WhatsApp ${HOPAYOLA_WHATSAPP}.`,
  };
}
