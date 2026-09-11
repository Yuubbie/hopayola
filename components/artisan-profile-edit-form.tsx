"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  initialFullName: string;
  initialAvailability: string;
  initialSpecialty: string[];
  initialSkills: string;
  initialYearsExperience: string;
  initialBio: string;
};

const SPECIALTY_OPTIONS = [
  "Tailoring",
  "Embellishment",
  "Design",
  "Beading",
  "Alterations",
];

const AVAILABILITY_OPTIONS = [
  { value: "available_today", label: "Available today" },
  { value: "available_this_week", label: "Available this week" },
  { value: "unavailable", label: "Unavailable" },
];

export default function ArtisanProfileEditForm({
  userId,
  initialFullName,
  initialAvailability,
  initialSpecialty,
  initialSkills,
  initialYearsExperience,
  initialBio,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState(initialFullName);
  const [availability, setAvailability] = useState(initialAvailability);
  const [specialty, setSpecialty] = useState<string[]>(initialSpecialty);
  const [skills, setSkills] = useState(initialSkills);
  const [yearsExperience, setYearsExperience] = useState(initialYearsExperience);
  const [bio, setBio] = useState(initialBio);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSpecialty(value: string) {
    setSpecialty((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (specialty.length === 0) {
      setError("Pick at least one specialty.");
      return;
    }

    setSaving(true);

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim() })
        .eq("id", userId)
        .select();

      if (profileError) {
        throw new Error(`Could not update name: ${profileError.message}`);
      }

      const { error: artisanError } = await supabase
        .from("artisan_profiles")
        .update({
          availability_status: availability,
          specialty,
          skills: skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          years_experience: yearsExperience ? Number(yearsExperience) : null,
          bio: bio.trim() || null,
        })
        .eq("id", userId)
        .select();

      if (artisanError) {
        throw new Error(`Could not update profile: ${artisanError.message}`);
      }

      router.push("/artisan/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="border border-stone rounded-2xl p-6">
        <div>
          <label className="block text-sm text-ink/50 mb-1" htmlFor="full-name">
            Full name
          </label>
          <input
            id="full-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
      </section>

      <section className="border border-stone rounded-2xl p-6">
        <h2 className="font-display text-lg mb-4">Availability</h2>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
        >
          {AVAILABILITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </section>

      <section className="border border-stone rounded-2xl p-6">
        <h2 className="font-display text-lg mb-4">Specialty</h2>
        <div className="grid grid-cols-2 gap-2">
          {SPECIALTY_OPTIONS.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 text-sm border border-stone rounded-lg px-3 py-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={specialty.includes(option)}
                onChange={() => toggleSpecialty(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </section>

      <section className="border border-stone rounded-2xl p-6">
        <div className="mb-4">
          <label className="block text-sm text-ink/50 mb-1" htmlFor="skills">
            Skills <span className="text-ink/30">(comma separated)</span>
          </label>
          <input
            id="skills"
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Hand beading, draping, agbada stitching"
            className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-ink/50 mb-1" htmlFor="years-experience">
            Years of experience <span className="text-ink/30">(optional)</span>
          </label>
          <input
            id="years-experience"
            type="number"
            min="0"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-ink/50 mb-1" htmlFor="bio">
            Bio <span className="text-ink/30">(optional)</span>
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border border-stone rounded-lg px-3 py-2 text-sm min-h-[80px]"
          />
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-royal text-paper rounded-lg py-3 text-sm font-medium hover:bg-royal-deep transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}