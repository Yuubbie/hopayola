"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { notifyProjectSubmission } from "@/app/actions/notifications";
import { seedDefaultMilestones } from "@/app/actions/seed-milestones";
import { generateConceptsAction } from "@/app/actions/generate-concepts";

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

const DESIGN_KINDS = ["Clothing", "Jewelry", "Complete look"] as const;

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

const PERSONA_OPTIONS = [
  "Pastor's Wife",
  "Rich Aunty",
  "Senator's Wife",
  "Executive Woman",
  "Young and Sophisticated",
  "Abuja Luxury",
  "Lagos Glam",
  "Traditional Royalty",
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

  const [designKind, setDesignKind] = useState<(typeof DESIGN_KINDS)[number]>(
    "Clothing"
  );
  const [occasion, setOccasion] = useState(
    initialOccasion && OCCASION_OPTIONS.includes(initialOccasion)
      ? initialOccasion
      : ""
  );
  const [styles, setStyles] = useState<string[]>([]);
  const [persona, setPersona] = useState("");
  const [styleDirection, setStyleDirection] = useState("");
  const [garmentType, setGarmentType] = useState("");
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFabricChange(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(e.target.files ?? []);
    if (chosen.length + fabricFiles.length > MAX_PHOTOS) {
      setError(`You can upload up to ${MAX_PHOTOS} fabric photos.`);
      return;
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

    const kindGarment =
      garmentType.trim() ||
      (designKind === "Jewelry"
        ? "Jewelry"
        : designKind === "Complete look"
          ? "Outfit and jewelry"
          : "");
    if (!occasion.trim() || !kindGarment) {
      setError("Pick an occasion and say what you are making.");
      return;
    }
    const styleBrief = [
      designKind,
      persona,
      styles.join(", "),
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
              {PERSONA_OPTIONS.map((p) => (
                <Chip
                  key={p}
                  label={p}
                  selected={persona === p}
                  onClick={() => setPersona(persona === p ? "" : p)}
                />
              ))}
            </div>
          </div>

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
          Fabric or reference photos{" "}
          <span className="text-ink/40 text-sm font-normal">(optional)</span>
        </h2>
        <p className="text-ink/50 text-sm mb-4">
          Skip this if you do not have fabric or a picture yet - describe the idea in the notes. Up to {MAX_PHOTOS} photos if you do.
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
                fitted 3D garment.
              </span>
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
