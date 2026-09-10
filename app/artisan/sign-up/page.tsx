"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const SPECIALTY_OPTIONS = [
  "Tailoring",
  "Embellishment",
  "Design",
  "Beading",
  "Alterations",
];

export default function ArtisanSignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState<string[]>([]);
  const [skills, setSkills] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

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

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          intended_role: "artisan",
          artisan_region: "abuja",
          artisan_specialty: specialty.join(","),
          artisan_skills: skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .join(","),
          artisan_years_experience: yearsExperience || null,
          artisan_bio: bio || null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSubmitted(true);
  }

  return (
    <main className="min-h-[80vh] grid md:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16 md:py-24">
        <div className="w-full max-w-sm">
          {submitted ? (
            <div className="text-center">
              <h1 className="font-display text-3xl mb-4">Check your email</h1>
              <p className="text-ink/70 leading-relaxed">
                We sent a confirmation link to <strong>{email}</strong>.
                Click it to activate your artisan profile.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-3xl mb-2">
                Join as an artisan
              </h1>
              <p className="text-ink/60 mb-8">
                Hopayola is launching in Abuja first. Set up your profile and
                start getting matched with projects.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1" htmlFor="fullName">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-stone rounded-lg px-4 py-2.5 focus:border-royal outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-stone rounded-lg px-4 py-2.5 focus:border-royal outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-stone rounded-lg px-4 py-2.5 focus:border-royal outline-none"
                  />
                </div>

                <div>
                  <p className="text-sm mb-1">Region</p>
                  <p className="text-sm text-ink/50 border border-stone rounded-lg px-4 py-2.5">
                    Abuja (pilot)
                  </p>
                </div>

                <div>
                  <p className="text-sm mb-2">Specialty</p>
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
                </div>

                <div>
                  <label className="block text-sm mb-1" htmlFor="skills">
                    Skills{" "}
                    <span className="text-ink/40">(comma separated)</span>
                  </label>
                  <input
                    id="skills"
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Hand beading, draping, agbada stitching"
                    className="w-full border border-stone rounded-lg px-4 py-2.5 focus:border-royal outline-none"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm mb-1"
                    htmlFor="yearsExperience"
                  >
                    Years of experience{" "}
                    <span className="text-ink/40">(optional)</span>
                  </label>
                  <input
                    id="yearsExperience"
                    type="number"
                    min="0"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full border border-stone rounded-lg px-4 py-2.5 focus:border-royal outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1" htmlFor="bio">
                    Bio <span className="text-ink/40">(optional)</span>
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="A few lines about your work and experience"
                    className="w-full border border-stone rounded-lg px-4 py-2.5 focus:border-royal outline-none min-h-[80px]"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-royal text-paper py-3 rounded-full hover:bg-royal-deep transition-colors disabled:opacity-60"
                >
                  {loading ? "Creating profile..." : "Sign up as an artisan"}
                </button>
              </form>

              <p className="text-sm text-ink/60 mt-6">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-royal hover:text-royal-deep"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      <div className="hidden md:block relative">
        <Image
          src="/images/marquee-4.jpg"
          alt="Hopayola artisans"
          fill
          className="object-cover"
          priority
        />
      </div>
    </main>
  );
}