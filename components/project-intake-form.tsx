"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { notifyProjectSubmission } from "@/app/actions/notifications";
import { seedDefaultMilestones } from "@/app/actions/seed-milestones";
import { generateConceptsAction } from "@/app/actions/generate-concepts";
import {
  FEMALE_GARMENTS,
  FEMALE_LOOKS,
  MALE_GARMENTS,
  MALE_LOOKS,
  PERSONA_MEN,
  PERSONA_WOMEN,
} from "@/lib/studio-looks";

type SavedMeasurements = {
  bust?: string;
  waist?: string;
  hip?: string;
  height?: string;
} | null;

type Props = {
  userId: string;
  clientName: string;
  clientEmail: string;
  savedMeasurements: SavedMeasurements;
  initialOccasion?: string;
  initialTier?: "standard" | "premium";
};

const MAX_PHOTOS = 5;
const MAX_FILE_MB = 8;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

function fileOk(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith("image/")) {
    return "Use a photo file (jpg, png, or webp).";
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return `Each photo must be under ${MAX_FILE_MB} MB.`;
  }
  return null;
}

const DESIGN_KINDS = ["Clothing", "Jewelry", "Complete look"] as const;

const JEWELRY_OPTIONS = [
  "Necklace",
  "Earrings",
  "Bracelet",
  "Beaded set",
  "Coral",
  "Matching set",
];

const OCCASION_OPTIONS = [
  "Wedding",
  "Church",
  "Birthday",
  "Dinner",
  "Traditional event",
  "Work",
  "Red carpet",
  "Casual",
  "Naming Ceremony",
  "Owambe / Party",
  "Other",
];

const FABRIC_OPTIONS = [
  "Ankara / wax print",
  "Aso-oke",
  "Adire",
  "Lace",
  "Silk",
  "Cotton",
  "Linen",
  "Suiting",
  "Velvet",
  "Not sure",
];

const STYLE_OPTIONS = [
  "Elegant",
  "Classic",
  "Modern",
  "Dramatic",
  "Minimalist",
  "Regal",
  "Feminine",
  "Bold",
  "Modest",
  "Traditional",
  "Contemporary African",
];

const START_MODES = [
  {
    id: "explore",
    title: "Explore Hopayola designs",
    body: "Start from a curated Hopayola look.",
  },
  {
    id: "own",
    title: "Build from my own idea",
    body: "Upload a sketch, fabric, or inspiration photo.",
  },
  {
    id: "combine",
    title: "Combine both",
    body: "Pick a Hopayola look and add your own references.",
  },
] as const;

const HOPAYOLA_LOOKS = [
  {
    id: "wedding-gown",
    title: "Ceremony gown",
    image: "/images/occasion-wedding.jpg",
  },
  {
    id: "owambe",
    title: "Owambe",
    image: "/images/occasion-owambe.jpg",
  },
  {
    id: "naming",
    title: "Naming / aso-oke",
    image: "/images/occasion-naming.jpg",
  },
  {
    id: "corporate",
    title: "Work / corporate",
    image: "/images/occasion-corporate.jpg",
  },
  {
    id: "everyday",
    title: "Everyday",
    image: "/images/occasion-everyday.jpg",
  },
  {
    id: "cultural",
    title: "Cultural / festival",
    image: "/images/occasion-cultural.jpg",
  },
];

export default function ProjectIntakeForm({
  userId,
  clientName,
  clientEmail,
  savedMeasurements,
  initialOccasion,
  initialTier,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [wearer, setWearer] = useState<"women" | "men">("women");
  const [lookId, setLookId] = useState("");
  const [designKind, setDesignKind] = useState<(typeof DESIGN_KINDS)[number]>(
    "Clothing"
  );
  const [occasion, setOccasion] = useState(
    initialOccasion && OCCASION_OPTIONS.includes(initialOccasion)
      ? initialOccasion
      : ""
  );
  const [fabricType, setFabricType] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [persona, setPersona] = useState("");
  const [startMode, setStartMode] = useState<(typeof START_MODES)[number]["id"]>(
    "combine"
  );
  const [curatedId, setCuratedId] = useState("");
  const [styleDirection, setStyleDirection] = useState("");
  const [garmentType, setGarmentType] = useState("");
  const [jewelry, setJewelry] = useState<string[]>([]);
  const [tier, setTier] = useState<"standard" | "premium">(
    initialTier === "premium" ? "premium" : "standard"
  );
  const [deliveryDeadline, setDeliveryDeadline] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  const [bust, setBust] = useState(savedMeasurements?.bust ?? "");
  const [waist, setWaist] = useState(savedMeasurements?.waist ?? "");
  const [hip, setHip] = useState(savedMeasurements?.hip ?? "");
  const [height, setHeight] = useState(savedMeasurements?.height ?? "");
  const [measurementNotes, setMeasurementNotes] = useState("");

  const [fabricFiles, setFabricFiles] = useState<File[]>([]);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [portraitConsent, setPortraitConsent] = useState(false);
  const [showOn, setShowOn] = useState<"mannequin" | "photo">("mannequin");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFabricChange(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(e.target.files ?? []);
    if (chosen.length + fabricFiles.length > MAX_PHOTOS) {
      setError(`You can upload up to ${MAX_PHOTOS} fabric photos.`);
      return;
    }
    for (const file of chosen) {
      const bad = fileOk(file);
      if (bad) {
        setError(bad);
        return;
      }
    }
    setError(null);
    setFabricFiles((prev) => [...prev, ...chosen]);
  }

  function removeFabricFile(index: number) {
    setFabricFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const jewelryLabel = jewelry.join(", ");
    const kindGarment =
      garmentType.trim() ||
      (designKind === "Jewelry"
        ? jewelryLabel || "Jewelry"
        : designKind === "Complete look"
          ? ["Outfit", jewelryLabel].filter(Boolean).join(" and ")
          : "");
    if (!occasion.trim() || !kindGarment) {
      setError("Pick an occasion and say what you are making.");
      return;
    }
    const curated = HOPAYOLA_LOOKS.find((l) => l.id === curatedId);
    if (
      (startMode === "explore" || startMode === "combine") &&
      !curated
    ) {
      setError("Pick a Hopayola design to start from.");
      return;
    }
    if (
      (startMode === "own" || startMode === "combine") &&
      fabricFiles.length === 0
    ) {
      setError("Upload a sketch, fabric, or inspiration photo.");
      return;
    }
    if (showOn === "photo") {
      if (!portraitFile) {
        setError("Add a photo of you, or switch to mannequin.");
        return;
      }
      if (!portraitConsent) {
        setError(
          "Tick consent if we should use your photo. The mockup is not a fit guarantee."
        );
        return;
      }
    }
    const looks = wearer === "men" ? MALE_LOOKS : FEMALE_LOOKS;
    const pickedLook = looks.find((l) => l.id === lookId);
    const styleBrief = [
      wearer === "men" ? "Menswear" : "Womenswear",
      designKind,
      pickedLook ? `${pickedLook.title}. ${pickedLook.prompt}` : "",
      startMode === "explore"
        ? "Explore Hopayola designs"
        : startMode === "own"
          ? "Build from my own idea"
          : "Combine Hopayola design and my references",
      curated ? `Hopayola start: ${curated.title}` : "",
      persona,
      jewelryLabel ? `Jewelry: ${jewelryLabel}` : "",
      fabricType ? `Fabric type: ${fabricType}` : "",
      styles.join(", "),
      showOn === "photo"
        ? "Client consented to a personal photo for a visual mockup only. Not a fit or identity guarantee."
        : "Show on a mannequin or fashion figure, not a real person.",
      styleDirection.trim(),
    ]
      .filter(Boolean)
      .join(". ");
    setSubmitting(true);

    try {
      const uploadedPaths: string[] = [];
      for (const file of fabricFiles) {
        const ext = file.name.split(".").pop();
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("project-fabrics")
          .upload(path, file);

        if (uploadError) {
          throw new Error(`Fabric photo upload failed: ${uploadError.message}`);
        }
        uploadedPaths.push(path);
      }
      if (showOn === "photo" && portraitFile) {
        const ext = portraitFile.name.split(".").pop();
        const path = `${userId}/portrait-${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("project-fabrics")
          .upload(path, portraitFile);
        if (uploadError) {
          throw new Error(`Portrait upload failed: ${uploadError.message}`);
        }
        uploadedPaths.push(path);
      }

      const measurements = {
        bust: bust || null,
        waist: waist || null,
        hip: hip || null,
        height: height || null,
        notes: measurementNotes || null,
      };

      const { data: project, error: insertError } = await supabase
        .from("projects")
        .insert({
          client_id: userId,
          tier,
          status: "submitted",
          occasion: occasion.trim(),
          style_direction: styleBrief || null,
          garment_type: kindGarment,
          measurements,
          delivery_deadline: deliveryDeadline || null,
          budget_min: budgetMin ? Number(budgetMin) : null,
          budget_max: budgetMax ? Number(budgetMax) : null,
          region: "abuja",
          fabric_image_urls: uploadedPaths,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Could not save project: ${insertError.message}`);
      }

      try {
        await seedDefaultMilestones(project.id);
      } catch {
        /* milestones can be added later */
      }
      try {
        await generateConceptsAction(project.id, tier);
      } catch {
        /* placeholders can wait */
      }
      notifyProjectSubmission(
        clientName,
        clientEmail,
        garmentType.trim(),
        occasion.trim()
      );

      router.push(`/account?project=${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="border border-stone rounded-2xl p-6">
        <h2 className="font-display text-lg mb-1">Design studio brief</h2>
        <p className="text-sm text-ink/50 mb-5">
          Tap what you want. You can still type extra notes.
        </p>

        <div className="space-y-5">
          <div>
            <p className="text-sm text-ink/50 mb-2">What are we designing?</p>
            <div className="flex flex-wrap gap-2">
              {DESIGN_KINDS.map((k) => (
                <Chip
                  key={k}
                  label={k}
                  selected={designKind === k}
                  onClick={() => setDesignKind(k)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-ink/50 mb-2">Who is this for?</p>
            <div className="flex flex-wrap gap-2">
              <Chip
                label="Women"
                selected={wearer === "women"}
                onClick={() => {
                  setWearer("women");
                  setLookId("");
                  setPersona("");
                }}
              />
              <Chip
                label="Men"
                selected={wearer === "men"}
                onClick={() => {
                  setWearer("men");
                  setLookId("");
                  setPersona("");
                }}
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-ink/50 mb-2">
              {wearer === "men" ? "Men's starting look" : "Women's starting look"}
            </p>
            <div className="flex flex-wrap gap-2">
              {(wearer === "men" ? MALE_LOOKS : FEMALE_LOOKS).map((look) => (
                <Chip
                  key={look.id}
                  label={look.title}
                  selected={lookId === look.id}
                  onClick={() => setLookId(lookId === look.id ? "" : look.id)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-ink/50 mb-2">Garment</p>
            <div className="flex flex-wrap gap-2">
              {(wearer === "men" ? MALE_GARMENTS : FEMALE_GARMENTS).map((g) => (
                <Chip
                  key={g}
                  label={g}
                  selected={garmentType === g}
                  onClick={() => setGarmentType(garmentType === g ? "" : g)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-ink/50 mb-2">How do you want to start?</p>
            <div className="grid gap-2">
              {START_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setStartMode(m.id)}
                  className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                    startMode === m.id
                      ? "border-royal bg-royal/5"
                      : "border-stone hover:border-royal"
                  }`}
                >
                  <span className="block text-sm font-medium">{m.title}</span>
                  <span className="block text-xs text-ink/50 mt-0.5">
                    {m.body}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {(startMode === "explore" || startMode === "combine") && (
            <div>
              <p className="text-sm text-ink/50 mb-2">Hopayola designs</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {HOPAYOLA_LOOKS.map((look) => (
                  <button
                    key={look.id}
                    type="button"
                    onClick={() => setCuratedId(look.id)}
                    className={`rounded-xl overflow-hidden border text-left ${
                      curatedId === look.id
                        ? "border-royal ring-1 ring-royal"
                        : "border-stone"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={look.image}
                      alt=""
                      className="w-full h-24 object-cover"
                    />
                    <span className="block text-xs px-2 py-2">{look.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm text-ink/50 mb-2">Occasion</p>
            <div className="flex flex-wrap gap-2">
              {OCCASION_OPTIONS.map((o) => (
                <Chip
                  key={o}
                  label={o}
                  selected={occasion === o}
                  onClick={() => setOccasion(o)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-ink/50 mb-2">Fabric type</p>
            <div className="flex flex-wrap gap-2">
              {FABRIC_OPTIONS.map((f) => (
                <Chip
                  key={f}
                  label={f}
                  selected={fabricType === f}
                  onClick={() => setFabricType(fabricType === f ? "" : f)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-ink/50 mb-2">Style direction</p>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  selected={styles.includes(s)}
                  onClick={() =>
                    setStyles((prev) =>
                      prev.includes(s)
                        ? prev.filter((x) => x !== s)
                        : [...prev, s]
                    )
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-ink/50 mb-2">Persona</p>
            <div className="flex flex-wrap gap-2">
              {(wearer === "men" ? PERSONA_MEN : PERSONA_WOMEN).map((p) => (
                <Chip
                  key={p}
                  label={p}
                  selected={persona === p}
                  onClick={() => setPersona(persona === p ? "" : p)}
                />
              ))}
            </div>
          </div>

          {(designKind === "Jewelry" || designKind === "Complete look") && (
            <div>
              <p className="text-sm text-ink/50 mb-2">Jewelry</p>
              <div className="flex flex-wrap gap-2">
                {JEWELRY_OPTIONS.map((j) => (
                  <Chip
                    key={j}
                    label={j}
                    selected={jewelry.includes(j)}
                    onClick={() =>
                      setJewelry((prev) =>
                        prev.includes(j)
                          ? prev.filter((x) => x !== j)
                          : [...prev, j]
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-ink/50 mb-1" htmlFor="garment-type">
              {designKind === "Jewelry" ? "Jewelry type" : "Garment type"}
            </label>
            <input
              id="garment-type"
              type="text"
              value={garmentType}
              onChange={(e) => setGarmentType(e.target.value)}
              placeholder={
                designKind === "Jewelry"
                  ? "Necklace, earrings, set..."
                  : "Gown, two-piece, agbada..."
              }
              className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-ink/50 mb-1" htmlFor="style-direction">
              Extra notes <span className="text-ink/30">(optional)</span>
            </label>
            <textarea
              id="style-direction"
              value={styleDirection}
              onChange={(e) => setStyleDirection(e.target.value)}
              placeholder="Rich Aunty vibes but not too loud. Sunday thanksgiving..."
              className="w-full border border-stone rounded-lg px-3 py-2 text-sm min-h-[80px]"
            />
          </div>
        </div>
      </section>

      <section className="border border-stone rounded-2xl p-6">
        <h2 className="font-display text-lg mb-4">
          {startMode === "explore"
            ? "Extra photos"
            : "Your sketch, fabric, or inspiration"}{" "}
          <span className="text-ink/40 text-sm font-normal">
            {startMode === "explore" ? "(optional)" : ""}
          </span>
        </h2>
        <p className="text-ink/50 text-sm mb-4">
          {startMode === "explore"
            ? "Optional. Up to " + MAX_PHOTOS + " photos."
            : "Required for this path. Up to " + MAX_PHOTOS + " photos."}
        </p>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFabricChange}
          className="text-sm"
        />

        {fabricFiles.length > 0 && (
          <ul className="mt-4 space-y-2">
            {fabricFiles.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center justify-between text-sm border border-stone rounded-lg px-3 py-2"
              >
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFabricFile(i)}
                  className="text-ink/40 hover:text-ink ml-3"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border border-stone rounded-2xl p-6">
        <h2 className="font-display text-lg mb-2">Who should the look be on?</h2>
        <p className="text-sm text-ink/50 mb-4">
          A generated image cannot guarantee fit. Measurements are for the
          artisan, not the picture.
        </p>
        <div className="grid gap-2 mb-4">
          <button
            type="button"
            onClick={() => setShowOn("mannequin")}
            className={`text-left rounded-xl border px-4 py-3 ${
              showOn === "mannequin"
                ? "border-royal bg-royal/5"
                : "border-stone"
            }`}
          >
            <span className="block text-sm font-medium">Mannequin / figure</span>
            <span className="block text-xs text-ink/50 mt-0.5">
              Default. No photo of you.
            </span>
          </button>
          <button
            type="button"
            onClick={() => setShowOn("photo")}
            className={`text-left rounded-xl border px-4 py-3 ${
              showOn === "photo" ? "border-royal bg-royal/5" : "border-stone"
            }`}
          >
            <span className="block text-sm font-medium">Optional photo of me</span>
            <span className="block text-xs text-ink/50 mt-0.5">
              Visual only. Not body measurements.
            </span>
          </button>
        </div>
        {showOn === "photo" && (
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                if (f) {
                  const bad = fileOk(f);
                  if (bad) {
                    setError(bad);
                    setPortraitFile(null);
                    return;
                  }
                }
                setError(null);
                setPortraitFile(f);
              }}
              className="text-sm"
            />
            {portraitFile && (
              <p className="text-xs text-ink/50">{portraitFile.name}</p>
            )}
            <label className="flex items-start gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={portraitConsent}
                onChange={(e) => setPortraitConsent(e.target.checked)}
                className="mt-1"
              />
              <span>
                I consent to Hopayola using this photo only to mock up this
                design. I understand it is not a true likeness or fit
                prediction.
              </span>
            </label>
          </div>
        )}
      </section>

      <section className="border border-stone rounded-2xl p-6">
        <h2 className="font-display text-lg mb-4">Measurements</h2>
        <p className="text-ink/50 text-sm mb-4">
          Rough numbers are fine for now - your assigned team will confirm
          these before production starts.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-ink/50 mb-1" htmlFor="bust">
              Bust
            </label>
            <input
              id="bust"
              type="text"
              value={bust}
              onChange={(e) => setBust(e.target.value)}
              className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-ink/50 mb-1" htmlFor="waist">
              Waist
            </label>
            <input
              id="waist"
              type="text"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-ink/50 mb-1" htmlFor="hip">
              Hip
            </label>
            <input
              id="hip"
              type="text"
              value={hip}
              onChange={(e) => setHip(e.target.value)}
              className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-ink/50 mb-1" htmlFor="height">
              Height
            </label>
            <input
              id="height"
              type="text"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-ink/50 mb-1" htmlFor="measurement-notes">
            Notes <span className="text-ink/30">(optional)</span>
          </label>
          <textarea
            id="measurement-notes"
            value={measurementNotes}
            onChange={(e) => setMeasurementNotes(e.target.value)}
            placeholder="Fit preferences, areas to pay attention to..."
            className="w-full border border-stone rounded-lg px-3 py-2 text-sm min-h-[60px]"
          />
        </div>
      </section>

      <section className="border border-stone rounded-2xl p-6">
        <h2 className="font-display text-lg mb-4">Package</h2>

        <div className="space-y-3">
          <label className="flex items-start gap-3 border border-stone rounded-lg p-4 cursor-pointer">
            <input
              type="radio"
              name="tier"
              value="standard"
              checked={tier === "standard"}
              onChange={() => setTier("standard")}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium">Standard</span>
              <span className="block text-ink/50 text-sm">
                3 AI design concepts to choose from
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 border border-stone rounded-lg p-4 cursor-pointer">
            <input
              type="radio"
              name="tier"
              value="premium"
              checked={tier === "premium"}
              onChange={() => setTier("premium")}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium">Premium</span>
              <span className="block text-ink/50 text-sm">
                7 looks, plus a 3D-style mockup. Visual guide only, not a true
                fitted 3D garment. One design session, not unlimited redraws.
              </span>
              <a
                href="/contact"
                className="inline-block mt-2 text-xs text-royal underline underline-offset-2"
              >
                Book a Premium consult
              </a>
            </span>
          </label>
        </div>
      </section>

      <section className="border border-stone rounded-2xl p-6">
        <h2 className="font-display text-lg mb-4">Timing and budget</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-ink/50 mb-1" htmlFor="deadline">
              Delivery deadline <span className="text-ink/30">(optional)</span>
            </label>
            <input
              id="deadline"
              type="date"
              value={deliveryDeadline}
              onChange={(e) => setDeliveryDeadline(e.target.value)}
              className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink/50 mb-1" htmlFor="budget-min">
                Budget min (NGN) <span className="text-ink/30">(optional)</span>
              </label>
              <input
                id="budget-min"
                type="number"
                min="0"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-ink/50 mb-1" htmlFor="budget-max">
                Budget max (NGN) <span className="text-ink/30">(optional)</span>
              </label>
              <input
                id="budget-max"
                type="number"
                min="0"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-royal text-paper rounded-lg py-3 text-sm font-medium hover:bg-royal-deep transition-colors disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit project"}
      </button>
    </form>
  );
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
        selected
          ? "bg-royal text-paper border-royal"
          : "border-stone text-ink/70 hover:border-royal"
      }`}
    >
      {label}
    </button>
  );
}
