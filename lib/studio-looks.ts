export const FEMALE_GARMENTS = [
  "Simple gown",
  "Kaftan / boubou",
  "Skirt and blouse",
  "Two-piece set",
  "Jumpsuit",
  "Trouser suit",
  "Bridal / occasionwear",
  "Hopayola-inspired dress",
];

export const MALE_GARMENTS = [
  "Abada / agbada",
  "Senator outfit",
  "Kaftan / tunic",
  "Shirt and trousers",
  "Hopayola-inspired jacket",
  "Two-piece set",
  "Suit / blazer",
  "Traditional robe",
];

export const PERSONA_WOMEN = [
  "Pastor's Wife",
  "Rich Aunty",
  "Senator's Wife",
  "Executive Woman",
  "Young and Sophisticated",
  "Abuja Luxury",
  "Lagos Glam",
  "Traditional Royalty",
];

export const PERSONA_MEN = [
  "Quiet luxury",
  "Executive Man",
  "Traditional Royalty",
  "Abuja Luxury",
  "Lagos Glam",
  "Young and Sophisticated",
];

export type LookTemplate = { id: string; title: string; prompt: string };

export const FEMALE_LOOKS: LookTemplate[] = [
  {
    id: "f-casual",
    title: "Everyday casual",
    prompt:
      "Everyday casual look. Simple stylish gown, comfortable for daily wear. Flattering but practical, clean finishing, minimal embellishment. Prioritise the fabric colour and pattern.",
  },
  {
    id: "f-work",
    title: "Work and business",
    prompt:
      "Sophisticated workwear. Professional, comfortable for a full day. Clean silhouette, defined but comfortable waist, discreet finishing. Confidence and refined taste.",
  },
  {
    id: "f-church",
    title: "Church and religious",
    prompt:
      "Elegant gown for church or a formal religious gathering. Modest graceful silhouette, appropriate coverage, dignified, fabric as the main feature.",
  },
  {
    id: "f-asoebi",
    title: "Wedding guest / asoebi",
    prompt:
      "Wedding-guest or asoebi outfit for a Nigerian celebration. Tasteful embellishment only where it complements the fabric. Distinctive, not overcrowded.",
  },
  {
    id: "f-engagement",
    title: "Traditional engagement",
    prompt:
      "Refined traditional engagement look. Contemporary tailoring with culturally appropriate details. Celebratory and elegant, keep the fabric character.",
  },
  {
    id: "f-bridal",
    title: "Bridal",
    prompt:
      "Bridal concept. Refined construction, elegant detailing, one distinctive focal feature. Special and personal, not excessively decorated.",
  },
  {
    id: "f-dinner",
    title: "Dinner and evening",
    prompt:
      "Elegant evening look for dinner or a formal celebration. Sophisticated silhouette, refined draping, subtle statement details.",
  },
  {
    id: "f-birthday",
    title: "Birthday",
    prompt:
      "Distinctive birthday outfit. Expressive and memorable, one or two standout features. Coordinated, not visually crowded.",
  },
  {
    id: "f-gala",
    title: "Gala and formal",
    prompt:
      "High-end formalwear. Silhouette, proportion, one strong design feature. Deliberate, not generic.",
  },
  {
    id: "f-vacation",
    title: "Vacation and resort",
    prompt:
      "Stylish comfortable holiday or resort wear. Flowing gown, relaxed dress or coordinated set. Practical and polished.",
  },
];

export const MALE_LOOKS: LookTemplate[] = [
  {
    id: "m-agbada",
    title: "Modern minimal agbada",
    prompt:
      "Contemporary Nigerian agbada with a clean elegant silhouette. Let the fabric decide structure and drape. Restrained embroidery at neckline or chest if the material supports it. Coordinated inner top and trousers. Regal, modern, comfortable, not excessively decorated.",
  },
  {
    id: "m-senator",
    title: "Modern senator",
    prompt:
      "Refined Nigerian senator-style outfit. Well-proportioned tunic, clean neckline, neat sleeves, matching trousers. Subtle detailing only. Quiet confidence.",
  },
  {
    id: "m-kaftan",
    title: "Casual kaftan / tunic",
    prompt:
      "Simple contemporary men's kaftan or tunic. Comfort, clean lines, easy movement. Minimal decoration. Fashionable, not ceremonial.",
  },
  {
    id: "m-chinese-formal",
    title: "Chinese-inspired formal",
    prompt:
      "Modern men's outfit inspired by refined Chinese short-drama styling. Mandarin-style collar, straight elegant silhouette, understated closures, precise finishing. Adapt to the fabric. Wearable luxury, not a costume.",
  },
  {
    id: "m-chinese-casual",
    title: "Chinese-inspired casual",
    prompt:
      "Contemporary casual look inspired by polished Chinese drama styling. Well-cut shirt, relaxed jacket or coordinated set. Clean proportions, practical, not historical costume.",
  },
  {
    id: "m-smart",
    title: "Smart-casual shirt and trousers",
    prompt:
      "Sophisticated men's shirt and trousers. Let the fabric decide crisp or draped. Clean collar, precise seams, well-proportioned trousers. Professional and social.",
  },
  {
    id: "m-ankara",
    title: "Ankara statement shirt",
    prompt:
      "Stylish men's shirt from the uploaded Ankara. Preserve the print. Clean cut. Pair with a complementary plain trouser so the print is the focus.",
  },
  {
    id: "m-asooke",
    title: "Aso-oke ceremonial",
    prompt:
      "Elegant traditional men's outfit from aso-oke. Respect weave, pattern and cultural character. Agbada, robe or structured ensemble as the material allows. Restrained extra embellishment. Complementary innerwear and trousers.",
  },
  {
    id: "m-silk",
    title: "Silk / luxury resort",
    prompt:
      "Refined men's shirt or resort set in silk or silk-like fabric. Let sheen and drape guide the silhouette. No heavy embroidery or stiff construction. Luxurious, not flashy.",
  },
  {
    id: "m-twopiece",
    title: "Contemporary two-piece",
    prompt:
      "Coordinated two-piece men's outfit. Matching shirt and trousers, short tunic with straight trousers, or light jacket with matching bottoms. Modern, versatile, one subtle design feature.",
  },
];
